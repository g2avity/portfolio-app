# Blob Storage Patterns & File Management

## Overview
This document outlines our patterns for file storage using Vercel Blob, including user-specific folder structures, file validation, and storage quotas.

## Architecture

### 1. Folder Structure
```
users/
├── {userId}/
│   ├── avatars/           # User profile pictures
│   ├── portfolio/         # Portfolio-specific files
│   └── media/            # General media files
```

### 2. File Categories
```typescript
// lib/blob.constants.ts
export const FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp', 'image/gif'],
  DOCUMENTS: [
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  ARCHIVES: [
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/x-tar',
    'application/gzip'
  ],
  TEXT: ['text/plain', 'text/csv']
};

export const FILE_SIZE_LIMITS = {
  IMAGES: 5 * 1024 * 1024,      // 5MB
  DOCUMENTS: 10 * 1024 * 1024,  // 10MB
  ARCHIVES: 25 * 1024 * 1024,   // 25MB
  TEXT: 1 * 1024 * 1024         // 1MB
};
```

## Server-Side Operations

### 1. File Upload
```typescript
// lib/blob.server.ts
import { put } from '@vercel/blob';

export async function uploadFile(
  userId: string,
  file: File,
  category: 'avatar' | 'portfolio' | 'media',
  options?: { access?: 'public' }
) {
  // Validate file
  const validation = validateFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }
  
  // Check storage quota
  const canUpload = await canUserUploadFile(userId, file.size);
  if (!canUpload.canUpload) {
    throw new Error(canUpload.error);
  }
  
  // Generate file path
  const filePath = generateFilePath(userId, file, category);
  
  // Upload to Vercel Blob
  const result = await put(filePath, file, {
    access: 'public',
    addRandomSuffix: true
  });
  
  return {
    url: result.url,
    path: filePath,
    size: file.size,
    type: file.type
  };
}
```

### 2. File Validation
```typescript
// lib/blob.constants.ts (client-safe)
export function validateFile(file: File): { isValid: boolean; error?: string } {
  // Check file type
  const allAllowedTypes = [
    ...FILE_TYPES.IMAGES,
    ...FILE_TYPES.DOCUMENTS,
    ...FILE_TYPES.ARCHIVES,
    ...FILE_TYPES.TEXT
  ];
  
  if (!allAllowedTypes.includes(file.type)) {
    return { isValid: false, error: 'File type not supported' };
  }
  
  // Check file size
  const sizeLimit = getFileSizeLimit(file.type);
  if (file.size > sizeLimit) {
    return { 
      isValid: false, 
      error: `File size exceeds ${formatBytes(sizeLimit)} limit` 
    };
  }
  
  return { isValid: true };
}

function getFileSizeLimit(mimeType: string): number {
  if (FILE_TYPES.IMAGES.includes(mimeType)) return FILE_SIZE_LIMITS.IMAGES;
  if (FILE_TYPES.DOCUMENTS.includes(mimeType)) return FILE_SIZE_LIMITS.DOCUMENTS;
  if (FILE_TYPES.ARCHIVES.includes(mimeType)) return FILE_SIZE_LIMITS.ARCHIVES;
  if (FILE_TYPES.TEXT.includes(mimeType)) return FILE_SIZE_LIMITS.TEXT;
  return FILE_SIZE_LIMITS.TEXT; // Default
}
```

### 3. Storage Quota Management
```typescript
// lib/blob.server.ts
export async function canUserUploadFile(
  userId: string,
  fileSize: number
): Promise<{ canUpload: boolean; error?: string; currentUsage: any }> {
  try {
    // Get current storage usage
    const currentUsage = await getUserStorageUsage(userId);
    
    // Check if user has premium plan
    const user = await getUser(userId);
    const maxStorage = user.isPremium ? 1000 * 1024 * 1024 : 100 * 1024 * 1024; // 1GB vs 100MB
    
    if (currentUsage.totalSize + fileSize > maxStorage) {
      return {
        canUpload: false,
        error: 'Storage quota exceeded. Upgrade to premium for more space.',
        currentUsage
      };
    }
    
    return { canUpload: true, currentUsage };
  } catch (error) {
    return {
      canUpload: false,
      error: 'Failed to check storage quota',
      currentUsage: null
    };
  }
}

export async function getUserStorageUsage(userId: string) {
  const prefix = `users/${userId}/`;
  const { blobs } = await list({ prefix });
  
  const totalSize = blobs.reduce((sum, blob) => sum + blob.size, 0);
  const fileCount = blobs.length;
  
  return {
    totalSize,
    fileCount,
    files: blobs.map(blob => ({
      url: blob.url,
      path: blob.pathname,
      size: blob.size,
      uploadedAt: blob.uploadedAt
    }))
  };
}
```

## Client-Side Integration

