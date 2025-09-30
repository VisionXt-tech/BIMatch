// File upload security utilities

export const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/webp'],
  documents: ['application/pdf'],
  archives: [], // Disabled for security
} as const;

export const MAX_FILE_SIZES = {
  image: 2 * 1024 * 1024, // 2MB for images
  document: 5 * 1024 * 1024, // 5MB for PDFs
} as const;

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedName?: string;
}

export const validateFileUpload = (file: File, type: 'image' | 'document'): FileValidationResult => {
  // Check file size
  const maxSize = type === 'image' ? MAX_FILE_SIZES.image : MAX_FILE_SIZES.document;
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File troppo grande. Dimensione massima: ${Math.round(maxSize / (1024 * 1024))}MB`
    };
  }
  
  // Check MIME type
  const allowedTypes = type === 'image' ? ALLOWED_FILE_TYPES.images : ALLOWED_FILE_TYPES.documents;
  if (!(allowedTypes as readonly string[]).includes(file.type)) {
    return {
      isValid: false,
      error: `Tipo di file non consentito. Tipi permessi: ${allowedTypes.join(', ')}`
    };
  }
  
  // Validate file extension matches MIME type
  const extension = file.name.toLowerCase().split('.').pop();
  const validExtensions = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/webp': ['webp'],
    'application/pdf': ['pdf']
  };
  
  const expectedExtensions = validExtensions[file.type as keyof typeof validExtensions];
  if (!expectedExtensions || !expectedExtensions.includes(extension || '')) {
    return {
      isValid: false,
      error: 'Estensione file non corrisponde al tipo MIME'
    };
  }
  
  // Sanitize filename
  const sanitizedName = sanitizeFileName(file.name);
  if (!sanitizedName) {
    return {
      isValid: false,
      error: 'Nome file non valido'
    };
  }
  
  // Additional security checks
  if (containsMaliciousPatterns(file.name)) {
    return {
      isValid: false,
      error: 'Nome file contiene caratteri non consentiti'
    };
  }
  
  return {
    isValid: true,
    sanitizedName
  };
};

export const sanitizeFileName = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9\-_\.]/g, '_') // Replace special chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
    .slice(0, 100); // Limit length
};

export const containsMaliciousPatterns = (filename: string): boolean => {
  const maliciousPatterns = [
    /\.(exe|bat|cmd|scr|pif|com|jar|vbs|js|html|htm)$/i, // Executable extensions
    /<script/i, // Script tags
    /javascript:/i, // JavaScript protocol
    /data:/i, // Data protocol
    /\.\./, // Path traversal
    /[<>"|?*]/, // Invalid filename characters
  ];
  
  return maliciousPatterns.some(pattern => pattern.test(filename));
};

// File content validation (basic header check)
export const validateFileHeader = async (file: File): Promise<boolean> => {
  try {
    // Get first 8 bytes of the file
    const arrayBuffer = await file.slice(0, 8).arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    // Check file magic numbers/signatures
    const signatures = {
      pdf: [0x25, 0x50, 0x44, 0x46], // %PDF
      jpeg: [0xFF, 0xD8, 0xFF], // JPEG
      png: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], // PNG
    };
    
    const matchesPDF = signatures.pdf.every((byte, i) => bytes[i] === byte);
    const matchesJPEG = signatures.jpeg.every((byte, i) => bytes[i] === byte);
    const matchesPNG = signatures.png.every((byte, i) => bytes[i] === byte);
    
    return matchesPDF || matchesJPEG || matchesPNG;
  } catch (error) {
    console.error('Error validating file header:', error);
    return false;
  }
};

// Generate secure filename for storage
export const generateSecureFileName = (originalName: string, userId: string): string => {
  const extension = originalName.toLowerCase().split('.').pop();
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  
  return `${userId}_${timestamp}_${random}.${extension}`;
};