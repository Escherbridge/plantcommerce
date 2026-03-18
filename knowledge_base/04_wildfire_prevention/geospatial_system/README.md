# Geospatial Wildfire Prevention and Ecosystem Management System

## Overview

This system provides an integrated geospatial platform for monitoring wildfire risk, managing ecosystem interventions, and optimizing land management strategies across fire-prone regions. It combines real-time fire detection, weather monitoring, soil analysis, and vegetation assessment to recommend targeted prevention and restoration strategies.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Data Pipeline Layer                       │
├──────────────┬──────────────┬──────────────┬────────────────┤
│  NASA FIRMS  │ Open-Meteo   │  USDA Soil   │   LANDFIRE     │
│  Fire Data   │  Weather     │  Survey      │   Vegetation   │
└──────────────┴──────────────┴──────────────┴────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              Analysis & Risk Calculation Layer              │
├──────────────────────────────────────────────────────────────┤
│  • Fuel Moisture Calculation (Nelson Model)                │
│  • Fire Risk Index (temperature, humidity, wind, fuel)     │
│  • Geospatial Feature Engineering                          │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              Strategy Mapping & Recommendation Layer        │
├──────────────────────────────────────────────────────────────┤
│  • Zone Classification (6 intervention types)              │
│  • Suitability Scoring (0-100 per strategy)                │
│  • Prioritization Matrix (urgency × impact × feasibility)  │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│           Ecosystem Monitoring & Impact Tracking            │
├──────────────────────────────────────────────────────────────┤
│  • Action Logging (grazing, planting, biochar, etc.)       │
│  • Impact Metrics (fuel reduction, carbon, water)          │
│  • Health Indicators & Time-Series Analysis                │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                 Interactive Map Viewer                      │
├──────────────────────────────────────────────────────────────┤
│  • Multi-layer visualization (Leaflet.js)                   │
│  • Real-time data display                                   │
│  • Zone analysis & reporting                                │
└──────────────────────────────────────────────────────────────┘
```

## Components

### 1. Data Pipeline (`data_pipeline.py`)

**Purpose**: Fetches and normalizes data from multiple open-source geospatial APIs.

**Data Sources**:
- **NASA FIRMS** (Fire Information for Resource Management System)
  - Active fire detections at 375m resolution
  - Updated every 4 hours
  - API: https://firms.modaps.eosdis.nasa.gov/api/area/csv/
  - Requires free API key registration

- **Open-Meteo Weather API**
  - Free real-time and forecast weather
  - Temperature, humidity, wind speed/direction, precipitation
  - No API key required
  - Historical data available

- **USDA Web Soil Survey**
  - Soil type, hydrology, erosion risk
  - Used indirectly via spatial matching with known soil maps

- **LANDFIRE Data**
  - Fuel type classification
  - Vegetation height and density
  - Public datasets available through USGS

**Key Classes**:
```python
DataPipeline
├── fetch_active_fires(bounds, days=7)
├── fetch_weather(lat, lon, include_forecast=True)
├── get_soil_type(lat, lon)
├── get_vegetation_type(lat, lon)
└── calculate_fuel_moisture(weather_data)
```

**Output**: GeoJSON FeatureCollections with normalized, cached data

### 2. Strategy Mapper (`strategy_mapper.py`)

**Purpose**: Maps intervention strategies to geographic zones based on environmental conditions.

**Intervention Types**:

| Strategy | Use Case | Conditions |
|----------|----------|-----------|
| **Silvopasture** | Mixed livestock/forest systems | Moderate slope, adequate water, suitable soils |
| **Targeted Grazing** | Fuel load reduction | High fuel, grassland/shrub, accessible |
| **Keyline** | Water concentration & infiltration | Degraded hydrology, contour-following |
| **Biochar** | Soil restoration & carbon | Post-fire areas, low organic matter |
| **Fuel Breaks** | Defensible perimeter creation | WUI boundary, ridgelines, infrastructure |
| **Monitoring Only** | Ecosystem protection | Riparian, wetlands, protected habitat |

**Key Classes**:
```python
StrategyMapper
├── score_zone(zone_properties) → dict
├── generate_prioritization_matrix() → DataFrame
├── recommend_strategies(geospatial_features) → GeoJSON
└── get_implementation_guidance(strategy_type, zone) → str
```

**Output**: GeoJSON with strategy recommendations and suitability scores

### 3. Ecosystem Monitor (`ecosystem_monitor.py`)

**Purpose**: Tracks real-world ecosystem interventions and their measurable impacts.

**Action Types**:
- `grazing_event`: Livestock grazing for fuel management
- `planting`: Tree/vegetation establishment
- `biochar_application`: Biochar soil amendment
- `fuel_treatment`: Mechanical or chemical fuel reduction
- `water_infiltration`: Keyline or infiltration structure construction
- `monitoring`: Survey or assessment activity

**Key Classes**:
```python
EcosystemAction
├── action_type: str
├── location: (lat, lon)
├── timestamp: datetime
├── status: str (pending, in_progress, completed)
├── metrics: dict

