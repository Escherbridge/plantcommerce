# PlantCommerce Knowledge Base
## Regenerative Agriculture + Wildfire Prevention + Climate Action Ecosystem

*Your comprehensive directory for becoming an all-rounder in regenerative agriculture, wildfire prevention, and decentralized climate action.*

---

## Quick Start

1. **New here?** Start with [01_learning_paths/LEARNING_ROADMAP.md](01_learning_paths/LEARNING_ROADMAP.md) — a 12-month roadmap from IT professional to regenerative agriculture expert
2. **Want to download free resources?** Run `python download_resources.py` to grab 30+ free academic PDFs, guides, and government publications
3. **Want to see the geospatial system?** Open `04_wildfire_prevention/geospatial_system/map_viewer.html` in your browser

---

## Directory Structure

```
knowledge_base/
│
├── README.md                          ← You are here
├── download_resources.py              ← Script to download free academic PDFs & guides
├── resources_manifest.json            ← Manifest of 30+ downloadable resources
│
├── 01_learning_paths/
│   └── LEARNING_ROADMAP.md            ← 12-month IT-to-expert learning roadmap
│
├── 02_regenerative_agriculture/
│   └── CURATED_RESOURCES.md           ← Research papers, courses, books, YouTube, tools
│
├── 03_controlled_environment_ag/      ← (Aquaponics, hydroponics, CEA resources)
│
├── 04_wildfire_prevention/
│   ├── WILDFIRE_PREVENTION_IMPLEMENTATION.md  ← 5-pillar implementation guide
│   └── geospatial_system/             ← WORKING PROTOTYPE
│       ├── README.md                  ← System architecture & setup
│       ├── QUICKSTART.md              ← 5-30 min setup guide
│       ├── data_pipeline.py           ← NASA FIRMS + Open-Meteo + USDA data feeds
│       ├── strategy_mapper.py         ← Maps interventions to geographic zones
│       ├── ecosystem_monitor.py       ← Tracks actions & calculates impact
│       └── map_viewer.html            ← Interactive Leaflet.js map (open in browser)
│
├── 05_product_catalogue/
│   └── PRODUCT_CATALOGUE.md           ← 7-category product/service catalogue
│
├── 06_business_and_grants/
│   └── GRANTS_AND_FUNDING.md          ← Federal grants, procurement, carbon markets
│
├── 07_platform_technology/
│   └── TECH_RESOURCES.md              ← IoT, GIS, AI/ML, satellite, blockchain resources
│
├── 08_data_sources_and_tools/         ← (Open data sources reference)
│
├── 09_flywheel_ecosystem_model/
│   └── FLYWHEEL_MODEL.md              ← Decentralized self-reinforcing ecosystem design
│
└── 10_app_enhancement_recommendations/
    └── APP_RECOMMENDATIONS.md          ← Priority-ranked platform feature roadmap
```

## What's Inside

### For Learning (Start Here)
| File | What It Teaches |
|------|----------------|
| `01_learning_paths/LEARNING_ROADMAP.md` | 12-month phased learning plan with specific courses, books, and milestones |
| `02_regenerative_agriculture/CURATED_RESOURCES.md` | 50+ curated links to papers, courses, YouTube channels, tools |
| `07_platform_technology/TECH_RESOURCES.md` | IoT platforms, GIS tools, satellite data, AI/ML, blockchain resources |

### For Building
| File | What It Builds |
|------|---------------|
| `04_wildfire_prevention/geospatial_system/` | Working geospatial prototype with real-time fire data, strategy mapping, ecosystem monitoring |
| `10_app_enhancement_recommendations/APP_RECOMMENDATIONS.md` | Prioritized feature roadmap for the PlantCommerce platform |
| `05_product_catalogue/PRODUCT_CATALOGUE.md` | Complete product/service catalogue across 7 categories |

### For Business
| File | What It Covers |
|------|---------------|
| `06_business_and_grants/GRANTS_AND_FUNDING.md` | SARE, RFSI, SCBG, CIG, OREI, CWDG grants + SAM.gov procurement |
| `09_flywheel_ecosystem_model/FLYWHEEL_MODEL.md` | Decentralized DAO-governed ecosystem with revenue model |

### For Downloading
| File | What It Does |
|------|-------------|
| `download_resources.py` | Downloads 30+ free academic PDFs and guides |
| `resources_manifest.json` | Manifest with URLs to government, university, and open-access publications |

## Key Numbers

- **Water**: Aquaponics uses 90% less water than soil farming
- **Carbon**: Silvopasture sequesters median 9.81 t CO2-eq/ha/yr
- **Yield**: Decoupled aquaponics gives +36% fruiting crop yield vs coupled
- **Fire**: Silvopasture significantly reduces grass biomass, litter, and duff
- **Market**: Carbon credits $6.34 avg voluntary, $89 EU compliance
- **Grants**: $200M+ CWDG Round 3, $700M+ USDA regenerative ag commitment
- **Growth**: Digital ag marketplace $14.56B (2024) → $43.73B (2033)

## Data Sources (All Free)

| Source | What | API |
|--------|------|-----|
| NASA FIRMS | Active fire detection (60-sec US) | firms.modaps.eosdis.nasa.gov/api/ |
| Open-Meteo | Weather forecast & historical | api.open-meteo.com (no key needed) |
| Sentinel-2 | 10m satellite imagery (5-day) | dataspace.copernicus.eu |
| USDA Web Soil Survey | Soil types & characteristics | websoilsurvey.nrcs.usda.gov |
| LANDFIRE | Vegetation & fuel classification | landfire.gov |
| NOAA | Weather data | weather.gov/documentation/services-web-api |
| Google Earth Engine | Satellite analysis platform | earthengine.google.com |
