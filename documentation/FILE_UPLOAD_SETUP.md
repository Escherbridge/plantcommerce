# File Upload System Setup Guide

This document explains how to configure and use the file upload system with Google Cloud Storage integration.

## Environment Variables

Add these environment variables to your `.env` file:

```bash
# Google Cloud Storage Configuration
GCS_PROJECT_ID=your-gcp-project-id
GCS_BUCKET_NAME=plantcommerce-files
GCS_KEY_FILE=path/to/your/gcs-service-account-key.json

# Optional: Custom base URL for file access
GCS_BASE_URL=https://storage.googleapis.com/plantcommerce-files
```

## GCP Setup

1. **Create a GCP Project** (if you don't have one)

2. **Enable Cloud Storage API**
   ```bash
   gcloud services enable storage-component.googleapis.com
   ```

3. **Create a Storage Bucket**
   ```bash
   gsutil mb gs://plantcommerce-files
   ```

4. **Create a Service Account**
   ```bash
   gcloud iam service-accounts create plantcommerce-storage \
     --display-name="PlantCommerce Storage Service Account"
   ```

5. **Grant Permissions to the Service Account**
   ```bash
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:plantcommerce-storage@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/storage.admin"
   ```

6. **Create and Download Service Account Key**
   ```bash
   gcloud iam service-accounts keys create ~/plantcommerce-gcs-key.json \
     --iam-account=plantcommerce-storage@YOUR_PROJECT_ID.iam.gserviceaccount.com
   ```

## File Upload API Endpoints

### Upload Files (POST /api/files/upload)

Upload one or more files via multipart form data.

**Parameters:**
- `files`: File(s) to upload (max 5 files, 10MB each)
- `entityType`: Type of entity ('user', 'product', 'content', 'general')
- `entityId`: Optional ID of the related entity
- `isPublic`: Boolean, whether file should be publicly accessible
- `metadata`: Optional JSON string with additional file metadata

**Example using fetch:**
```javascript
const formData = new FormData();
formData.append('files', fileInput.files[0]);
formData.append('entityType', 'product');
formData.append('entityId', '123');
formData.append('isPublic', 'true');
formData.append('metadata', JSON.stringify({ alt: 'Product image' }));

const response = await fetch('/api/files/upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result.files); // Array of uploaded file objects
```

## TRPC API Methods

### Get File Information
```typescript
const file = await trpc.files.getFile.query({ fileId: 'uuid' });
```

### Get Files by Entity
```typescript
const files = await trpc.files.getFilesByEntity.query({
  entityType: 'product',
  entityId: '123',
  limit: 10
});
```

### Generate Signed URL (for private files)
```typescript
const { signedUrl } = await trpc.files.getSignedUrl.query({
  fileId: 'uuid',
  expiresIn: 3600 // 1 hour
});
```

### Update File Metadata
```typescript
const updatedFile = await trpc.files.updateFileMetadata.mutate({
  fileId: 'uuid',
  metadata: { alt: 'Updated alt text' },
  isPublic: true
});
```

### Delete File
```typescript
await trpc.files.deleteFile.mutate({ fileId: 'uuid' });
```

### Get Public Images
```typescript
const images = await trpc.files.getImages.query({
  limit: 20,
  entityType: 'product',
  entityId: '123'
});
```

## File Organization

Files are organized in the bucket using this structure:
```
{entityType}/{year}/{month}/{entityId}/{unique-filename}
```

Examples:
- `user/2024/01/user123/avatar-a1b2c3d4.jpg`
- `product/2024/01/product456/main-image-e5f6g7h8.png`
- `content/2024/01/page789/featured-i9j0k1l2.webp`
- `general/2024/01/document-m3n4o5p6.pdf`

## Database Schema

The file system uses a dedicated `file` table that stores:
- Unique file ID (UUID)
- Original and sanitized filenames
- File metadata (size, MIME type, etc.)
- Bucket path and name
- Entity relationships
- Access control settings
- Upload tracking

Related tables reference files by ID instead of storing URLs directly:
- `user.avatarFileId` → `file.id`
- `productImage.fileId` → `file.id`
- `contentPage.featuredImageFileId` → `file.id`

## Security Features

- **Authentication required** for uploads and private file access
- **File type validation** (images, documents, media only)
- **File size limits** (10MB per file, 5 files per upload)
- **Access control** based on file ownership and user roles
- **Signed URLs** for temporary access to private files
- **Automatic cleanup** if database operations fail

## Usage Examples

### Product Image Upload
1. Upload image via `/api/files/upload` with `entityType: 'product'`
2. Use the returned `fileId` to create a `productImage` record
3. Set `isMain: true` for the primary product image

### User Avatar
1. Upload image via `/api/files/upload` with `entityType: 'user'`
2. Update user record to set `avatarFileId` to the returned file ID

### Content Featured Image
1. Upload image via `/api/files/upload` with `entityType: 'content'`
2. Update content page to set `featuredImageFileId`

## Migration from URL-based System

If migrating from a system that stores image URLs directly:

1. **Run database migration** to add new file-reference columns
2. **Upload existing images** to GCS using the file service
3. **Update existing records** to reference file IDs instead of URLs
4. **Remove old URL columns** after verification

The migration can be done gradually by supporting both systems during transition.
