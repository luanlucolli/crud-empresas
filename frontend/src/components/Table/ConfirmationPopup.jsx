import React, { useState } from "react";
import "./confirmationpopup.css";

const ConfirmationPopup = ({ open, title, message, onConfirm, onCancel }) => {
  if (!open) return null;

  const [isFadingOut, setFadingOut] = useState(false);

  const handleClosePopup = () => {
    setFadingOut(true); 
    setTimeout(() => {
      onCancel(); 
    }, 10); 
  };
  

  return (
    <div className={`popup-overlay ${isFadingOut ? "fade-out" : ""}`}>
      <div className={`popup-box ${isFadingOut ? "fade-out" : ""}`}>
        <div className="popup-header">
          <h2>{title}</h2>
        </div>
        <div className="popup-body">
          <p>{message}</p>
        </div>
        <div className="popup-footer">
          <button className="cancel-button" onClick={handleClosePopup}>
            Cancelar
          </button>
          <button className="confirm-button" onClick={onConfirm}>
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPopup;
