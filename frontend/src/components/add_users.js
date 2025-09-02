import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const AddUser = () => {
  const [form, setForm] = useState({
    idNumber: "",
    fullName: "",
    phone: "",
    email: "",
    username: "",
    password: "",
    role: "employee",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // ✅ ולידציה בזמן הקלדה
    if (name === "idNumber" && !/^\d{0,9}$/.test(value)) return; // בדיוק עד 9 ספרות
    if (name === "phone" && !/^\d{0,10}$/.test(value)) return;   // בדיוק עד 10 ספרות
    if (name === "fullName" && !/^[א-תa-zA-Z\s]*$/.test(value)) return; // רק אותיות ורווחים

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ בדיקות קשיחות לפני שליחה
    if (form.idNumber.length !== 9)
      return toast.error("תעודת זהות חייבת להכיל בדיוק 9 ספרות");
    if (form.fullName.trim().length < 2)
      return toast.error("שם מלא חייב להכיל לפחות 2 תווים");
    if (form.phone.length !== 10)
      return toast.error("מספר טלפון חייב להכיל בדיוק 10 ספרות");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return toast.error("האימייל אינו תקין");
    if (form.password.length < 6)
      return toast.error("סיסמה חייבת להכיל לפחות 6 תווים");

    try {
      await axios.post("http://localhost:5000/api/users", form, {
        headers: { "Content-Type": "application/json" },
      });

      toast.success("✅ משתמש נוסף בהצלחה!");

      // איפוס הטופס
      setForm({
        idNumber: "",
        fullName: "",
        phone: "",
        email: "",
        username: "",
        password: "",
        role: "employee",
      });
    } catch (error) {
      console.error("❌ שגיאה:", error);
      const msg = error.response?.data?.message || "שגיאה בהוספת המשתמש";
      toast.error(msg);
    }
  };

  return (
    <div className="container mt-4" dir="rtl">
      <div className="card shadow p-4">
        <h3 className="text-center mb-4">הוספת משתמש חדש</h3>

        <form onSubmit={handleSubmit}>
          <div className="row g-3">

            {/* תעודת זהות */}
            <div className="col-md-6">
              <label className="form-label">תעודת זהות (9 ספרות)</label>
              <input
                type="text"
                name="idNumber"
                className="form-control"
                value={form.idNumber}
                onChange={handleChange}
                required
              />
            </div>

            {/* שם מלא */}
            <div className="col-md-6">
              <label className="form-label">שם מלא</label>
              <input
                type="text"
                name="fullName"
                className="form-control"
                value={form.fullName}
                onChange={handleChange}
                required
              />
            </div>

            {/* טלפון */}
            <div className="col-md-6">
              <label className="form-label">טלפון (10 ספרות)</label>
              <input
                type="text"
                name="phone"
                className="form-control"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>

            {/* אימייל */}
            <div className="col-md-6">
              <label className="form-label">אימייל</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* שם משתמש */}
            <div className="col-md-6">
              <label className="form-label">שם משתמש</label>
              <input
                type="text"
                name="username"
                className="form-control"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>

            {/* סיסמה */}
            <div className="col-md-6">
              <label className="form-label">סיסמה (לפחות 6 תווים)</label>
              <input
                type="password"
                name="password"
                className="form-control"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* תפקיד */}
            <div className="col-md-6">
              <label className="form-label">תפקיד במערכת</label>
              <select
                name="role"
                className="form-select"
                value={form.role}
                onChange={handleChange}
              >
                <option value="admin">מנהל</option>
                <option value="employee">עובד</option>
              </select>
            </div>

            {/* כפתור שמירה */}
            <div className="col-12 text-center mt-3">
              <button type="submit" className="btn btn-primary px-5">
                שמירה
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;
