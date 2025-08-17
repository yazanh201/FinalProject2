import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

// קומפוננטה להוספת לקוח חדש יחד עם רכבו
const AddCustomerWithCar = () => {
  const navigate = useNavigate();

  // סטייט לניהול טופס הלקוח והרכב
  const [form, setForm] = useState({
    name: "",             // שם הלקוח
    idNumber: "",         // תעודת זהות
    phonePrefix: "050",   // קידומת טלפון (ברירת מחדל)
    phoneNumber: "",      // מספר טלפון (ללא קידומת)
    email: "",            // כתובת מייל
    vehicleNumber: "",    // מספר רכב
  });

  // פונקציה לטיפול בשינויים בשדות הטופס
  const handleChange = (e) => {
    const { name, value } = e.target;

    // ✅ אימותים בזמן הקלדה לכל שדה רלוונטי:
    if (name === "idNumber" && !/^\d{0,9}$/.test(value)) return;         // ת"ז – עד 9 ספרות בלבד
    if (name === "name" && !/^[א-תa-zA-Z\s]*$/.test(value)) return;      // שם – אותיות בעברית/אנגלית ורווחים בלבד
    if (name === "phoneNumber" && !/^\d{0,7}$/.test(value)) return;     // טלפון – עד 7 ספרות בלבד
    if (name === "vehicleNumber" && !/^\d{0,8}$/.test(value)) return;   // מספר רכב – עד 8 ספרות בלבד

    // עדכון סטייט הטופס
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // שליחת הטופס לשרת (API)
  const handleSubmit = async (e) => {
    e.preventDefault(); // מניעת רענון הדף

    // ✅ בדיקות תקינות לפני שליחה
    if (form.name.trim().length < 2) return toast.error("שם לקוח אינו תקין");
    if (form.idNumber.length !== 9) return toast.error("תעודת זהות חייבת להכיל בדיוק 9 ספרות");
    if (form.phoneNumber.length !== 7) return toast.error("מספר טלפון חייב להכיל 7 ספרות");
    if (form.vehicleNumber.length < 5) return toast.error("מספר רכב חייב להכיל לפחות 5 ספרות");

    try {
      // בניית גוף הבקשה
      const payload = {
        name: form.name,
        idNumber: form.idNumber,
        phone: form.phonePrefix + form.phoneNumber, // קידומת + מספר
        email: form.email,
        vehicleNumber: form.vehicleNumber,
      };

      // שליחת בקשת POST לשרת להוספת לקוח
      await axios.post("http://localhost:5000/api/customers", payload);

      // הודעת הצלחה וניווט לעמוד השלמה
      toast.success("הלקוח נשמר בהצלחה!");
      navigate(`/complete-vehicle/${form.vehicleNumber}`);
    } catch (error) {
      // טיפול בשגיאה מהשרת
      console.error("שגיאה:", error);
      const msg = error.response?.data?.message || "ארעה שגיאה בהוספה. ודא שכל הנתונים תקינים.";
      toast.error(msg);
    }
  };

  // JSX להצגת טופס ההוספה
  return (
    <div className="container mt-4" dir="rtl">
      <div className="card shadow p-4">
        <h3 className="text-center mb-4">הוספת לקוח ורכב</h3>

        <form onSubmit={handleSubmit}>
          <div className="row g-3">

            {/* שדה: שם לקוח */}
            <div className="col-md-6">
              <label className="form-label">שם לקוח מלא</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* שדה: תעודת זהות */}
            <div className="col-md-6">
              <label className="form-label">תעודת זהות</label>
              <input
                type="text"
                name="idNumber"
                className="form-control"
                value={form.idNumber}
                onChange={handleChange}
                required
              />
            </div>

            {/* שדה: טלפון (קידומת + מספר) */}
            <div className="col-md-6">
              <label className="form-label">מספר טלפון</label>
              <div className="d-flex">
                <input
                  type="text"
                  name="phoneNumber"
                  className="form-control ms-2"
                  placeholder="7 ספרות"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  required
                />
                <select
                  name="phonePrefix"
                  className="form-select w-auto"
                  value={form.phonePrefix}
                  onChange={handleChange}
                >
                  {/* אפשרויות קידומת */}
                  {["050", "052", "053", "054", "055", "056", "057", "058", "059"].map((prefix) => (
                    <option key={prefix} value={prefix}>{prefix}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* שדה: מייל */}
            <div className="col-md-6">
              <label className="form-label">מייל</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            {/* שדה: מספר רכב */}
            <div className="col-md-6">
              <label className="form-label">מספר רישוי רכב</label>
              <input
                type="text"
                name="vehicleNumber"
                className="form-control"
                value={form.vehicleNumber}
                onChange={handleChange}
                required
              />
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

export default AddCustomerWithCar;