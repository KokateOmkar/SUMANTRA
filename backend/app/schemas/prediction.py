from pydantic import BaseModel
from enum import Enum
from typing import List

class HealthStatus(str, Enum):
    HEALTHY = "healthy"
    NEEDS_ATTENTION = "needs_attention"
    UNHEALTHY = "unhealthy"

class PredictionResponse(BaseModel):
    species: str
    confidence: float
    health_status: HealthStatus
    care_tips: List[str]