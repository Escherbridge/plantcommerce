# Geospatial Wildfire Prevention System - Quick Start Guide

## 5-Minute Setup

### 1. View the Interactive Map (No Setup Required)
Open `map_viewer.html` in any modern web browser. The map includes sample data with:
- 19 realistic fire risk zones across Idaho
- 2 active fire detections
- 3 recent ecosystem interventions
- Interactive controls for layer toggling and filtering

**Features:**
- Click zones for detailed information
- Toggle layers on/off
- Filter by time range and risk level
- Export data as GeoJSON
- Multiple basemap options (OpenStreetMap, Topographic)

---

## 30-Minute Full Setup (with Live Data)

### Prerequisites
- Python 3.8+
- pip package manager
- Internet connection

### Step 1: Install Dependencies
```bash
cd geospatial_system
pip install -r requirements.txt
```

### Step 2: Get NASA FIRMS API Key (Free)
1. Visit: https://firms.modaps.eosdis.nasa.gov/api/area/
2. Register for a free account
3. API key is provided immediately upon registration
4. Valid for 2 years

### Step 3: Create Configuration File
Create `.env` file in the `geospatial_system` directory:
```
NASA_FIRMS_KEY=your_api_key_here
NASA_FIRMS_DAYS=7
NASA_FIRMS_SOURCE=MODIS
DEFAULT_LAT=43.6
DEFAULT_LON=-114.0
DEFAULT_ZOOM=6
CACHE_DURATION_HOURS=24
CACHE_DIR=.cache
LOG_LEVEL=INFO
LOG_FILE=geospatial_system.log
```

### Step 4: Test the Data Pipeline
```bash
python data_pipeline.py
```

Expected output:
```
2026-03-15 22:50:10 - data_pipeline - INFO - Fetching active fires from: https://firms.modaps.eosdis.nasa.gov/api/area/csv/...
2026-03-15 22:50:12 - data_pipeline - INFO - Retrieved X fire detections
```

### Step 5: Generate Strategy Recommendations
```bash
python strategy_mapper.py
```

This generates recommendations for 2 sample zones showing suitability scores for each intervention strategy.

### Step 6: Test Ecosystem Monitoring
```bash
python ecosystem_monitor.py
```

Creates sample ecosystem actions and displays impact calculations.

---

## Usage Examples

### Example 1: Fetch Real Fire Data and Weather
```python
from data_pipeline import DataPipeline

pipeline = DataPipeline(api_key="your_key")

# Define region (Idaho)
bounds = {
    "north": 49.0,
    "south": 42.0,
    "east": -111.0,
    "west": -117.5
}

# Fetch all data
data = pipeline.fetch_all_data(bounds)

# Access individual datasets
fires = data["fires"]
weather = data["weather"]
soil = data["soil"]
vegetation = data["vegetation"]

print(f"Retrieved {len(fires['features'])} fire detections")
```

### Example 2: Map Intervention Strategies
```python
from strategy_mapper import StrategyMapper

mapper = StrategyMapper()

# Score a zone
zone_props = {
    "fire_risk_index": 75,
    "temperature_c": 28,
    "relative_humidity": 35,
    "wind_speed_kmh": 15,
    "slope_percent": 12,
    "drainage_class": "well",
    "fuel_load_tons_ha": 20,
    "vegetation_type": "conifer_forest",
    "rainfall_annual_mm": 350,
    "area_hectares": 100,
    "near_wui": True
}

scores = mapper.score_zone(zone_props)

# Get recommendations
recommendations = mapper.recommend_strategies([
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [-114.5, 43.5]},
        "properties": zone_props
    }
])

print(f"Top strategy: {recommendations['features'][0]['properties']['top_strategy']}")
```

### Example 3: Log Ecosystem Actions
```python
from ecosystem_monitor import EcosystemMonitor, EcosystemAction, ActionType
from datetime import datetime

monitor = EcosystemMonitor()

# Create and log a grazing intervention
action = EcosystemAction(
    action_type=ActionType.GRAZING_EVENT,
    zone_id="zone_001",
    location=(43.5, -114.2),
    timestamp=datetime.now(),
    area_hectares=150,
    duration_days=14,
    metadata={"livestock_units": 100}
)

action_id = monitor.log_action(action)
print(f"Logged action: {action_id}")

# Get zone status
status = monitor.get_zone_status("zone_001")
print(f"Fire risk reduced by: {status.fire_risk_baseline - status.fire_risk_current:.1f} points")
print(f"Carbon sequestered: {status.cumulative_impacts.carbon_sequestered_tons_co2e:.1f} tons CO2e")

# Generate report
report = monitor.generate_report("zone_001", period_days=30)
print(report.summary)
```

