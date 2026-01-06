import { showError } from '../helpers/Toast';

/**
 * Global error handler for the application
 */
class ErrorHandler {
  static instance = null;

  constructor() {
    if (ErrorHandler.instance) {
      return ErrorHandler.instance;
    }
    
    this.setupGlobalErrorHandlers();
    ErrorHandler.instance = this;
  }

  setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Handle specific error types
      if (event.reason?.message?.includes('Loading chunk')) {
        this.handleChunkLoadError();
      } else if (event.reason?.message?.includes('Network Error')) {
        this.handleNetworkError();
      } else {
        this.handleGenericError(event.reason);
      }
      
      event.preventDefault();
    });

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      console.error('JavaScript error:', event.error);
      this.handleGenericError(event.error);
    });
  }

  handleChunkLoadError() {
    showError('Application update detected. Please refresh the page.');
    // Auto-refresh after 3 seconds
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  }

  handleNetworkError() {
    showError('Network connection issue. Please check your internet connection.');
  }

  handleGenericError(error) {
    const message = error?.message || 'An unexpected error occurred';
    showError(message);
  }

  // API error handler
  static handleApiError(error) {
    console.error('API Error:', error);
    
    if (error?.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('padel_user');
      window.location.href = '/login';
      return;
    }
    
    if (error?.response?.status === 403) {
      showError('Access denied. You do not have permission to perform this action.');
      return;
    }
    
    if (error?.response?.status >= 500) {
      showError('Server error. Please try again later.');
      return;
    }
    
    const message = error?.response?.data?.message || 
                   error?.message || 
                   'An error occurred. Please try again.';
    showError(message);
  }

  // Form validation error handler
  static handleValidationErrors(errors) {
    const firstError = Object.values(errors).find(error => error);
    if (firstError) {
      showError(firstError);
    }
  }

  // Socket error handler
  static handleSocketError(error) {
    console.error('Socket Error:', error);
    showError('Connection issue. Some features may not work properly.');
  }
}

// Initialize global error handler
new ErrorHandler();

export default ErrorHandler;