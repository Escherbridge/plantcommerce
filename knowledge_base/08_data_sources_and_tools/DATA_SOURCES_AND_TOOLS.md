# Open Data Sources & Tools Reference

A comprehensive guide to free and open data sources for building regenerative agriculture and wildfire prevention platforms. This reference includes satellite imagery, weather data, soil properties, vegetation indices, fire monitoring, and open-source tools for geospatial analysis.

---

## Satellite & Remote Sensing

### NASA FIRMS (Fire Information for Resource Management System)

**Homepage:** https://firms.modaps.eosdis.nasa.gov/
**API Documentation:** https://firms.modaps.eosdis.nasa.gov/api/area/

**What it provides:**
- Near real-time active fire detection with 60-second latency for US/Canada
- Global active fire data for remote areas

**Available sensors:**
- MODIS: 1km resolution
- VIIRS (S-NPP): 375m resolution
- VIIRS (NOAA-21): 375m resolution

**Data formats:**
- CSV
- Shapefile (SHP)
- KML
- WMS (Web Map Service)

**Cost:** Free (requires free API key registration)

**Platform use cases:**
- Real-time fire detection layer
- Fire alert triggering for users
- Historical fire distribution analysis

**Integration notes:** API returns JSON with fire coordinates, confidence levels, and scan times. Suitable for automated workflows via scheduled API calls.

---

### Copernicus Sentinel-2

**Homepage:** https://dataspace.copernicus.eu/

**What it provides:**
- 10-meter multispectral satellite imagery
- 5-day global revisit cycle
- Continuous archive since 2015

**Spectral bands (13 total):**
- Visible bands (4): Blue, Green, Red, Red Edge
- NIR (2): Near Infrared bands
- SWIR (2): Shortwave Infrared bands
- Additional bands for atmospheric and cloud detection

**Key spectral indices:**
- NDVI (Normalized Difference Vegetation Index): Vegetation health and greenness
- NDWI (Normalized Difference Water Index): Water content in vegetation
- NBR (Normalized Burn Ratio): Burn severity assessment
- EVI (Enhanced Vegetation Index): Vegetation vigor
- BAI (Burn Area Index): Fire impact detection

**Data formats:**
- GeoTIFF via STAC API
- COG (Cloud Optimized GeoTIFF)

**Cost:** Free

**Platform use cases:**
- Vegetation health monitoring
- Burn severity mapping post-fire
- Land use classification
- Crop health assessment
- Erosion monitoring
- Water feature delineation

**Integration notes:** Accessible via STAC API for time-series processing. Excellent for monitoring ecosystem recovery post-intervention.

---

### Google Earth Engine

**Homepage:** https://earthengine.google.com/

**What it provides:**
- Planetary-scale geospatial analysis platform
- Server-side processing of massive datasets
- Pre-processed image collections

**Data catalog includes:**
- Landsat (30m, global, 1972-present)
- Sentinel-1 & Sentinel-2 (10m, 2015-present)
- MODIS (250m-1km, 2000-present)
- Climate data (temperature, precipitation)
- Elevation models (SRTM, ASTER)
- Land cover classifications

**Available APIs:**
- Python API
- JavaScript API
- REST API (limited)

**Cost:**
- Free for research, education, and nonprofits
- Commercial licensing available
- Generous free tier for most use cases

**Platform use cases:**
- Time-series vegetation analysis
- Change detection workflows
- Large-area processing (faster than local GIS)
- Automated change alerts
- Machine learning on satellite imagery
- Historical land use change analysis

**Integration notes:** Excellent for batch processing large geographic areas. Supports reproducible, version-controlled scripts. Learning curve steeper than desktop GIS but powerful for production workflows.

---

### Landsat (USGS Geological Survey)

**Homepage:** https://www.usgs.gov/landsat-missions

**What it provides:**
- 30-meter resolution multispectral imagery
- Continuous global record since 1972
- Longest-running earth observation satellite program

**Characteristics:**
- Revisit cycle: 16 days (8 days combined Landsat 8 + 9)
- 11 spectral bands (visible through thermal)
- Consistent historical archive for long-term change analysis

**Cost:** Free

**Platform use cases:**
- Long-term land use change tracking (50+ years)
- Historical fire analysis and recovery
- Baseline vegetation conditions
- Seasonal change monitoring
- Thermal data for water quality and temperature assessment

**Integration notes:** Older imagery than Sentinel-2 but superior for historical baselines. Coarser resolution limits fine-scale work but good for large landscapes.

---

### Planet Labs (Commercial with Research Access)

**Homepage:** https://www.planet.com/

**What it provides:**
- 3-5 meter resolution daily imagery of entire Earth
- Planet Education & Research Program: Free for qualifying institutions
- Fastest revisit rate of any commercial provider

