"""
Strategy Mapper for Geospatial Wildfire Prevention

Maps optimal intervention strategies to geographic zones based on:
- Fire risk assessment
- Environmental conditions (soil, vegetation, hydrology)
- Infrastructure and accessibility constraints
- Cost-benefit analysis

Produces prioritized recommendations with implementation guidance.
"""

import json
import logging
from dataclasses import dataclass, asdict
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple

import pandas as pd

logger = logging.getLogger(__name__)


class InterventionStrategy(Enum):
    """Enumeration of available intervention strategies"""
    SILVOPASTURE = "silvopasture"
    TARGETED_GRAZING = "targeted_grazing"
    KEYLINE = "keyline"
    BIOCHAR = "biochar"
    FUEL_BREAK = "fuel_break"
    MONITORING_ONLY = "monitoring_only"


@dataclass
class StrategyScore:
    """Score for a single strategy in a zone"""
    strategy: InterventionStrategy
    suitability_score: float  # 0-100
    urgency: float  # 0-100: how urgent is this intervention
    impact: float  # 0-100: expected impact on fire risk
    feasibility: float  # 0-100: practical feasibility
    cost_estimate: float  # USD per hectare
    recommended: bool  # Top recommendation for this zone?

    @property
    def priority_score(self) -> float:
        """Calculate overall priority (weighted combination)"""
        return (
            self.urgency * 0.35 +
            self.impact * 0.35 +
            self.feasibility * 0.30
        )

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "strategy": self.strategy.value,
            "suitability_score": round(self.suitability_score, 2),
            "urgency": round(self.urgency, 2),
            "impact": round(self.impact, 2),
            "feasibility": round(self.feasibility, 2),
            "priority_score": round(self.priority_score, 2),
            "cost_estimate_per_ha": round(self.cost_estimate, 2),
            "recommended": self.recommended
        }


@dataclass
class ZoneRecommendation:
    """Comprehensive recommendation for a geographic zone"""
    zone_id: str
    location: Tuple[float, float]  # (latitude, longitude)
    area_hectares: float
    fire_risk_index: float
    strategies: List[StrategyScore]
    top_strategy: Optional[InterventionStrategy]
    implementation_guidance: str
    timeline_months: int
    expected_outcomes: Dict[str, Any]

    def to_geojson_feature(self) -> Dict[str, Any]:
        """Convert to GeoJSON feature"""
        lat, lon = self.location
        return {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [lon, lat]
            },
            "properties": {
                "zone_id": self.zone_id,
                "fire_risk_index": round(self.fire_risk_index, 2),
                "area_hectares": self.area_hectares,
                "top_strategy": self.top_strategy.value if self.top_strategy else None,
                "strategies": [s.to_dict() for s in self.strategies],
                "timeline_months": self.timeline_months,
                "expected_outcomes": self.expected_outcomes,
                "guidance": self.implementation_guidance
            }
        }


