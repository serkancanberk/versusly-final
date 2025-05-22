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
  const [editingField, setEditingField] = useState(null);
  const [showProfilePictureInput, setShowProfilePictureInput] = useState(false);

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
      // Revoke previous preview URL if it exists
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
      
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

  const handleFieldClick = (fieldName) => {
    if (!isEditing) {
      setIsEditing(true);
    }
    setEditingField(fieldName);
    
    if (fieldName === 'profilePicture') {
      setShowProfilePictureInput(true);
    }
  };

  const handleFieldBlur = () => {
    setEditingField(null);
    if (editingField === 'profilePicture') {
      setShowProfilePictureInput(false);
    }
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
    setEditingField(null);
    setShowProfilePictureInput(false);
  };

  const getFieldClassName = (fieldName) => {
    const baseClasses = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent";
    const highlightClasses = highlightedFields[fieldName] ? "bg-green-50 transition-colors duration-1000" : "";
    return `${baseClasses} ${highlightClasses}`;
  };


  const EditableField = ({ fieldName, label, type = "text", value = "", isEditing, isActive, onBlur }) => {
    const isTextArea = type === "textarea";
    const displayValue = fieldName === "nickname" ? `@${value || 'Not set'}` : (value || 'Not set');

    return (
      <div className="space-y-1">
        <label htmlFor={fieldName} className="block text-caption text-mutedDark mb-1">
          {label}
        </label>
        {isEditing && isActive ? (
          isTextArea ? (
            <textarea
              id={fieldName}
              name={fieldName}
              value={value || ""}
              onChange={handleInputChange}
              onBlur={onBlur}
              rows="3"
              className={getFieldClassName(fieldName)}
              required
              autoFocus
            />
          ) : (
            <input
              type={type}
              id={fieldName}
              name={fieldName}
              value={value || ""}
              onChange={handleInputChange}
              onBlur={onBlur}
              className={getFieldClassName(fieldName)}
              required
              autoFocus
            />
          )
        ) : (
          <div
            onClick={() => handleFieldClick(fieldName)}
            className="px-3 py-2 text-secondary/80 hover:text-secondary hover:underline hover:cursor-pointer transition-all duration-200 flex items-center gap-2 group"
          >
            {displayValue}
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">✏️</span>
          </div>
        )}
      </div>
    );
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
    <>
      {/* Profile Header Section */}
      <section className="bg-muted25 bg-[radial-gradient(circle,_#E0E2DB_1px,_transparent_1px)] bg-[length:12px_12px] pt-20 pb-4 border-b border-muted">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <h1 className="text-subheading text-secondary flex items-center gap-2">
            🥷 Your Profile
          </h1>
          <p className="text-label text-secondary opacity-50">
            View and edit your public information
          </p>
          <button
            onClick={() => window.location.href = "/"}
            className="mt-4 text-label text-accent underline hover:opacity-80 transition-opacity"
          >
            ← Back to main feed
          </button>
        </div>
      </section>

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

      {/* Edit Form Section */}
      <section className="max-w-4xl mx-auto px-4 md:px-6">
        <div ref={editFormRef} className="bg-white rounded-lg shadow-md p-6 mb-8 mt-8">
          <h3 className="text-body font-semibold text-secondary mb-6">
            {isEditing ? 'Editing your profile' : 'Tap a field to update your info'}
          </h3>

          <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center space-y-2 mb-6">
              <div 
                onClick={() => isEditing && handleFieldClick('profilePicture')}
                className={`relative cursor-pointer transition-transform duration-200 ${isEditing ? 'hover:scale-105' : ''}`}
              >
                <ProfilePicture
                  image={previewImage || formData.profilePicture}
                  size="lg"
                  editable={isEditing && showProfilePictureInput}
                  onFileChange={handleFileChange}
                  isLoading={isSubmitting}
                  onEditActivate={() => {
                    // Only trigger handleFieldClick and setShowProfilePictureInput.
                    handleFieldClick('profilePicture');
                    setShowProfilePictureInput(true);
                    // Do NOT trigger the file input directly here to avoid double file picker.
                  }}
                />
                {isEditing && !showProfilePictureInput && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                    <span className="text-white text-sm font-medium">Click to change photo</span>
                  </div>
                )}
              </div>
              {selectedFile && (
                <div className="text-sm text-gray-600">
                  Selected: {selectedFile.name} ({selectedFile.size}MB)
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <EditableField
                fieldName="firstName"
                label="First Name"
                value={formData.firstName}
                isEditing={isEditing}
                isActive={editingField === 'firstName'}
                onBlur={handleFieldBlur}
              />

              <EditableField
                fieldName="lastName"
                label="Last Name"
                value={formData.lastName}
                isEditing={isEditing}
                isActive={editingField === 'lastName'}
                onBlur={handleFieldBlur}
              />
            </div>

            <EditableField
              fieldName="nickname"
              label="Nickname"
              value={formData.nickname}
              isEditing={isEditing}
              isActive={editingField === 'nickname'}
              onBlur={handleFieldBlur}
            />

            <EditableField
              fieldName="bio"
              label="Bio"
              value={formData.bio}
              isEditing={isEditing}
              isActive={editingField === 'bio'}
              onBlur={handleFieldBlur}
            />

            {isEditing && (
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="text-caption text-mutedDark hover:text-alert"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-3 rounded-2xl bg-black text-white text-label hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
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
      </section>
    </>
  );
};

export default Profile;
