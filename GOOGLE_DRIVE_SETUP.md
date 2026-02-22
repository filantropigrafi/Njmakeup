# Google Drive Setup Guide

## 🚨 Error 403 Forbidden Solutions

If you're seeing `403 Forbidden` errors when accessing Google Drive images, follow these steps:

### 1. **Share Folder Correctly**
1. Open your Google Drive folder
2. Right-click the folder → **Share**
3. Under "General access", select **"Anyone with the link"**
4. Make sure **"Viewer"** role is selected
5. Click **"Share"**

### 2. **Verify Folder Permissions**
- The folder must be publicly accessible
- All images inside should inherit the folder's sharing settings
- Test by opening the folder link in an incognito window

### 3. **Check Environment Variables**
Ensure these are correctly set in `.env.local`:
```bash
VITE_GOOGLE_DRIVE_API_KEY=your_api_key
VITE_GOOGLE_DRIVE_FOLDER_ID=your_folder_id
```

### 4. **API Key Permissions**
Your Google Drive API key needs:
- Google Drive API enabled
- Proper API key restrictions (if any)

### 5. **Troubleshooting Steps**
1. **Refresh the page** after fixing permissions
2. **Clear browser cache** if issues persist
3. **Check browser console** for specific error messages
4. **Test with different images** in the folder

## 🔄 Multiple URL Fallbacks

The application now uses multiple URL strategies to handle different access scenarios:

1. **Thumbnail Link** (if available from API)
2. **Direct Thumbnail URL**: `https://drive.google.com/thumbnail?id=FILE_ID&sz=w400`
3. **Alternative Sizes**: w200, w100
4. **UC Export**: `https://drive.google.com/uc?export=view&id=FILE_ID`

## 🎯 Best Practices

- **Always share folders publicly** for catalog images
- **Use consistent naming** for better organization
- **Optimize image sizes** before uploading
- **Test permissions** in incognito mode

## 📞 Support

If issues persist:
1. Check the browser console for specific errors
2. Verify folder sharing settings
3. Ensure API key is valid and has proper permissions
4. Contact support with error details
