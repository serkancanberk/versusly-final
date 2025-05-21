import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Alert from './ui/Alert';
import ProfilePicture from './ui/ProfilePicture';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nickname: '',
    bio: '',
    profilePicture: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [initialData, setInitialData] = useState(null);
  const [highlightedFields, setHighlightedFields] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);

  const editFormRef = useRef(null);
  const alertTimeoutRef = useRef(null);

  // Clear alert timeout on unmount
  useEffect(() => {
    return () => {
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
    };
  }, []);

  // Auto-dismiss alerts after 5 seconds
  const showAlert = (type, message) => {
    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current);
    }
    
    if (type === 'error') {
      setError(message);
      setSuccess(null);
    } else {
      setSuccess(message);
      setError(null);
    }

    alertTimeoutRef.current = setTimeout(() => {
      if (type === 'error') {
        setError(null);
      } else {
        setSuccess(null);
      }
    }, 5000);
  };

  // Fetch user profile data on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get('/api/user/profile', {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch profile');
      }

      const userData = response.data.data;
      const newFormData = {
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        nickname: userData.nickname || '',
        bio: userData.bio || '',
        profilePicture: userData.profilePicture || null
      };
      
      setFormData(newFormData);
      setInitialData(newFormData);

    } catch (err) {
      console.error('Error fetching profile:', err);
      showAlert('error', 
        err.response?.data?.message || 
        'Failed to load profile data. Please try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
      
      // Update form data and selected file info
      setFormData(prev => ({
        ...prev,
        profilePicture: file
      }));
      setSelectedFile({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) // Convert to MB
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          submitData.append(key, formData[key]);
        }
      });

      const response = await axios.patch('/api/user/profile', submitData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        }
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to update profile');
      }

      // Update form data with response
      const updatedData = response.data.data;
      setFormData(prev => ({
        ...prev,
        firstName: updatedData.firstName || '',
        lastName: updatedData.lastName || '',
        nickname: updatedData.nickname || '',
        bio: updatedData.bio || '',
        profilePicture: updatedData.profilePicture || null
      }));
      setInitialData(updatedData);

      // Highlight updated fields
      const updatedFields = {};
      Object.keys(updatedData).forEach(key => {
        if (updatedData[key] !== initialData[key]) {
          updatedFields[key] = true;
        }
      });
      setHighlightedFields(updatedFields);
      setTimeout(() => setHighlightedFields({}), 2000);

      // Clear preview image and selected file
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
        setPreviewImage(null);
      }
      setSelectedFile(null);

      showAlert('success', 'Profile updated successfully!');
      setIsEditing(false);
      
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error updating profile:', err);
      
      if (err.response?.status === 413) {
        showAlert('error', 'Your file is too large. Please upload a file under 5MB.');
      } else if (err.response?.data?.error) {
        showAlert('error', err.response.data.error);
      } else {
        showAlert('error', 'Failed to update profile. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    // Scroll to edit form after a short delay to ensure it's rendered
    setTimeout(() => {
      editFormRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleCancel = () => {
    const isDirty = Object.keys(formData).some(key => formData[key] !== initialData[key]);
    
    if (isDirty) {
      const confirmDiscard = window.confirm("You have unsaved changes. Discard them?");
      if (!confirmDiscard) return;
    }
    
    // Reset form data to initial state
    setFormData(initialData);
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
      setPreviewImage(null);
    }
    setSelectedFile(null);
    setIsEditing(false);
  };

  const getFieldClassName = (fieldName) => {
    const baseClasses = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent";
    const highlightClasses = highlightedFields[fieldName] ? "bg-green-50 transition-colors duration-1000" : "";
    return `${baseClasses} ${highlightClasses}`;
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Alert Messages */}
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {success && (
        <Alert
          type="success"
          message={success}
          onClose={() => setSuccess(null)}
        />
      )}

      {/* Profile Header Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
          <button
            onClick={handleEditClick}
            className="px-4 py-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
          >
            Edit Profile
          </button>
        </div>
        
        <div className="flex items-start space-x-6">
          <div className="flex flex-col items-center space-y-2">
            <ProfilePicture
              image={previewImage || formData.profilePicture}
              size="lg"
              editable={isEditing}
              onFileChange={handleFileChange}
              isLoading={isSubmitting}
            />
            {selectedFile && (
              <div className="text-sm text-gray-600">
                Selected: {selectedFile.name} ({selectedFile.size}MB)
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {formData.firstName} {formData.lastName}
                </h2>
                <p className="text-gray-600">@{formData.nickname}</p>
              </div>
              <p className="text-gray-700">{formData.bio}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form Section */}
      <div ref={editFormRef} className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Edit Profile</h2>
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={getFieldClassName('firstName')}
                  required
                />
              ) : (
                <div className="px-3 py-2 text-gray-900">{formData.firstName || 'Not set'}</div>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={getFieldClassName('lastName')}
                  required
                />
              ) : (
                <div className="px-3 py-2 text-gray-900">{formData.lastName || 'Not set'}</div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
              Nickname
            </label>
            {isEditing ? (
              <input
                type="text"
                id="nickname"
                name="nickname"
                value={formData.nickname}
                onChange={handleInputChange}
                className={getFieldClassName('nickname')}
                required
              />
            ) : (
              <div className="px-3 py-2 text-gray-900">@{formData.nickname || 'Not set'}</div>
            )}
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            {isEditing ? (
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows="4"
                className={getFieldClassName('bio')}
              />
            ) : (
              <div className="px-3 py-2 text-gray-900">{formData.bio || 'No bio provided'}</div>
            )}
          </div>

          {isEditing && (
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 bg-primary text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors ${
                  isSubmitting 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-primary-dark'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;
