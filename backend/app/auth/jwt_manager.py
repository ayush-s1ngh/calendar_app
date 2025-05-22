from datetime import datetime, timezone
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt, get_jwt_identity
from .. import jwt
from ..models import User
from ..utils.logger import logger

# JWT token blocklist (for logout functionality)
jwt_blocklist = set()


@jwt.token_in_blocklist_loader
def check_if_token_in_blocklist(jwt_header, jwt_payload):
    """Check if a token is in the blocklist (used for logout)"""
    jti = jwt_payload["jti"]
    return jti in jwt_blocklist


@jwt.user_identity_loader
def user_identity_lookup(user):
    """Convert user object to JWT identity"""
    if isinstance(user, User):
        return str(user.id)
    return str(user)


@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    """Look up user from JWT identity"""
    identity = jwt_data["sub"]  # This is a string now
    return User.query.get(int(identity))  # Convert back to int for query


@jwt.additional_claims_loader
def add_claims_to_access_token(user):
    """Add custom claims to the JWT token"""
    claims = {}

    # Add the token creation time as a claim
    claims["iat"] = datetime.now(timezone.utc).timestamp()

    if isinstance(user, User):
        # Add username as a claim
        claims["username"] = user.username

    return claims


def generate_auth_tokens(user):
    """
    Generate access and refresh tokens for a user

    Parameters:
    - user: User object

    Returns:
    - Dictionary with access_token and refresh_token
    """
    access_token = create_access_token(identity=user)
    refresh_token = create_refresh_token(identity=user)

    logger.info(f"Generated auth tokens for user ID: {user.id}")

    return {
        "access_token": access_token,
        "refresh_token": refresh_token
    }