import React, { useEffect, useState } from "react";
import Modal from "./Modal";
import "../Pages/cssfiles/TablesResponsive.css";

const Employees = () => {
  const [employees, setEmployees] = useState([]); 
  const [modalType, setModalType] = useState(null); 
  const [selectedEmployee, setSelectedEmployee] = useState({
    idNumber: "",
    fullName: "",
    email: "",
    phone: "",
    role: "employee", // ברירת מחדל תמיד עובד
  });

  // ✅ שליפת משתמשים עם role=employee
  useEffect(() => {
    fetch("http://localhost:5000/api/users")
      .then((res) => res.json())
      .then((data) => {
        const onlyEmployees = data.filter((u) => u.role === "employee");
        setEmployees(onlyEmployees);
      })
      .catch((err) => console.error("❌ שגיאה בשליפת עובדים:", err));
  }, []);

  // ✅ פתיחת מודאל
  const handleShowModal = (type, employee = null) => {
    setModalType(type);
    if (type === "add") {
      setSelectedEmployee({
        idNumber: "",
        fullName: "",
        email: "",
        phone: "",
        role: "employee", // הוספה תמיד תיצור עובד
      });
    } else if (type === "edit" && employee) {
      setSelectedEmployee(employee);
    }
  };

  // ✅ סגירת מודאל
  const handleCloseModal = () => {
    setModalType(null);
    setSelectedEmployee(null);
  };

  // ✅ שמירה – הוספה או עדכון
  const handleSave = async () => {
    if (
      !selectedEmployee.idNumber ||
      !selectedEmployee.fullName ||
      !selectedEmployee.email ||
      !selectedEmployee.phone
    ) {
      alert("❌ יש למלא את כל השדות לפני שמירה");
      return;
    }

    try {
      const method = modalType === "edit" ? "PUT" : "POST";
      const url =
        modalType === "edit"
          ? `http://localhost:5000/api/users/${selectedEmployee._id}`
          : "http://localhost:5000/api/users";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...selectedEmployee, role: "employee" }), // תוודא שתמיד עובד
      });

      const data = await res.json();

      if (modalType === "edit") {
        setEmployees((prev) =>
          prev.map((emp) => (emp._id === data._id ? data : emp))
        );
        alert("✅ עובד עודכן בהצלחה!");
      } else {
        setEmployees((prev) => [data, ...prev]);
        alert("✅ עובד נוסף בהצלחה!");
      }

      handleCloseModal();
    } catch (err) {
      console.error("❌ שגיאה בשמירת עובד:", err);
      alert("❌ שגיאה בשמירת עובד");
    }
  };

  // ✅ מחיקת עובד
  const handleDelete = async (id) => {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק את העובד הזה?")) return;
    try {
      await fetch(`http://localhost:5000/api/users/${id}`, {
        method: "DELETE",
      });
      setEmployees((prev) => prev.filter((emp) => emp._id !== id));
      alert("✅ העובד נמחק בהצלחה!");
    } catch (err) {
      console.error("❌ שגיאה במחיקת עובד:", err);
      alert("❌ שגיאה במחיקת עובד");
    }
  };

  return (
    <div className="container mt-4">
      <div className="text-center mb-4">
        <h2>עובדים</h2>
      </div>


      <div className="responsiveTableContainer">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ת.ז</th>
              <th>שם מלא</th>
              <th>אימייל</th>
              <th>טלפון</th>
              <th>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp._id}>
                <td>{emp.idNumber}</td>
                <td>{emp.fullName}</td>
                <td>{emp.email}</td>
                <td>{emp.phone}</td>
                <td>
                  <button
                    className="btn btn-primary btn-sm me-2"
                    onClick={() => handleShowModal("edit", emp)}
                  >
                    עריכה
                  </button>
                  <button
                    className="btn btn-danger btn-sm me-2"
                    onClick={() => handleDelete(emp._id)}
                  >
                    מחיקה
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(modalType === "add" || modalType === "edit") && selectedEmployee && (
        <Modal isOpen={true} onClose={handleCloseModal} onSave={handleSave}>
          <h3>{modalType === "edit" ? "עריכת עובד" : "הוספת עובד חדש"}</h3>
          <form>
            {/* תעודת זהות */}
            <div className="form-group mb-3">
              <label>תעודת זהות</label>
              <input
                type="text"
                className="form-control"
                value={selectedEmployee.idNumber || ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ""); 
                  setSelectedEmployee({ ...selectedEmployee, idNumber: value });
                }}
                maxLength={9}
                minLength={5}
                inputMode="numeric"
                required
              />
            </div>

            {/* שם מלא */}
            <div className="form-group mb-3">
              <label>שם מלא</label>
              <input
                type="text"
                className="form-control"
                value={selectedEmployee.fullName || ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^א-תa-zA-Z\s]/g, "");
                  setSelectedEmployee({ ...selectedEmployee, fullName: value });
                }}
                required
              />
            </div>

            {/* אימייל */}
            <div className="form-group mb-3">
              <label>אימייל</label>
              <input
                type="email"
                className="form-control"
                value={selectedEmployee.email || ""}
                onChange={(e) =>
                  setSelectedEmployee({ ...selectedEmployee, email: e.target.value })
                }
                required
              />
            </div>

            {/* טלפון */}
            <div className="form-group mb-3">
              <label>טלפון</label>
              <input
                type="text"
                className="form-control"
                value={selectedEmployee.phone || ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setSelectedEmployee({ ...selectedEmployee, phone: value });
                }}
                maxLength={10}
                minLength={7}
                inputMode="numeric"
                required
              />
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};

export default Employees;