### Example 4: Export as GeoJSON for Mapping
```python
import json
from ecosystem_monitor import EcosystemMonitor

monitor = EcosystemMonitor()

# Export all actions as GeoJSON
geojson = monitor.export_geojson()

# Save to file
with open('ecosystem_actions.geojson', 'w') as f:
    json.dump(geojson, f, indent=2)

# Or filter by zone
zone_geojson = monitor.export_geojson(zone_id="zone_001")
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│         Interactive Web Map Viewer          │
│    (map_viewer.html - Opens in Browser)     │
└──────────────┬──────────────────────────────┘
               │
        ┌──────┴──────────┬──────────────┬─────────────┐
        ▼                 ▼              ▼              ▼
   Data Pipeline    Strategy Mapper  Ecosystem Mon.  Export
   ┌──────────┐     ┌──────────┐     ┌──────────┐    GeoJSON
   │NASA FIRMS│     │Zone Score│     │Actions   │
   │Weather   │     │Recommend │     │Impacts   │
   │Soil      │     │Prioritize│     │Reports   │
   │Vegetation│     │Guidance  │     │Trends    │
   └──────────┘     └──────────┘     └──────────┘
```

---

## Key Files and Their Purpose

| File | Purpose | Lines |
|------|---------|-------|
| `map_viewer.html` | Interactive web-based visualization with Leaflet.js | 769 |
| `data_pipeline.py` | Fetches and normalizes data from NASA FIRMS, Open-Meteo, USDA, LANDFIRE | 756 |
| `strategy_mapper.py` | Maps intervention strategies to zones with suitability scoring | 775 |
| `ecosystem_monitor.py` | Tracks ecosystem interventions and calculates measurable impacts | 645 |
| `README.md` | Comprehensive system documentation | 508 |
| `requirements.txt` | Python package dependencies | - |

**Total: 3,453 lines of production-quality code**

---

## Common Issues & Solutions

### Issue: "ModuleNotFoundError: No module named 'requests'"
**Solution:**
```bash
pip install -r requirements.txt
```

### Issue: "NASA FIRMS API returns 401 Unauthorized"
**Solution:**
1. Verify API key in `.env` file matches the one from https://firms.modaps.eosdis.nasa.gov/api/area/
2. Check key hasn't expired (valid 2 years)
3. Confirm you're using the "area CSV" endpoint key (not map endpoint)

### Issue: Map shows sample data but not live data
**Solution:**
1. Check browser console (F12) for JavaScript errors
2. Verify GeoJSON files are being generated correctly:
   ```bash
   python data_pipeline.py
   ```
3. Check CORS headers if loading from different domain
4. Ensure API responses are valid JSON

### Issue: "PermissionError" when writing cache
**Solution:**
```bash
chmod -R 755 .cache/
```

---

## Next Steps

1. **Customize for Your Region:**
   - Modify bounds in `data_pipeline.py` for your area of interest
   - Adjust thresholds in `strategy_mapper.py` for local conditions
   - Add custom intervention types in `ecosystem_monitor.py`

2. **Integrate with Databases:**
   - PostgreSQL + PostGIS for spatial queries
   - Store action history in relational DB
   - Time-series database for health indicators

3. **Add Real-Time Updates:**
   - WebSocket server for live fire data
   - Desktop notifications for fire detection
   - SMS/email alerts for high-risk zones

4. **Expand Analysis:**
   - Machine learning for fire behavior prediction
   - Cost-benefit analysis for interventions
   - Carbon credit valuation
   - Habitat impact assessment

5. **Mobile Application:**
   - Native apps for field operations
   - Offline map capability
   - Action logging in field
   - GPS-based zone detection

---

## Support & Resources

- **NASA FIRMS API:** https://firms.modaps.eosdis.nasa.gov/
- **Open-Meteo Weather:** https://open-meteo.com/
- **Leaflet.js Documentation:** https://leafletjs.com/
- **USDA Web Soil Survey:** https://websoilsurvey.sc.egov.usda.gov/
- **LANDFIRE Data:** https://www.landfire.gov/

---

## Testing the Complete Pipeline

```bash
#!/bin/bash
# test_pipeline.sh - Run all components

echo "=== Testing Data Pipeline ==="
python data_pipeline.py

echo -e "\n=== Testing Strategy Mapper ==="
python strategy_mapper.py

echo -e "\n=== Testing Ecosystem Monitor ==="
python ecosystem_monitor.py

echo -e "\n=== All tests completed! ==="
echo "Open map_viewer.html in your browser to visualize the results"
```

---

**Version:** 1.0.0-beta
**Last Updated:** March 2026
**Status:** Production-Ready Prototype
