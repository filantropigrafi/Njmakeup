
import React, { useState } from 'react';
import { Cloud, XCircle, Loader2, ImageOff } from 'lucide-react';
import { listGoogleDriveFiles, getGoogleDriveFileUrl, getAllThumbnailUrls, extractFileId } from '../services/googleDrive';

interface DriveFile {
  id: string;
  name: string;
  mimeType?: string;
  thumbnailLink?: string;
}

interface GoogleDrivePickerProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

const GoogleDrivePicker: React.FC<GoogleDrivePickerProps> = ({ onSelect, onClose }) => {
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [failedThumbnails, setFailedThumbnails] = useState<Set<string>>(new Set());
  const [retryAttempts, setRetryAttempts] = useState<Map<string, number>>(new Map());

  React.useEffect(() => {
    const fetchFiles = async () => {
      const files = await listGoogleDriveFiles();
      if (!files || files.length === 0) {
        setHasError(true);
      } else {
        setDriveFiles(files as DriveFile[]);
        setHasError(false);
      }
      setIsLoading(false);
    };
    fetchFiles();
  }, []);

  const handleSelect = (fileId: string) => {
    const url = getGoogleDriveFileUrl(fileId);
    onSelect(url);
    onClose();
  };

  const handleImageError = (fileId: string) => {
    const currentAttempts = retryAttempts.get(fileId) || 0;
    const maxAttempts = 3;
    
    if (currentAttempts < maxAttempts) {
      // Retry with different URL
      setRetryAttempts(prev => new Map(prev).set(fileId, currentAttempts + 1));
      console.log(`Retrying thumbnail for file: ${fileId} (attempt ${currentAttempts + 1})`);
    } else {
      // Mark as failed after max attempts
      setFailedThumbnails(prev => new Set(prev).add(fileId));
      console.log(`Failed to load thumbnail for file: ${fileId} after ${maxAttempts} attempts`);
    }
  };

  const shouldShowImage = (file: DriveFile) => {
    return !failedThumbnails.has(file.id);
  };

  const isDirectViewerUrl = (url: string) => {
  return url.includes('/file/d/') && url.includes('/view');
};

const getThumbnailUrl = (file: DriveFile, attempt: number = 0) => {
    const urls = getAllThumbnailUrls(file.id);
    return urls[attempt % urls.length];
};

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-zinc-900/90 backdrop-blur-md">
      <div className="bg-white rounded-[3rem] w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-white/10">
        <div className="p-10 border-b border-zinc-50 flex justify-between items-center bg-zinc-50/50">
           <div>
              <h2 className="text-3xl font-serif text-zinc-900">Google Drive Gallery</h2>
              <p className="text-zinc-400 font-medium text-sm">Select an image from your NJ Cloud folder</p>
           </div>
           <button onClick={onClose} className="p-4 bg-white rounded-full text-zinc-300 hover:text-zinc-900 transition-all shadow-lg">
             <XCircle size={24} />
           </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-[#D4AF37] mb-4" size={40} />
              <p className="text-zinc-400 font-medium italic">Fetching cloud assets...</p>
            </div>
          ) : (
            <>
              {hasError && driveFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <ImageOff size={48} className="mx-auto text-zinc-200 mb-4" />
                  <p className="text-zinc-400 font-medium mb-2">
                    Tidak bisa mengakses Google Drive atau folder kosong.
                  </p>
                  <p className="text-[11px] text-zinc-300 max-w-md mb-4">
                    Pastikan folder Google Drive sudah di-share dengan "Anyone with the link can view".
                    Jika gambar tidak muncul, coba refresh atau periksa izin akses folder.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => {
                        setHasError(false);
                        setFailedThumbnails(new Set());
                        setRetryAttempts(new Map());
                        const fetchFiles = async () => {
                          setIsLoading(true);
                          const files = await listGoogleDriveFiles();
                          if (!files || files.length === 0) {
                            setHasError(true);
                          } else {
                            setDriveFiles(files as DriveFile[]);
                            setHasError(false);
                          }
                          setIsLoading(false);
                        };
                        fetchFiles();
                      }}
                      className="px-4 py-2 bg-[#D4AF37] text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-zinc-900 transition-all"
                    >
                      Retry
                    </button>
                    <button
                      onClick={() => {
                        console.log('Debug info:', {
                          apiKey: import.meta.env.VITE_GOOGLE_DRIVE_API_KEY ? 'Set' : 'Not set',
                          folderId: import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID ? 'Set' : 'Not set',
                          filesFound: driveFiles.length
                        });
                      }}
                      className="px-4 py-2 bg-zinc-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 transition-all"
                    >
                      Debug
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                  {driveFiles.map((file) => (
                    <div 
                      key={file.id} 
                      onClick={() => handleSelect(file.id)}
                      className="group cursor-pointer bg-zinc-50 rounded-3xl overflow-hidden border border-zinc-100 hover:border-[#D4AF37] transition-all relative"
                    >
                       <div className="aspect-square bg-zinc-100 flex items-center justify-center overflow-hidden relative">
                          {shouldShowImage(file) ? (
                            <img 
                              key={`${file.id}-${retryAttempts.get(file.id) || 0}`}
                              src={getThumbnailUrl(file, retryAttempts.get(file.id) || 0)} 
                              alt={file.name} 
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                              onError={() => handleImageError(file.id)}
                            />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                              <Cloud className="text-zinc-300 mb-2" size={32} />
                              <p className="text-[8px] text-zinc-400 font-medium line-clamp-2">{file.name}</p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(`https://drive.google.com/file/d/${file.id}/view`, '_blank');
                                }}
                                className="mt-2 px-2 py-1 bg-[#D4AF37] text-white rounded text-[8px] font-black uppercase tracking-widest hover:bg-zinc-900 transition-all"
                              >
                                Open
                              </button>
                            </div>
                          )}
                       </div>
                       <div className="p-4">
                          <p className="text-[10px] font-bold text-zinc-600 truncate">{file.name}</p>
                       </div>
                       <div className="absolute inset-0 bg-[#D4AF37]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="px-4 py-2 bg-white rounded-full text-[10px] font-black uppercase tracking-widest text-[#D4AF37] shadow-xl">Select File</div>
                       </div>
                    </div>
                  ))}
                  {driveFiles.length === 0 && !hasError && (
                    <div className="col-span-full text-center py-20 border-2 border-dashed border-zinc-100 rounded-3xl">
                      <Cloud size={48} className="mx-auto text-zinc-200 mb-4" />
                      <p className="text-zinc-400 font-medium">No files found in the linked folder.</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleDrivePicker;
