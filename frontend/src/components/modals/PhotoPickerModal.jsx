import React, { useRef } from 'react';
import ReactDOM from 'react-dom';
import { useAppData } from '../../hooks/useAppData';

const PhotoPickerModal = ({ isOpen, onClose, onPhotoSelect }) => {
  const { triggerToast } = useAppData();
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  if (!isOpen) return null;

  const triggerCamera = () => {
    onClose();
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const triggerGallery = () => {
    onClose();
    if (galleryInputRef.current) {
      galleryInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      onPhotoSelect(ev.target.result);
      triggerToast('Profile photo updated!');
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  return (
    <>
      {ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose}>
          <div className="photo-modal modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="photo-modal-title">Add profile photo</div>
          
          <div className="photo-opt" onClick={triggerCamera}>
            <div className="photo-opt-icon" style={{ background: '#E6F1FB' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#185FA5">
                <path d="M12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7zm7-13h-1.5l-1.7-2H8.2L6.5 2.5H5A3 3 0 0 0 2 5.5v13A3 3 0 0 0 5 21.5h14a3 3 0 0 0 3-3v-13A3 3 0 0 0 19 2.5z"/>
              </svg>
            </div>
            <div>
              <div className="photo-opt-label">Take a photo</div>
              <div className="photo-opt-sub">Use your camera</div>
            </div>
          </div>

          <div className="photo-opt" onClick={triggerGallery}>
            <div className="photo-opt-icon" style={{ background: '#E1F5EE' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#0F6E56">
                <path d="M21 3H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H3V5h18v14zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5z"/>
              </svg>
            </div>
            <div>
              <div className="photo-opt-label">Choose from gallery</div>
              <div className="photo-opt-sub">Pick an existing photo</div>
            </div>
          </div>

          <button className="photo-modal-cancel" onClick={onClose}>Cancel</button>
        </div>
      </div>,
      document.body
      )}

      {/* Hidden file input elements */}
      <input 
        type="file" 
        ref={cameraInputRef} 
        accept="image/*" 
        capture="user" 
        style={{ display: 'none' }} 
        onChange={handleFileChange}
      />
      <input 
        type="file" 
        ref={galleryInputRef} 
        accept="image/*" 
        style={{ display: 'none' }} 
        onChange={handleFileChange}
      />
    </>
  );
};

export default PhotoPickerModal;
