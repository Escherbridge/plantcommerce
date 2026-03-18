# How to Download Resources

The download script can't run from the Cowork sandbox (outbound network is restricted). You need to run it directly on your Windows machine.

## Quick Start (Windows)

1. Open **Command Prompt** or **PowerShell**
2. Navigate to the knowledge_base folder:
   ```
   cd C:\Users\atooz\Programming\plantcommerce\knowledge_base
   ```
3. Make sure `requests` is installed:
   ```
   pip install requests
   ```
4. Run the downloader:
   ```
   python download_resources.py
   ```

## What It Downloads

34 verified PDFs from government and academic sources, organized into 10 categories:

| Category | Files | Sources |
|----------|-------|---------|
| Silvopasture & Agroforestry | 5 | USDA Forest Service, UMN Extension, Grasslands Partnership |
| Wildfire Prevention | 4 | UC Davis Rangelands, California Assembly |
| Biochar & Carbon | 6 | USDA RMRS, NREL, NRCS, International Biochar Initiative |
| Aquaponics & Hydroponics | 2 | FAO Technical Paper 589, Stellenbosch University |
| Keyline & Water Management | 2 | Agriculture Water Stewards, Oregon Dept of Water Resources |
| IoT & Precision Agriculture | 1 | Center for Science and Agriculture |
| Grants & Procurement | 6 | USDA AMS, NRCS, DOE, US Embassy (SAM.gov guides) |
| Fire Modeling & Data | 1 | UC San Diego WIFIRE |
| Carbon Credits | 2 | Verra VCS Standard, RSB Methodology |
| Regenerative Ag Overview | 5 | Rodale Institute, USDA NRCS |

## Options

Download specific categories only:
```
python download_resources.py --category silvopasture_and_agroforestry
python download_resources.py --category wildfire_prevention --category biochar_and_carbon
```

## Troubleshooting

- **"requests not found"** → Run `pip install requests`
- **403 Forbidden** → Some government sites block automated downloads; open the URL in your browser instead
- **HTML instead of PDF** → The script detects this and saves the landing page as `_LANDING_PAGE.html` so you can manually download from there
- **Slow downloads** → Some government PDFs are large; the timeout is set to 60 seconds

## Log File

Check `download_resources.log` for detailed information about any failures.

## Already-Downloaded Files

The script skips files that already exist, so you can safely re-run it if some fail the first time (network hiccups, etc.).
