import React, { useEffect, useState } from "react";
import Modal from "./Modal";
import { useNavigate } from "react-router-dom";
import "../Pages/cssfiles/TablesResponsive.css";
import DynamicTable from "./DynamicTable";
import { FaEye, FaFileInvoice } from "react-icons/fa";

const TreatmentsTable = ({
  filterAppointment,
  filterTreatmentNumber,
  onNavigateToRepair,
  onNavigateToAppointment
}) => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  // מצב ניהול מודלים, חיפוש, טיפולים וטיפול נבחר
  const [modalType, setModalType] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [treatments, setTreatments] = useState([]);
  const [selectedTreatment, setSelectedTreatment] = useState({
    date: "",
    cost: "",
    workerId: "",
    typeId: "",
    carPlate: "",
    appointmentNumber: "",
    invoiceId: ""
  });

  // שליפת טיפולים מהשרת לפי סינון (מספר תור או טיפול)
  useEffect(() => {
    let url = "http://localhost:5000/api/treatments";

    if (filterTreatmentNumber) {
      url = `http://localhost:5000/api/treatments/by-id/${filterTreatmentNumber}`;
    } else if (filterAppointment) {
      url = `http://localhost:5000/api/treatments/by-appointment/${filterAppointment}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const result = Array.isArray(data) ? data : [data];
        setTreatments(result);
      })
      .catch((err) => console.error("❌ שגיאה בשליפת טיפולים:", err));
  }, [filterAppointment, filterTreatmentNumber]);

  // פתיחת מודל (עריכה או חיפוש)
  const handleShowModal = (type, treatment = null) => {
    setModalType(type);
    setSearchTerm("");
    if (type === "edit" && treatment) {
      setSelectedTreatment(treatment);
    }
  };

  // סגירת מודל
  const handleCloseModal = () => {
    setModalType(null);
    setSelectedTreatment(null);
    setSearchTerm("");
  };

  // שמירת טיפול (עדכון או יצירה)
  const handleSave = async () => {
    try {
      const method = modalType === "edit" ? "PUT" : "POST";
      const url =
        modalType === "edit"
          ? `http://localhost:5000/api/treatments/${selectedTreatment._id}`
          : "http://localhost:5000/api/treatments";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedTreatment)
      });

      const data = await res.json();

      if (modalType === "edit") {
        // עדכון טיפול קיים
        setTreatments((prev) =>
          prev.map((t) => (t._id === data._id ? data : t))
        );
      } else {
        // הוספת טיפול חדש
        setTreatments((prev) => [data.treatment, ...prev]);
      }

      alert("✅ הטיפול נשמר בהצלחה!");
      handleCloseModal();
    } catch (error) {
      console.error("❌ שגיאה בשמירה:", error);
      alert("❌ שגיאה בשמירה");
    }
  };

  // חיפוש לפי תאריך
  const handleSearchByDate = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/treatments/by-date/${searchTerm}`
      );
      const data = await res.json();
      setTreatments(data);
      handleCloseModal();
    } catch (error) {
      console.error("❌ שגיאה בחיפוש לפי תאריך:", error);
    }
  };

  // חיפוש לפי מספר רכב
  const handleSearchByCar = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/treatments/by-car/${searchTerm}`
      );
      const data = await res.json();
      setTreatments(data);
      handleCloseModal();
    } catch (error) {
      console.error("❌ שגיאה בחיפוש לפי רכב:", error);
    }
  };

  // מחיקת טיפול
  const handleDelete = async (id) => {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק את הטיפול הזה?")) return;
    try {
      await fetch(`http://localhost:5000/api/treatments/${id}`, {
        method: "DELETE",
      });
      setTreatments((prev) => prev.filter((t) => t._id !== id));
      alert("✅ הטיפול נמחק בהצלחה!");
    } catch (err) {
      console.error("❌ שגיאה במחיקת טיפול:", err);
      alert("❌ שגיאה במחיקה");
    }
  };



  return (
    <div>
      <div className="text-center mb-4">
        <h2 className="me-3">טיפולים</h2>
      </div>

      <div className="d-flex mb-3 gap-2">
        <button className="btn btn-primary" onClick={() => handleShowModal("searchDate")}>
          חיפוש לפי תאריך
        </button>
        <button className="btn btn-primary" onClick={() => handleShowModal("searchCar")}>
          חיפוש לפי מספר רכב
        </button>
      </div>

     <div className="table-responsive" dir="rtl">
      <table className="table table-striped table-bordered align-middle">
        <thead>
            <tr>
              <th>מזהה טיפול</th>
              <th>תאריך</th>
              <th>מספר רכב</th>
              <th>שם לקוח</th>
              <th>צפייה</th>
              {role === "admin" && <th>חשבונית</th>}
              <th>עריכה</th>
            </tr>
          </thead>
          <tbody>
            {treatments.map((treatment) => (
              <tr key={treatment._id}>
                <td>{treatment.treatmentId}</td>
                <td>{treatment.date}</td>
                <td>{treatment.carPlate}</td>
                <td>{treatment.customerName || "—"}</td>

                <td>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => navigate(`/treatment/${treatment._id}`)}
                    title="צפייה בפרטי הטיפול"
                  >
                    <FaEye size={18} />
                  </button>
                </td>

                {role === "admin" && (   // ✅ מציג את עמודת החשבונית רק למנהל
                  <td>
                    <button
                      className="btn btn-outline-success btn-sm"
                      onClick={() => navigate(`/invoice/${treatment._id}`)}
                      title="צפייה בחשבונית"
                    >
                      <FaFileInvoice size={18} /> חשבונית
                    </button>
                  </td>
                )}

                <td>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() =>
                      navigate("/create-treatment", {
                        state: {
                          plateNumber: treatment.carPlate,
                          customerName: treatment.customerName,
                          idNumber: treatment.idNumber || "",
                          workerName: treatment.workerName || "",
                          cost: treatment.cost || "",
                          date: treatment.date || "",
                          description: treatment.description || "",
                          status: treatment.status || "",
                          treatmentId: treatment._id || "",
                          repairTypeId: treatment.typeId || "",
                          workerId: treatment.workerId || "",
                          treatmentServices: treatment.treatmentServices || []
                        }
                      })
                    }
                  >
                    עריכה
                  </button>
                  <button
                    className="btn btn-primary btn-sm ms-2 me-2"
                    onClick={() => handleDelete(treatment._id)}
                  >
                    מחיקה
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {modalType === "edit" && (
        <Modal isOpen={true} onClose={handleCloseModal} onSave={handleSave}>
          <h3>{modalType === "edit" ? "עריכת טיפול" : "הוספת טיפול חדש"}</h3>
          <form>
            {[
              { key: "date", label: "תאריך", type: "date" },
              { key: "cost", label: "עלות", type: "number" },
              { key: "workerId", label: "מזהה עובד" },
              { key: "typeId", label: "סוג טיפול" },
              { key: "carPlate", label: "מספר רכב" },
              { key: "invoiceId", label: "מזהה חשבונית" }
            ].map(({ key, label, type = "text" }) => (
              <div className="form-group mb-3" key={key}>
                <label>{label}</label>
                <input
                  type={type}
                  className="form-control"
                  value={selectedTreatment?.[key] || ""}
                  onChange={(e) =>
                    setSelectedTreatment({ ...selectedTreatment, [key]: e.target.value })
                  }
                  required
                />
              </div>
            ))}
          </form>
        </Modal>
      )}

      {modalType === "searchDate" && (
        <Modal isOpen={true} onClose={handleCloseModal} onSave={handleSearchByDate}>
          <h3>חיפוש לפי תאריך</h3>
          <input
            type="date"
            className="form-control"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Modal>
      )}

      {modalType === "searchCar" && (
        <Modal isOpen={true} onClose={handleCloseModal} onSave={handleSearchByCar}>
          <h3>חיפוש לפי מספר רכב</h3>
          <input
            type="text"
            className="form-control"
            placeholder="הזן מספר רכב"
            value={searchTerm}
            inputMode="numeric"
            maxLength={8}
            onChange={(e) => {
              // מסנן תווים לא מספריים ומגביל ל־8 ספרות
              const onlyNumbers = e.target.value.replace(/[^0-9]/g, "");
              if (onlyNumbers.length <= 8) {
                setSearchTerm(onlyNumbers);
              }
            }}
          />
        </Modal>
      )}

    </div>
  );
};

export default TreatmentsTable;