**Characteristics:**
- Daily global coverage (weather permitting)
- Multiple sensor types (PlanetScope, SkySat)
- High-frequency change detection

**Cost:**
- Commercial licensing required for typical use
- Free for education and qualifying nonprofits
- Research partnerships available

**Platform use cases:**
- High-frequency vegetation monitoring
- Rapid post-fire damage assessment
- Construction and intervention progress tracking
- Precise change detection
- Weather-independent thermal data (via IR sensors)

**Integration notes:** Most useful if platform qualifies for research program. Daily revisit enables monitoring of rapid changes.

---

## Weather & Climate

### Open-Meteo Weather API

**Homepage:** https://api.open-meteo.com/

**What it provides:**
- Global weather forecasts and historical data
- No API key required
- 80,000+ weather stations integrated

**Available parameters:**
- Current conditions: temperature, humidity, wind speed/direction, precipitation
- Forecast: 10-day daily forecast, 7-day hourly forecast
- Historical: Data back to 1940 for many locations
- Soil data: Soil temperature, soil moisture at multiple depths
- Solar radiation
- Growing degree days (agricultural model)

**Resolution:**
- 1km for some weather models
- 11km for global forecast models

**Rate limiting:**
- 10,000 requests/day (free tier)
- Unlimited for research/nonprofit applications

**Cost:** Free

**Platform use cases:**
- Fire risk calculation (fuel moisture, temperature, wind)
- Irrigation scheduling (rainfall, evapotranspiration)
- Crop growth modeling (growing degree days, soil moisture)
- Wildfire weather alerts
- Frost protection warnings
- Drought monitoring

**Integration notes:** Most accessible API for weather integration. Excellent for automated decision support systems. No authentication required simplifies deployment.

---

### NOAA National Weather Service API

**Homepage:** https://www.weather.gov/documentation/services-web-api

**What it provides:**
- Official US weather forecasts
- Real-time weather observations
- Severe weather alerts and warnings
- Grid point data (0.5 mile resolution for US)

**Data returned:**
- GeoJSON format
- Detailed forecast by location
- Alert geometry and properties

**Cost:** Free

**Platform use cases:**
- Severe weather alerts for users
- Real-time weather data validation
- Tornado, flood, winter storm warnings
- Red flag warning integration (fire danger)
- Local forecast customization

**Integration notes:** US-only, but most authoritative source for US weather. Integrates seamlessly with user location-based services.

---

### PRISM Climate Data

**Homepage:** https://prism.oregonstate.edu/

**What it provides:**
- High-resolution (800m) climate data for United States
- 30+ years of daily, monthly, and annual data
- Extensive ground station network integration

**Parameters:**
- Temperature (minimum, maximum, mean)
- Precipitation
- Dew point
- Vapor pressure deficit
- Mean temperature normals

**Data availability:**
- 1895-present for monthly normals
- 1981-present for daily data

**Cost:** Free

**Platform use cases:**
- Precise climate zone classification
- Site suitability analysis for crop/species selection
- Microclimate assessment
- Frost date determination
- Water balance calculations
- Validation against interpolated weather APIs

**Integration notes:** Very high resolution and accuracy for US. Excellent for localized recommendations.

---

### WorldClim Global Climate Data

**Homepage:** https://www.worldclim.org/

**What it provides:**
- Global climate data at ~1km resolution
- Historical averages (1960-1991)
- Future climate projections (2050, 2070)
- 19 bioclimatic variables (derived indices)

**Bioclimatic variables include:**
- Annual mean temperature
- Temperature seasonality
- Annual precipitation
- Precipitation seasonality
- Isothermality
- Temperature/precipitation of warmest/coldest/driest/wettest periods

**Cost:** Free

**Platform use cases:**
- Global climate zone mapping for platform expansion
- Species suitability modeling (MaxEnt, others)
- Future climate scenario planning
- Biodiversity conservation planning
- International project site assessment

**Integration notes:** Essential for any international expansion. Future projections available under multiple emissions scenarios (SSP 1.2.6 through 5.8.5).

---

## Soil Data

### USDA Web Soil Survey

**Homepage:** https://websoilsurvey.nrcs.usda.gov/
**API Documentation:** https://SDMDataAccess.nrcs.usda.gov/

**What it provides:**
- Detailed soil maps and properties for entire United States
- 50+ years of soil survey research compiled
- Field-verified soil characterization

**Available soil properties:**
- Soil texture (sand, silt, clay percentages)
- Drainage class (well-drained to very poorly drained)
- pH (acidity/alkalinity)
- Organic matter content
- Depth to water table
- Erosion hazard
- Flooding frequency
- Root zone available water capacity
- Electrical conductivity (salinity)
- CEC (cation exchange capacity)
- Permeability

