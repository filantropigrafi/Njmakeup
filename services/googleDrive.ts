
const GOOGLE_DRIVE_API_KEY =
  import.meta.env.VITE_GOOGLE_DRIVE_API_KEY || import.meta.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY;
const GOOGLE_DRIVE_FOLDER_ID =
  import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID || import.meta.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID;

// Extract file ID from various Google Drive URL formats
export const extractFileId = (url: string): string | null => {
  if (!url) return null;
  
  // Check if it's already just an ID
  if (!url.includes('/') && !url.includes('=')) {
    return url;
  }
  
  // Pattern 1: https://drive.google.com/file/d/FILE_ID/view
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return fileMatch[1];
  
  // Pattern 2: https://drive.google.com/uc?export=view&id=FILE_ID
  const ucMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (ucMatch) return ucMatch[1];
  
  // Pattern 3: https://lh3.googleusercontent.com/d/FILE_ID
  const lhMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (lhMatch) return lhMatch[1];
  
  // Pattern 4: https://drive.google.com/thumbnail?id=FILE_ID
  const thumbMatch = url.match(/thumbnail\?id=([a-zA-Z0-9_-]+)/);
  if (thumbMatch) return thumbMatch[1];
  
  return null;
};

export const getGoogleDriveFileUrl = (fileIdOrUrl: string) => {
  // Extract file ID if a full URL is passed
  const fileId = extractFileId(fileIdOrUrl) || fileIdOrUrl;
  
  // Use direct image URL that can be embedded in <img> tags
  // The uc export URL is the most reliable for publicly shared files
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
};

// Get a thumbnail URL that works reliably without expiring
export const getThumbnailUrl = (fileIdOrUrl: string, size: 'w100' | 'w200' | 'w400' | 'w800' = 'w400') => {
  const fileId = extractFileId(fileIdOrUrl) || fileIdOrUrl;
  
  // Use lh3.googleusercontent.com which doesn't expire (most reliable for public files)
  // This format works for publicly shared files without authentication
  return `https://lh3.googleusercontent.com/d/${fileId}=${size}-${size}`;
};

// Get all possible thumbnail URLs for fallback
export const getAllThumbnailUrls = (fileIdOrUrl: string): string[] => {
  const fileId = extractFileId(fileIdOrUrl) || fileIdOrUrl;
  
  return [
    // Primary: lh3 format (doesn't expire) - most reliable
    `https://lh3.googleusercontent.com/d/${fileId}=w400-h400`,
    `https://lh3.googleusercontent.com/d/${fileId}=w800-h800`,
    `https://lh3.googleusercontent.com/d/${fileId}=w200-h200`,
    
    // Secondary: drive.google.com/thumbnail (doesn't expire for public files)
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`,
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`,
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w200`,
    
    // Tertiary: uc export (reliable but slower)
    `https://drive.google.com/uc?export=view&id=${fileId}`,
    
    // Last resort: small thumbnail
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w100`
  ];
};

// Ensure any stored Google Drive URL is always reliable
// This handles URLs that may have become stale or expired
export const getStableImageUrl = (url: string, addCacheBuster: boolean = false): string => {
  if (!url) return url;
  
  // Check if it's a Google Drive URL
  const isGoogleDriveUrl = url.includes('drive.google.com') || 
                          url.includes('googleusercontent.com') ||
                          url.includes('goo.gl');
  
  if (!isGoogleDriveUrl) {
    // Not a Google Drive URL, return as-is
    return addCacheBuster ? `${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}` : url;
  }
  
  // Extract the file ID
  const fileId = extractFileId(url);
  
  if (!fileId) {
    // Can't extract file ID, return original URL with cache buster if requested
    return addCacheBuster ? `${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}` : url;
  }
  
  // Use the most reliable URL format
  let stableUrl = `https://lh3.googleusercontent.com/d/${fileId}=w800-h800`;
  
  // Add cache buster if requested (helps force refresh on failed loads)
  if (addCacheBuster) {
    stableUrl += `&_t=${Date.now()}`;
  }
  
  return stableUrl;
};

// Check if a URL is a valid Google Drive image URL
export const isGoogleDriveImageUrl = (url: string): boolean => {
  if (!url) return false;
  return url.includes('drive.google.com') || url.includes('googleusercontent.com');
};

export const listGoogleDriveFiles = async () => {
  try {
    if (!GOOGLE_DRIVE_API_KEY || !GOOGLE_DRIVE_FOLDER_ID) {
      console.log('Google Drive configuration is missing.');
      return [];
    }

    const url = new URL('https://www.googleapis.com/drive/v3/files');
    
    // Only add folder query if folder ID exists and is valid
    if (GOOGLE_DRIVE_FOLDER_ID && GOOGLE_DRIVE_FOLDER_ID.trim() !== '') {
      url.searchParams.set('q', `'${GOOGLE_DRIVE_FOLDER_ID}' in parents`);
    }
    
    url.searchParams.set('key', GOOGLE_DRIVE_API_KEY);
    url.searchParams.set('fields', 'files(id,name,mimeType,thumbnailLink)');
    url.searchParams.set('supportsAllDrives', 'true');
    url.searchParams.set('includeItemsFromAllDrives', 'true');
    url.searchParams.set('pageSize', '50');

    const response = await fetch(url.toString());

    if (!response.ok) {
      const text = await response.text();
      console.error('Google Drive API error:', response.status, text);
      
      // If it's a rate limiting error, return empty array but don't show error
      if (response.status === 429) {
        console.log('Rate limited by Google Drive API, returning empty result');
        return [];
      }
      
      return [];
    }

    const data = await response.json();
    const files = (data.files || []) as Array<{ id: string; name: string; mimeType?: string; thumbnailLink?: string }>;
    
    // Filter for image files only
    const imageFiles = files.filter(file => 
      file.mimeType?.startsWith('image/') || 
      file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
    );
    
    console.log(`Found ${imageFiles.length} image files in Google Drive folder`);
    return imageFiles;
  } catch (error) {
    console.error("Google Drive Error:", error);
    return [];
  }
};
