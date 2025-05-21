import React from 'react';

const ProfilePicture = ({ 
  image, 
  size = 'md', 
  editable = false, 
  onFileChange,
  onRemove,
  className = '',
  isLoading = false
}) => {
  const sizes = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-40 h-40'
  };

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

  return (
    <div className={`relative ${sizes[size]} ${className}`}>
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
            <label className="cursor-pointer text-white text-sm font-medium">
              Change Photo
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={onFileChange}
              />
            </label>
          </div>
          
          {imageSource && onRemove && (
            <button
              onClick={onRemove}
              className="absolute bottom-0 right-0 bg-red-500 text-white p-1 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200"
              title="Remove profile picture"
            >
              🗑
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default ProfilePicture; 