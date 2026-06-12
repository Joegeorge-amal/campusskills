import api from './api';

export const imageService = {
  /**
   * Fetch a signed upload signature from our backend
   * @param {string} type - 'avatar' or 'banner'
   */
  getSignature: async (type) => {
    const response = await api.get(`/images/signature?type=${type}`);
    return response.data;
  },

  /**
   * Upload a file directly to Cloudinary using the signature
   * @param {File} file 
   * @param {Object} signatureData 
   * @returns {string} The secure URL of the uploaded image
   */
  uploadToCloudinary: async (file, signatureData) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', signatureData.api_key);
    formData.append('timestamp', signatureData.timestamp);
    formData.append('signature', signatureData.signature);
    formData.append('public_id', signatureData.public_id);
    formData.append('overwrite', 'true');

    const response = await fetch(`https://api.cloudinary.com/v1_1/${signatureData.cloud_name}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image to Cloudinary');
    }

    const data = await response.json();
    return data.secure_url;
  }
};
