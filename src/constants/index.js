// App Constants
export const SESSION_KEYS = {
  USER: "padel_user",
  OWNER: "padel_owner"
};

export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[6-9]\d{9}$/,
  PASSWORD_MIN_LENGTH: 6
};

export const COMMON_STYLES = {
  INPUT: {
    borderRadius: "8px",
    height: "50px",
    boxShadow: "none"
  },
  BUTTON: {
    borderRadius: "25px",
    height: "50px"
  },
  GRADIENT: "linear-gradient(to right, #27ae60, #2e51f3)"
};