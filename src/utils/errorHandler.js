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
      
      // Prevent default only for specific cases
      const reason = event.reason?.toString() || '';
      
      // Ignore network errors from API interceptor (already handled)
      if (reason.includes('Network error') || reason.includes('Session expired')) {
        event.preventDefault();
        return;
      }
      
      // Handle specific error types
      if (reason.includes('Loading chunk')) {
        this.handleChunkLoadError();
        event.preventDefault();
      }
    });

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      console.error('JavaScript error:', event.error);
      
      // Don't show toast for network errors (handled by API interceptor)
      if (event.error?.message?.includes('Network Error')) {
        return;
      }
      
      this.handleGenericError(event.error);
    });
  }

  handleChunkLoadError() {
    showError('Application update detected. Please refresh the page.');
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  }

  handleGenericError(error) {
    const message = error?.message || 'An unexpected error occurred';
    // Only show if it's not a network error
    if (!message.includes('Network') && !message.includes('network')) {
      showError(message);
    }
  }

  // API error handler
  static handleApiError(error) {
    console.error('API Error:', error);
    
    if (error?.response?.status === 401) {
      localStorage.removeItem('padel_owner');
      window.location.href = '/admin/login';
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
}

// Initialize global error handler
new ErrorHandler();

export default ErrorHandler;
