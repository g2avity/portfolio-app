import { put, del, list } from '@vercel/blob';
import type { PutBlobResult } from '@vercel/blob';
import { FILE_TYPES, STORAGE_QUOTAS, validateFile, getFileCategory } from './blob.constants';

// File validation and category functions are now imported from blob.constants.ts

// Calculate user's total storage usage
export async function getUserStorageUsage(userId: string): Promise<{
  totalSize: number;
  totalSizeMB: number;
  fileCount: number;
  categoryBreakdown: Record<string, { size: number; count: number }>;
  quota: number;
  quotaMB: number;
  remaining: number;
  remainingMB: number;
  usagePercentage: number;
}> {
  try {
    const { blobs } = await list({
      prefix: `users/${userId}/`,
    });

    let totalSize = 0;
    let fileCount = 0;
    const categoryBreakdown: Record<string, { size: number; count: number }> = {
      images: { size: 0, count: 0 },
      documents: { size: 0, count: 0 },
      archives: { size: 0, count: 0 },
      avatars: { size: 0, count: 0 },
      portfolio: { size: 0, count: 0 }
    };

    for (const blob of blobs) {
      totalSize += blob.size || 0;
      fileCount++;

      // Categorize files based on path
      if (blob.pathname.includes('/avatars/')) {
        categoryBreakdown.avatars.size += blob.size || 0;
        categoryBreakdown.avatars.count++;
      } else if (blob.pathname.includes('/portfolio/')) {
        categoryBreakdown.portfolio.size += blob.size || 0;
        categoryBreakdown.portfolio.count++;
      } else if (blob.pathname.includes('/media/images/')) {
        categoryBreakdown.images.size += blob.size || 0;
        categoryBreakdown.images.count++;
      } else if (blob.pathname.includes('/media/documents/')) {
        categoryBreakdown.documents.size += blob.size || 0;
        categoryBreakdown.documents.count++;
      } else if (blob.pathname.includes('/media/archives/')) {
        categoryBreakdown.archives.size += blob.size || 0;
        categoryBreakdown.archives.count++;
      } else {
        // For files in root user folder, try to determine category by extension
        const extension = blob.pathname.split('.').pop()?.toLowerCase();
        if (extension) {
          if (['jpg', 'jpeg', 'png', 'svg', 'webp', 'gif'].includes(extension)) {
            categoryBreakdown.images.size += blob.size || 0;
            categoryBreakdown.images.count++;
          } else if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv'].includes(extension)) {
            categoryBreakdown.documents.size += blob.size || 0;
            categoryBreakdown.documents.count++;
          } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
            categoryBreakdown.archives.size += blob.size || 0;
            categoryBreakdown.archives.count++;
          }
        }
      }
    }

    // TODO: Get user's actual quota from database (free vs premium)
    const quota = STORAGE_QUOTAS.free; // Default to free tier
    const remaining = Math.max(0, quota - totalSize);
    const usagePercentage = (totalSize / quota) * 100;

    return {
      totalSize,
      totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100,
      fileCount,
      categoryBreakdown,
      quota,
      quotaMB: Math.round(quota / (1024 * 1024) * 100) / 100,
      remaining,
      remainingMB: Math.round(remaining / (1024 * 1024) * 100) / 100,
      usagePercentage: Math.round(usagePercentage * 100) / 100
    };
  } catch (error) {
    console.error('Error calculating user storage usage:', error);
    throw new Error('Failed to calculate storage usage');
  }
}

// Check if user can upload file (quota validation)
export async function canUserUploadFile(file: File, userId: string): Promise<{
  canUpload: boolean;
  error?: string;
  currentUsage: any;
}> {
  try {
    const currentUsage = await getUserStorageUsage(userId);
    const fileSize = file.size;

    if (currentUsage.totalSize + fileSize > currentUsage.quota) {
      return {
        canUpload: false,
        error: `Upload would exceed your ${currentUsage.quotaMB}MB storage limit. You have ${currentUsage.remainingMB}MB remaining.`,
        currentUsage
      };
    }

    return { canUpload: true, currentUsage };
  } catch (error) {
    console.error('Error checking upload permission:', error);
    return { canUpload: false, error: 'Failed to check storage quota', currentUsage: null };
  }
}

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
      access: 'public',
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

// List user's media files with enhanced metadata
export async function listUserMediaFiles(userId: string, category?: string): Promise<Array<{
  url: string;
  pathname: string;
  size: number;
  uploadedAt: Date;
  category: string;
  filename: string;
  extension: string;
}>> {
  try {
    // Get all user files, not just media folder
    const prefix = `users/${userId}/`;

    const { blobs } = await list({ prefix });

    // Filter by category if specified
    let filteredBlobs = blobs;
    if (category && category !== 'all') {
      filteredBlobs = blobs.filter(blob => {
        const fileCategory = getFileCategoryFromPath(blob.pathname);
        return fileCategory === category;
      });
    }

    return filteredBlobs.map(blob => {
      const filename = blob.pathname.split('/').pop() || '';
      const extension = '.' + filename.split('.').pop()?.toLowerCase();
      const fileCategory = getFileCategoryFromPath(blob.pathname);

      return {
        url: blob.url,
        pathname: blob.pathname,
        size: blob.size || 0,
        uploadedAt: blob.uploadedAt || new Date(),
        category: fileCategory,
        filename,
        extension
      };
    });
  } catch (error) {
    console.error('Error listing user media files:', error);
    throw new Error('Failed to list media files');
  }
}

// Helper function to get file category from path
function getFileCategoryFromPath(pathname: string): string {
  if (pathname.includes('/media/images/')) return 'images';
  if (pathname.includes('/media/documents/')) return 'documents';
  if (pathname.includes('/media/archives/')) return 'archives';
  if (pathname.includes('/avatars/')) return 'avatars';
  if (pathname.includes('/portfolio/')) return 'portfolio';
  
  // For files in root user folder, try to determine category by extension
  const extension = pathname.split('.').pop()?.toLowerCase();
  if (extension) {
    if (['jpg', 'jpeg', 'png', 'svg', 'webp', 'gif'].includes(extension)) return 'images';
    if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv'].includes(extension)) return 'documents';
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) return 'archives';
  }
  
  return 'misc';
}

// Upload user avatar with organized naming
export async function uploadUserAvatar(
  file: File,
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
      pathname: result.pathname
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

// Upload media file to user's media library
export async function uploadMediaFile(
  file: File,
  userId: string,
  category: string
): Promise<PutBlobResult> {
  try {
    // Validate file before upload
    const validation = validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error || 'File validation failed');
    }

    // Check storage quota
    const quotaCheck = await canUserUploadFile(file, userId);
    if (!quotaCheck.canUpload) {
      throw new Error(quotaCheck.error || 'Storage quota exceeded');
    }

    // Create organized file path: users/{userId}/media/{category}/{timestamp}-{filename}
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `users/${userId}/media/${category}/${timestamp}.${fileExtension}`;
    
    console.log('📁 Uploading media file to path:', fileName);
    
    const result = await put(fileName, file, {
      access: 'public',
      addRandomSuffix: false,
    });
    
    console.log('✅ Media file upload successful:', {
      url: result.url,
      pathname: result.pathname
    });
    
    return result;
  } catch (error) {
    console.error('Error uploading media file:', error);
    throw new Error(`Failed to upload media file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Legacy validateImageFile function removed - now using enhanced validateFile from constants

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
