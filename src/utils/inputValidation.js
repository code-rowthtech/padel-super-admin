/**
 * Input validation utilities for forms
 */

export const validators = {
  // Phone number validation (Indian format)
  phone: (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) return 'Phone number is required';
    if (cleaned.length !== 10) return 'Phone number must be 10 digits';
    if (!/^[6-9]/.test(cleaned)) return 'Phone number must start with 6, 7, 8, or 9';
    return '';
  },

  // Email validation
  email: (value) => {
    if (!value) return ''; // Email is optional in most cases
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Invalid email format';
    return '';
  },

  // Name validation
  name: (value) => {
    if (!value || !value.trim()) return 'Name is required';
    if (value.trim().length < 2) return 'Name must be at least 2 characters';
    if (value.trim().length > 50) return 'Name must be less than 50 characters';
    if (!/^[a-zA-Z\s]+$/.test(value.trim())) return 'Name can only contain letters and spaces';
    return '';
  },

  // Required field validation
  required: (value, fieldName = 'This field') => {
    if (!value || !value.toString().trim()) {
      return `${fieldName} is required`;
    }
    return '';
  },

  // Minimum length validation
  minLength: (value, min, fieldName = 'This field') => {
    if (value && value.length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    return '';
  },

  // Maximum length validation
  maxLength: (value, max, fieldName = 'This field') => {
    if (value && value.length > max) {
      return `${fieldName} must be less than ${max} characters`;
    }
    return '';
  },

  // Date validation
  date: (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (isNaN(date.getTime())) return 'Invalid date format';
    return '';
  },

  // Future date validation
  futureDate: (value) => {
    if (!value) return '';
    const date = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return 'Date must be in the future';
    return '';
  },

  // Past date validation (for DOB)
  pastDate: (value) => {
    if (!value) return '';
    const date = new Date(value);
    const today = new Date();
    if (date >= today) return 'Date must be in the past';
    return '';
  },

  // Age validation (minimum 13 years)
  minimumAge: (value, minAge = 13) => {
    if (!value) return '';
    const birthDate = new Date(value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age < minAge) return `You must be at least ${minAge} years old`;
    return '';
  }
};

/**
 * Validate multiple fields at once
 * @param {Object} data - Object with field values
 * @param {Object} rules - Object with validation rules for each field
 * @returns {Object} - Object with errors for each field
 */
export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const fieldRules = Array.isArray(rules[field]) ? rules[field] : [rules[field]];
    const value = data[field];
    
    for (const rule of fieldRules) {
      let error = '';
      
      if (typeof rule === 'function') {
        error = rule(value);
      } else if (typeof rule === 'object') {
        const { validator, ...params } = rule;
        if (validators[validator]) {
          error = validators[validator](value, ...Object.values(params));
        }
      } else if (validators[rule]) {
        error = validators[rule](value);
      }
      
      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  });
  
  return errors;
};

/**
 * Sanitize input to prevent XSS
 * @param {string} input - Input string to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Format phone number for display
 * @param {string} phone - Phone number
 * @returns {string} - Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned}`;
  }
  return phone;
};

/**
 * Clean and format name
 * @param {string} name - Name to format
 * @returns {string} - Formatted name
 */
export const formatName = (name) => {
  if (!name) return '';
  
  return name
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .toLowerCase()
    .replace(/(^|\s)\w/g, (letter) => letter.toUpperCase()); // Capitalize first letter of each word
};