// Client-safe constants for blob storage
// This file can be imported on both client and server

// File type configurations
export const FILE_TYPES = {
  images: {
    extensions: ['.jpg', '.jpeg', '.png', '.svg', '.webp', '.gif'],
    mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp', 'image/gif'],
    maxSize: 5 * 1024 * 1024, // 5MB
    category: 'images'
  },
  documents: {
    extensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv'],
    mimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain', 'text/csv'],
    maxSize: 10 * 1024 * 1024, // 10MB
    category: 'documents'
  },
  archives: {
    extensions: ['.zip', '.rar', '.7z', '.tar', '.gz'],
    mimeTypes: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/x-tar', 'application/gzip'],
    maxSize: 25 * 1024 * 1024, // 25MB
    category: 'archives'
  }
};

// Storage quota configuration
export const STORAGE_QUOTAS = {
  free: 100 * 1024 * 1024, // 100MB
  premium: 1024 * 1024 * 1024 // 1GB
};

// Helper function to get file category (client-safe)
export function getFileCategory(file: File): keyof typeof FILE_TYPES | null {
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  const mimeType = file.type.toLowerCase();

  for (const [category, config] of Object.entries(FILE_TYPES)) {
    if (config.extensions.includes(extension) || config.mimeTypes.includes(mimeType)) {
      return category as keyof typeof FILE_TYPES;
    }
  }

  return null;
}

// File validation (client-safe)
export function validateFile(file: File): { isValid: boolean; error?: string; category?: string } {
  // Check file size based on category
  const fileCategory = getFileCategory(file);
  if (!fileCategory) {
    return { isValid: false, error: 'File type not supported' };
  }

  const maxSize = FILE_TYPES[fileCategory].maxSize;
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return { 
      isValid: false, 
      error: `File size must be less than ${maxSizeMB}MB for ${fileCategory}`,
      category: fileCategory
    };
  }

  return { isValid: true, category: fileCategory };
}
