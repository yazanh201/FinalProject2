import React from "react";
import "./Modal.css"; // ייבוא קובץ העיצוב עבור רכיב ה-Modal

/**
 * רכיב Modal (חלון קופץ)
 * 
 * @param {boolean} isOpen - מציין האם המודל פתוח (true) או סגור (false).
 * @param {function} onClose - פונקציה לסגירת המודל.
 * @param {function} onSave - פונקציה לשמירת הנתונים.
 * @param {React.ReactNode} children - תוכן דינמי שיוצג בתוך המודל.
 * 
 * @returns רכיב חלון קופץ, או null אם המודל סגור.
 */
const Modal = ({ isOpen, onClose, onSave, children }) => {
  // אם המודל סגור (isOpen=false), אל תציג את המודל
  if (!isOpen) return null;

  // אם המודל פתוח (isOpen=true), מציג את המודל
  return (
    <div className="modal-overlay">
      {/* תוכן המודל */}
      <div className="modal-content">
        {/* התוכן הדינמי שמועבר דרך ה-children */}
        {children}

        {/* אזור הכפתורים של המודל */}
        <div className="modal-buttons">
          {/* כפתור לסגירת המודל */}
          <button onClick={onClose} className="btn btn-secondary">
            ביטול
          </button>

          {/* כפתור לשמירת הנתונים */}
          <button onClick={onSave} className="btn btn-primary">
            אישור
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