EcosystemMonitor
├── log_action(action: EcosystemAction)
├── get_zone_status(zone_id) → ZoneStatus
├── calculate_impact(action) → ImpactMetrics
└── generate_report(zone_id, date_range) → Report
```

**Impact Metrics Tracked**:
- **Fuel reduction** (tons/hectare)
- **Carbon sequestered** (tons CO2e)
- **Water infiltrated** (mm/year)
- **Vegetation established** (trees/hectares)
- **Soil health** (organic matter %, infiltration rate)

### 4. Interactive Map Viewer (`map_viewer.html`)

**Purpose**: Web-based visualization of all geospatial data and analysis results.

**Features**:
- **Multi-layer visualization** using Leaflet.js
- **Layer toggles**:
  - Fire risk heatmap (0-100 scale, red intensity = risk)
  - Active fires (NASA FIRMS data)
  - Weather overlay (temperature, wind vectors)
  - Soil types (colored by type)
  - Strategy zones (color-coded by recommended intervention)
  - Ecosystem actions (timestamps and types)

- **Interactive features**:
  - Click zones for detailed analysis
  - Time-range slider for temporal views
  - Sidebar with zone metrics and recommendations
  - Legend with color coding

- **Sample Data**: Includes ~20 realistic sample points across Idaho for immediate visualization

## Setup & Installation

### Prerequisites

```bash
Python 3.8+
pip install:
  - aiohttp          # Async HTTP requests
  - requests         # HTTP requests
  - geojson          # GeoJSON handling
  - pandas           # Data analysis
  - numpy            # Numerical computing
  - python-dotenv    # Environment variable management
```

### Installation

```bash
# Clone or download the repository
cd knowledge_base/04_wildfire_prevention/geospatial_system

# Install dependencies
pip install -r requirements.txt

# Set up NASA FIRMS API key
# 1. Register at: https://firms.modaps.eosdis.nasa.gov/api/area/
# 2. Create .env file:
echo "NASA_FIRMS_KEY=your_api_key_here" > .env
```

### Configuration

Create a `.env` file in the system directory:

```
# NASA FIRMS Configuration
NASA_FIRMS_KEY=your_api_key_from_firms.modaps.eosdis.nasa.gov
NASA_FIRMS_DAYS=7          # Number of days of fire data to fetch
NASA_FIRMS_SOURCE=MODIS    # or VIIRS

# Geographic Focus (default: Idaho)
DEFAULT_LAT=43.6
DEFAULT_LON=-114.0
DEFAULT_ZOOM=6

# Caching
CACHE_DURATION_HOURS=24
CACHE_DIR=.cache

# Logging
LOG_LEVEL=INFO
LOG_FILE=geospatial_system.log
```

## Usage

### 1. Running the Data Pipeline

```python
from data_pipeline import DataPipeline

pipeline = DataPipeline(api_key="your_nasa_key")

