import { useState, useCallback } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useFirebase } from '@/contexts/FirebaseContext';
import { useToast } from '@/hooks/use-toast';

export interface SecureUploadProgress {
  progress: number;
  isUploading: boolean;
  error: string | null;
  downloadURL: string | null;
}

export interface SecureUploadOptions {
  folder: string; // e.g., 'cvs', 'certifications', 'logos'
  fileType: 'image' | 'document';
  maxSizeBytes?: number;
  onProgress?: (progress: number) => void;
  onError?: (error: string) => void;
  onSuccess?: (downloadURL: string) => void;
}

/**
 * Secure file upload hook with server-side validation
 */
export function useSecureFileUpload() {
  const [uploadStates, setUploadStates] = useState<Map<string, SecureUploadProgress>>(new Map());
  const { toast } = useToast();
  const { storage } = useFirebase();

  const uploadFile = useCallback(async (
    file: File,
    userId: string,
    options: SecureUploadOptions
  ): Promise<string> => {
    
    const uploadId = `${userId}-${options.folder}-${Date.now()}`;
    
    // Initialize upload state
    setUploadStates(prev => new Map(prev).set(uploadId, {
      progress: 0,
      isUploading: true,
      error: null,
      downloadURL: null
    }));

    try {
      // Step 1: Client-side pre-validation
      if (options.maxSizeBytes && file.size > options.maxSizeBytes) {
        throw new Error(`File size exceeds ${(options.maxSizeBytes / 1024 / 1024).toFixed(1)}MB limit`);
      }

      // Step 2: Server-side validation
      console.log('Starting server-side file validation...');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', options.fileType);

      const validationResponse = await fetch('/api/validate-file', {
        method: 'POST',
        body: formData
      });

      const validationResult = await validationResponse.json();
      
      if (!validationResponse.ok || !validationResult.isValid) {
        throw new Error(validationResult.error || 'File validation failed');
      }

      console.log('Server-side validation passed:', validationResult.message);

      // Step 3: Generate secure file path
      const timestamp = Date.now();
      const sanitizedFileName = file.name
        .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special characters
        .slice(0, 100); // Limit filename length
      
      const filePath = `users/${userId}/${options.folder}/${timestamp}_${sanitizedFileName}`;
      const fileRef = ref(storage, filePath);

      // Step 4: Upload file with progress tracking
      return new Promise<string>((resolve, reject) => {
        const uploadTask = uploadBytesResumable(fileRef, file);

        uploadTask.on('state_changed',
          // Progress callback
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            
            setUploadStates(prev => {
              const newState = new Map(prev);
              const currentState = newState.get(uploadId) || {
                progress: 0,
                isUploading: true,
                error: null,
                downloadURL: null
              };
              newState.set(uploadId, { ...currentState, progress });
              return newState;
            });
            
            options.onProgress?.(progress);
            console.log(`Upload progress: ${progress.toFixed(1)}%`);
          },
          
          // Error callback
          (error) => {
            console.error('Upload error:', error);
            
            let errorMessage = 'Upload failed';
            switch (error.code) {
              case 'storage/unauthorized':
                errorMessage = 'Accesso non autorizzato. Effettua il login e riprova.';
                break;
              case 'storage/canceled':
                errorMessage = 'Upload annullato.';
                break;
              case 'storage/unknown':
                errorMessage = 'Errore sconosciuto durante l\'upload.';
                break;
              case 'storage/quota-exceeded':
                errorMessage = 'Quota storage superata.';
                break;
              case 'storage/invalid-checksum':
                errorMessage = 'File corrotto durante l\'upload.';
                break;
              default:
                errorMessage = error.message || 'Errore durante l\'upload';
            }

            setUploadStates(prev => {
              const newState = new Map(prev);
              newState.set(uploadId, {
                progress: 0,
                isUploading: false,
                error: errorMessage,
                downloadURL: null
              });
              return newState;
            });

            options.onError?.(errorMessage);
            toast({
              title: "Errore Upload",
              description: errorMessage,
              variant: "destructive"
            });
            
            reject(new Error(errorMessage));
          },
          
          // Success callback
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              
              setUploadStates(prev => {
                const newState = new Map(prev);
                newState.set(uploadId, {
                  progress: 100,
                  isUploading: false,
                  error: null,
                  downloadURL
                });
                return newState;
              });

              options.onSuccess?.(downloadURL);
              console.log('File uploaded successfully:', downloadURL);
              
              resolve(downloadURL);
              
            } catch (error) {
              const errorMessage = 'Errore nel recupero URL file';
              console.error('Error getting download URL:', error);
              
              setUploadStates(prev => {
                const newState = new Map(prev);
                newState.set(uploadId, {
                  progress: 0,
                  isUploading: false,
                  error: errorMessage,
                  downloadURL: null
                });
                return newState;
              });
              
              reject(new Error(errorMessage));
            }
          }
        );
      });

    } catch (error: any) {
      const errorMessage = error.message || 'Errore durante la validazione file';
      console.error('Secure upload error:', error);
      
      setUploadStates(prev => {
        const newState = new Map(prev);
        newState.set(uploadId, {
          progress: 0,
          isUploading: false,
          error: errorMessage,
          downloadURL: null
        });
        return newState;
      });

      options.onError?.(errorMessage);
      toast({
        title: "Errore Upload",
        description: errorMessage,
        variant: "destructive"
      });

      throw error;
    }
  }, [toast, storage]);

  const getUploadState = useCallback((uploadId: string): SecureUploadProgress | null => {
    return uploadStates.get(uploadId) || null;
  }, [uploadStates]);

  const clearUploadState = useCallback((uploadId: string) => {
    setUploadStates(prev => {
      const newState = new Map(prev);
      newState.delete(uploadId);
      return newState;
    });
  }, []);

  return {
    uploadFile,
    getUploadState,
    clearUploadState,
    uploadStates: uploadStates
  };
}

// Utility function to generate consistent upload IDs
export function generateUploadId(userId: string, folder: string): string {
  return `${userId}-${folder}-${Date.now()}`;
}