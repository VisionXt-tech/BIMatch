/**
 * Security-focused input validation utilities
 */

// Sanitize HTML and prevent XSS
export const sanitizeHTML = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Validate email format with stricter rules
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  // Additional checks
  if (email.length > 254) return false;
  if (email.startsWith('.') || email.endsWith('.')) return false;
  if (email.includes('..')) return false;
  
  return emailRegex.test(email);
};

// Validate Italian VAT number
export const isValidItalianVAT = (vat: string): boolean => {
  if (!vat || typeof vat !== 'string') return false;
  
  // Remove any spaces and convert to string
  const cleanVAT = vat.replace(/\s/g, '');
  
  // Must be exactly 11 digits
  if (!/^\d{11}$/.test(cleanVAT)) return false;
  
  // Check digit validation for Italian VAT
  const digits = cleanVAT.split('').map(Number);
  let sum = 0;
  
  for (let i = 0; i < 10; i++) {
    let digit = digits[i];
    if (i % 2 === 1) { // odd positions (1-based indexing)
      digit *= 2;
      if (digit > 9) digit = digit - 9;
    }
    sum += digit;
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === digits[10];
};

// Validate phone number (international format)
export const isValidPhoneNumber = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return false;
  
  // Allow various international formats
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  return phoneRegex.test(cleanPhone) && cleanPhone.length >= 7 && cleanPhone.length <= 15;
};

// Validate URL format
export const isValidURL = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

// Detect potential injection attempts
export const containsPotentialInjection = (input: string): boolean => {
  if (!input || typeof input !== 'string') return false;
  
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /onload=/i,
    /onerror=/i,
    /onclick=/i,
    /onmouseover=/i,
    /eval\(/i,
    /expression\(/i,
    /url\(/i,
    /import\s*\(/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
  ];
  
  return dangerousPatterns.some(pattern => pattern.test(input));
};

// Validate file extension
export const isValidFileExtension = (filename: string, allowedExtensions: string[]): boolean => {
  if (!filename || typeof filename !== 'string') return false;
  
  const extension = filename.toLowerCase().split('.').pop();
  return extension ? allowedExtensions.includes(extension) : false;
};

// Rate limiting key generator
export const generateRateLimitKey = (type: string, identifier: string): string => {
  return `${type}_${identifier}`.toLowerCase();
};

// Clean and normalize string input
export const normalizeString = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
    .slice(0, 1000); // Limit length
};