"""
Geospatial Data Pipeline for Wildfire Prevention

Fetches and normalizes real-time geospatial data from multiple open-source APIs:
- NASA FIRMS: Active fire detection
- Open-Meteo: Weather data
- USDA Soil Survey: Soil characteristics
- LANDFIRE: Vegetation and fuel types

Outputs normalized GeoJSON for mapping and analysis.
"""

import asyncio
import csv
import io
import json
import logging
import math
from dataclasses import asdict, dataclass
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import urlencode

import aiohttp
import requests
from dotenv import load_dotenv
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()


@dataclass
class FireDetection:
    """Represents a single fire detection point"""
    latitude: float
    longitude: float
    brightness: float  # Radiance in watts/m²/sr
    confidence: float  # Detection confidence (0-100)
    acq_date: str  # Acquisition date (YYYY-MM-DD)
    acq_time: str  # Acquisition time (HHMM UTC)
    instrument: str  # MODIS or VIIRS
    source: str  # Data source identifier

    def to_geojson_feature(self) -> Dict[str, Any]:
        """Convert to GeoJSON feature"""
        return {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [self.longitude, self.latitude]
            },
            "properties": {
                "brightness": self.brightness,
                "confidence": self.confidence,
                "acq_date": self.acq_date,
                "acq_time": self.acq_time,
                "instrument": self.instrument,
                "source": self.source,
                "risk_level": self._classify_brightness()
            }
        }

    def _classify_brightness(self) -> str:
        """Classify fire intensity based on brightness"""
        if self.brightness > 330:
            return "intense"
        elif self.brightness > 300:
            return "high"
        elif self.brightness > 270:
            return "moderate"
        else:
            return "low"


@dataclass
class WeatherPoint:
    """Represents weather data at a location"""
    latitude: float
    longitude: float
    timestamp: datetime
    temperature: float  # Celsius
    relative_humidity: float  # Percentage
    wind_speed: float  # km/h
    wind_direction: int  # Degrees (0-360)
    precipitation: float  # mm
    pressure: float  # hPa

    def to_geojson_feature(self) -> Dict[str, Any]:
        """Convert to GeoJSON feature"""
        return {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [self.longitude, self.latitude]
            },
            "properties": {
                "timestamp": self.timestamp.isoformat(),
                "temperature_c": self.temperature,
                "relative_humidity": self.relative_humidity,
                "wind_speed_kmh": self.wind_speed,
                "wind_direction_deg": self.wind_direction,
                "precipitation_mm": self.precipitation,
                "pressure_hpa": self.pressure
            }
        }


@dataclass
class SoilType:
    """Represents soil characteristics"""
    latitude: float
    longitude: float
    soil_type: str
    drainage_class: str
    infiltration_rate: float  # mm/hr
    organic_matter: float  # Percentage
    hydric: bool

    def to_geojson_feature(self) -> Dict[str, Any]:
        """Convert to GeoJSON feature"""
        return {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [self.longitude, self.latitude]
            },
            "properties": {
                "soil_type": self.soil_type,
                "drainage_class": self.drainage_class,
                "infiltration_rate_mm_hr": self.infiltration_rate,
                "organic_matter_pct": self.organic_matter,
                "hydric": self.hydric
            }
        }


