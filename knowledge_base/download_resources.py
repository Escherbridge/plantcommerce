#!/usr/bin/env python3
"""
Download free, open-access academic resources on regenerative agriculture.

This script reads a manifest of URLs and downloads PDFs/documents organized by category.
It includes retry logic, resumable downloads, and comprehensive error handling.

Usage:
    python download_resources.py                    # Download all categories
    python download_resources.py --category silvopasture_and_agroforestry
    python download_resources.py --category silvopasture_and_agroforestry --category biochar_and_carbon
    python download_resources.py --manifest custom_manifest.json
"""

import json
import os
import sys
import time
import logging
from pathlib import Path
from urllib.parse import urlparse
from typing import Dict, List, Tuple, Optional
import argparse

try:
    import requests
except ImportError:
    print("ERROR: 'requests' module not found.")
    print("Install it with: pip install requests")
    sys.exit(1)

# ============================================================================
# CONFIGURATION
# ============================================================================

DEFAULT_MANIFEST = "resources_manifest.json"
DEFAULT_USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)
DOWNLOAD_TIMEOUT = 120  # seconds (NRCS/USDA servers are very slow)
MAX_RETRIES = 4
RETRY_DELAY = 5  # seconds (base delay - will increase exponentially for 429s)
CHUNK_SIZE = 8192  # bytes, for streaming downloads
MIN_PDF_SIZE = 1024  # bytes - anything smaller is likely an error page

# Domains known to be slow - get extra patience
SLOW_DOMAINS = {"nrcs.usda.gov", "rd.usda.gov", "usda.gov"}
SLOW_DOMAIN_TIMEOUT = 180  # 3 minutes for notoriously slow USDA sites

# ============================================================================
# LOGGING SETUP
# ============================================================================