**Data formats:**
- Shapefile (SHP) via web interface
- Tabular data via SOAP/REST API
- GeoJSON export option

**Cost:** Free

**Platform use cases:**
- Determine soil suitability for silvopasture systems
- Keyline design planning (slope, infiltration, water holding capacity)
- Crop and species selection
- Perennial vegetation zoning
- Erosion risk assessment
- Drainage requirement determination
- Foundation for hydrologic modeling

**Integration notes:** Most detailed and accurate soil data available for US. Requires some interpretation (consulting soil survey reports enhances recommendations). Can be integrated as WFS (Web Feature Service).

---

### SoilGrids

**Homepage:** https://soilgrids.org/

**What it provides:**
- Global soil property maps at 250m resolution
- Machine learning models trained on 150,000+ soil profiles
- Continuous coverage (unlike traditional soil surveys)

**Available properties:**
- Soil texture (sand, silt, clay)
- Bulk density
- Organic carbon
- pH (H2O and CaCl2)
- CEC (cation exchange capacity)
- Nitrogen content
- Predictions at multiple soil depths (0, 10, 30, 60, 100, 200cm)

**Data access:**
- WCS (Web Coverage Service)
- WMS (Web Map Service)
- GeoTIFF downloads
- REST API

**Cost:** Free

**Platform use cases:**
- Global soil assessment for platform expansion into new regions
- Soil carbon baseline (for carbon credit quantification)
- Soil suitability pre-screening
- International project site evaluation
- Comparative soil analysis across study areas

**Integration notes:** Less detailed than USDA surveys but provides global coverage. Good for rapid assessments and comparative studies. Uncertainty estimates provided for each prediction.

---

### OpenLandMap

**Homepage:** https://openlandmap.org/

**What it provides:**
- Global environmental layers including soil, vegetation, climate
- Multi-source data fusion
- Machine learning-derived products

**Key layers:**
- Soil properties (texture, pH, organic matter)
- Vegetation indices (NDVI, EVI time series)
- Climate data (precipitation, temperature)
- Land use/land cover
- Terrain attributes (slope, aspect, curvature)
- Water occurrence

**Resolution:**
- 250m to 1km resolution
- Global coverage
- Monthly, seasonal, and annual composites available

**Cost:** Free

**Platform use cases:**
- Multi-layer environmental assessment
- Rapid baseline characterization
- Temporal trend analysis (NDVI time series)
- Land use change detection
- Comparative site analysis

**Integration notes:** Good for integrated assessments. Less detailed than specialized sources but useful for holistic characterization.

---

## Vegetation & Land Cover

### LANDFIRE (Landscape Fire and Resource Management Planning Tools)

**Homepage:** https://landfire.gov/

**What it provides:**
- Nationwide geospatial data on vegetation, fuel characteristics, and fire regimes
- 30-meter resolution
- Regular updates (versions released periodically)

**Key products:**
- Fuel models (Scott & Burgan 40 models): 40 standardized fuel types
- Canopy cover: Percentage crown closure
- Canopy height: Average tree height
- Canopy base height: Height to first live foliage
- Existing vegetation type (EVT): Plant community classification
- Disturbance history: Fire, harvest, and other disturbances
- Fire regime groups: Fire return intervals and severity

**Data formats:**
- GeoTIFF (raster)
- Shapefile (vector polygons)
- WMS service available
- USGS 1:24,000 and 1:100,000 editions

**Cost:** Free

**Platform use cases:**
- Fuel type classification for fire behavior modeling
- Fire behavior prediction inputs (FlamMap, FARSITE)
- Hazardous fuel identification
- Post-fire recovery tracking
- Vegetation community mapping
- Intervention targeting (where to focus fuel reduction)

**Integration notes:** Essential for any fire-focused work. Updates released every 2-3 years. Accuracy varies by region; field validation recommended for critical decisions.

---

### NLCD (National Land Cover Database)

**Homepage:** https://www.mrlc.gov/

**What it provides:**
- US land cover classification
- Harmonized classification system across datasets
- Historical change products

**Classification scheme:**
- Urban/developed
- Agricultural (crops, pasture)
- Forest types
- Herbaceous/shrubland
- Wetland
- Water
- Barren

**Characteristics:**
- 30-meter resolution
- Landsat-based classification
- Updates released every 2-3 years
- 1992, 2001, 2004, 2006, 2008, 2011, 2013, 2016, 2019, 2021 editions available

**Cost:** Free

**Platform use cases:**
- Baseline land use mapping
- Land cover change detection
- Developed area identification
- Agricultural area characterization
- Wetland mapping

**Integration notes:** Provides consistent national baseline. Good for landscape-scale planning but limited thematic detail compared to LANDFIRE.