class FuelMoistureCalculator:
    """
    Calculates fuel moisture using simplified Nelson Model.

    Nelson, R.M. (1989). A method for describing transient fire spread
    on conifers. Forest Science 35(3): 681-695.
    """

    @staticmethod
    def calculate_dead_fuel_moisture(
        relative_humidity: float,
        temperature: float,
        days_since_rain: int,
        fuel_lag_hours: int = 10
    ) -> float:
        """
        Estimate dead fuel moisture content using simplified Nelson Model.

        Args:
            relative_humidity: Relative humidity (0-100%)
            temperature: Air temperature (Celsius)
            days_since_rain: Number of days since significant precipitation
            fuel_lag_hours: Fuel drying lag time (default: 10 hours for 1-hour fuels)

        Returns:
            Estimated dead fuel moisture content (%)
        """
        try:
            # Adjust RH based on days since rain
            if days_since_rain == 0:
                adjusted_rh = min(100, relative_humidity + 10)
            else:
                # Exponential decay adjustment
                adjusted_rh = max(relative_humidity - (days_since_rain * 3), 10)

            # Simplified equilibrium moisture content calculation
            # Based on Nelson model simplified approach
            numerator = 1.03 * (101 - math.log(adjusted_rh / 100 + 0.1) / 0.53) ** 1.7
            fuel_moisture = numerator + 6.4

            # Clamp between realistic bounds
            return max(2.0, min(fuel_moisture, 35.0))

        except (ValueError, ZeroDivisionError) as e:
            logger.warning(f"Error calculating fuel moisture: {e}")
            return 12.0  # Default value

    @staticmethod
    def calculate_live_fuel_moisture(
        relative_humidity: float,
        temperature: float,
        vegetation_type: str = "mixed"
    ) -> float:
        """
        Estimate live vegetation fuel moisture.

        Args:
            relative_humidity: Relative humidity (%)
            temperature: Air temperature (Celsius)
            vegetation_type: Type of vegetation (conifer, hardwood, grass)

        Returns:
            Estimated live fuel moisture (%)
        """
        # Base relationship (simplified)
        base_moisture = (relative_humidity * 1.5) / 100 + 50

        # Adjust for vegetation type
        if vegetation_type == "conifer":
            factor = 0.9
        elif vegetation_type == "hardwood":
            factor = 1.0
        else:  # grass
            factor = 1.2

        moisture = base_moisture * factor
        return max(30.0, min(moisture, 250.0))


