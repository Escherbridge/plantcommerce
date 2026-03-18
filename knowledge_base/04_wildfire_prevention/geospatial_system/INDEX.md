# Geospatial Wildfire Prevention System - File Index

## Quick Navigation

| File | Purpose | Size | Language |
|------|---------|------|----------|
| [map_viewer.html](#map_viewerhtml) | Interactive web-based map visualization | 769 lines | HTML/JavaScript/CSS |
| [data_pipeline.py](#data_pipelinepy) | Real-time data aggregation from NASA, NOAA, USDA | 756 lines | Python 3.8+ |
| [strategy_mapper.py](#strategy_mapperpy) | Spatial intervention strategy analysis | 775 lines | Python 3.8+ |
| [ecosystem_monitor.py](#ecosystem_monitorpy) | Action tracking and impact calculation | 645 lines | Python 3.8+ |
| [README.md](#readmemd) | Complete system documentation | 508 lines | Markdown |
| [QUICKSTART.md](#quickstartmd) | 5-30 minute setup guide | 300+ lines | Markdown |
| [requirements.txt](#requirementstxt) | Python dependencies | 30+ lines | Text |

---

## File Descriptions

### map_viewer.html
**An interactive, single-file web application for visualizing geospatial wildfire prevention data.**

**No dependencies, no build step required - just open in a browser!**

**Features:**
- 6 visualization layers with toggle controls
- Fire risk heatmap (0-100 scale)
- Active fire detection points (NASA FIRMS)
- Weather overlay with temperature and wind
- Intervention strategy zone recommendations
- Recent ecosystem action markers
- 19 sample zones across Idaho for immediate demonstration

**Interactive Elements:**
- Click zones for detailed analysis sidebar
- Time-range slider (1-365 days)
- Fire risk level filtering
- Strategy type filtering
- Multi-basemap support (OpenStreetMap, Topographic)
- GeoJSON export button
- Legend with color-coded categories

**Technologies:**
- Leaflet.js 1.9.4 (mapping)
- Leaflet Heat (heatmap)
- Leaflet MarkerCluster (clustering)
- Font Awesome (icons)
- Vanilla JavaScript (no frameworks)

**How to Use:**
1. Open `map_viewer.html` in any modern browser
2. See immediate visualization of 19 fire risk zones
3. Click zones to view strategy recommendations
4. Toggle layers to focus on specific data types
5. Use time-range slider to filter by time
6. Export data as GeoJSON for GIS analysis

**Data Embedded:**
- Sample fire risk zones with scores 38-88
- 2 active fire detections with brightness levels
- 3 recent ecosystem actions (grazing, planting, biochar)
- Realistic geographic distribution across Idaho

---

### data_pipeline.py
**Fetches and normalizes real-time geospatial data from open-source APIs.**

**Data Sources (all FREE):**
1. **NASA FIRMS** - Active fire detection at 375m resolution
   - Requires free API key (valid 2 years)
   - Updated every 4 hours
   - Provides brightness confidence metrics

2. **Open-Meteo** - Weather data (no key required)
   - Current conditions: temperature, humidity, wind, pressure
   - Forecast data: up to 7 days
   - Historical data available

3. **USDA Web Soil Survey** - Soil characteristics
   - Drainage class, infiltration rate
   - Organic matter content
   - Hydric status

4. **LANDFIRE** - Vegetation and fuel data
   - Fuel type classification
   - Canopy height and density
   - Fuel load estimates

**Key Classes:**
```python
DataPipeline          # Main orchestrator
FireDetection         # Fire detection dataclass
WeatherPoint          # Weather data point
SoilType              # Soil characteristics
FuelMoistureCalculator  # Nelson Model implementation
```

**Key Methods:**
```python
fetch_active_fires(bounds, days, source)  # Get fires from NASA FIRMS
fetch_weather(lat, lon, include_forecast)  # Get weather from Open-Meteo
get_soil_type(lat, lon)                   # Get soil data
get_vegetation_type(lat, lon)             # Get vegetation data
calculate_fuel_moisture(weather_data)     # Nelson Model calculation
calculate_fire_risk_index(...)            # Composite fire risk (0-100)
fetch_all_data(bounds)                    # Fetch from all sources
clear_cache()                             # Clear cached responses
```

**Features:**
- Smart response caching (configurable duration)
- Async-capable architecture for parallel requests
- Comprehensive error handling and logging
- GeoJSON format output for all data
- Type hints throughout
- Fuel moisture calculation using Nelson Model
- Fire risk index combining 5 weighted factors

**Output Formats:**
- GeoJSON FeatureCollections
- Individual Feature objects
- Normalized metrics (temperature, humidity, wind, etc.)

**Configuration (.env):**
```
NASA_FIRMS_KEY=your_api_key
NASA_FIRMS_DAYS=7
CACHE_DURATION_HOURS=24
CACHE_DIR=.cache
```

---

### strategy_mapper.py
**Maps optimal intervention strategies to geographic zones using multi-criteria analysis.**

**6 Intervention Strategies:**
1. **Silvopasture** - Mixed livestock-forest systems
   - Best for: Well-drained slopes <15%, rainfall >300mm
   - Impact: 35% fire risk reduction, 2.5 tons CO2e/year
   - Cost: $800/hectare

2. **Targeted Grazing** - Strategic fuel load reduction
   - Best for: High fuel areas (>8 tons/ha), grassland
   - Impact: 40% fire risk reduction, 60% fuel reduction
   - Cost: $150/hectare

3. **Keyline** - Water harvesting and infiltration
   - Best for: 5-20% slopes, poor drainage
   - Impact: 100mm/year infiltration, 20% fire risk reduction
   - Cost: $1,200/hectare

4. **Biochar** - Soil restoration and carbon sequestration
   - Best for: Post-fire areas, low organic matter soils
   - Impact: 15% fire risk reduction, 5.0 tons CO2e/year
   - Cost: $2,000/hectare

5. **Fuel Breaks** - Defensible perimeter creation
   - Best for: WUI boundaries, high fire risk areas
   - Impact: 45% fire risk reduction, 45% fire spread reduction
   - Cost: $3,000/hectare

6. **Monitoring Only** - Ecosystem protection
   - Best for: Riparian buffers, sensitive habitat
   - Impact: Data collection, habitat protection
   - Cost: $50/hectare

**Key Classes:**
```python
StrategyMapper        # Main analysis engine
StrategyScore         # Scoring result for one strategy
ZoneRecommendation   # Comprehensive recommendation for zone
```

**Scoring System:**
- **Suitability Score** (0-100): Does zone meet strategy requirements?
- **Urgency Score** (0-100): How pressing is the need?
- **Impact Score** (0-100): Expected reduction in fire risk?
- **Feasibility Score** (0-100): Practical ability to implement?
- **Priority Score**: Weighted combination of above three

**Key Methods:**
```python
score_zone(zone_properties)              # Score all strategies
recommend_strategies(geospatial_features)  # Generate recommendations
generate_prioritization_matrix(...)       # Create decision matrix
```

**Input Properties (for scoring):**
```python
{
    "fire_risk_index": 75,
    "temperature_c": 28,
    "relative_humidity": 35,
    "wind_speed_kmh": 15,
    "slope_percent": 12,
    "drainage_class": "well",
    "infiltration_rate_mm_hr": 10,
    "organic_matter_pct": 4,
    "fuel_load_tons_ha": 20,
    "vegetation_type": "conifer_forest",
    "rainfall_annual_mm": 350,
    "area_hectares": 100,
    "near_wui": True  # Wildland-urban interface
}
```

**Output:**
- GeoJSON with strategy recommendations as feature properties
- Suitability scores for each strategy (0-100)
- Top recommended strategy with implementation guidance
- Estimated outcomes (fire risk %, carbon tons, fuel reduction)
- Cost and timeline estimates

---

### ecosystem_monitor.py
**Tracks ecosystem interventions and calculates measurable impacts over time.**

**8 Action Types:**
1. `GRAZING_EVENT` - Livestock grazing for fuel management
2. `PLANTING` - Tree/vegetation establishment
3. `BIOCHAR_APPLICATION` - Biochar soil amendment
4. `FUEL_TREATMENT` - Mechanical or chemical fuel reduction
5. `WATER_INFILTRATION` - Keyline or infiltration structure
6. `MONITORING` - Survey or assessment activity
7. `ROAD_TREATMENT` - Road maintenance for access
8. `PRESCRIBED_BURN` - Controlled burn operation

**Key Classes:**
```python
EcosystemMonitor    # Main tracking system
EcosystemAction     # Single intervention action
ImpactMetrics       # Quantified impacts
ZoneStatus          # Aggregated zone metrics
Report              # Comprehensive zone report
```

**Impact Metrics Tracked:**
- **Fuel reduction** (tons/hectare)
- **Carbon sequestered** (annual tons CO2e)
- **Water infiltrated** (mm/year)
- **Vegetation established** (trees/hectares)
- **Soil organic matter improvement** (%)
- **Biodiversity units** (habitat index)
- **Fire risk reduction** (index points)

**Key Methods:**
```python
log_action(action)                      # Record ecosystem intervention
get_zone_status(zone_id)                # Get aggregated zone metrics
calculate_impact(action)                # Estimate action impacts
generate_report(zone_id, period_days)   # Create comprehensive report
get_action_history(...)                 # Query action history
export_geojson(zone_id)                 # Export actions as GeoJSON
```

**Features:**
- Persistent storage of action history
- Time-series health trend analysis
- Automatic impact calculation based on action type
- Zone-level aggregation of impacts
- Generates actionable recommendations
- Exports data in GeoJSON format for mapping

**Example Usage:**
```python
monitor = EcosystemMonitor()

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
status = monitor.get_zone_status("zone_001")
report = monitor.generate_report("zone_001", period_days=30)
```

---

### README.md
**Comprehensive system documentation covering architecture, setup, and usage.**

**Sections:**
1. **Overview** - System purpose and scope
2. **System Architecture** - Component relationships and data flow
3. **Components** - Detailed description of each module
4. **Setup & Installation** - Prerequisites and installation steps
5. **Configuration** - Environment variables and settings
6. **Usage** - Code examples for each module
7. **Fire Risk Index Calculation** - Formula and explanation
8. **Fuel Moisture Calculation** - Nelson Model details
9. **Extending the System** - How to add new data sources and strategies
10. **Performance Considerations** - Optimization tips
11. **Security Notes** - Best practices and warnings
12. **Troubleshooting** - Common issues and solutions
13. **Future Enhancements** - Expansion ideas
14. **API Reference** - Complete method documentation

**Formulas Included:**
- Fire Risk Index (5-factor weighted calculation)
- Fuel Moisture (Nelson Model, 1989)
- Strategy suitability scoring algorithms
- Impact estimation models

---

### QUICKSTART.md
**Fast track guide for getting the system up and running in 5-30 minutes.**

**Contents:**
1. **5-Minute Startup** - View demo immediately
2. **30-Minute Full Setup** - Get live data flowing
3. **Usage Examples** - 4 complete code examples
4. **Architecture Overview** - Visual system diagram
5. **Common Issues** - Troubleshooting tips
6. **Next Steps** - Expansion ideas

**Code Examples Provided:**
1. Fetch real fire data and weather
2. Map intervention strategies
3. Log ecosystem actions
4. Export as GeoJSON

**Setup Steps:**
```
1. pip install -r requirements.txt
2. Register for free NASA FIRMS API key
3. Create .env with API key
4. Run: python data_pipeline.py
5. Run: python strategy_mapper.py
6. Run: python ecosystem_monitor.py
```

---

### requirements.txt
**Python package dependencies with version constraints.**

**Core Dependencies:**
- `requests` - HTTP requests for APIs
- `aiohttp` - Async HTTP for parallel requests
- `python-dotenv` - Environment variable management
- `pandas` - Data analysis
- `numpy` - Numerical computing
- `geojson` - GeoJSON handling

**Optional Development Tools:**
- `pytest` - Testing framework
- `black` - Code formatting
- `flake8` - Linting
- `mypy` - Type checking

**Optional Advanced Features:**
- `matplotlib` - Static visualization
- `geopandas` - Geospatial operations
- `folium` - Interactive map generation
- `sqlalchemy` - Database ORM
- `psycopg2-binary` - PostgreSQL adapter

---

## System Architecture Overview

```
User Interaction
      ↓
┌─────────────────────────────────────────────────────┐
│  map_viewer.html (Interactive Web Interface)         │
│  - Click zones for details                           │
│  - Toggle layers                                     │
│  - Filter by risk & strategy                         │
│  - Export as GeoJSON                                 │
└──────────────┬──────────────────────────────────────┘
               ↓
┌──────────────────────────────────────────────────────────┐
│  Data Pipeline (data_pipeline.py)                        │
│  ├─ NASA FIRMS API → Fire detections                     │
│  ├─ Open-Meteo API → Weather data                        │
│  ├─ USDA Survey → Soil characteristics                   │
│  └─ LANDFIRE → Vegetation types                          │
│  Processing: Cache, normalize, calculate fire risk       │
└──────────────┬──────────────────────────────────────────┘
               ↓
┌──────────────────────────────────────────────────────────┐
│  Strategy Mapper (strategy_mapper.py)                     │
│  ├─ Score zones (6 strategies)                           │
│  ├─ Rank by urgency × impact × feasibility               │
│  ├─ Generate guidance                                    │
│  └─ Estimate outcomes                                    │
└──────────────┬──────────────────────────────────────────┘
               ↓
┌──────────────────────────────────────────────────────────┐
│  Ecosystem Monitor (ecosystem_monitor.py)                 │
│  ├─ Log ecosystem actions                                │
│  ├─ Calculate impacts                                    │
│  ├─ Track time-series trends                             │
│  ├─ Generate reports                                     │
│  └─ Export action history                                │
└──────────────┬──────────────────────────────────────────┘
               ↓
        Data Visualization
   (GeoJSON → Map Layers)
```

---

## Getting Started Paths

### Path 1: Quick Visualization (2 minutes)
1. Open `map_viewer.html` in browser
2. Explore sample data
3. Done!

### Path 2: Quick Demo (10 minutes)
1. Install Python 3.8+
2. `pip install requests geojson pandas`
3. Run example code from QUICKSTART.md
4. See GeoJSON output

### Path 3: Full Setup (30 minutes)
1. `pip install -r requirements.txt`
2. Register NASA FIRMS API key (free)
3. Create `.env` with API key
4. Run all three Python modules
5. View live data in web map
6. Integrate with your systems

---

## File Locations

**All files are located at:**
```
/sessions/friendly-peaceful-keller/mnt/plantcommerce/knowledge_base/04_wildfire_prevention/geospatial_system/
```

**Directory Tree:**
```
geospatial_system/
├── map_viewer.html           (Open in browser)
├── data_pipeline.py          (python data_pipeline.py)
├── strategy_mapper.py        (python strategy_mapper.py)
├── ecosystem_monitor.py      (python ecosystem_monitor.py)
├── README.md                 (Read for detailed docs)
├── QUICKSTART.md             (Read for setup guide)
├── requirements.txt          (pip install -r requirements.txt)
└── INDEX.md                  (This file)
```

---

## Feature Summary

| Feature | Implemented | Details |
|---------|-------------|---------|
| Real-time fire detection | ✓ | NASA FIRMS API integration |
| Weather integration | ✓ | Open-Meteo (no key required) |
| Soil analysis | ✓ | USDA Web Soil Survey reference data |
| Vegetation mapping | ✓ | LANDFIRE-based fuel classification |
| Fire risk calculation | ✓ | 5-factor composite index (0-100) |
| Fuel moisture estimation | ✓ | Nelson Model implementation |
| Strategy recommendations | ✓ | 6 strategies with multi-criteria scoring |
| Impact tracking | ✓ | 8 action types with impact metrics |
| Ecosystem monitoring | ✓ | Time-series analysis and reporting |
| Interactive visualization | ✓ | Leaflet.js web mapping |
| Data export | ✓ | GeoJSON format for all data |
| Caching system | ✓ | Configurable duration |
| Error handling | ✓ | Comprehensive logging |
| Type hints | ✓ | Throughout Python code |
| Sample data | ✓ | 19 zones + fires + actions |

---

## Support Resources

**For Implementation Issues:**
- See README.md → Troubleshooting section
- See QUICKSTART.md → Common Issues section
- Check logs in `geospatial_system.log`

**For API Documentation:**
- NASA FIRMS: https://firms.modaps.eosdis.nasa.gov/
- Open-Meteo: https://open-meteo.com/
- USDA Soil Survey: https://websoilsurvey.sc.egov.usda.gov/
- LANDFIRE: https://www.landfire.gov/

**For GIS Integration:**
- Export GeoJSON from map_viewer.html
- Import into QGIS, ArcGIS, or other GIS software
- Use generated JSON with Leaflet, Mapbox, or other web mapping libraries

---

## License & Attribution

This system integrates data from:
- NASA FIRMS (public domain)
- Open-Meteo (free weather data)
- USDA Web Soil Survey (public data)
- LANDFIRE (public datasets)

Please attribute these sources when using the system.

---

**Ready to use! Start with map_viewer.html or QUICKSTART.md**

Last Updated: March 2026
Version: 1.0.0-beta
