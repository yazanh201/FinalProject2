import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// קומפוננטה ליצירת או עריכת תור
const CreateAppointment = () => {
  const navigate = useNavigate();          // מאפשר ניווט בין דפים
  const location = useLocation();          // קבלת מידע שהועבר דרך הניווט
  const { id } = useParams();              // קבלת מזהה תור מה-URL אם קיים

  // סטייטים לניהול זמני תורים והצעות לקוח
  const [availableTimes, setAvailableTimes] = useState([]); // שעות פנויות בתאריך מסוים
  const [suggestions, setSuggestions] = useState([]);        // הצעות ללקוח בזמן הקלדה
  const [typingTimeout, setTypingTimeout] = useState(null);  // טיימר לדיליי בהשלמה אוטומטית

  // סטייט לטופס קביעת תור
  const [form, setForm] = useState({
    date: '',
    time: '',
    description: '',
    idNumber: '',
    name: '',
    email: '',
    phonePrefix: '050',
    phoneNumber: '',
    carNumber: '',
  });

  // useEffect - בעת טעינת הדף או שינוי ב־location / id
  useEffect(() => {
    if (location.state) {
      // אם הגיע עם state (לדוגמה דרך ניווט) – נשתמש בנתונים
      const data = location.state;
      setForm({
        date: data.date || '',
        time: data.time || '',
        description: data.description || '',
        idNumber: data.idNumber || '',
        name: data.name || '',
        email: data.email || '', // ✅ נוספה שליפת אימייל
        phonePrefix: data.phoneNumber ? data.phoneNumber.substring(0, 3) : '050',
        phoneNumber: data.phoneNumber ? data.phoneNumber.substring(3) : '',
        carNumber: data.carNumber || ''
      });
      fetchAvailableTimes(data.date); // שליפת שעות לתאריך
    } else if (id) {
      // אם הגענו עם מזהה תור – נטען מהשרת
      fetch(`http://localhost:5000/api/appointments/by-number/${id}`)
        .then(res => res.json())
        .then(data => {
          setForm({
            date: data.date || '',
            time: data.time || '',
            description: data.description || '',
            idNumber: data.idNumber || '',
            name: data.name || '',
            email: data.email || '', // ✅ נוספה שליפת אימייל מה־DB
            phonePrefix: data.phoneNumber ? data.phoneNumber.substring(0, 3) : '050',
            phoneNumber: data.phoneNumber ? data.phoneNumber.substring(3) : '',
            carNumber: data.carNumber || ''
          });
          fetchAvailableTimes(data.date);
        })
        .catch(err => console.error('❌ שגיאה בטעינת נתוני עריכה:', err));
    }
  }, [location.state, id]);

  // שליפת שעות פנויות לתאריך מסוים
  // שליפת שעות פנויות לתאריך מסוים
const fetchAvailableTimes = async (date) => {
    if (!date) return;
    try {
      const res = await fetch(`http://localhost:5000/api/appointments/available-times/${date}`);
      const data = await res.json();

      let times = data;

      // ✅ סינון שעות עבר אם מדובר בתאריך של היום
      const today = new Date().toISOString().split("T")[0];
      if (date === today) {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinutes = now.getMinutes();

        times = times.filter((time) => {
          const [h, m] = time.split(":").map(Number);
          return h > currentHour || (h === currentHour && m > currentMinutes);
        });
      }

      // שמירה של השעה הקיימת אם בעריכה
      const finalTimes =
        times.includes(form.time) || !form.time ? times : [...times, form.time];

      setAvailableTimes(finalTimes);
    } catch (error) {
      console.error("❌ שגיאה בשליפת שעות פנויות:", error);
    }
  };


  // שינוי בשדות הטופס
  const handleChange = (e) => {
    const { name, value } = e.target;

    // אם מדובר על תאריך – נבדוק שהוא לא תאריך עבר
    if (name === 'date') {
      const today = new Date().toISOString().slice(0, 10);
      if (value < today) {
        toast.error('❌ לא ניתן לבחור תאריך שכבר עבר!');
        return;
      }
      fetchAvailableTimes(value);
    }

    // ולידציות:
    if (name === 'idNumber' && !/^\d{0,9}$/.test(value)) return; // ת"ז עד 9 ספרות
    if (name === 'name') {
      if (!/^[א-תa-zA-Z\s]*$/.test(value)) return; // שם בעברית/אנגלית בלבד
      fetchCustomerSuggestions(value); // הצעות ללקוח
    }

    if (name === 'phoneNumber' && !/^\d{0,7}$/.test(value)) return; // טלפון - 7 ספרות
    if (name === 'carNumber' && !/^\d{0,8}$/.test(value)) return;   // רכב - עד 8 ספרות

    setForm((prev) => ({ ...prev, [name]: value })); // עדכון טופס
  };

  // שליחת טופס – שמירה או עדכון תור
  const handleSubmit = async (e) => {
    e.preventDefault();

    // בדיקות תקינות
    if (form.idNumber.length !== 9) {
      toast.error(' תעודת זהות חייבת להכיל בדיוק 9 ספרות');
      return;
    }
    if (!/^[א-תa-zA-Z\s]+$/.test(form.name)) {
      toast.error(' שם הלקוח חייב להכיל אותיות בלבד');
      return;
    }
    if (!/^\d{7}$/.test(form.phoneNumber)) {
      toast.error(' מספר הטלפון חייב להכיל 7 ספרות');
      return;
    }
    if (!/^\d{1,8}$/.test(form.carNumber)) {
      toast.error(' מספר רכב חייב להכיל עד 8 ספרות');
      return;
    }

    // הרכבת מספר טלפון מלא והכנת payload
    const fullPhone = form.phonePrefix + form.phoneNumber;
    const payload = { ...form, phoneNumber: fullPhone };

    try {
      const isEdit = location.state?._id || id; // האם מדובר על עריכה
      const url = isEdit
        ? `http://localhost:5000/api/appointments/${location.state?._id || id}`
        : 'http://localhost:5000/api/appointments';
      const method = isEdit ? 'PUT' : 'POST';

      // שליחה לשרת
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'שגיאה בשמירה');

      toast.success(` התור ${isEdit ? 'עודכן' : 'נשמר'} בהצלחה!`);

      // איפוס טופס לאחר הצלחה
      setForm({
        date: '',
        time: '',
        description: '',
        idNumber: '',
        name: '',
        email: '', // ✅ נוספה איפוס אימייל
        phonePrefix: '050',
        phoneNumber: '',
        carNumber: '',
      });

      navigate('/Dashboard'); // מעבר ללוח הבקרה
    } catch (error) {
      console.error(error);
      toast.error(` שגיאה: ${error.message}`);
    }
  };

  // שליפת הצעות ללקוחות בזמן הקלדת שם
  const fetchCustomerSuggestions = (value) => {
    if (value.length < 2) {
      setSuggestions([]); // אם ההקלדה קצרה מדי – ננקה
      return;
    }

    if (typingTimeout) clearTimeout(typingTimeout); // מניעת קריאה כפולה
    setTypingTimeout(
      setTimeout(async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/customers/search?query=${value}`);
          const data = await res.json();
          setSuggestions(data); // עדכון הצעות
        } catch (error) {
          console.error('שגיאה בחיפוש לקוחות:', error);
        }
      }, 300) // דיליי למניעת עומס
    );
  };


  return (
    <div className="container mt-5" dir="rtl">
      <div className="card shadow p-4 position-relative">
        <h3 className="text-center mb-4">
          {location.state || id ? "עריכת תור" : "קביעת תור חדש"}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="row g-4">

            {/* 🟢 צד ימין: שם ותעודת זהות בראש */}
            <div className="col-md-6 position-relative">
              <label className="form-label">שם לקוח</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={form.name}
                onChange={handleChange}
                autoComplete="off"
                required
              />

              {suggestions.length > 0 && (
                <ul className="list-group position-absolute z-3 w-100" style={{ maxHeight: 200, overflowY: "auto" }}>
                  {suggestions.map((s) => (
                    <li key={s._id} className="list-group-item">
                      <div><strong>{s.name}</strong> – ת"ז: {s.idNumber}</div>
                      <div>{s.phone}</div>
                      <div>
                        רכבים:
                        {s.vehicles && s.vehicles.length > 0 ? (
                          <ul className="list-unstyled ms-3 mt-1">
                            {s.vehicles.map((car, idx) => (
                              <li key={idx}>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary me-2 my-1"
                                  onClick={() => {
                                    setForm((prev) => ({
                                      ...prev,
                                      name: s.name,
                                      idNumber: s.idNumber,
                                      phoneNumber: s.phone?.substring(3) || "",
                                      phonePrefix: s.phone?.substring(0, 3) || "050",
                                      carNumber: car,
                                      email: s.email || "",
                                    }));
                                    setSuggestions([]);
                                  }}
                                >
                                  {car}
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-muted">אין רכבים</div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/* תעודת זהות מתחת לשם */}
              <label className="form-label mt-3">תעודת זהות</label>
              <input
                type="text"
                name="idNumber"
                className="form-control"
                value={form.idNumber}
                onChange={handleChange}
                required
              />

              <label className="form-label mt-3">טלפון</label>
              <div className="d-flex">
                <select name="phonePrefix" className="form-select w-auto" value={form.phonePrefix} onChange={handleChange}>
                  {["050", "052", "053", "054", "055", "056", "057", "058", "059"].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <input
                  type="text"
                  name="phoneNumber"
                  className="form-control ms-2"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  required
                  placeholder="7 ספרות"
                />
              </div>

              <label className="form-label mt-3">מספר רישוי</label>
              <input type="text" name="carNumber" className="form-control" value={form.carNumber} onChange={handleChange} required />
            </div>

            <div className="col-md-6">
              <label className="form-label">תאריך</label>
              <input type="date" name="date" className="form-control" value={form.date} onChange={handleChange} required />

              <label className="form-label mt-3">שעה</label>
              <select name="time" className="form-control" value={form.time} onChange={handleChange}>
                <option value="">בחר שעה</option>
                {availableTimes.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>

              <label className="form-label mt-3">תיאור</label>
              <textarea name="description" className="form-control" rows="3" value={form.description} onChange={handleChange}></textarea>
            </div>

            <div className="col-12 text-center mt-4">
              <button type="submit" className="btn btn-success mx-2 px-4">
                {location.state || id ? "עדכן" : "שמור "}
              </button>
              <button type="button" className="btn btn-secondary mx-2 px-4" onClick={() => navigate('/Dashboard')}>
                ביטול
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );



};

export default CreateAppointment;