class DataPipeline:
    """
    Main data pipeline for fetching and normalizing geospatial data.

    Supports async operations for efficient data retrieval.
    """

    # NASA FIRMS Configuration
    FIRMS_BASE_URL = "https://firms.modaps.eosdis.nasa.gov/api/area/csv"

    # Open-Meteo Configuration
    OPENMETEO_BASE_URL = "https://api.open-meteo.com/v1/forecast"

    def __init__(
        self,
        api_key: Optional[str] = None,
        cache_dir: str = ".cache",
        cache_duration_hours: int = 24
    ):
        """
        Initialize data pipeline.

        Args:
            api_key: NASA FIRMS API key (from environment if not provided)
            cache_dir: Directory for caching API responses
            cache_duration_hours: Cache validity duration in hours
        """
        self.api_key = api_key or os.getenv("NASA_FIRMS_KEY")
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(exist_ok=True)
        self.cache_duration = timedelta(hours=cache_duration_hours)

        if not self.api_key:
            logger.warning("NASA FIRMS API key not found. Fire data will not be available.")

    def _get_cache_path(self, key: str) -> Path:
        """Get cache file path for a data key"""
        return self.cache_dir / f"{key}.json"

    def _is_cache_valid(self, cache_path: Path) -> bool:
        """Check if cached data is still valid"""
        if not cache_path.exists():
            return False
        age = datetime.now() - datetime.fromtimestamp(cache_path.stat().st_mtime)
        return age < self.cache_duration

    def _save_cache(self, key: str, data: Dict[str, Any]) -> None:
        """Save data to cache"""
        cache_path = self._get_cache_path(key)
        try:
            with open(cache_path, 'w') as f:
                json.dump(data, f)
            logger.debug(f"Cached data for key: {key}")
        except IOError as e:
            logger.warning(f"Failed to cache data: {e}")

    def _load_cache(self, key: str) -> Optional[Dict[str, Any]]:
        """Load data from cache if valid"""
        cache_path = self._get_cache_path(key)
        if self._is_cache_valid(cache_path):
            try:
                with open(cache_path, 'r') as f:
                    logger.debug(f"Loaded cached data for key: {key}")
                    return json.load(f)
            except IOError as e:
                logger.warning(f"Failed to load cache: {e}")
        return None

    def fetch_active_fires(
        self,
        bounds: Dict[str, float],
        days: int = 7,
        source: str = "MODIS"
    ) -> Dict[str, Any]:
        """
        Fetch active fire detections from NASA FIRMS API.

        Args:
            bounds: Bounding box {'north': 45, 'south': 42, 'east': -113, 'west': -115}
            days: Number of days of data to retrieve (1-7)
            source: Fire detection source ('MODIS' or 'VIIRS')

        Returns:
            GeoJSON FeatureCollection of fire detections
        """
        if not self.api_key:
            logger.error("NASA FIRMS API key not configured")
            return {"type": "FeatureCollection", "features": []}

        cache_key = f"fires_{source}_{days}_{abs(hash(str(bounds)))}"
        cached = self._load_cache(cache_key)
        if cached:
            return cached

        try:
            # Construct FIRMS API URL
            # Format: area/{map_key}/{source}/{area}/
            # area = {lonW},{latS},{lonE},{latN}
            area = f"{bounds['west']},{bounds['south']},{bounds['east']},{bounds['north']}"

            url = f"{self.FIRMS_BASE_URL}/{self.api_key}/{source}/{area}/{days}"
            logger.info(f"Fetching active fires from: {url}")

            response = requests.get(url, timeout=10)
            response.raise_for_status()

            # Parse CSV response
            fires = []
            reader = csv.DictReader(io.StringIO(response.text))
            for row in reader:
                try:
                    fire = FireDetection(
                        latitude=float(row['latitude']),
                        longitude=float(row['longitude']),
                        brightness=float(row['brightness']),
                        confidence=float(row['confidence']),
                        acq_date=row['acq_date'],
                        acq_time=row['acq_time'],
                        instrument=row['instrument'],
                        source=source
                    )
                    fires.append(fire.to_geojson_feature())
                except (KeyError, ValueError) as e:
                    logger.warning(f"Failed to parse fire record: {e}")
                    continue

            result = {
                "type": "FeatureCollection",
                "features": fires,
                "properties": {
                    "source": "NASA FIRMS",
                    "timestamp": datetime.now().isoformat(),
                    "source_type": source,
                    "days": days
                }
            }

            self._save_cache(cache_key, result)
            logger.info(f"Retrieved {len(fires)} fire detections")
            return result

        except requests.RequestException as e:
            logger.error(f"Failed to fetch fire data: {e}")
            return {"type": "FeatureCollection", "features": []}

    def fetch_weather(
        self,
        latitude: float,
        longitude: float,
        include_forecast: bool = True
    ) -> Dict[str, Any]:
        """
        Fetch weather data from Open-Meteo API (free, no key required).

        Args:
            latitude: Location latitude
            longitude: Location longitude
            include_forecast: Include forecast data (7 days)

        Returns:
            GeoJSON Feature with weather data
        """
        cache_key = f"weather_{latitude}_{longitude}"
        cached = self._load_cache(cache_key)
        if cached:
            return cached

        try:
            params = {
                "latitude": latitude,
                "longitude": longitude,
                "current": "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,precipitation",
                "timezone": "UTC"
            }

            if include_forecast:
                params["hourly"] = "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m"
                params["forecast_days"] = 7

            logger.info(f"Fetching weather for ({latitude}, {longitude})")
            response = requests.get(self.OPENMETEO_BASE_URL, params=params, timeout=10)
            response.raise_for_status()

            data = response.json()

            # Extract current conditions
            current = data.get("current", {})
            weather_point = WeatherPoint(
                latitude=latitude,
                longitude=longitude,
                timestamp=datetime.now(),
                temperature=current.get("temperature_2m", 0),
                relative_humidity=current.get("relative_humidity_2m", 0),
                wind_speed=current.get("wind_speed_10m", 0),
                wind_direction=current.get("wind_direction_10m", 0),
                precipitation=current.get("precipitation", 0),
                pressure=current.get("pressure", 1013)
            )

            result = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [longitude, latitude]
                },
                "properties": {
                    "temperature_c": weather_point.temperature,
                    "relative_humidity": weather_point.relative_humidity,
                    "wind_speed_kmh": weather_point.wind_speed,
                    "wind_direction_deg": weather_point.wind_direction,
                    "precipitation_mm": weather_point.precipitation,
                    "timestamp": datetime.now().isoformat(),
                    "source": "Open-Meteo",
                    "hourly_data": data.get("hourly", {}) if include_forecast else None
                }
            }

            self._save_cache(cache_key, result)
            return result

        except requests.RequestException as e:
            logger.error(f"Failed to fetch weather data: {e}")
            return {"type": "Feature", "geometry": {"type": "Point", "coordinates": [longitude, latitude]}, "properties": {}}

    def get_soil_type(self, latitude: float, longitude: float) -> Dict[str, Any]:
        """
        Get soil type for a location (returns sample/reference data).

        In production, this would query USDA Web Soil Survey API.
        For now, returns representative soil types based on location.

        Args:
            latitude: Location latitude
            longitude: Location longitude

        Returns:
            GeoJSON Feature with soil properties
        """
        cache_key = f"soil_{latitude}_{longitude}"
        cached = self._load_cache(cache_key)
        if cached:
            return cached

        # Simplified soil classification based on region
        # In production, integrate with USDA Web Soil Survey API
        soil_types = {
            "high_mountain": {
                "name": "Subalpine Meadow Soil",
                "drainage": "well",
                "infiltration": 15.0,
                "organic_matter": 8.5,
                "hydric": False
            },
            "moderate_slope": {
                "name": "Loamy Mountain Soil",
                "drainage": "well",
                "infiltration": 12.0,
                "organic_matter": 6.5,
                "hydric": False
            },
            "valley_bottom": {
                "name": "Alluvial Valley Soil",
                "drainage": "moderate",
                "infiltration": 8.0,
                "organic_matter": 4.5,
                "hydric": False
            },
            "low_area": {
                "name": "Poorly Drained Soil",
                "drainage": "poor",
                "infiltration": 2.0,
                "organic_matter": 12.0,
                "hydric": True
            }
        }

        # Simple classification by latitude band
        if latitude > 44:
            soil_class = "high_mountain"
        elif latitude > 43:
            soil_class = "moderate_slope"
        elif latitude > 42.5:
            soil_class = "valley_bottom"
        else:
            soil_class = "low_area"

        soil_info = soil_types[soil_class]

        result = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [longitude, latitude]
            },
            "properties": {
                "soil_type": soil_info["name"],
                "drainage_class": soil_info["drainage"],
                "infiltration_rate_mm_hr": soil_info["infiltration"],
                "organic_matter_pct": soil_info["organic_matter"],
                "hydric": soil_info["hydric"],
                "source": "USDA Web Soil Survey (reference)",
                "timestamp": datetime.now().isoformat()
            }
        }

        self._save_cache(cache_key, result)
        return result

    def get_vegetation_type(self, latitude: float, longitude: float) -> Dict[str, Any]:
        """
        Get vegetation type for a location (returns sample/reference data).

        In production, this would use LANDFIRE or satellite imagery.

        Args:
            latitude: Location latitude
            longitude: Location longitude

        Returns:
            GeoJSON Feature with vegetation properties
        """
        cache_key = f"veg_{latitude}_{longitude}"
        cached = self._load_cache(cache_key)
        if cached:
            return cached

        # Simplified vegetation classification
        vegetation_types = {
            "conifer_forest": {
                "type": "Coniferous Forest",
                "fuel_type": "timber_litter",
                "canopy_height_m": 25,
                "canopy_density": 0.7,
                "fuel_load_tons_ha": 45
            },
            "mixed_forest": {
                "type": "Mixed Forest",
                "fuel_type": "mixed_brush_timber",
                "canopy_height_m": 18,
                "canopy_density": 0.6,
                "fuel_load_tons_ha": 35
            },
            "grassland": {
                "type": "Grassland",
                "fuel_type": "short_grass",
                "canopy_height_m": 1,
                "canopy_density": 0.8,
                "fuel_load_tons_ha": 2
            },
            "shrubland": {
                "type": "Shrubland",
                "fuel_type": "brush_slash",
                "canopy_height_m": 3,
                "canopy_density": 0.5,
                "fuel_load_tons_ha": 15
            }
        }

        # Simple classification by latitude/longitude
        if latitude > 43.5 and longitude < -114:
            veg_class = "conifer_forest"
        elif latitude > 43 and longitude < -114.5:
            veg_class = "mixed_forest"
        elif latitude < 43:
            veg_class = "grassland"
        else:
            veg_class = "shrubland"

        veg_info = vegetation_types[veg_class]

        result = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [longitude, latitude]
            },
            "properties": {
                "vegetation_type": veg_info["type"],
                "fuel_type": veg_info["fuel_type"],
                "canopy_height_m": veg_info["canopy_height_m"],
                "canopy_density": veg_info["canopy_density"],
                "fuel_load_tons_ha": veg_info["fuel_load_tons_ha"],
                "source": "LANDFIRE (reference)",
                "timestamp": datetime.now().isoformat()
            }
        }

        self._save_cache(cache_key, result)
        return result

    def calculate_fuel_moisture(
        self,
        weather_data: Dict[str, Any],
        days_since_rain: int = 0
    ) -> float:
        """
        Calculate fuel moisture from weather data.

        Args:
            weather_data: Weather feature with temperature, humidity
            days_since_rain: Days since last meaningful precipitation

        Returns:
            Estimated dead fuel moisture (%)
        """
        props = weather_data.get("properties", {})
        temperature = props.get("temperature_c", 20)
        humidity = props.get("relative_humidity", 50)

        return FuelMoistureCalculator.calculate_dead_fuel_moisture(
            relative_humidity=humidity,
            temperature=temperature,
            days_since_rain=days_since_rain
        )

    def calculate_fire_risk_index(
        self,
        weather_data: Dict[str, Any],
        vegetation_data: Dict[str, Any],
        days_since_rain: int = 0
    ) -> float:
        """
        Calculate composite fire risk index (0-100).

        Index based on:
        - Temperature (higher = more risk)
        - Relative humidity (lower = more risk)
        - Wind speed (higher = more risk)
        - Fuel moisture (lower = more risk)
        - Days since rain (more days = more risk)

        Args:
            weather_data: Weather feature data
            vegetation_data: Vegetation feature data
            days_since_rain: Days since significant precipitation

        Returns:
            Fire risk index (0-100)
        """
        try:
            props = weather_data.get("properties", {})
            temp = props.get("temperature_c", 20)
            humidity = props.get("relative_humidity", 50)
            wind = props.get("wind_speed_kmh", 10)

            veg_props = vegetation_data.get("properties", {})
            fuel_load = veg_props.get("fuel_load_tons_ha", 20)

            fuel_moisture = self.calculate_fuel_moisture(weather_data, days_since_rain)

            # Normalize components to 0-100 scale
            temp_score = min(100, (temp / 40) * 100)  # 40°C = max score
            humidity_score = max(0, 100 - humidity)  # Inverse: lower humidity = higher risk
            wind_score = min(100, (wind / 50) * 100)  # 50 km/h = max score
            fuel_score = min(100, (fuel_load / 50) * 100)  # 50 tons/ha = max score
            moisture_score = max(0, 100 - (fuel_moisture * 3))  # Lower moisture = higher risk

            # Weighted combination
            risk_index = (
                temp_score * 0.25 +
                humidity_score * 0.20 +
                wind_score * 0.20 +
                fuel_score * 0.20 +
                moisture_score * 0.15
            )

            return min(100, max(0, risk_index))

        except (KeyError, TypeError, ValueError) as e:
            logger.warning(f"Error calculating fire risk index: {e}")
            return 50.0  # Default moderate risk

    def fetch_all_data(self, bounds: Dict[str, float]) -> Dict[str, Any]:
        """
        Fetch all available data for a region.

        Args:
            bounds: Bounding box {'north', 'south', 'east', 'west'}

        Returns:
            Dictionary with all data sources as GeoJSON
        """
        logger.info(f"Fetching all data for bounds: {bounds}")

        # Calculate center point for weather and soil queries
        center_lat = (bounds['north'] + bounds['south']) / 2
        center_lon = (bounds['east'] + bounds['west']) / 2

        # Fetch data from all sources
        fires = self.fetch_active_fires(bounds)
        weather = self.fetch_weather(center_lat, center_lon)
        soil = self.get_soil_type(center_lat, center_lon)
        vegetation = self.get_vegetation_type(center_lat, center_lon)

        return {
            "fires": fires,
            "weather": weather,
            "soil": soil,
            "vegetation": vegetation,
            "timestamp": datetime.now().isoformat(),
            "bounds": bounds
        }

    def clear_cache(self) -> None:
        """Clear all cached data"""
        import shutil
        try:
            shutil.rmtree(self.cache_dir)
            self.cache_dir.mkdir(exist_ok=True)
            logger.info("Cache cleared")
        except Exception as e:
            logger.error(f"Failed to clear cache: {e}")


# Example usage
if __name__ == "__main__":
    # Initialize pipeline
    pipeline = DataPipeline()

    # Define Idaho region
    idaho_bounds = {
        "north": 49.0,
        "south": 42.0,
        "east": -111.0,
        "west": -117.5
    }

    # Fetch all data
    all_data = pipeline.fetch_all_data(idaho_bounds)

    # Print results
    print(json.dumps(all_data, indent=2, default=str))
