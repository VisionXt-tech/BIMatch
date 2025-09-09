import { NextRequest, NextResponse } from 'next/server';
import { validateFileUpload, validateFileHeader } from '@/lib/security/fileValidation';

// Rate limiting map
const rateLimitMap = new Map<string, number[]>();
const MAX_VALIDATIONS_PER_MINUTE = 10;

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    // Check rate limiting
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Too many file validation requests.' },
        { status: 429 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('type') as string; // 'image' or 'document'
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!fileType || !['image', 'document'].includes(fileType)) {
      return NextResponse.json(
        { error: 'Invalid file type specified. Must be "image" or "document"' },
        { status: 400 }
      );
    }

    console.log(`Validating file: ${file.name}, size: ${file.size}, type: ${file.type}`);

    // Validate file using existing security functions
    const validation = validateFileUpload(file, fileType as 'image' | 'document');
    
    if (!validation.isValid) {
      return NextResponse.json({
        isValid: false,
        error: validation.error
      }, { status: 400 });
    }

    // Validate file headers for additional security
    const headerValidation = await validateFileHeader(file);
    
    if (!headerValidation) {
      return NextResponse.json({
        isValid: false,
        error: 'File appears to be corrupted or potentially dangerous'
      }, { status: 400 });
    }

    // Additional server-side validations
    const additionalValidation = await performAdditionalValidations(file, fileType);
    
    if (!additionalValidation.isValid) {
      return NextResponse.json({
        isValid: false,
        error: additionalValidation.error
      }, { status: 400 });
    }

    // File is valid
    console.log(`File validation successful: ${file.name}`);
    
    return NextResponse.json({
      isValid: true,
      message: 'File validation successful',
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type,
        validatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('File validation error:', error);
    
    return NextResponse.json({
      isValid: false,
      error: 'Server error during file validation'
    }, { status: 500 });
  }
}

/**
 * Perform additional server-side file validations
 */
async function performAdditionalValidations(
  file: File, 
  fileType: string
): Promise<{ isValid: boolean; error?: string }> {
  
  // Read file content for validation
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Check for embedded scripts in PDF files
  if (file.type === 'application/pdf') {
    const pdfContent = new TextDecoder().decode(bytes);
    
    // Look for JavaScript in PDF
    const dangerousPatterns = [
      /\/JavaScript/gi,
      /\/JS/gi,
      /\/OpenAction/gi,
      /\/AA/gi, // Auto Action
      /\/Launch/gi,
      /<script/gi
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(pdfContent)) {
        return {
          isValid: false,
          error: 'PDF file contains potentially dangerous scripts'
        };
      }
    }
  }

  // Check for executable content in images
  if (fileType === 'image') {
    // Check for common executable signatures in image files
    const executableSignatures = [
      [0x4D, 0x5A], // PE/DOS executable
      [0x7F, 0x45, 0x4C, 0x46], // ELF executable
      [0x50, 0x4B, 0x03, 0x04], // ZIP (could contain executable)
      [0x50, 0x4B, 0x05, 0x06], // Empty ZIP
      [0x50, 0x4B, 0x07, 0x08], // Spanned ZIP
    ];

    for (const signature of executableSignatures) {
      if (bytes.length >= signature.length) {
        let matches = true;
        for (let i = 0; i < signature.length; i++) {
          if (bytes[i] !== signature[i]) {
            matches = false;
            break;
          }
        }
        if (matches) {
          return {
            isValid: false,
            error: 'Image file contains embedded executable content'
          };
        }
      }
    }
  }

  // Check file size limits (additional server-side check)
  const MAX_FILE_SIZE = fileType === 'image' ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
  
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds limit (${MAX_FILE_SIZE / 1024 / 1024}MB)`
    };
  }

  // Check for null bytes (could indicate binary tampering)
  const nullByteIndex = bytes.indexOf(0);
  if (fileType === 'document' && nullByteIndex !== -1 && nullByteIndex < 1024) {
    // Allow null bytes in PDF but check they're in reasonable positions
    if (file.type === 'application/pdf') {
      const firstKB = bytes.slice(0, 1024);
      const nullCount = firstKB.filter(byte => byte === 0).length;
      if (nullCount > 100) { // Too many null bytes in first KB
        return {
          isValid: false,
          error: 'File appears to be corrupted or tampered with'
        };
      }
    }
  }

  return { isValid: true };
}

/**
 * Rate limiting for file validation requests
 */
function checkRateLimit(clientIP: string): boolean {
  const now = Date.now();
  const userRequests = rateLimitMap.get(clientIP) || [];
  
  // Remove requests older than 1 minute
  const minuteAgo = now - (60 * 1000);
  const recentRequests = userRequests.filter(timestamp => timestamp > minuteAgo);
  
  if (recentRequests.length >= MAX_VALIDATIONS_PER_MINUTE) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimitMap.set(clientIP, recentRequests);
  
  return true;
}