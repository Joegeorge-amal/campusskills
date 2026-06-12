// One-time cleanup utility to remove oversized base64 images from browser storage
// This prevents QuotaExceededError crashes.

export const cleanupBrowserStorage = () => {
  try {
    const checkAndCleanObject = (obj) => {
      let modified = false;
      if (obj.avatarImg && typeof obj.avatarImg === 'string' && obj.avatarImg.startsWith('data:image/')) {
        delete obj.avatarImg;
        modified = true;
      }
      if (obj.bannerImg && typeof obj.bannerImg === 'string' && obj.bannerImg.startsWith('data:image/')) {
        delete obj.bannerImg;
        modified = true;
      }
      return modified;
    };

    // Clean localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      
      if (key === 'cs_user' || key === 'setup_form_data') {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            const parsed = JSON.parse(value);
            if (checkAndCleanObject(parsed)) {
              localStorage.setItem(key, JSON.stringify(parsed));
              console.log(`[Storage Cleanup] Purged base64 images from localStorage key: ${key}`);
            }
          } catch (e) {
            // Not JSON, ignore
          }
        }
      }
    }

    // Clean sessionStorage (just in case)
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (!key) continue;
      
      if (key === 'cs_user' || key === 'setup_form_data') {
        const value = sessionStorage.getItem(key);
        if (value) {
          try {
            const parsed = JSON.parse(value);
            if (checkAndCleanObject(parsed)) {
              sessionStorage.setItem(key, JSON.stringify(parsed));
              console.log(`[Storage Cleanup] Purged base64 images from sessionStorage key: ${key}`);
            }
          } catch (e) {
            // Not JSON, ignore
          }
        }
      }
    }
  } catch (error) {
    console.error("[Storage Cleanup] Failed to run storage cleanup:", error);
  }
};
