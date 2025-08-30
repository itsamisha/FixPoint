import React from 'react';
import { Upload } from "lucide-react";

const ImageUploader = ({ 
  selectedImage, 
  imagePreview, 
  handleImageSelect 
}) => {
  return (
    <div className="form-group">
      <label className="form-label">Upload Image</label>
      <div className="form-help mb-3">
        Add a photo to help illustrate the issue (optional)
      </div>
      
      <div className="image-upload-container">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="image-input"
          id="image-upload"
        />
        <label htmlFor="image-upload" className="image-upload-label">
          <div className="image-upload-content">
            {imagePreview ? (
              <div className="image-preview-container">
                <img src={imagePreview} alt="Preview" className="image-preview" />
                <div className="image-overlay">
                  <Upload size={24} />
                  <span>Change Image</span>
                </div>
              </div>
            ) : (
              <div className="image-upload-placeholder">
                <Upload size={48} className="upload-icon" />
                <div className="upload-text">
                  <span className="upload-title">Click to upload image</span>
                  <span className="upload-subtitle">or drag and drop</span>
                </div>
              </div>
            )}
          </div>
        </label>
      </div>
    </div>
  );
};

export default ImageUploader;