---

### GBIF (Global Biodiversity Information Facility)

**Homepage:** https://www.gbif.org/

**What it provides:**
- Global species occurrence database
- 2.5+ billion species occurrence records
- Citizen science, museum, and research data

**Data includes:**
- Species coordinates and dates
- Collection metadata
- Taxonomic information
- Data provider attribution
- License information

**Access methods:**
- Web portal search
- REST API (free registration required)
- Data downloads (bulk export)

**Cost:** Free

**Platform use cases:**
- Biodiversity monitoring and assessment
- Native species selection for restoration
- Invasive species distribution mapping
- Wildlife habitat mapping
- Ecosystem service validation
- Scientific literature integration

**Integration notes:** Data quality varies by source; filtering and validation essential. Excellent for answering "what species occur here?" questions. API enables automated species presence queries.

---

## Fire & Risk

### NIFC (National Interagency Fire Center)

**Homepage:** https://www.nifc.gov/

**What it provides:**
- Historical fire perimeters (20+ years)
- Annual fire statistics and incidents
- Fire incident database
- National fire occurrence data

**Available data:**
- Fire perimeter polygons (Shapefile, GeoJSON)
- Fire attributes (name, date, acres, cause)
- Historical fire polygons back to 2000+
- ArcGIS REST services

**Cost:** Free

**Platform use cases:**
- Historical fire analysis
- Wildfire risk zone identification
- Burn probability assessment
- Land use pattern analysis around previous fires
- Intervention prioritization (repeat burn zones)

**Integration notes:** Critical for baseline historical context. Enables identification of repeatedly-burned areas for targeted management. Quality and completeness vary by region and year.

---

### MTBS (Monitoring Trends in Burn Severity)

**Homepage:** https://www.mtbs.gov/

**What it provides:**
- Burn severity assessments for all large fires in US and territories
- Analysis of fire impacts using remote sensing
- Continuous record since 1984

**Products:**
- Pre-fire and post-fire satellite imagery
- Normalized Burn Ratio (NBR) images
- Burn severity classifications (unburned through high severity)
- Fire perimeters and metadata

**Data formats:**
- GeoTIFF (raster)
- Shapefile (polygons)
- Downloadable datasets by year/region

**Cost:** Free

**Platform use cases:**
- Post-fire impact assessment
- Recovery monitoring (multi-year vegetation regrowth)
- Erosion risk assessment
- Replanting suitability analysis
- Debris flow hazard identification
- Comparative severity analysis across fires

**Integration notes:** Enables quantitative assessment of fire impacts at landscape scale. Historical comparisons show recovery patterns.

---

### WFIGS (Wildland Fire Interagency Geospatial Services)

**Homepage:** https://data-nifc.opendata.arcgis.com/

**What it provides:**
- Current and historical fire information
- Interagency incident data (ICS-209 reports)
- Infrastructure layers (roads, structures, jurisdictions)
- Fire resource availability

**Data services:**
- REST API endpoints
- Shapefile/GeoJSON downloads
- Real-time active incidents
- Historical fire data
- Resource availability

**Cost:** Free

**Platform use cases:**
- Real-time fire situation awareness
- Active fire monitoring and alerts
- Resource availability (firefighting capacity)
- Incident-specific impact analysis
- Emergency response planning
- Risk communication to users

**Integration notes:** Most current fire incident data. API enables real-time dashboards and alerts. Excellent for emergency response integration.

---

## Hydrology

### USGS National Water Information System (NWIS)

**Homepage:** https://waterdata.usgs.gov/nwis

**What it provides:**
- Real-time and historical water data from 1.5+ million monitoring sites
- Streamflow, groundwater, water quality, precipitation
- Data from USGS, state, and local agencies

**Data types:**
- Real-time streamflow (discharge)
- Groundwater levels (aquifer monitoring)
- Water quality (temperature, conductivity, pH, dissolved oxygen)
- Precipitation
- Reservoir levels

**Access methods:**
- Web portal
- REST API
- WaterML/WaterOneFlow web services
- ODBC connections

**Cost:** Free

**Platform use cases:**
- Watershed health monitoring
- Aquifer sustainability assessment
- Flood risk identification
- Drought monitoring and early warning
- Water quality validation
- Base flow analysis for irrigation planning
- Hydrologic regime characterization

**Integration notes:** Largest water monitoring network globally. Real-time data enables continuous monitoring systems. Historical records support long-term analysis.

---

### OpenTopography

**Homepage:** https://opentopography.org/

**What it provides:**
- High-resolution topographic data primarily from LiDAR
- Global coverage with emphasis on US
- Elevation models and derivatives

**Available data:**
- LiDAR point clouds and rasters
- Airborne Topographic Mapper (ATM)
- Interferometric SAR
- Sub-meter to meter resolution
- Free and unrestricted download

