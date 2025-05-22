from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, current_user
from werkzeug.security import generate_password_hash

from .. import db
from . import auth_bp
from .jwt_manager import generate_auth_tokens, jwt_blocklist
from ..models import User
from ..utils.responses import success_response, error_response
from ..utils.validators import validate_username, validate_email_address, validate_password
from ..utils.logger import logger


@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register a new user

    Request body:
    - username: User's username
    - email: User's email
    - password: User's password

    Returns:
    - Success response with auth tokens or error response
    """
    try:
        data = request.get_json()

        if not data:
            return error_response("Invalid request data", 400)

        # Extract and validate user data
        username = data.get('username', '')
        email = data.get('email', '')
        password = data.get('password', '')

        # Validate username
        is_valid, error_msg = validate_username(username)
        if not is_valid:
            return error_response(error_msg, 400)

        # Validate email
        is_valid, error_msg = validate_email_address(email)
        if not is_valid:
            return error_response(error_msg, 400)

        # Validate password
        is_valid, error_msg = validate_password(password)
        if not is_valid:
            return error_response(error_msg, 400)

        # Check if username exists
        if User.query.filter_by(username=username).first():
            return error_response("Username already exists", 409)

        # Check if email exists
        if User.query.filter_by(email=email).first():
            return error_response("Email already exists", 409)

        # Create new user
        new_user = User(
            username=username,
            email=email,
            password=password
        )

        # Save to database
        db.session.add(new_user)
        db.session.commit()

        # Generate auth tokens
        tokens = generate_auth_tokens(new_user)

        # Return success response with tokens
        logger.info(f"User registered successfully: {username}")
        return success_response(
            data={"user": {"id": new_user.id, "username": new_user.username, "email": new_user.email},
                  "tokens": tokens},
            message="User registered successfully",
            status_code=201
        )

    except Exception as e:
        logger.error(f"Error in user registration: {str(e)}")
        db.session.rollback()
        return error_response("An error occurred during registration", 500)


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Log in a user

    Request body:
    - username: User's username or email
    - password: User's password

    Returns:
    - Success response with auth tokens or error response
    """
    try:
        data = request.get_json()

        if not data:
            return error_response("Invalid request data", 400)

        # Extract credentials
        username_or_email = data.get('username', '')
        password = data.get('password', '')

        if not username_or_email or not password:
            return error_response("Username/email and password are required", 400)

        # Check if using email or username
        if '@' in username_or_email:
            user = User.query.filter_by(email=username_or_email).first()
        else:
            user = User.query.filter_by(username=username_or_email).first()

        # Check if user exists and password is correct
        if not user or not user.check_password(password):
            return error_response("Invalid credentials", 401)

        # Generate auth tokens
        tokens = generate_auth_tokens(user)

        # Return success response with tokens
        logger.info(f"User logged in: {user.username}")
        return success_response(
            data={"user": {"id": user.id, "username": user.username, "email": user.email}, "tokens": tokens},
            message="Login successful"
        )

    except Exception as e:
        logger.error(f"Error in user login: {str(e)}")
        return error_response("An error occurred during login", 500)


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    Log out a user (blacklist the current JWT token)

    Returns:
    - Success response or error response
    """
    try:
        # Add token to blocklist
        jti = get_jwt()["jti"]
        jwt_blocklist.add(jti)

        logger.info(f"User logged out: {current_user.username if current_user else 'Unknown'}")
        return success_response(message="Logout successful")

    except Exception as e:
        logger.error(f"Error in user logout: {str(e)}")
        return error_response("An error occurred during logout", 500)