# Fetch all data for a region (bounding box)
bounds = {
    "north": 44.5,
    "south": 42.5,
    "east": -113.0,
    "west": -115.0
}

data = pipeline.fetch_all_data(bounds)
# Returns: {
#   "fires": GeoJSON,
#   "weather": GeoJSON,
#   "soil": GeoJSON,
#   "vegetation": GeoJSON
# }
```

### 2. Mapping Intervention Strategies

```python
from strategy_mapper import StrategyMapper

mapper = StrategyMapper()
strategy_zones = mapper.recommend_strategies(
    fire_data=data["fires"],
    weather_data=data["weather"],
    soil_data=data["soil"],
    vegetation_data=data["vegetation"]
)

# Returns GeoJSON with recommended strategies
print(strategy_zones)
```

### 3. Monitoring Ecosystem Actions

```python
from ecosystem_monitor import EcosystemMonitor, EcosystemAction

monitor = EcosystemMonitor()

# Log an intervention
action = EcosystemAction(
    action_type="grazing_event",
    location=(43.5, -114.2),
    timestamp=datetime.now(),
    duration_days=14,
    livestock_units=50
)

monitor.log_action(action)

# Get zone status
status = monitor.get_zone_status("zone_001")
print(f"Fuel reduction: {status.fuel_reduction_tons} tons")
print(f"Carbon sequestered: {status.carbon_tons} tons CO2e")
```

### 4. Viewing in Browser

Simply open `map_viewer.html` in a web browser. The map loads with sample data and is immediately interactive.

To use live data:
1. Run the Python backend to generate live GeoJSON files
2. Update the data URLs in `map_viewer.html`
3. Refresh the browser to display updated data

## Data Flow Example

```
1. User opens map_viewer.html
   ↓
2. Map loads sample/live GeoJSON data layers
   ↓
3. User clicks on a zone
   ↓
4. Sidebar displays:
   - Fire risk score
   - Recommended strategies & suitability scores
   - Recent ecosystem actions in that zone
   - Impact metrics from interventions
   ↓
5. User can filter by time range or intervention type
   ↓
6. Recommendations adapt dynamically to latest data
```

## API Reference

### DataPipeline

```python
# Initialize
pipeline = DataPipeline(api_key=str, cache_dir=str, cache_duration_hours=int)

# Public methods
pipeline.fetch_active_fires(bounds, days) → GeoJSON
pipeline.fetch_weather(lat, lon, include_forecast) → GeoJSON
pipeline.get_soil_type(lat, lon) → dict
pipeline.get_vegetation_type(lat, lon) → dict
pipeline.calculate_fuel_moisture(weather_data, days_since_rain) → float
pipeline.fetch_all_data(bounds) → dict
pipeline.clear_cache() → None
```

### StrategyMapper

```python
# Initialize
mapper = StrategyMapper()

# Public methods
mapper.score_zone(zone_properties) → dict
mapper.recommend_strategies(fire_data, weather_data, soil_data, veg_data) → GeoJSON
mapper.generate_prioritization_matrix() → pandas.DataFrame
mapper.get_implementation_guidance(strategy_type, zone) → str
```

### EcosystemMonitor

```python
# Initialize
monitor = EcosystemMonitor(storage_path=str)

# Public methods
monitor.log_action(action) → str (action_id)
monitor.get_zone_status(zone_id) → ZoneStatus
monitor.calculate_impact(action) → ImpactMetrics
monitor.generate_report(zone_id, start_date, end_date) → Report
monitor.get_action_history(zone_id, action_type) → List[EcosystemAction]
```

## Fire Risk Index Calculation

The system uses a composite fire risk index based on the Canadian Fire Weather Index (FWI) system, simplified:

```
FireRiskIndex = (w₁ × T + w₂ × (100-RH) + w₃ × WS + w₄ × FMC + w₅ × DSR) / 5

Where:
  T   = Temperature (°C)
  RH  = Relative Humidity (%)
  WS  = Wind Speed (km/h)
  FMC = Fuel Moisture Code (estimated)
  DSR = Days Since Rain
  w₁-w₅ = Weighted coefficients (default: equal weights)

