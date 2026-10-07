"""
Emergency First-Aid Guidance API Routes
"""

from fastapi import APIRouter, HTTPException, Query
from app.models.schemas import GuidanceResponse
from app.services.guidance_service import get_category_guidance, EMERGENCY_DATA

router = APIRouter(tags=["Guidance"])

@router.get("/guidance/{category_id}", response_model=GuidanceResponse)
def get_guidance(category_id: str, urgency: str = Query("HIGH", pattern="^(LOW|MODERATE|HIGH)$")):
    """Returns verified step-by-step first-aid guidance for the given emergency category and urgency level"""
    cat = category_id.lower()
    if cat not in EMERGENCY_DATA:
        raise HTTPException(status_code=404, detail=f"Emergency category '{category_id}' not found.")

    data = get_category_guidance(cat, urgency)
    return data