### 1. File Upload Component
```typescript
// components/file-upload.tsx
import { useState } from 'react';
import { useSubmit } from 'react-router';
import { validateFile } from '../lib/blob.constants';

export function FileUpload({ userId, category }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const submit = useSubmit();
  
  const handleFileSelect = async (file: File) => {
    // Client-side validation
    const validation = validateFile(file);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('_action', 'uploadFile');
      formData.append('file', file);
      formData.append('category', category);
      formData.append('userId', userId);
      
      submit(formData, { method: 'post' });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div 
      className={`border-2 border-dashed rounded-lg p-8 text-center ${
        dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
      onDragEnter={() => setDragActive(true)}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
      }}
    >
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        {uploading ? 'Uploading...' : 'Drop files here or click to upload'}
      </label>
    </div>
  );
}
```

### 2. Media Library Component
```typescript
// components/media-library.tsx
export function MediaLibrary({ userId }: MediaLibraryProps) {
  const { mediaFiles } = useLoaderData<typeof loader>();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const categories = [
    { value: 'all', label: 'All Files' },
    { value: 'images', label: 'Images' },
    { value: 'documents', label: 'Documents' },
    { value: 'archives', label: 'Archives' },
    { value: 'avatars', label: 'Profile Pictures' },
    { value: 'portfolio', label: 'Portfolio Files' }
  ];
  
  const filteredFiles = mediaFiles.filter(file => {
    if (selectedCategory === 'all') return true;
    return file.category === selectedCategory;
  });
  
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <select 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map(category => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
        
        {/* View Toggle */}
        <div className="flex border rounded-lg">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : ''}`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : ''}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* File Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredFiles.map(file => (
            <FileCard key={file.url} file={file} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredFiles.map(file => (
            <FileListItem key={file.url} file={file} />
          ))}
        </div>
      )}
    </div>
  );
}
```

## Route Integration

### 1. Media Library Route
```typescript
// routes/dashboard.media.tsx
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  
  // Get all user files
  const mediaFiles = await listUserMediaFiles(user.id);
  
  // Categorize files
  const categorizedFiles = mediaFiles.map(file => ({
    ...file,
    category: getFileCategoryFromPath(file.pathname)
  }));
  
  return { user, mediaFiles: categorizedFiles };
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();
  const action = formData.get('_action') as string;
  
  switch (action) {
    case 'uploadFile':
      const file = formData.get('file') as File;
      const category = formData.get('category') as string;
      
      const result = await uploadFile(user.id, file, category as any);
      return { success: true, file: result };
      
    case 'deleteFile':
      const fileUrl = formData.get('fileUrl') as string;
      await deleteFile(fileUrl);
      return { success: true };
      
    default:
      return { success: false, error: 'Unknown action' };
  }
}
```

### 2. Avatar Upload Integration
```typescript
// In profile form component
const handleAvatarUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('_action', 'uploadAvatar');
  formData.append('avatar', file);
  
  submit(formData, { method: 'post' });
};

// In dashboard action
if (action === 'uploadAvatar') {
  const avatarFile = formData.get('avatar') as File;
  const result = await uploadUserAvatar(user.id, avatarFile);
  
  // Update user record with new avatar URL
  await updateUser(user.id, { avatarUrl: result.url });
  
  return { success: true, avatarUrl: result.url };
}
```

## File Display Patterns

### 1. Image Preview
```typescript
// components/file-card.tsx
export function FileCard({ file }: FileCardProps) {
  const isImage = file.category === 'images' || file.category === 'avatars';
  
  return (
    <div className="border rounded-lg p-2 hover:shadow-md transition-shadow">
      {isImage ? (
        <img
          src={file.url}
          alt={file.name}
          className="w-full h-24 object-cover rounded"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <div className="w-full h-24 flex items-center justify-center bg-gray-100 rounded">
          <FileIcon type={file.type} />
        </div>
      )}
      
      <div className="mt-2">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <p className="text-xs text-gray-500">{formatBytes(file.size)}</p>
      </div>
    </div>
  );
}
```

### 2. File Actions
```typescript
// components/file-actions.tsx
export function FileActions({ file }: FileActionsProps) {
  const submit = useSubmit();
  
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this file?')) {
      const formData = new FormData();
      formData.append('_action', 'deleteFile');
      formData.append('fileUrl', file.url);
      submit(formData, { method: 'post' });
    }
  };
  
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.click();
  };
  
  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" onClick={handleDownload}>
        <Download className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="outline" onClick={handleDelete}>
        <Trash className="w-4 h-4" />
      </Button>
    </div>
  );
}
```

## Best Practices

### 1. Security
- Validate file types on both client and server
- Implement file size limits
- Use signed URLs for sensitive files
- Sanitize file names

### 2. Performance
- Implement lazy loading for large file lists
- Use image optimization for thumbnails
- Cache file metadata
- Implement pagination for large collections

### 3. User Experience
- Show upload progress
- Provide drag-and-drop functionality
- Display file previews when possible
- Implement proper error handling

### 4. Storage Management
- Monitor storage usage
- Implement cleanup for deleted files
- Provide storage quota information
- Support file compression

## File Structure
```
app/
├── lib/
│   ├── blob.server.ts         # Server-side blob operations
│   └── blob.constants.ts      # Client-safe constants and validation
├── components/
│   ├── file-upload.tsx        # File upload component
│   ├── media-library.tsx      # Media library interface
│   ├── file-card.tsx          # File display component
│   └── file-actions.tsx       # File action buttons
└── routes/
    └── dashboard.media.tsx    # Media library route
```
