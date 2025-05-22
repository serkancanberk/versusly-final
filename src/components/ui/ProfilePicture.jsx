import React, { useRef } from 'react';

const ProfilePicture = ({ 
  image, 
  size = 'md', 
  editable = false, 
  onFileChange,
  onRemove,
  className = '',
  isLoading = false,
  onEditActivate
}) => {
  const sizes = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-40 h-40'
  };

  const fileInputRef = useRef();

  const getImageSource = () => {
    if (!image) return null;
    if (typeof image === 'string') {
      return image.startsWith('/uploads/')
        ? `http://localhost:8080${image}`
        : image;
    }
    if (image instanceof File) return URL.createObjectURL(image);
    return null;
  };

  const imageSource = getImageSource();

  const handleClick = (e) => {
    if (editable && onEditActivate) {
      onEditActivate();
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  const handleUpdatePhotoClick = (e) => {
    e.stopPropagation();
    if (onEditActivate) {
      onEditActivate();
    }
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        className={`relative ${sizes[size]} ${className} ${editable ? 'cursor-pointer' : ''}`}
        onClick={handleClick}
      >
        <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : imageSource ? (
            <img
              src={imageSource}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-400">Profile Picture</span>
          )}
        </div>
        
        {editable && !isLoading && (
          <>
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200">
              <label 
                className="cursor-pointer text-white text-sm font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                Change Photo
              </label>
            </div>
            
            {imageSource && onRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="absolute bottom-0 right-0 bg-red-500 text-white p-1 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200"
                title="Remove profile picture"
              >
                🗑
              </button>
            )}
          </>
        )}
      </div>
      
      <label 
        onClick={handleUpdatePhotoClick}
        className="mt-2 text-caption text-mutedDark hover:text-secondary hover:underline cursor-pointer transition-colors duration-200"
      >
        Update Your Photo
      </label>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={onFileChange}
      />
    </div>
  );
};

export default ProfilePicture; 