Index Range: 0-100
  0-25   = Low risk
  26-50  = Moderate risk
  51-75  = High risk
  76-100 = Extreme risk
```

## Fuel Moisture Calculation

The system estimates dead fuel moisture using the **Nelson Model** (1989):

```
FMC = 1.03 × {101 - [(ln(H × RH / 100 + 0.1)) / 0.53]^1.7} + 6.4 × sin(day_of_year × π/182)

Where:
  H  = 1-hour fuel moisture lag (hours)
  RH = Relative Humidity (%)
  day_of_year = Julian day (1-365)

Typically for dead fuels: H ≈ 10-20 hours
```

## Extending the System

### Adding New Data Sources

1. Add a new method to `DataPipeline`:
```python
def fetch_custom_data(self, bounds: dict) -> dict:
    """Fetch data from custom source"""
    # Implementation
    return geojson_feature_collection
```

2. Update `recommend_strategies()` to use new data

### Adding New Intervention Strategies

1. Define the strategy parameters in `StrategyMapper.__STRATEGY_PARAMETERS__`
2. Implement scoring logic in `score_strategy_suitability()`
3. Add layer to `map_viewer.html`

### Custom Metrics in EcosystemMonitor

1. Extend `ImpactMetrics` dataclass
2. Implement calculation in `calculate_impact()`
3. Update reporting templates

## Performance Considerations

- **Caching**: API responses cached for 24 hours (configurable)
- **Spatial Indexing**: Use GeoJSON for efficient spatial queries
- **Async Operations**: Data pipeline supports async requests for parallel fetching
- **Map Rendering**: Leaflet.js handles 1000+ features efficiently with clustering

## Security Notes

- Never commit `.env` files with API keys to version control
- Use environment variables for sensitive configuration
- Validate all external data inputs
- Implement rate limiting for public deployments
- Consider authentication for zone modification endpoints

## Troubleshooting

### NASA FIRMS API Returns 401 Error
- Verify API key in `.env` file
- Check key hasn't expired (valid for 2 years)
- Confirm key is for correct API endpoint (area CSV endpoint)

### Weather Data Missing
- Open-Meteo API may be rate-limited
- Check internet connection
- Verify latitude/longitude are valid

### Map Not Loading Data
- Check browser console for JavaScript errors
- Verify GeoJSON files are in correct format
- Check CORS headers if loading from different domain

### High Memory Usage with Large Datasets
- Consider spatial filtering (smaller bounding boxes)
- Increase cache duration to reduce API calls
- Implement data decimation for visualization

## Future Enhancements

1. **Machine Learning**: Predictive fire behavior modeling
2. **Real-time Alerts**: WebSocket-based fire detection notifications
3. **Mobile App**: Native mobile interface for field operations
4. **Drones**: Integration with UAV data collection
5. **Satellite Imagery**: Integration with Sentinel-2 or Landsat
6. **Social Features**: Collaborative zone management and community alerts
7. **Carbon Markets**: Integration with carbon credit systems
8. **Economics**: Cost-benefit analysis for interventions

## Contributing

Contributions welcome! Areas of particular interest:
- Additional weather data sources
- Improved fuel moisture models
- New intervention strategy types
- Performance optimizations
- Testing and validation

## License

[Specify your license]

## References

1. Canadian Forest Fire Weather Index System - Van Wagner, C.E.
2. Nelson, R.M. (1989). A method for describing transient fire spread on conifers
3. NASA FIRMS: https://firms.modaps.eosdis.nasa.gov/
4. Open-Meteo: https://open-meteo.com/
5. USDA Soil Survey: https://websoilsurvey.sc.egov.usda.gov/
6. LANDFIRE: https://www.landfire.gov/

## Contact & Support

For questions or issues, please refer to the project documentation or contact the development team.

---

**Last Updated**: March 2026
**System Version**: 1.0.0-beta