**Products include:**
- Digital Elevation Models (DEM)
- Digital Surface Models (DSM)
- Hillshades and slope maps
- Aspect, curvature derivatives

**Cost:** Free

**Platform use cases:**
- Keyline design and contour mapping
- Slope analysis for erosion risk
- Earthwork volume calculations
- Drainage pattern analysis
- Viewshed analysis
- Terrain characterization for species placement

**Integration notes:** Most detailed elevation data available. Essential for any earthworks or water management design. Sub-meter accuracy enables precise feature mapping.

---

### HydroSHEDS (Hydrological Data and Maps based on SHuttle Elevation Derivatives)

**Homepage:** https://www.hydrosheds.org/

**What it provides:**
- Global hydrographic data (river networks, basins, catchments)
- Derived from SRTM digital elevation model
- Consistent global methodology

**Products:**
- River networks (line vector)
- Watershed/basin boundaries (polygon vector)
- Flow accumulation (raster)
- Flow direction (raster)
- Drainage density derivatives

**Resolution:**
- 3 arc-seconds (~90m at equator): Global coverage
- 15 arc-seconds (~500m): Alternative coarser version
- 30 arc-seconds (~1km): Simplified version

**Cost:** Free

**Platform use cases:**
- Watershed delineation for global platform deployment
- Basin-scale hydrologic analysis
- Riparian zone identification
- Water availability assessment
- Groundwater recharge area mapping
- International project watershed characterization

**Integration notes:** Consistent global product enables reproducible methodologies across regions. Flow direction raster enables hydrologic routing algorithms.

---

## Carbon & Emissions

### Global Carbon Atlas

**Homepage:** https://globalcarbonatlas.org/

**What it provides:**
- Global carbon emissions data by country and sector
- Carbon flux maps and databases
- Carbon budget information

**Data includes:**
- Fossil fuel emissions (coal, oil, gas)
- Land use change emissions
- Agricultural emissions
- National carbon inventories
- Visualizations and downloadable data

**Cost:** Free

**Platform use cases:**
- Carbon baseline establishment
- Carbon credit calculation validation
- Regional emissions context
- Policy and compliance reference
- Carbon sequestration potential assessment

**Integration notes:** Useful for context and validation. Regional aggregates rather than site-level data.

---

### FLUXNET

**Homepage:** https://fluxnet.org/

**What it provides:**
- Global network of micrometeorological tower sites
- Direct measurement of carbon, water, and energy fluxes
- 212+ active flux tower sites worldwide
- Continuous measurements (often 10+ years per site)

**Measurements:**
- Net Ecosystem Productivity (NEP)
- Gross Primary Productivity (GPP)
- Evapotranspiration (ET)
- Soil respiration
- Latent and sensible heat fluxes
- CO2, H2O, and energy exchange

**Data access:**
- FLUXNET2015 dataset (standardized)
- LaFarge data portal (Brazil-focused)
- Site-specific archives
- Free registration required

**Cost:** Free for research, education, nonprofits

**Platform use cases:**
- Validation of carbon sequestration models
- Ecosystem productivity baseline
- Evapotranspiration model calibration
- Climate sensitivity analysis
- Restoration effectiveness quantification
- Vegetation productivity benchmarking

**Integration notes:** Essential for any claims about carbon sequestration. Direct measurements provide ground truth for remote sensing estimates. Enables model development and validation.

---

## Tools & Platforms

### QGIS (Quantum GIS)

**Homepage:** https://qgis.org/

**What it provides:**
- Free, open-source GIS desktop application
- Cross-platform (Windows, Mac, Linux)
- 1000+ plugins extend functionality

**Core capabilities:**
- Vector and raster data visualization
- Spatial analysis tools
- Geoprocessing workflows
- Map creation and cartography
- Database connectivity (PostGIS, SQLite, etc.)
- Python and JavaScript scripting
- Workflow automation via graphical models

**Key plugins:**
- GRASS integration (advanced analysis)
- SAGA integration (additional algorithms)
- InaSAFE (disaster risk assessment)
- Crayfish (hydrologic modeling visualization)
- LecoS (landscape ecology)
- Semi-Automatic Classification Plugin (satellite image classification)

**Cost:** Free

**Platform use cases:**
- All mapping and spatial analysis workflows
- Data preparation and cleaning
- Model input generation (LANDFIRE, soil data)
- Output visualization and validation
- Prototype development before production coding

**Integration notes:** Essential tool for any geospatial project. Bridges between raw data and production systems. Extensive documentation and community support.

---

### PostGIS

**Homepage:** https://postgis.net/

**What it provides:**
- Spatial extension for PostgreSQL relational database
- Geospatial types and functions
- Production-grade spatial database engine