def setup_logging(log_file: str = "download_resources.log") -> logging.Logger:
    """Configure logging to both console and file."""
    logger = logging.getLogger("ResourceDownloader")
    logger.setLevel(logging.DEBUG)

    # File handler
    file_handler = logging.FileHandler(log_file)
    file_handler.setLevel(logging.DEBUG)

    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)

    # Formatter
    formatter = logging.Formatter(
        fmt="%(asctime)s [%(levelname)s] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    file_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)

    logger.addHandler(file_handler)
    logger.addHandler(console_handler)

    return logger


# ============================================================================
# MANIFEST HANDLING
# ============================================================================

def load_manifest(manifest_path: str) -> Dict:
    """Load and validate the resources manifest JSON."""
    if not os.path.exists(manifest_path):
        raise FileNotFoundError(f"Manifest not found: {manifest_path}")

    try:
        with open(manifest_path, "r", encoding="utf-8") as f:
            manifest = json.load(f)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON in manifest: {e}")

    if "categories" not in manifest:
        raise ValueError("Manifest must contain 'categories' key")

    return manifest


def validate_manifest(manifest: Dict) -> None:
    """Validate manifest structure."""
    for category, data in manifest["categories"].items():
        if not isinstance(data, dict):
            raise ValueError(f"Category '{category}' must be a dict")

        required_keys = {"description", "output_dir", "resources"}
        if not required_keys.issubset(data.keys()):
            raise ValueError(
                f"Category '{category}' missing required keys: {required_keys}"
            )

        if not isinstance(data["resources"], list):
            raise ValueError(f"Category '{category}' 'resources' must be a list")

        for idx, resource in enumerate(data["resources"]):
            if not isinstance(resource, dict):
                raise ValueError(
                    f"Category '{category}', resource {idx} is not a dict"
                )
            required_res = {"title", "url", "filename"}
            if not required_res.issubset(resource.keys()):
                raise ValueError(
                    f"Category '{category}', resource {idx} missing keys: "
                    f"{required_res}"
                )


# ============================================================================
# DOWNLOAD LOGIC
# ============================================================================

def create_directory(path: str, logger: logging.Logger) -> bool:
    """Create directory if it doesn't exist."""
    try:
        Path(path).mkdir(parents=True, exist_ok=True)
        return True
    except Exception as e:
        logger.error(f"Failed to create directory '{path}': {e}")
        return False


def file_exists_and_valid(filepath: str, logger: logging.Logger) -> bool:
    """Check if file exists and has non-zero size."""
    if not os.path.exists(filepath):
        return False

    size = os.path.getsize(filepath)
    if size == 0:
        logger.warning(f"Skipping zero-byte file (will re-download): {filepath}")
        return False

    return True


def download_with_retries(
    url: str,
    filepath: str,
    logger: logging.Logger,
    max_retries: int = MAX_RETRIES
) -> Tuple[bool, str]:
    """
    Download a file with retry logic and streaming.
    Uses exponential backoff for rate limits (429) and
    longer timeouts for known-slow government domains.

    Returns:
        Tuple of (success: bool, message: str)
    """
    headers = {"User-Agent": DEFAULT_USER_AGENT}

    # Use longer timeout for known-slow domains
    parsed = urlparse(url)
    hostname = parsed.hostname or ""
    timeout = DOWNLOAD_TIMEOUT
    for slow_domain in SLOW_DOMAINS:
        if hostname.endswith(slow_domain):
            timeout = SLOW_DOMAIN_TIMEOUT
            logger.debug(f"Using extended timeout ({timeout}s) for slow domain: {hostname}")
            break

    for attempt in range(1, max_retries + 1):
        try:
            logger.debug(f"Download attempt {attempt}/{max_retries}: {url}")

            response = requests.get(
                url,
                headers=headers,
                timeout=timeout,
                stream=True,
                allow_redirects=True
            )
            response.raise_for_status()

            # Check content type - reject HTML pages masquerading as PDFs
            content_type = response.headers.get("content-type", "").lower()
            if "text/html" in content_type and filepath.endswith(".pdf"):
                logger.warning(
                    f"Server returned HTML instead of PDF (content-type: {content_type}). "
                    f"URL may be a landing page, not a direct download."
                )
                # Save as .html instead so user can still access it
                html_path = filepath.replace(".pdf", "_LANDING_PAGE.html")
                with open(html_path, "wb") as f:
                    for chunk in response.iter_content(chunk_size=CHUNK_SIZE):
                        if chunk:
                            f.write(chunk)
                return False, f"Got HTML instead of PDF - saved landing page to {os.path.basename(html_path)}"

            # Get total file size from headers
            content_length = response.headers.get("content-length")
            if content_length:
                total_size = int(content_length)
            else:
                total_size = None

            # Stream download to file
            downloaded_bytes = 0
            with open(filepath, "wb") as f:
                for chunk in response.iter_content(chunk_size=CHUNK_SIZE):
                    if chunk:
                        f.write(chunk)
                        downloaded_bytes += len(chunk)

            if total_size and downloaded_bytes < total_size:
                logger.warning(
                    f"Incomplete download: got {downloaded_bytes}/{total_size} "
                    f"bytes"
                )
                if attempt < max_retries:
                    time.sleep(RETRY_DELAY)
                    continue
                return False, "Incomplete download (file truncated)"

            # Verify downloaded PDF isn't too small (likely an error page)
            if filepath.endswith(".pdf") and downloaded_bytes < MIN_PDF_SIZE:
                logger.warning(
                    f"Downloaded file is suspiciously small ({downloaded_bytes} bytes). "
                    f"May be an error page."
                )
                return False, f"File too small ({downloaded_bytes} bytes) - likely an error page"

            # Quick PDF header check
            if filepath.endswith(".pdf"):
                try:
                    with open(filepath, "rb") as f:
                        header = f.read(5)
                    if header != b"%PDF-":
                        logger.warning(
                            f"File does not start with PDF header (got: {header!r}). "
                            f"May not be a valid PDF."
                        )
                        # Keep the file but warn - it might still be usable
                except Exception:
                    pass

            logger.info(f"Successfully downloaded: {filepath} "
                       f"({downloaded_bytes:,} bytes)")
            return True, "Downloaded successfully"

        except requests.exceptions.Timeout:
            msg = f"Timeout (attempt {attempt}/{max_retries})"
            if attempt < max_retries:
                logger.warning(msg)
                time.sleep(RETRY_DELAY)
            else:
                return False, msg

        except requests.exceptions.ConnectionError as e:
            msg = f"Connection error: {str(e)[:50]} (attempt {attempt}/{max_retries})"
            if attempt < max_retries:
                logger.warning(msg)
                time.sleep(RETRY_DELAY)
            else:
                return False, msg

        except requests.exceptions.HTTPError as e:
            status_code = e.response.status_code
            if status_code in (403, 404):
                return False, f"HTTP {status_code}: Resource not found or forbidden"
            if status_code == 429:
                # Rate limited - use exponential backoff
                backoff = RETRY_DELAY * (2 ** (attempt - 1))  # 5, 10, 20, 40s
                retry_after = e.response.headers.get("Retry-After")
                if retry_after and retry_after.isdigit():
                    backoff = max(backoff, int(retry_after))
                msg = f"Rate limited (429), waiting {backoff}s (attempt {attempt}/{max_retries})"
                if attempt < max_retries:
                    logger.warning(msg)
                    time.sleep(backoff)
                else:
                    return False, msg
                continue
            msg = f"HTTP error {status_code} (attempt {attempt}/{max_retries})"
            if attempt < max_retries:
                logger.warning(msg)
                time.sleep(RETRY_DELAY)
            else:
                return False, msg

        except requests.exceptions.RequestException as e:
            msg = f"Request error: {str(e)[:60]} (attempt {attempt}/{max_retries})"
            if attempt < max_retries:
                logger.warning(msg)
                time.sleep(RETRY_DELAY)
            else:
                return False, msg

        except OSError as e:
            return False, f"File I/O error: {str(e)[:60]}"

    return False, "Unknown error after retries"


def download_resource(
    resource: Dict,
    output_dir: str,
    logger: logging.Logger
) -> Tuple[bool, str]:
    """
    Download a single resource.

    Args:
        resource: Resource dict with title, url, filename, etc.
        output_dir: Directory to save the file
        logger: Logger instance

    Returns:
        Tuple of (success: bool, status_message: str)
    """
    title = resource.get("title", "Unknown")
    url = resource.get("url", "").strip()
    filename = resource.get("filename", "").strip()

    # Validate required fields
    if not url:
        return False, f"[{title}] Missing URL"

    if not filename:
        return False, f"[{title}] Missing filename"

    filepath = os.path.join(output_dir, filename)

    # Check if file already exists
    if file_exists_and_valid(filepath, logger):
        logger.info(f"[{title}] Already exists, skipping: {filepath}")
        return True, "Already exists"

    # Create directory
    if not create_directory(output_dir, logger):
        return False, f"Could not create output directory: {output_dir}"

    # Attempt download
    success, message = download_with_retries(url, filepath, logger)

    if success:
        return True, message
    else:
        # Clean up partial/corrupt file
        if os.path.exists(filepath):
            try:
                os.remove(filepath)
            except OSError:
                pass
        return False, message


# ============================================================================
# MAIN ORCHESTRATION
# ============================================================================

def download_all_resources(
    manifest: Dict,
    categories: Optional[List[str]] = None,
    logger: Optional[logging.Logger] = None
) -> Dict[str, Dict[str, int]]:
    """
    Download resources from manifest, optionally filtered by category.

    Args:
        manifest: Loaded manifest dict
        categories: List of category names to download. If None, download all.
        logger: Logger instance

    Returns:
        Summary dict with statistics per category
    """
    if logger is None:
        logger = setup_logging()

    summary = {}

    for category_name, category_data in manifest["categories"].items():
        # Skip if categories filter is specified and this category not included
        if categories and category_name not in categories:
            logger.info(f"Skipping category (not selected): {category_name}")
            continue

        logger.info(f"\n{'='*70}")
        logger.info(f"Processing category: {category_name}")
        logger.info(f"Description: {category_data.get('description', 'N/A')}")
        logger.info(f"{'='*70}")

        output_dir = category_data.get("output_dir", "")
        resources = category_data.get("resources", [])

        if not output_dir:
            logger.error(f"Category '{category_name}' has no output_dir")
            summary[category_name] = {"total": 0, "success": 0, "failed": 0}
            continue

        success_count = 0
        failed_count = 0

        for idx, resource in enumerate(resources, 1):
            title = resource.get("title", f"Resource {idx}")
            verified = resource.get("verified", False)

            status = "[VERIFIED]" if verified else "[UNVERIFIED]"
            logger.info(f"\n{status} {idx}/{len(resources)}: {title}")

            success, message = download_resource(resource, output_dir, logger)

            if success:
                success_count += 1
                logger.info(f"  ✓ {message}")
            else:
                failed_count += 1
                logger.error(f"  ✗ {message}")

        summary[category_name] = {
            "total": len(resources),
            "success": success_count,
            "failed": failed_count
        }

        logger.info(f"\nCategory summary: {success_count} succeeded, "
                   f"{failed_count} failed")

    return summary


def print_final_summary(summary: Dict[str, Dict[str, int]]) -> None:
    """Print final summary of all downloads."""
    print("\n" + "="*70)
    print("FINAL DOWNLOAD SUMMARY")
    print("="*70)

    total_all = 0
    success_all = 0
    failed_all = 0

    for category, stats in summary.items():
        total = stats["total"]
        success = stats["success"]
        failed = stats["failed"]

        total_all += total
        success_all += success
        failed_all += failed

        status_icon = "✓" if failed == 0 else "✗"
        print(f"{status_icon} {category:40s} {success:3d}/{total:3d} succeeded")

    print("-"*70)
    print(f"{'OVERALL':40s} {success_all:3d}/{total_all:3d} succeeded")
    print("="*70)

    if failed_all == 0:
        print("✓ All downloads completed successfully!")
    else:
        print(f"⚠ {failed_all} download(s) failed. Check download_resources.log "
              f"for details.")

    print("\nLog file: download_resources.log")


# ============================================================================
# CLI & ENTRY POINT
# ============================================================================

def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Download free, open-access academic resources on "
                    "regenerative agriculture and related topics.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python download_resources.py
  python download_resources.py --category silvopasture_and_agroforestry
  python download_resources.py --category silvopasture_and_agroforestry \\
                               --category biochar_and_carbon
  python download_resources.py --manifest custom_manifest.json
        """.strip()
    )

    parser.add_argument(
        "--manifest",
        default=DEFAULT_MANIFEST,
        help=f"Path to manifest JSON file (default: {DEFAULT_MANIFEST})"
    )

    parser.add_argument(
        "--category",
        action="append",
        dest="categories",
        help="Category to download (can specify multiple times). "
             "If omitted, download all categories."
    )

    args = parser.parse_args()

    # Setup logging
    logger = setup_logging()
    logger.info("Starting resource download...")
    logger.info(f"Manifest file: {args.manifest}")

    # Load and validate manifest
    try:
        manifest = load_manifest(args.manifest)
        validate_manifest(manifest)
        logger.info(f"Loaded manifest with {len(manifest['categories'])} "
                   f"categories")
    except (FileNotFoundError, ValueError, json.JSONDecodeError) as e:
        logger.error(f"Failed to load manifest: {e}")
        print(f"\nERROR: {e}", file=sys.stderr)
        sys.exit(1)

    # Validate selected categories if specified
    if args.categories:
        invalid_categories = set(args.categories) - \
                            set(manifest["categories"].keys())
        if invalid_categories:
            logger.error(
                f"Invalid categories: {', '.join(invalid_categories)}"
            )
            print(f"ERROR: Invalid categories: {', '.join(invalid_categories)}",
                  file=sys.stderr)
            print(f"Available categories: "
                  f"{', '.join(manifest['categories'].keys())}",
                  file=sys.stderr)
            sys.exit(1)

    # Download resources
    try:
        summary = download_all_resources(
            manifest,
            categories=args.categories,
            logger=logger
        )
    except Exception as e:
        logger.exception(f"Unexpected error during download: {e}")
        print(f"\nERROR: {e}", file=sys.stderr)
        sys.exit(1)

    # Print final summary
    print_final_summary(summary)


if __name__ == "__main__":
    main()
