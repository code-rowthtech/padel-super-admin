import { VALIDATION_RULES } from '../constants';

export const validateEmail = (email) => VALIDATION_RULES.EMAIL.test(email);

export const validatePhone = (phone) => VALIDATION_RULES.PHONE.test(phone);

export const validatePassword = (password) => password && password.length >= VALIDATION_RULES.PASSWORD_MIN_LENGTH;

export const validateRequired = (value) => value && value.trim().length > 0;

export const validatePasswordMatch = (password, confirmPassword) => password === confirmPassword;