**Capabilities:**
- Vector and raster storage and querying
- Spatial indexing (GiST, BRIN)
- Geometric operations (intersection, union, buffer, etc.)
- Raster to vector conversion
- Topology support
- 3D geometry support
- Network analysis (routing)

**Integrations:**
- Works with QGIS, GeoServer, Leaflet.js, and most GIS tools
- Python/R libraries (geopandas, sf, etc.)
- JDBC drivers for Java

**Cost:** Free

**Platform use cases:**
- Geospatial database backend for production applications
- Complex spatial queries (find all properties in 100m of stream)
- Real-time fire location storage and queries
- User property management
- Intervention tracking and impact analysis
- Scalable architecture for growing data

**Integration notes:** Industry standard for geospatial databases. Essential for production platform. Requires database administration knowledge.

---

### GeoServer

**Homepage:** https://geoserver.org/

**What it provides:**
- Open-source server for sharing geospatial data
- Standard web services protocols (OGC compliant)
- Styling, filtering, and output format flexibility

**Protocols supported:**
- WMS (Web Map Service): Raster tiles for mapping
- WFS (Web Feature Service): Vector data access
- WCS (Web Coverage Service): Raster data access
- WMTS (Web Map Tile Service): Pre-generated tiles
- WPS (Web Processing Service): Server-side processing

**Features:**
- Layer grouping and organization
- On-the-fly style rendering (SLD)
- Filtering and attribute queries
- Output formats: GeoJSON, Shapefile, GML, PNG, GeoTIFF
- Security and access control
- Performance optimization (tile caching)

**Cost:** Free

**Platform use cases:**
- Serve LANDFIRE, Sentinel-2, and other raster layers to web frontend
- Provide vector data access (fire perimeters, watersheds)
- Pre-process and style data server-side
- Cache expensive computations
- Provide multiple output formats
- Enable third-party application access via REST

**Integration notes:** Standard approach for web GIS applications. Works seamlessly with Leaflet and Deck.gl frontends. Requires web server administration.

---

### Leaflet.js

**Homepage:** https://leafletjs.com/

**What it provides:**
- Lightweight JavaScript mapping library
- Mobile-friendly interactive maps
- Minimal dependencies

**Capabilities:**
- Base map support (OpenStreetMap, satellite imagery, custom)
- Marker, popup, and polygon rendering
- User interaction (pan, zoom, click)
- GeoJSON overlay
- WMS/WMTS layer integration
- Custom controls and plugins
- Touch device support

**Key plugins:**
- Leaflet.draw: Draw features on map
- Leaflet.heat: Heatmap visualization
- Leaflet-omnivore: Parse multiple data formats
- Leaflet-measure: Distance/area measurement
- Leaflet.markercluster: Cluster point markers

**Cost:** Free

**Platform use cases:**
- Web application mapping interface
- Real-time fire location display
- User property visualization
- Interactive data layer toggling
- Measurement tools
- Drawing tools for property boundary capture

**Integration notes:** Excellent for lightweight, responsive web maps. Limited for very large datasets (use Deck.gl instead). Works with PostGIS via GeoServer or custom APIs.

---

### Deck.gl

**Homepage:** https://deck.gl/

**What it provides:**
- WebGL-powered visualization framework for geospatial data
- GPU-accelerated rendering for large datasets
- Designed for big data visualization

**Capabilities:**
- Render millions of data points smoothly
- 2D and 3D visualization
- Layer-based architecture
- Deck.gl maps (Mapbox, Google Maps, ArcGIS, Carto base maps)
- Animation support
- Interactive filtering and queries
- Performance optimization for real-time updates

**Layer types:**
- ScatterplotLayer: Point cloud visualization
- LineLayer: Flow and network visualization
- PolygonLayer: Choropleth and filled polygons
- HexagonLayer: Spatial aggregation/hexbinning
- HeatmapLayer: Density visualization
- TripsLayer: Animated paths (vehicle tracking)

**Cost:** Free

**Platform use cases:**
- High-performance visualization of fire detection points
- Animated fire spread simulation
- Vehicle/asset tracking (firefighting resources)
- Vegetation time series visualization
- Large-scale intervention impact mapping
- Real-time dashboard updates

**Integration notes:** Requires JavaScript/React development. Steep learning curve but essential for big-data visualization. Integrates with standard mapping libraries.

---

### Apache Superset

**Homepage:** https://superset.apache.org/

**What it provides:**
- Open-source data exploration and visualization platform
- Dashboards and reports
- Multi-database support

**Capabilities:**
- SQL editor with auto-complete
- Drag-and-drop dashboard creation
- 50+ visualization types
- Filters and drill-down capabilities
- Caching and performance optimization
- User and role-based access control
- Alerts and report scheduling
- Custom plugin support

