import { put, del, list } from '@vercel/blob';
import { writeAsyncIterableToFile } from '@vercel/blob';
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
  file: File,
  userId: string
): Promise<PutBlobResult> {
  try {
    // Create organized file path: users/{userId}/avatars/{timestamp}-{filename}
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `users/${userId}/avatars/${timestamp}.${fileExtension}`;
    
    const result = await put(fileName, file, {
      access: 'public',
      addRandomSuffix: false, // We're already adding timestamp for uniqueness
    });
    
    return result;
  } catch (error) {
    console.error('Error uploading user avatar:', error);
    throw new Error('Failed to upload avatar');
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
