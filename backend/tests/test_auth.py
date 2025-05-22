import json
import unittest
from ..app import create_app, db
from ..app.models import User

class AuthTestCase(unittest.TestCase):
    """Test case for the authentication endpoints"""

    def setUp(self):
        """Set up test environment"""
        self.app = create_app('testing')
        self.client = self.app.test_client()

        # Create application context
        self.app_context = self.app.app_context()
        self.app_context.push()

        # Create tables
        db.create_all()

        # Test user data
        self.test_user = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'Password123'
        }

    def tearDown(self):
        """Clean up test environment"""
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def test_user_registration(self):
        """Test user registration"""
        # Register user
        res = self.client.post(
            '/api/auth/register',
            data=json.dumps(self.test_user),
            content_type='application/json'
        )

        # Check response
        result = json.loads(res.data.decode())
        self.assertEqual(res.status_code, 201)
        self.assertTrue(result['success'])
        self.assertTrue('data' in result)
        self.assertTrue('tokens' in result['data'])

        # Verify user was created in database
        user = User.query.filter_by(username='testuser').first()
        self.assertIsNotNone(user)

    def test_user_login(self):
        """Test user login"""
        # First register a user
        self.client.post(
            '/api/auth/register',
            data=json.dumps(self.test_user),
            content_type='application/json'
        )

        # Then login
        res = self.client.post(
            '/api/auth/login',
            data=json.dumps({
                'username': 'testuser',
                'password': 'Password123'
            }),
            content_type='application/json'
        )

        # Check response
        result = json.loads(res.data.decode())
        self.assertEqual(res.status_code, 200)
        self.assertTrue(result['success'])
        self.assertTrue('data' in result)
        self.assertTrue('tokens' in result['data'])

    def test_invalid_login(self):
        """Test invalid login credentials"""
        # Register a user
        self.client.post(
            '/api/auth/register',
            data=json.dumps(self.test_user),
            content_type='application/json'
        )

        # Try to login with incorrect password
        res = self.client.post(
            '/api/auth/login',
            data=json.dumps({
                'username': 'testuser',
                'password': 'WrongPassword'
            }),
            content_type='application/json'
        )

        # Check response
        result = json.loads(res.data.decode())
        self.assertEqual(res.status_code, 401)
        self.assertFalse(result['success'])


if __name__ == '__main__':
    unittest.main()