**Database support:**
- PostgreSQL (including PostGIS queries)
- MySQL, Oracle, SQLite
- Elasticsearch, Druid
- Google BigQuery, Snowflake

**Cost:** Free

**Platform use cases:**
- Real-time ecosystem metric dashboards
- Fire risk indicator monitoring
- Vegetation health trends
- Soil moisture and precipitation visualization
- User engagement analytics
- Scientific result presentation

**Integration notes:** Good for internal monitoring and analysis. Less suitable for public-facing consumer apps (better to use custom React/Vue dashboards for those).

---

### FarmBot

**Homepage:** https://farm.bot/

**What it provides:**
- Open-source CNC farming robot
- Full software stack (hardware + firmware + web app)
- Controlled Environment Agriculture (CEA) automation
- Community-driven development

**Components:**
- XY Gantry system (automated positioning)
- Tool head (planting, watering, weeding)
- Raspberry Pi control computer
- Web application for planning
- REST API for integration
- Camera for plant monitoring

**Capabilities:**
- Precise planting and harvesting
- Automated watering
- Weed detection and removal
- Plant growth monitoring
- Weather integration
- Sequence creation and scheduling

**Cost:** Hardware purchase required (~$3-5k), software free

**Platform use cases:**
- Reference architecture for automated growing systems
- Small-scale CEA implementation
- Integration with monitoring platforms
- Proof-of-concept for scaled automation
- Community learning and development
- API integration for remote monitoring

**Integration notes:** Open-source hardware enables local adaptation and repair. Community extends functionality through custom sequences.

---

### Mycodo

**Homepage:** https://github.com/kizniche/Mycodo

**What it provides:**
- Open-source environmental monitoring and regulation system
- Designed for Raspberry Pi and similar hardware
- Sensor-driven automation

**Capabilities:**
- Support for 100+ sensor types
- GPIO and relay control
- PID controller for environmental setpoints
- Data logging and graphing
- Conditional logic (if-then statements)
- Notification system (email, system alerts)
- REST API for integration
- Multi-environment dashboard
- Web interface

**Typical applications:**
- Greenhouse environmental control
- Growth chamber automation
- Seedling nursery management
- Aquaponics system monitoring
- Mushroom cultivation
- Fermentation monitoring
- Composting optimization

**Cost:** Free

**Platform use cases:**
- Environmental monitoring for CEA operations
- Automated watering and climate control
- Data integration with central monitoring platform
- Prototype development for larger systems
- Educational reference architecture
- Integration with remote monitoring dashboards

**Integration notes:** Lightweight and well-documented. Good entry point for IoT sensor integration. Scales from single environment to multi-location with proper architecture.

---

## Fire Behavior Modeling

### FlamMap6 / FARSITE

**Homepage:** https://www.firelab.org/project/flammap

**What it provides:**
- Fire behavior simulation and spatial modeling tools
- Wildland fire spread prediction
- Desktop application (Windows/Mac)

**Key features:**
- Accepts LANDFIRE fuel model data
- Incorporates weather and terrain
- Simulates fire spread and intensity
- Produces probability maps
- Generates hazard assessments

**Inputs required:**
- Fuel models (from LANDFIRE)
- Topography (elevation, slope, aspect)
- Weather (wind, temperature, humidity)
- Initial fire location

**Outputs:**
- Fire perimeter predictions
- Intensity maps
- Time-of-arrival layers
- Hazard classification

**Cost:** Free

**Platform use cases:**
- Wildfire risk assessment and mapping
- Intervention location prioritization (fuel reduction placement)
- Evacuation planning
- Structural protection planning
- Scenario analysis (wind, fuel treatment variations)

**Integration notes:** Valuable for understanding fire behavior potential. Results inform intervention strategies. Supports batch processing for multiple scenarios.

---

### WIFIRE

**Homepage:** https://wifire.ucsd.edu/

**What it provides:**
- AI-driven wildfire simulation and prediction system
- Real-time fire spread forecasting
- Developed at UC San Diego Supercomputer Center

**Capabilities:**
- Real-time fire perimeter integration
- Machine learning fire spread prediction
- Sub-grid resolution (25m)
- Ensemble probabilistic forecasts
- Integration with weather and fuel data
- Public web platform with APIs

**Key features:**
- Continuous learning from active fires
- High-resolution fire behavior
- Accessible to researchers and practitioners
- Real-time data feeds

**Cost:** Free public platform

**Platform use cases:**
- Real-time fire spread predictions
- Evacuation planning and coordination
- Resource deployment optimization
- User notification and alert timing
- Risk communication
- Research and validation

**Integration notes:** Cutting-edge AI approach. Accessible via web interface and API. Excellent for informed emergency response.

