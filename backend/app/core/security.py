"""Authentication boundary; token implementation is intentionally pending."""

from fastapi import HTTPException, status


def require_bearer_token(authorization: str | None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Bearer token required",
        )
    return authorization.removeprefix("Bearer ").strip()
