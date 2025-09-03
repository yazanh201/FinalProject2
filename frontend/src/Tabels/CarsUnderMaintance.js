import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import "../Pages/cssfiles/TablesResponsive.css";

// קומפוננטה להצגת רכבים שנמצאים כרגע בטיפול או בתיקון
const CarsInService = () => {
  const [modalType, setModalType] = useState(null); // סוג המודל (כעת רק "edit")
  const [treatments, setTreatments] = useState([]); // רשימת הטיפולים מהרשומות
  const [selectedTreatment, setSelectedTreatment] = useState(null); // הטיפול הנבחר לעריכה

  // ✅ שליפת כל הטיפולים בעת טעינת הקומפוננטה
  useEffect(() => {
    fetch("http://localhost:5000/api/treatments")
      .then(res => res.json())
      .then(data => {
        // דואג שגם אם התשובה אינה מערך עדיין יומר למערך
        const result = Array.isArray(data) ? data : [data];
        setTreatments(result);
      })
      .catch(err => console.error("❌ שגיאה בשליפת טיפולים:", err));
  }, []);

  // פתיחת מודל לעריכת טיפול נבחר
  const handleShowModal = (treatment) => {
    setModalType("edit");
    setSelectedTreatment({
      ...treatment,
      delayReason: treatment.delayReason || "", // סיבת עיכוב אם קיימת
      estimatedReleaseDate: treatment.estimatedReleaseDate || "" // תאריך שחרור אם קיים
    });
  };

  // סגירת המודל ואיפוס
  const handleCloseModal = () => {
    setModalType(null);
    setSelectedTreatment(null);
  };

  // שמירת השינויים בטיפול לשרת
  const handleSave = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/treatments/${selectedTreatment._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          delayReason: selectedTreatment.delayReason,
          estimatedReleaseDate: selectedTreatment.estimatedReleaseDate
        })
      });

      if (!res.ok) throw new Error("❌ שגיאה בשמירה");

      // עדכון המערך המקומי עם הטיפול שעודכן
      setTreatments(prev =>
        prev.map(t => (t._id === selectedTreatment._id ? selectedTreatment : t))
      );

      alert("✅ הנתונים נשמרו בהצלחה!");
      handleCloseModal();
    } catch (err) {
      console.error(err);
      alert("❌ שגיאה בשמירה");
    }
  };

  return (
    <div>
      {/* כותרת */}
      <div className="text-center mb-4">
        <h2 className="me-3">רכבים בטיפול/תיקון</h2>
      </div>

      {/* טבלה רספונסיבית */}
      <div className="table-responsive" dir="rtl">
        <table className="table table-striped table-bordered align-middle">
          <thead>
            <tr>
              <th>מספר רישוי</th>
              <th>סטטוס טיפול</th>
              <th>תאריך כניסה</th>
              <th>סיבת עיכוב</th>
              <th>תאריך משוער לשחרור</th>
              <th>עריכה</th>
            </tr>
          </thead>
          <tbody>
            {/* סינון רק טיפולים שלא הסתיימו */}
            {treatments
              .filter(t => t.status !== "הסתיים")
              .map(treatment => (
                <tr key={treatment._id}>
                  <td>{treatment.carPlate}</td>
                  <td>{treatment.status || "—"}</td>
                  <td>{treatment.date || "—"}</td>
                  <td>{treatment.delayReason || "—"}</td>
                  <td>
                    {treatment.estimatedReleaseDate
                      ? new Date(treatment.estimatedReleaseDate).toLocaleDateString("he-IL")
                      : "—"}
                  </td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleShowModal(treatment)}
                    >
                      ערוך
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* מודל עריכה – מוצג רק אם נבחר טיפול לעריכה */}
      {modalType === "edit" && selectedTreatment && (
        <Modal isOpen={true} onClose={handleCloseModal} onSave={handleSave}>
          <h3>עריכת פרטי רכב בטיפול</h3>

          {/* שדה סיבת עיכוב */}
          <div className="form-group mb-3">
            <label>סיבת עיכוב</label>
            <textarea
              className="form-control"
              value={selectedTreatment.delayReason}
              onChange={(e) =>
                setSelectedTreatment({ ...selectedTreatment, delayReason: e.target.value })
              }
            />
          </div>

          {/* שדה תאריך משוער לשחרור */}
          <div className="form-group mb-3">
            <label>תאריך משוער לשחרור</label>
            <input
              type="date"
              className="form-control"
              value={
                selectedTreatment.estimatedReleaseDate
                  ? new Date(selectedTreatment.estimatedReleaseDate).toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) =>
                setSelectedTreatment({
                  ...selectedTreatment,
                  estimatedReleaseDate: e.target.value
                })
              }
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CarsInService;