---

### Pyrecast

**Homepage:** https://pyregence.org/

**What it provides:**
- Next-generation wildfire forecasting system
- Probabilistic fire risk assessment
- Data-driven approach integrating multiple models

**Approach:**
- Machine learning ensemble methods
- Integration of multiple fire models
- Probability of fire occurrence and spread
- Uncertainty quantification
- Seasonal and operational forecasts

**Data integrated:**
- Weather forecasts
- Fuel moisture
- Historical fire data
- Vegetation data
- Topography

**Cost:** Free platform access

**Platform use cases:**
- Probabilistic wildfire risk forecasting
- Seasonal fire outlook (spring/summer)
- Operational risk assessment (7-10 days)
- Resource pre-positioning planning
- Insurance and hazard mitigation
- Long-term risk communication

**Integration notes:** State-of-the-art probabilistic approach. Enables risk quantification for decision-making. Good for communicating uncertainty to users and stakeholders.

---

## Integration Patterns

### Recommended Data Stack for a Regenerative Agriculture Platform

**Frontend visualization layer:**
- Leaflet.js for standard maps (user-facing)
- Deck.gl for data-intensive visualization (dashboards)
- Apache Superset for analytics dashboards

**Backend data services:**
- PostGIS for all geospatial data storage
- GeoServer for WMS/WFS/WMTS data access
- REST APIs for custom data (fire alerts, user properties, interventions)

**Data acquisition and processing:**
- Google Earth Engine for time-series satellite analysis
- NASA FIRMS API for real-time fire detection
- Open-Meteo API for weather integration
- USGS NWIS for hydrologic data
- Scheduled jobs (Python/Node.js) to download and process:
  - Sentinel-2 imagery (weekly)
  - LANDFIRE updates (on release)
  - MTBS burn severity (seasonal)
  - Climate normals (annual)

**Environmental monitoring:**
- Mycodo for sensor-based field monitoring
- FarmBot API for CEA automation
- FLUXNET data for validation

**Fire behavior analysis:**
- FARSITE/FlamMap6 for offline scenario planning
- WIFIRE API for real-time predictions
- Pyrecast for seasonal outlook

**Data sources hierarchy:**
1. Priority: NASA FIRMS (real-time fire), Open-Meteo (weather), USDA Soil Survey (site properties)
2. Secondary: Google Earth Engine (satellite time series), NOAA API (weather validation), USGS NWIS (water)
3. Reference: WorldClim (climate context), LANDFIRE (fuel models), NLCD (land cover baseline)

---

## Regulatory & Attribution Requirements

**Data attribution:**
- All data sources require attribution in final products
- Review individual data source terms of service
- Maintain metadata documenting data provenance

**Fire data considerations:**
- FIRMS data suitable for research and operational use
- MTBS data suitable for post-fire analysis
- Follow NIFC incident data use policy (public information)

**Satellite imagery:**
- Sentinel-2: Attribution required to ESA/Copernicus
- Landsat: Public domain (USGS)
- Planet: Research program requires agreement

**Open data commitments:**
- Consider publishing your analysis results back to open platforms
- Share validation data with scientific community
- Contribute to GBIF if collecting biodiversity observations
- Share environmental monitoring data with FLUXNET if establishing stations

---

## Getting Started Checklist

- [ ] Create accounts: NASA FIRMS, Google Earth Engine, Open-Meteo (optional)
- [ ] Install QGIS for initial data exploration
- [ ] Download sample data: LANDFIRE fuel models, USDA soil survey for project area
- [ ] Set up PostGIS database for geospatial data storage
- [ ] Create basic Leaflet.js map with local basemap
- [ ] Integrate Open-Meteo API for weather display
- [ ] Write Python scripts to download and process Sentinel-2 imagery
- [ ] Implement NASA FIRMS API integration for fire detection
- [ ] Set up GeoServer to serve processed layers
- [ ] Build Superset dashboard for monitoring key metrics
- [ ] Develop fire risk assessment workflow (FARSITE integration)
- [ ] Plan monitoring network (Mycodo installations)

---

## Additional Resources

**Official documentation:**
- QGIS: https://docs.qgis.org/
- PostGIS: https://postgis.net/documentation/
- GeoServer: https://geoserver.org/documentation/
- Leaflet: https://leafletjs.com/reference/

**Tutorials and courses:**
- Google Earth Engine Education: https://developers.google.com/earth-engine/guides
- Copernicus Learning: https://learning.eumetsat.int/
- USGS Landsat tutorials
- QGIS Tutorial Library

**Community and support:**
- QGIS community forums
- PostGIS mailing list
- Stack Overflow (tag: gis, qgis, postgis)
- GitHub discussions for individual projects

---

Last updated: March 2026

