export const formatCurrency = (amount) => `₹${amount?.toLocaleString('en-IN') || 0}`;

export const formatDate = (date) => new Date(date).toLocaleDateString('en-IN');

export const formatTime = (time) => new Date(`1970-01-01T${time}`).toLocaleTimeString('en-IN', { 
  hour: '2-digit', 
  minute: '2-digit' 
});

export const truncateText = (text, maxLength = 100) => 
  text?.length > maxLength ? `${text.substring(0, maxLength)}...` : text;

export const capitalizeFirst = (str) => 
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';

export const formatPhoneNumber = (phone) => 
  phone?.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');