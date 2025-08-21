import { put, del, list } from '@vercel/blob';
import type { PutBlobResult } from '@vercel/blob';

// Upload a file to Vercel Blob
export async function uploadFile(
  file: File,
  options?: {
    access?: 'public' | 'private';
    addRandomSuffix?: boolean;
  }
): Promise<PutBlobResult> {
  try {
    const result = await put(file.name, file, {
      access: options?.access || 'public',
      addRandomSuffix: options?.addRandomSuffix ?? true,
    });
    
    return result;
  } catch (error) {
    console.error('Error uploading file to Vercel Blob:', error);
    throw new Error('Failed to upload file');
  }
}

// Delete a file from Vercel Blob
export async function deleteFile(url: string): Promise<void> {
  try {
    await del(url);
  } catch (error) {
    console.error('Error deleting file from Vercel Blob:', error);
    throw new Error('Failed to delete file');
  }
}

// List files in a specific folder (useful for user-specific content)
export async function listUserFiles(userId: string): Promise<string[]> {
  try {
    const { blobs } = await list({
      prefix: `users/${userId}/`,
    });
    
    return blobs.map(blob => blob.url);
  } catch (error) {
    console.error('Error listing user files:', error);
    throw new Error('Failed to list user files');
  }
}

// Upload user avatar with organized naming
export async function uploadUserAvatar(
  file: File | Blob,
  userId: string
): Promise<PutBlobResult> {
  try {
    console.log('🚀 uploadUserAvatar called with:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      userId: userId
    });
    
    console.log('🔍 File object details:', {
      constructor: file.constructor.name,
      isFile: file instanceof File,
      hasName: 'name' in file,
      hasSize: 'size' in file,
      hasType: 'type' in file
    });

    // Validate environment variable
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('❌ BLOB_READ_WRITE_TOKEN environment variable is missing!');
      throw new Error('Blob storage not configured - missing BLOB_READ_WRITE_TOKEN');
    }

    // Create organized file path: users/{userId}/avatars/{timestamp}-{filename}
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `users/${userId}/avatars/${timestamp}.${fileExtension}`;
    
    console.log('📁 Attempting to upload to path:', fileName);
    console.log('🔑 BLOB_READ_WRITE_TOKEN exists:', !!process.env.BLOB_READ_WRITE_TOKEN);
    console.log('📤 Calling Vercel Blob put() function...');
    
    // Use the official Vercel Blob approach - File objects are supported
    const result = await put(fileName, file, {
      access: 'public',
      addRandomSuffix: false, // We're already adding timestamp for uniqueness
    });
    
    console.log('✅ Blob upload successful:', {
      url: result.url,
      pathname: result.pathname,
      size: result.size
    });
    
    console.log('🔍 Full result object:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Error uploading user avatar:', error);
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
    }
    
    throw new Error(`Failed to upload avatar: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Upload portfolio images with organized naming
export async function uploadPortfolioImage(
  file: File,
  userId: string,
  section: string
): Promise<PutBlobResult> {
  try {
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `users/${userId}/portfolio/${section}/${timestamp}.${fileExtension}`;
    
    const result = await put(fileName, file, {
      access: 'public',
      addRandomSuffix: false,
    });
    
    return result;
  } catch (error) {
    console.error('Error uploading portfolio image:', error);
    throw new Error('Failed to upload portfolio image');
  }
}

// Validate file before upload
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 5MB' };
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
  }
  
  return { isValid: true };
}

// Test blob connection
export async function testBlobConnection(): Promise<boolean> {
  try {
    console.log('🧪 Testing blob connection...');
    
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('❌ BLOB_READ_WRITE_TOKEN not found in environment');
      return false;
    }
    
    console.log('✅ BLOB_READ_WRITE_TOKEN found in environment');
    console.log('🔑 Token starts with:', process.env.BLOB_READ_WRITE_TOKEN.substring(0, 20) + '...');
    
    // Try to list blobs to test connection
    const { blobs } = await list({ limit: 1 });
    console.log('✅ Blob connection successful, found', blobs.length, 'existing blobs');
    
    return true;
  } catch (error) {
    console.error('❌ Blob connection test failed:', error);
    return false;
  }
}
