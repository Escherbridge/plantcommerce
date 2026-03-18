"""
Ecosystem Monitoring System for Wildfire Prevention

Tracks real-world ecosystem interventions and their measurable impacts:
- Fuel load reduction from grazing
- Carbon sequestration from planting and biochar
- Water infiltration improvements
- Vegetation establishment
- Soil health metrics

Maintains time-series of ecosystem actions and generates impact reports.
"""

import json
import logging
from dataclasses import dataclass, asdict, field
from datetime import datetime, timedelta
from enum import Enum
from typing import Any, Dict, List, Optional
from pathlib import Path

logger = logging.getLogger(__name__)


class ActionType(Enum):
    """Types of ecosystem interventions"""
    GRAZING_EVENT = "grazing_event"
    PLANTING = "planting"
    BIOCHAR_APPLICATION = "biochar_application"
    FUEL_TREATMENT = "fuel_treatment"
    WATER_INFILTRATION = "water_infiltration"
    MONITORING = "monitoring"
    ROAD_TREATMENT = "road_treatment"
    PRESCRIBED_BURN = "prescribed_burn"


class ActionStatus(Enum):
    """Status of an action"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


@dataclass
class ImpactMetrics:
    """Quantified impact metrics from an ecosystem action"""
    fuel_reduction_tons_ha: float = 0.0  # Dead fuel reduced
    carbon_sequestered_tons_co2e: float = 0.0  # Annual carbon sequestered
    water_infiltrated_mm_year: float = 0.0  # Additional infiltration
    vegetation_established_trees_ha: float = 0.0  # Trees planted/established
    soil_organic_matter_improvement_pct: float = 0.0  # Increase in organic matter
    biodiversity_units: float = 0.0  # Habitat improvement index
    fire_risk_reduction_index: float = 0.0  # Reduction in fire risk score

    def to_dict(self) -> Dict[str, float]:
        """Convert to dictionary"""
        return asdict(self)

    @property
    def total_carbon_equivalent(self) -> float:
        """Total carbon impact in CO2e tons"""
        return self.carbon_sequestered_tons_co2e + (self.fuel_reduction_tons_ha * 0.5)


@dataclass
class EcosystemAction:
    """
    Represents a single ecosystem intervention action.

    Tracks location, type, status, and impacts.
    """
    action_type: ActionType
    zone_id: str
    location: tuple  # (latitude, longitude)
    timestamp: datetime
    status: ActionStatus = ActionStatus.PENDING
    area_hectares: float = 100.0
    duration_days: Optional[int] = None
    completed_date: Optional[datetime] = None

    # Action-specific metadata
    metadata: Dict[str, Any] = field(default_factory=dict)

    # Impact metrics (calculated or observed)
    impacts: ImpactMetrics = field(default_factory=ImpactMetrics)

    # Action ID (assigned on creation)
    action_id: str = ""

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "action_id": self.action_id,
            "action_type": self.action_type.value,
            "zone_id": self.zone_id,
            "location": self.location,
            "timestamp": self.timestamp.isoformat(),
            "status": self.status.value,
            "area_hectares": self.area_hectares,
            "duration_days": self.duration_days,
            "completed_date": self.completed_date.isoformat() if self.completed_date else None,
            "metadata": self.metadata,
            "impacts": self.impacts.to_dict()
        }

    def to_geojson_feature(self) -> Dict[str, Any]:
        """Convert to GeoJSON feature for mapping"""
        lat, lon = self.location
        return {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [lon, lat]
            },
            "properties": {
                "action_id": self.action_id,
                "action_type": self.action_type.value,
                "zone_id": self.zone_id,
                "timestamp": self.timestamp.isoformat(),
                "status": self.status.value,
                "area_hectares": self.area_hectares,
                "fuel_reduction_tons": round(self.impacts.fuel_reduction_tons_ha * self.area_hectares, 2),
                "carbon_sequestered_annual_tons": round(self.impacts.carbon_sequestered_tons_co2e, 2),
                "water_infiltration_annual_mm": round(self.impacts.water_infiltrated_mm_year, 2),
                "fire_risk_reduction": round(self.impacts.fire_risk_reduction_index, 2)
            }
        }


@dataclass
class ZoneStatus:
    """Aggregated status for a geographic zone"""
    zone_id: str
    total_area_hectares: float
    total_actions: int
    completed_actions: int
    cumulative_impacts: ImpactMetrics
    last_action_date: Optional[datetime]
    fire_risk_baseline: float  # Initial fire risk index
    fire_risk_current: float  # Current estimated fire risk
    health_indicator_trend: float  # -1 to +1 (degrading to improving)
    action_history: List[EcosystemAction] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "zone_id": self.zone_id,
            "total_area_hectares": self.total_area_hectares,
            "total_actions": self.total_actions,
            "completed_actions": self.completed_actions,
            "cumulative_impacts": self.cumulative_impacts.to_dict(),
            "last_action_date": self.last_action_date.isoformat() if self.last_action_date else None,
            "fire_risk_baseline": round(self.fire_risk_baseline, 2),
            "fire_risk_current": round(self.fire_risk_current, 2),
            "fire_risk_reduction_percent": round(
                (self.fire_risk_baseline - self.fire_risk_current) / max(self.fire_risk_baseline, 1) * 100, 2
            ),
            "health_indicator_trend": round(self.health_indicator_trend, 2),
            "completion_rate": round(
                self.completed_actions / max(self.total_actions, 1) * 100, 2
            ) if self.total_actions > 0 else 0
        }


@dataclass
class Report:
    """Comprehensive zone report"""
    zone_id: str
    period_start: datetime
    period_end: datetime
    zone_status: ZoneStatus
    actions_in_period: List[EcosystemAction]
    recommendations: List[str]
    summary: str

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "zone_id": self.zone_id,
            "period": {
                "start": self.period_start.isoformat(),
                "end": self.period_end.isoformat()
            },
            "zone_status": self.zone_status.to_dict(),
            "actions_in_period": len(self.actions_in_period),
            "recommendations": self.recommendations,
            "summary": self.summary
        }


class EcosystemMonitor:
    """
    Central monitoring system for ecosystem interventions.

    Tracks all actions, calculates impacts, and generates reports.
    """

    def __init__(self, storage_path: str = ".ecosystem_data"):
        """
        Initialize ecosystem monitor.

        Args:
            storage_path: Directory for storing action history
        """
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(exist_ok=True)
        self.actions: Dict[str, EcosystemAction] = {}
        self.zones: Dict[str, Dict[str, Any]] = {}
        self._load_history()
        logger.info(f"EcosystemMonitor initialized with storage at {storage_path}")

    def _load_history(self) -> None:
        """Load action history from storage"""
        history_file = self.storage_path / "action_history.json"
        if history_file.exists():
            try:
                with open(history_file, 'r') as f:
                    data = json.load(f)
                    # Reconstruct actions
                    for action_data in data.get("actions", []):
                        action = self._dict_to_action(action_data)
                        self.actions[action.action_id] = action
                logger.info(f"Loaded {len(self.actions)} actions from history")
            except Exception as e:
                logger.warning(f"Failed to load action history: {e}")

    def _save_history(self) -> None:
        """Save action history to storage"""
        history_file = self.storage_path / "action_history.json"
        try:
            data = {
                "actions": [a.to_dict() for a in self.actions.values()],
                "timestamp": datetime.now().isoformat()
            }
            with open(history_file, 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save action history: {e}")

    def _dict_to_action(self, data: Dict[str, Any]) -> EcosystemAction:
        """Convert dictionary back to EcosystemAction"""
        return EcosystemAction(
            action_type=ActionType(data["action_type"]),
            zone_id=data["zone_id"],
            location=tuple(data["location"]),
            timestamp=datetime.fromisoformat(data["timestamp"]),
            status=ActionStatus(data["status"]),
            area_hectares=data["area_hectares"],
            duration_days=data.get("duration_days"),
            completed_date=datetime.fromisoformat(data["completed_date"]) if data.get("completed_date") else None,
            metadata=data.get("metadata", {}),
            impacts=ImpactMetrics(**data.get("impacts", {})),
            action_id=data["action_id"]
        )

    def log_action(
        self,
        action: EcosystemAction,
        calculated_impacts: Optional[ImpactMetrics] = None
    ) -> str:
        """
        Log a new ecosystem action.

        Args:
            action: EcosystemAction to log
            calculated_impacts: Pre-calculated impacts (optional)

        Returns:
            Action ID
        """
        # Generate action ID if not present
        if not action.action_id:
            action.action_id = f"{action.zone_id}_{action.action_type.value}_{int(datetime.now().timestamp())}"

        # Calculate impacts if not provided
        if not calculated_impacts:
            action.impacts = self.calculate_impact(action)
        else:
            action.impacts = calculated_impacts

        # Store action
        self.actions[action.action_id] = action

        # Update zone registry
        self._update_zone_registry(action)

        # Persist to storage
        self._save_history()

        logger.info(f"Logged action: {action.action_id}")
        return action.action_id

    def _update_zone_registry(self, action: EcosystemAction) -> None:
        """Update zone registry with new action"""
        if action.zone_id not in self.zones:
            self.zones[action.zone_id] = {
                "actions": [],
                "total_area": action.area_hectares,
                "fire_risk_baseline": 50.0  # Default baseline
            }

        self.zones[action.zone_id]["actions"].append(action.action_id)

    def get_zone_status(self, zone_id: str) -> ZoneStatus:
        """
        Get comprehensive status for a zone.

        Args:
            zone_id: Zone identifier

        Returns:
            ZoneStatus with aggregated metrics
        """
        zone_info = self.zones.get(zone_id, {})
        action_ids = zone_info.get("actions", [])
        actions = [self.actions[aid] for aid in action_ids if aid in self.actions]

        # Calculate cumulative impacts
        cumulative = ImpactMetrics()
        completed_count = 0

        for action in actions:
            cumulative.fuel_reduction_tons_ha += action.impacts.fuel_reduction_tons_ha
            cumulative.carbon_sequestered_tons_co2e += action.impacts.carbon_sequestered_tons_co2e
            cumulative.water_infiltrated_mm_year += action.impacts.water_infiltrated_mm_year
            cumulative.vegetation_established_trees_ha += action.impacts.vegetation_established_trees_ha
            cumulative.soil_organic_matter_improvement_pct += action.impacts.soil_organic_matter_improvement_pct
            cumulative.biodiversity_units += action.impacts.biodiversity_units
            cumulative.fire_risk_reduction_index += action.impacts.fire_risk_reduction_index

            if action.status == ActionStatus.COMPLETED:
                completed_count += 1

        # Last action date
        last_action = max((a.timestamp for a in actions), default=None)

        # Calculate health trend
        health_trend = self._calculate_health_trend(actions) if actions else 0.0

        # Estimate current fire risk
        baseline = zone_info.get("fire_risk_baseline", 50.0)
        current = max(0, baseline - (cumulative.fire_risk_reduction_index * 0.1))

        return ZoneStatus(
            zone_id=zone_id,
            total_area_hectares=zone_info.get("total_area", 100),
            total_actions=len(actions),
            completed_actions=completed_count,
            cumulative_impacts=cumulative,
            last_action_date=last_action,
            fire_risk_baseline=baseline,
            fire_risk_current=current,
            health_indicator_trend=health_trend,
            action_history=actions
        )

    def calculate_impact(self, action: EcosystemAction) -> ImpactMetrics:
        """
        Calculate estimated impacts from an action.

        Args:
            action: EcosystemAction to analyze

        Returns:
            ImpactMetrics with calculated values
        """
        impacts = ImpactMetrics()

        if action.action_type == ActionType.GRAZING_EVENT:
            # Fuel reduction from grazing
            grazing_units = action.metadata.get("livestock_units", 50)
            duration = action.duration_days or 14
            # Roughly 0.5-1 ton/hectare reduction per 14 days of grazing
            impacts.fuel_reduction_tons_ha = (grazing_units / 100) * duration / 14
            impacts.fire_risk_reduction_index = impacts.fuel_reduction_tons_ha * 2

        elif action.action_type == ActionType.PLANTING:
            # Tree establishment and carbon sequestration
            trees_per_ha = action.metadata.get("trees_per_hectare", 500)
            species = action.metadata.get("species", "mixed")

            # Estimate based on species growth rates
            annual_carbon = 0.003 if species == "deciduous" else 0.005  # tons CO2/tree/year
            impacts.carbon_sequestered_tons_co2e = trees_per_ha * annual_carbon
            impacts.vegetation_established_trees_ha = trees_per_ha
            impacts.fire_risk_reduction_index = 5  # Modest initial reduction
            impacts.biodiversity_units = trees_per_ha * 0.01

        elif action.action_type == ActionType.BIOCHAR_APPLICATION:
            # Biochar impacts
            application_rate = action.metadata.get("application_rate_tons_ha", 15)

            # Carbon sequestration from biochar (long-term)
            impacts.carbon_sequestered_tons_co2e = application_rate * 3.67 / 20  # Annual over 20 years

            # Soil improvement
            impacts.soil_organic_matter_improvement_pct = min(5, application_rate / 5)
            impacts.water_infiltrated_mm_year = application_rate * 2  # Improved infiltration
            impacts.fire_risk_reduction_index = 3

        elif action.action_type == ActionType.FUEL_TREATMENT:
            # Mechanical or chemical fuel reduction
            treatment_intensity = action.metadata.get("intensity", "moderate")
            base_reduction = {
                "light": 2,
                "moderate": 5,
                "heavy": 10
            }.get(treatment_intensity, 5)

            impacts.fuel_reduction_tons_ha = base_reduction
            impacts.fire_risk_reduction_index = base_reduction * 2

        elif action.action_type == ActionType.WATER_INFILTRATION:
            # Keyline or infiltration structure
            structure_length = action.metadata.get("structure_length_m", 1000)
            # Rough estimate: 1000m of keyline improves infiltration on ~50 hectares
            area_affected = structure_length / 20

            impacts.water_infiltrated_mm_year = 100
            impacts.fire_risk_reduction_index = 5  # Indirect through vegetation improvement

        elif action.action_type == ActionType.MONITORING:
            # Monitoring provides data but limited direct impact
            impacts.biodiversity_units = 0.5  # Small habitat benefit from monitoring

        # Scale by area
        impacts.fuel_reduction_tons_ha *= action.area_hectares / 100
        impacts.vegetation_established_trees_ha *= action.area_hectares / 100

        return impacts

    def _calculate_health_trend(self, actions: List[EcosystemAction]) -> float:
        """
        Calculate ecosystem health trend (-1 to +1).

        Analyzes action history to determine if ecosystem is improving or degrading.
        """
        if not actions:
            return 0.0

        # Sort by date
        sorted_actions = sorted(actions, key=lambda a: a.timestamp)

        # Calculate cumulative impacts over time
        early_period = [a for a in sorted_actions if a.timestamp < datetime.now() - timedelta(days=180)]
        recent_period = [a for a in sorted_actions if a.timestamp >= datetime.now() - timedelta(days=180)]

        if not recent_period:
            return 0.5 if actions else 0.0  # Neutral if no recent activity

        # Compare periods
        early_impact = sum(a.impacts.fire_risk_reduction_index for a in early_period)
        recent_impact = sum(a.impacts.fire_risk_reduction_index for a in recent_period)

        # Trend from 0 (no improvement) to 1 (strong improvement)
        if early_impact == 0:
            trend = 0.5 if recent_impact > 0 else 0.0
        else:
            trend = min(1.0, recent_impact / early_impact) * 0.8 + 0.1

        return trend

    def get_action_history(
        self,
        zone_id: Optional[str] = None,
        action_type: Optional[ActionType] = None,
        days: int = 365
    ) -> List[EcosystemAction]:
        """
        Get action history with optional filters.

        Args:
            zone_id: Filter by zone (optional)
            action_type: Filter by action type (optional)
            days: Only include actions from last N days

        Returns:
            Filtered list of actions
        """
        cutoff = datetime.now() - timedelta(days=days)
        filtered = []

        for action in self.actions.values():
            if action.timestamp < cutoff:
                continue

            if zone_id and action.zone_id != zone_id:
                continue

            if action_type and action.action_type != action_type:
                continue

            filtered.append(action)

        return sorted(filtered, key=lambda a: a.timestamp, reverse=True)

    def generate_report(
        self,
        zone_id: str,
        period_days: int = 90
    ) -> Report:
        """
        Generate comprehensive zone report.

        Args:
            zone_id: Zone to report on
            period_days: Report period length in days

        Returns:
            Comprehensive Report object
        """
        period_start = datetime.now() - timedelta(days=period_days)
        period_end = datetime.now()

        status = self.get_zone_status(zone_id)
        actions = self.get_action_history(zone_id=zone_id, days=period_days)

        # Generate recommendations
        recommendations = self._generate_recommendations(status)

        # Generate summary
        summary = self._generate_summary(status, actions, period_days)

        return Report(
            zone_id=zone_id,
            period_start=period_start,
            period_end=period_end,
            zone_status=status,
            actions_in_period=actions,
            recommendations=recommendations,
            summary=summary
        )

    def _generate_recommendations(self, status: ZoneStatus) -> List[str]:
        """Generate recommendations based on zone status"""
        recommendations = []

        # Check fire risk
        risk_reduction = (status.fire_risk_baseline - status.fire_risk_current) / max(status.fire_risk_baseline, 1)
        if risk_reduction < 0.1:
            recommendations.append("Accelerate fuel reduction interventions - fire risk not adequately controlled")

        # Check activity level
        if status.last_action_date is None or (datetime.now() - status.last_action_date).days > 180:
            recommendations.append("Resume ecosystem interventions - no recent activity")

        # Check completion rate
        if status.total_actions > 0 and status.completion_rate < 50:
            recommendations.append("Focus on completing in-progress actions before starting new ones")

        # Check carbon sequestration
        if status.cumulative_impacts.carbon_sequestered_tons_co2e < status.total_area_hectares:
            recommendations.append("Increase carbon-focused interventions (planting, biochar)")

        # Check water infiltration
        if status.cumulative_impacts.water_infiltrated_mm_year < status.total_area_hectares * 2:
            recommendations.append("Consider keyline or water infiltration structures for improved hydrology")

        return recommendations if recommendations else ["Continue current management plan"]

    def _generate_summary(
        self,
        status: ZoneStatus,
        actions: List[EcosystemAction],
        period_days: int
    ) -> str:
        """Generate text summary for report"""
        action_count = len(actions)
        fuel_reduction = status.cumulative_impacts.fuel_reduction_tons_ha * status.total_area_hectares
        carbon = status.cumulative_impacts.carbon_sequestered_tons_co2e
        risk_reduction = (status.fire_risk_baseline - status.fire_risk_current) / max(status.fire_risk_baseline, 1) * 100

        summary = (
            f"Zone {status.zone_id} ({status.total_area_hectares} hectares) "
            f"completed {action_count} actions in the past {period_days} days. "
            f"Total fuel reduction: {fuel_reduction:.1f} tons. "
            f"Carbon sequestered: {carbon:.1f} tons CO2e. "
            f"Fire risk reduced by {risk_reduction:.1f}%. "
            f"Ecosystem health trend: {status.health_indicator_trend:+.1%}."
        )

        return summary

    def export_geojson(self, zone_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Export actions as GeoJSON FeatureCollection.

        Args:
            zone_id: Export only actions from specific zone (optional)

        Returns:
            GeoJSON FeatureCollection
        """
        features = []

        for action in self.actions.values():
            if zone_id and action.zone_id != zone_id:
                continue

            features.append(action.to_geojson_feature())

        return {
            "type": "FeatureCollection",
            "features": features,
            "properties": {
                "total_actions": len(features),
                "timestamp": datetime.now().isoformat()
            }
        }


# Example usage
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    monitor = EcosystemMonitor()

    # Log a grazing event
    grazing = EcosystemAction(
        action_type=ActionType.GRAZING_EVENT,
        zone_id="zone_001",
        location=(43.5, -114.2),
        timestamp=datetime.now(),
        status=ActionStatus.COMPLETED,
        area_hectares=150,
        duration_days=14,
        metadata={"livestock_units": 100, "species": "cattle"},
        completed_date=datetime.now() - timedelta(days=1)
    )

    action_id = monitor.log_action(grazing)
    print(f"Logged action: {action_id}")

    # Get zone status
    status = monitor.get_zone_status("zone_001")
    print(f"\nZone Status: {status.to_dict()}")

    # Generate report
    report = monitor.generate_report("zone_001")
    print(f"\nReport: {report.to_dict()}")

    # Export as GeoJSON
    geojson = monitor.export_geojson("zone_001")
    print(f"\nGeoJSON: {json.dumps(geojson, indent=2)}")
