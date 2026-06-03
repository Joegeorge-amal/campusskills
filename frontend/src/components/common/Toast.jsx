import React from 'react';
import { useAppData } from '../../hooks/useAppData';

const Toast = () => {
  const { toastMessage } = useAppData();

  if (!toastMessage) return null;

  return (
    <div className="toast-el">
      {toastMessage}
    </div>
  );
};

export default Toast;