class StrategyMapper:
    """
    Maps optimal intervention strategies to geographic zones.

    Uses multi-criteria decision analysis to score and rank interventions.
    """

    # Strategy selection parameters and thresholds
    __STRATEGY_PARAMETERS__ = {
        InterventionStrategy.SILVOPASTURE: {
            "description": "Mixed livestock-forest system for fuel management and productivity",
            "soil_drainage_preferred": ["well", "moderate"],
            "slope_max_percent": 15,
            "rainfall_min_mm": 300,
            "fuel_load_target_reduction": 0.5,  # Expected fuel load reduction factor
            "cost_per_hectare": 800,
            "timeline_months": 24,
            "carbon_sequestration_annual_tons_ha": 2.5
        },
        InterventionStrategy.TARGETED_GRAZING: {
            "description": "Strategic livestock grazing for fuel load reduction",
            "fuel_load_min_tons_ha": 8,
            "vegetation_types_suitable": ["grassland", "shrubland", "mixed_brush_timber"],
            "slope_max_percent": 25,
            "accessibility_required": True,
            "fuel_load_target_reduction": 0.6,
            "cost_per_hectare": 150,
            "timeline_months": 12,
            "estimated_grazing_units_per_ha": 1.5
        },
        InterventionStrategy.KEYLINE: {
            "description": "Water harvesting and infiltration for hydrology restoration",
            "slope_min_percent": 5,
            "slope_max_percent": 20,
            "drainage_class_poor_preferred": True,
            "rainfall_min_mm": 250,
            "infiltration_improvement_percent": 150,
            "cost_per_hectare": 1200,
            "timeline_months": 6,
            "water_infiltration_improvement_mm_year": 100
        },
        InterventionStrategy.BIOCHAR: {
            "description": "Biochar application for soil restoration and carbon sequestration",
            "post_fire_preferred": True,
            "organic_matter_max_percent": 5,
            "infiltration_improvement_percent": 80,
            "cost_per_hectare": 2000,
            "timeline_months": 3,
            "carbon_sequestration_annual_tons_ha": 5.0,
            "years_of_benefit": 20
        },
        InterventionStrategy.FUEL_BREAK: {
            "description": "Strategically placed fuel-free zones to limit fire spread",
            "fire_risk_min_index": 60,
            "width_optimal_m": 30,
            "infrastructure_access_required": True,
            "cost_per_hectare": 3000,
            "timeline_months": 2,
            "fire_spread_reduction_percent": 45
        },
        InterventionStrategy.MONITORING_ONLY: {
            "description": "Monitoring and assessment of sensitive areas",
            "sensitive_habitat_required": True,
            "cost_per_hectare": 50,
            "timeline_months": 12,
            "activities": ["surveys", "data_collection", "impact_assessment"]
        }
    }

    def __init__(self):
        """Initialize strategy mapper"""
        logger.info("Initializing StrategyMapper")

    def score_zone(self, zone_properties: Dict[str, Any]) -> Dict[str, StrategyScore]:
        """
        Score all strategies for a given zone.

        Args:
            zone_properties: Dictionary with zone characteristics:
                - fire_risk_index (0-100)
                - temperature_c
                - relative_humidity
                - wind_speed_kmh
                - slope_percent
                - drainage_class
                - infiltration_rate_mm_hr
                - organic_matter_pct
                - fuel_load_tons_ha
                - canopy_height_m
                - vegetation_type
                - rainfall_annual_mm
                - post_fire (bool)
                - near_wui (bool) - Wildland-urban interface

        Returns:
            Dictionary mapping strategy to StrategyScore
        """
        scores = {}

        # Score each strategy
        for strategy in InterventionStrategy:
            score = self._score_strategy(strategy, zone_properties)
            scores[strategy] = score

        return scores

    def _score_strategy(
        self,
        strategy: InterventionStrategy,
        zone_props: Dict[str, Any]
    ) -> StrategyScore:
        """Score a single strategy for a zone"""

        if strategy == InterventionStrategy.SILVOPASTURE:
            return self._score_silvopasture(zone_props)
        elif strategy == InterventionStrategy.TARGETED_GRAZING:
            return self._score_targeted_grazing(zone_props)
        elif strategy == InterventionStrategy.KEYLINE:
            return self._score_keyline(zone_props)
        elif strategy == InterventionStrategy.BIOCHAR:
            return self._score_biochar(zone_props)
        elif strategy == InterventionStrategy.FUEL_BREAK:
            return self._score_fuel_break(zone_props)
        else:  # MONITORING_ONLY
            return self._score_monitoring_only(zone_props)

    def _score_silvopasture(self, props: Dict[str, Any]) -> StrategyScore:
        """Score silvopasture suitability"""
        score = 50.0  # Base score

        # Soil drainage
        drainage = props.get("drainage_class", "moderate")
        if drainage in ["well", "moderate"]:
            score += 15
        elif drainage == "poor":
            score -= 20

        # Slope
        slope = props.get("slope_percent", 10)
        if slope <= 15:
            score += 15
        elif slope <= 25:
            score += 5
        else:
            score -= 20

        # Rainfall
        rainfall = props.get("rainfall_annual_mm", 400)
        if rainfall >= 300:
            score += 15
        else:
            score -= 10

        # Fire risk (opportunity for buffer creation)
        fire_risk = props.get("fire_risk_index", 50)
        if 40 <= fire_risk <= 70:
            score += 10

        # Vegetation suitability
        veg = props.get("vegetation_type", "mixed")
        if veg in ["mixed_forest", "mixed_brush_timber"]:
            score += 10
        elif veg in ["conifer_forest"]:
            score += 5

        # Urgency based on fire risk
        urgency = min(100, fire_risk * 1.2)

        # Impact on fuel reduction
        impact = 60  # Moderate but sustained impact

        # Feasibility assessment
        feasibility = 70 if slope <= 15 and drainage != "poor" else 40

        suitability = max(0, min(100, score))
        params = self.__STRATEGY_PARAMETERS__[InterventionStrategy.SILVOPASTURE]

        return StrategyScore(
            strategy=InterventionStrategy.SILVOPASTURE,
            suitability_score=suitability,
            urgency=urgency,
            impact=impact,
            feasibility=feasibility,
            cost_estimate=params["cost_per_hectare"],
            recommended=suitability > 65
        )

    def _score_targeted_grazing(self, props: Dict[str, Any]) -> StrategyScore:
        """Score targeted grazing suitability"""
        score = 50.0

        # Fuel load (primary factor)
        fuel_load = props.get("fuel_load_tons_ha", 10)
        if fuel_load >= 15:
            score += 25
        elif fuel_load >= 8:
            score += 15
        else:
            score -= 15

        # Vegetation type
        veg = props.get("vegetation_type", "grassland")
        if veg in ["grassland", "shrubland"]:
            score += 15
        elif veg == "mixed_brush_timber":
            score += 10

        # Slope accessibility
        slope = props.get("slope_percent", 10)
        if slope <= 20:
            score += 15
        elif slope <= 30:
            score += 5
        else:
            score -= 20

        # Water availability (for livestock)
        rainfall = props.get("rainfall_annual_mm", 400)
        if rainfall >= 250:
            score += 10

        # Urgency based on fuel load and fire risk
        fire_risk = props.get("fire_risk_index", 50)
        urgency = min(100, (fuel_load / 20) * 100 + fire_risk * 0.5)

        # Impact based on fuel reduction potential
        impact = min(100, (fuel_load / 10) * 100) * 0.8

        # Feasibility
        feasibility = 85 if slope <= 25 else 50

        suitability = max(0, min(100, score))
        params = self.__STRATEGY_PARAMETERS__[InterventionStrategy.TARGETED_GRAZING]

        return StrategyScore(
            strategy=InterventionStrategy.TARGETED_GRAZING,
            suitability_score=suitability,
            urgency=urgency,
            impact=impact,
            feasibility=feasibility,
            cost_estimate=params["cost_per_hectare"],
            recommended=suitability > 60 and fuel_load > 8
        )

    def _score_keyline(self, props: Dict[str, Any]) -> StrategyScore:
        """Score keyline design suitability"""
        score = 50.0

        # Drainage issues (primary factor)
        drainage = props.get("drainage_class", "moderate")
        if drainage == "poor":
            score += 20
        elif drainage == "moderate":
            score += 10

        # Slope (key for keyline design)
        slope = props.get("slope_percent", 10)
        if 5 <= slope <= 20:
            score += 20
        elif 3 <= slope <= 25:
            score += 10
        else:
            score -= 15

        # Infiltration improvement potential
        infiltration = props.get("infiltration_rate_mm_hr", 8)
        if infiltration < 5:
            score += 20

        # Rainfall pattern
        rainfall = props.get("rainfall_annual_mm", 400)
        if rainfall >= 250:
            score += 15

        # Post-fire recovery potential
        if props.get("post_fire", False):
            score += 15

        fire_risk = props.get("fire_risk_index", 50)
        urgency = fire_risk * 0.8 if drainage == "poor" else fire_risk * 0.5

        impact = 70  # Good for water retention and ecosystem recovery

        feasibility = 80 if 5 <= slope <= 20 else 40

        suitability = max(0, min(100, score))
        params = self.__STRATEGY_PARAMETERS__[InterventionStrategy.KEYLINE]

        return StrategyScore(
            strategy=InterventionStrategy.KEYLINE,
            suitability_score=suitability,
            urgency=urgency,
            impact=impact,
            feasibility=feasibility,
            cost_estimate=params["cost_per_hectare"],
            recommended=suitability > 65 and (drainage == "poor" or infiltration < 5)
        )

    def _score_biochar(self, props: Dict[str, Any]) -> StrategyScore:
        """Score biochar application suitability"""
        score = 50.0

        # Post-fire status (primary factor)
        if props.get("post_fire", False):
            score += 25

        # Organic matter content (lower is better candidate)
        om = props.get("organic_matter_pct", 5)
        if om < 3:
            score += 20
        elif om < 5:
            score += 10

        # Degraded conditions
        infiltration = props.get("infiltration_rate_mm_hr", 8)
        if infiltration < 4:
            score += 15

        # Slope (should be accessible)
        slope = props.get("slope_percent", 10)
        if slope <= 25:
            score += 10

        # Fire risk (recovery areas)
        fire_risk = props.get("fire_risk_index", 50)
        if fire_risk > 60 or props.get("post_fire", False):
            score += 15

        urgency = fire_risk * 0.7 if props.get("post_fire", False) else fire_risk * 0.3

        impact = 80 if props.get("post_fire", False) else 50

        feasibility = 90 if slope <= 25 else 60

        suitability = max(0, min(100, score))
        params = self.__STRATEGY_PARAMETERS__[InterventionStrategy.BIOCHAR]

        return StrategyScore(
            strategy=InterventionStrategy.BIOCHAR,
            suitability_score=suitability,
            urgency=urgency,
            impact=impact,
            feasibility=feasibility,
            cost_estimate=params["cost_per_hectare"],
            recommended=suitability > 65 and (props.get("post_fire", False) or om < 5)
        )

    def _score_fuel_break(self, props: Dict[str, Any]) -> StrategyScore:
        """Score fuel break suitability"""
        score = 50.0

        # Fire risk (primary factor)
        fire_risk = props.get("fire_risk_index", 50)
        if fire_risk > 70:
            score += 25
        elif fire_risk > 60:
            score += 15

        # WUI proximity
        if props.get("near_wui", False):
            score += 20

        # Infrastructure access
        near_road = props.get("near_infrastructure", False)
        if near_road:
            score += 15
        else:
            score -= 10

        # Slope (moderate slopes best)
        slope = props.get("slope_percent", 10)
        if 5 <= slope <= 20:
            score += 10

        # Vegetation type
        veg = props.get("vegetation_type", "mixed")
        if veg in ["conifer_forest", "mixed_brush_timber"]:
            score += 10

        urgency = min(100, fire_risk * 1.3) if props.get("near_wui", False) else fire_risk

        impact = 85 if props.get("near_wui", False) else 60

        feasibility = 80 if near_road and slope <= 25 else 40

        suitability = max(0, min(100, score))
        params = self.__STRATEGY_PARAMETERS__[InterventionStrategy.FUEL_BREAK]

        return StrategyScore(
            strategy=InterventionStrategy.FUEL_BREAK,
            suitability_score=suitability,
            urgency=urgency,
            impact=impact,
            feasibility=feasibility,
            cost_estimate=params["cost_per_hectare"],
            recommended=suitability > 70 and (fire_risk > 70 or props.get("near_wui", False))
        )

    def _score_monitoring_only(self, props: Dict[str, Any]) -> StrategyScore:
        """Score monitoring-only suitability"""
        score = 50.0

        # Sensitive habitat
        if props.get("sensitive_habitat", False):
            score += 25

        # Riparian/wetland
        drainage = props.get("drainage_class", "moderate")
        if drainage == "very_poor" or props.get("hydric", False):
            score += 20

        # Low fire risk (monitor to maintain)
        fire_risk = props.get("fire_risk_index", 50)
        if fire_risk < 40:
            score += 15

        urgency = max(20, 60 - fire_risk * 0.5)
        impact = 40  # Primarily informational
        feasibility = 95  # Monitoring is always feasible

        suitability = max(0, min(100, score))
        params = self.__STRATEGY_PARAMETERS__[InterventionStrategy.MONITORING_ONLY]

        return StrategyScore(
            strategy=InterventionStrategy.MONITORING_ONLY,
            suitability_score=suitability,
            urgency=urgency,
            impact=impact,
            feasibility=feasibility,
            cost_estimate=params["cost_per_hectare"],
            recommended=props.get("sensitive_habitat", False) or props.get("hydric", False)
        )

    def recommend_strategies(
        self,
        geospatial_features: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Generate strategy recommendations for a set of zones.

        Args:
            geospatial_features: List of zone feature dictionaries with properties

        Returns:
            GeoJSON FeatureCollection with strategy recommendations
        """
        recommendations = []

        for i, feature in enumerate(geospatial_features):
            props = feature.get("properties", {})
            coords = feature.get("geometry", {}).get("coordinates", [0, 0])

            # Score all strategies for this zone
            strategy_scores = self.score_zone(props)

            # Sort by priority
            ranked_strategies = sorted(
                strategy_scores.values(),
                key=lambda x: x.priority_score,
                reverse=True
            )

            # Get top recommendation
            top_strategy = ranked_strategies[0].strategy if ranked_strategies else None

            # Implementation guidance
            guidance = self._generate_implementation_guidance(top_strategy, props)

            # Expected outcomes
            outcomes = self._estimate_outcomes(top_strategy, props)

            # Create recommendation
            rec = ZoneRecommendation(
                zone_id=f"zone_{i:04d}",
                location=(coords[1], coords[0]) if len(coords) > 1 else (0, 0),
                area_hectares=props.get("area_hectares", 100),
                fire_risk_index=props.get("fire_risk_index", 50),
                strategies=ranked_strategies,
                top_strategy=top_strategy,
                implementation_guidance=guidance,
                timeline_months=self.__STRATEGY_PARAMETERS__[top_strategy]["timeline_months"] if top_strategy else 12,
                expected_outcomes=outcomes
            )

            recommendations.append(rec.to_geojson_feature())

        return {
            "type": "FeatureCollection",
            "features": recommendations
        }

    def _generate_implementation_guidance(
        self,
        strategy: Optional[InterventionStrategy],
        zone_props: Dict[str, Any]
    ) -> str:
        """Generate implementation guidance for a strategy"""

        if not strategy:
            return "Insufficient data for recommendations."

        guidance_templates = {
            InterventionStrategy.SILVOPASTURE:
                "Establish mixed livestock-forest system. Begin with soil preparation and contour mapping. "
                "Introduce compatible tree species and manage grazing rotations.",

            InterventionStrategy.TARGETED_GRAZING:
                f"Implement rotational grazing with {zone_props.get('estimated_grazing_units_per_ha', 1.5):.1f} "
                f"animal units per hectare. Focus on high fuel areas. Plan 12-month implementation.",

            InterventionStrategy.KEYLINE:
                "Design and construct keyline swales following contours. Begin survey and site preparation. "
                "Expect 6-month implementation for slope-based water harvesting.",

            InterventionStrategy.BIOCHAR:
                "Apply biochar amendment at 10-20 tons/hectare. Suitable for post-fire recovery. "
                "Incorporates carbon sequestration with soil restoration.",

            InterventionStrategy.FUEL_BREAK:
                "Create defensible fuel-free zones 20-40m wide. Prioritize WUI boundaries and ridgelines. "
                "May include mechanical fuel reduction and vegetation removal.",

            InterventionStrategy.MONITORING_ONLY:
                "Establish monitoring protocols for sensitive areas. Conduct quarterly surveys and data collection. "
                "Prioritize riparian buffers and protected habitat."
        }

        return guidance_templates.get(strategy, "Standard implementation recommended.")

    def _estimate_outcomes(
        self,
        strategy: Optional[InterventionStrategy],
        zone_props: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Estimate outcomes from strategy implementation"""

        if not strategy:
            return {}

        outcomes = {
            "fire_risk_reduction_percent": 0,
            "carbon_sequestration_annual_tons": 0,
            "water_infiltration_improvement_mm": 0,
            "fuel_reduction_tons_ha": 0,
            "biodiversity_improvement": "neutral"
        }

        if strategy == InterventionStrategy.SILVOPASTURE:
            outcomes["fire_risk_reduction_percent"] = 35
            outcomes["carbon_sequestration_annual_tons"] = 2.5
            outcomes["fuel_reduction_tons_ha"] = zone_props.get("fuel_load_tons_ha", 10) * 0.5
            outcomes["biodiversity_improvement"] = "significant"

        elif strategy == InterventionStrategy.TARGETED_GRAZING:
            outcomes["fire_risk_reduction_percent"] = 40
            outcomes["fuel_reduction_tons_ha"] = zone_props.get("fuel_load_tons_ha", 10) * 0.6

        elif strategy == InterventionStrategy.KEYLINE:
            outcomes["water_infiltration_improvement_mm"] = 100
            outcomes["fire_risk_reduction_percent"] = 20
            outcomes["biodiversity_improvement"] = "moderate"

        elif strategy == InterventionStrategy.BIOCHAR:
            outcomes["fire_risk_reduction_percent"] = 15
            outcomes["carbon_sequestration_annual_tons"] = 5.0
            outcomes["biodiversity_improvement"] = "moderate"

        elif strategy == InterventionStrategy.FUEL_BREAK:
            outcomes["fire_risk_reduction_percent"] = 45
            outcomes["fire_spread_reduction_percent"] = 45

        return outcomes

    def generate_prioritization_matrix(
        self,
        recommendations: Dict[str, Any]
    ) -> pd.DataFrame:
        """
        Generate prioritization matrix for recommendations.

        Creates DataFrame for sorting by urgency × impact × feasibility.

        Args:
            recommendations: GeoJSON FeatureCollection from recommend_strategies

        Returns:
            pandas DataFrame with prioritization metrics
        """
        data = []

        for feature in recommendations.get("features", []):
            props = feature.get("properties", {})
            zone_id = props.get("zone_id", "unknown")
            fire_risk = props.get("fire_risk_index", 50)

            # Get top strategy scores
            strategies = props.get("strategies", [])
            if strategies:
                top = strategies[0]
                data.append({
                    "zone_id": zone_id,
                    "strategy": top["strategy"],
                    "fire_risk": fire_risk,
                    "urgency": top["urgency"],
                    "impact": top["impact"],
                    "feasibility": top["feasibility"],
                    "priority_score": top["priority_score"],
                    "cost_per_ha": top["cost_estimate_per_ha"]
                })

        df = pd.DataFrame(data)
        if not df.empty:
            df = df.sort_values("priority_score", ascending=False)

        return df


# Example usage
if __name__ == "__main__":
    mapper = StrategyMapper()

    # Sample zone properties
    sample_zones = [
        {
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [-114.5, 43.5]},
            "properties": {
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
                "near_wui": True
            }
        },
        {
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [-114.0, 43.0]},
            "properties": {
                "fire_risk_index": 45,
                "temperature_c": 22,
                "relative_humidity": 60,
                "wind_speed_kmh": 8,
                "slope_percent": 8,
                "drainage_class": "poor",
                "infiltration_rate_mm_hr": 3,
                "organic_matter_pct": 8,
                "fuel_load_tons_ha": 8,
                "vegetation_type": "grassland",
                "rainfall_annual_mm": 400,
                "area_hectares": 80,
                "near_wui": False
            }
        }
    ]

    # Generate recommendations
    recs = mapper.recommend_strategies(sample_zones)

    # Print results
    print(json.dumps(recs, indent=2))

    # Generate prioritization matrix
    matrix = mapper.generate_prioritization_matrix(recs)
    print("\nPrioritization Matrix:")
    print(matrix.to_string())
