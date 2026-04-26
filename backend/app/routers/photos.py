import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel

from app.core.auth import get_current_user
from app.core.supabase import get_supabase

router = APIRouter(prefix="/api/photos", tags=["photos"])

BUCKET = "profile-photos"
MAX_PHOTOS = 5
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


class PhotoResponse(BaseModel):
    id: str
    user_id: str
    url: str
    caption: str | None = None
    sort_order: int


def _ensure_bucket(sb) -> None:
    """Create the storage bucket if it doesn't exist."""
    try:
        sb.storage.get_bucket(BUCKET)
    except Exception:
        sb.storage.create_bucket(BUCKET, options={"public": True})


@router.get("", response_model=list[PhotoResponse])
async def list_my_photos(user: dict = Depends(get_current_user)):
    sb = get_supabase()
    result = (
        sb.table("photos")
        .select("*")
        .eq("user_id", user["id"])
        .order("sort_order")
        .execute()
    )
    return result.data or []


@router.post("", response_model=PhotoResponse)
async def upload_photo(
    file: UploadFile = File(...),
    caption: str = Form(""),
    sort_order: int = Form(...),
    user: dict = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WebP, and GIF images are allowed")

    if sort_order < 0 or sort_order > 4:
        raise HTTPException(status_code=400, detail="sort_order must be 0-4")

    sb = get_supabase()
    _ensure_bucket(sb)

    # Check photo count
    existing = (
        sb.table("photos")
        .select("id")
        .eq("user_id", user["id"])
        .execute()
    )
    if len(existing.data or []) >= MAX_PHOTOS:
        raise HTTPException(status_code=400, detail="Maximum 5 photos allowed")

    # Upload to Supabase Storage
    file_ext = (file.filename or "photo.jpg").rsplit(".", 1)[-1]
    storage_path = f"{user['id']}/{uuid.uuid4()}.{file_ext}"
    file_bytes = await file.read()

    sb.storage.from_(BUCKET).upload(
        storage_path,
        file_bytes,
        file_options={"content-type": file.content_type or "image/jpeg"},
    )

    public_url = sb.storage.from_(BUCKET).get_public_url(storage_path)

    # Insert into photos table
    row = sb.table("photos").insert({
        "user_id": user["id"],
        "url": public_url,
        "caption": caption[:60] if caption else None,
        "sort_order": sort_order,
    }).execute()

    if not row.data:
        raise HTTPException(status_code=500, detail="Failed to save photo record")
    return row.data[0]


@router.delete("/{photo_id}")
async def delete_photo(photo_id: str, user: dict = Depends(get_current_user)):
    sb = get_supabase()

    # Verify ownership
    existing = (
        sb.table("photos")
        .select("*")
        .eq("id", photo_id)
        .eq("user_id", user["id"])
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Photo not found")

    photo = existing.data[0]

    # Delete from storage (extract path from URL)
    url = photo["url"]
    # URL format: .../storage/v1/object/public/profile-photos/{user_id}/{file}
    try:
        path_part = url.split(f"/storage/v1/object/public/{BUCKET}/")[1]
        sb.storage.from_(BUCKET).remove([path_part])
    except Exception:
        pass  # Storage cleanup is best-effort

    # Delete from DB
    sb.table("photos").delete().eq("id", photo_id).execute()
    return {"detail": "Photo deleted"}
