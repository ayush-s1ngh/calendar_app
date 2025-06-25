import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Alert,
  AlertTitle
} from '@mui/material';
import { ErrorOutline as ErrorIcon } from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can also log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <Paper
          elevation={3}
          sx={{
            p: 3,
            m: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2
          }}
        >
          <ErrorIcon color="error" sx={{ fontSize: 60, mb: 2 }} />

          <Typography variant="h5" component="h2" gutterBottom color="error">
            Something went wrong
          </Typography>

          <Typography variant="body1" align="center" sx={{ mb: 2 }}>
            The application encountered an error. You can try refreshing the page or returning to the dashboard.
          </Typography>

          <Divider sx={{ width: '100%', my: 2 }} />

          <Box sx={{ width: '100%', mb: 3 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              <AlertTitle>Error Details</AlertTitle>
              {this.state.error && this.state.error.toString()}
            </Alert>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={this.handleReset}
              aria-label="Try again"
            >
              Try Again
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={() => window.location.href = '/calendar'}
              aria-label="Go to Dashboard"
            >
              Go to Dashboard
            </Button>
          </Box>
        </Paper>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;