import unittest
import sys


def run_tests():
    """Run all tests"""
    # Discover and run tests
    tests = unittest.TestLoader().discover('tests', pattern='test_*.py')
    result = unittest.TextTestRunner(verbosity=2).run(tests)

    # Return non-zero exit code if tests failed
    if not result.wasSuccessful():
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(run_tests())