import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../Pages/cssfiles/TablesResponsive.css'

const Customers = () => {
  const navigate = useNavigate();

  // סטייטים לניהול מצב המודל
  const [modalType, setModalType] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // רשימת כל הלקוחות
  const [customers, setCustomers] = useState([]);

  // שדות טופס לקוח
  const [name, setName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [vehicleNumber, setvehicleNumber] = useState('');

  // טלפון מפוצל לקידומת וסיומת
  const [phonePrefix, setPhonePrefix] = useState('052');
  const [phoneSuffix, setPhoneSuffix] = useState('');

  // שדה חיפוש
  const [searchQuery, setSearchQuery] = useState('');

  // שליפת לקוחות בעת טעינה ראשונית
  useEffect(() => {
    fetchCustomers();
  }, []);

  // שליפת לקוחות מהשרת
  const fetchCustomers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('❌ שגיאה בשליפת לקוחות:', error.message);
    }
  };

  // פתיחת מודל (edit בלבד)
  const handleShowModal = (type, customer = null) => {
    setModalType(type);
    setSelectedCustomer(customer);

    // אם עריכה - ממלא את השדות הקיימים
    if (type === 'edit' && customer) {
      setName(customer.name);
      setIdNumber(customer.idNumber);

      const fullPhone = customer.phone || '';
      if (fullPhone.length === 10) {
        setPhonePrefix(fullPhone.substring(0, 3));
        setPhoneSuffix(fullPhone.substring(3));
      } else {
        setPhonePrefix('');
        setPhoneSuffix('');
      }

      setEmail(customer.email);
      setvehicleNumber(customer.vehicles?.[0] || '');
    }
  };

  // סגירת המודל ואיפוס
  const handleCloseModal = () => {
    setModalType(null);
    setSelectedCustomer(null);
  };

  // שמירת הלקוח לאחר עריכה
  const handleSave = async () => {
    try {
      // בדיקות תקינות
      const idRegex = /^\d{9}$/;
      const carRegex = /^\d{1,9}$/;
      const nameRegex = /^[\u0590-\u05FFa-zA-Z\s]{2,}$/;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!nameRegex.test(name)) return alert("❌ שם לקוח חייב להכיל לפחות 2 אותיות, ללא מספרים");
      if (!idRegex.test(idNumber)) return alert("❌ תעודת זהות חייבת להכיל בדיוק 9 ספרות");
      if (!carRegex.test(vehicleNumber)) return alert("❌ מספר רכב חייב להכיל עד 9 ספרות בלבד");
      if (email && !emailRegex.test(email)) return alert("❌ כתובת מייל אינה תקינה");

      const fullPhone = phonePrefix + phoneSuffix;
      const phoneRegex = /^05[0-9]{8}$/;
      if (!phoneRegex.test(fullPhone)) return alert("❌ מספר טלפון לא תקין. יש להזין קידומת חוקית ו-7 ספרות.");

      // מבנה הנתונים לשליחה
      const customerData = {
        name,
        idNumber,
        phone: fullPhone,
        email,
        vehicleNumber: [vehicleNumber],
      };

      // אם עריכה - שליחת עדכון לשרת
      if (modalType === "edit" && selectedCustomer) {
        await axios.put(`http://localhost:5000/api/customers/${selectedCustomer._id}`, customerData);
        alert("✅ פרטי הלקוח עודכנו בהצלחה!");
      }

      handleCloseModal();
      fetchCustomers();
    } catch (error) {
      console.error('❌ שגיאה בשמירה:', error.message);
      alert(error.response?.data?.message || '❌ שגיאה בשמירה');
    }
  };

  // חיפוש לקוחות
  const handleSearch = async () => {
    try {
      if (searchQuery.trim() === '') {
        fetchCustomers();
        return;
      }

      const response = await axios.get(`http://localhost:5000/api/customers/search?query=${searchQuery}`);
      setCustomers(response.data);
      handleCloseModal();
    } catch (error) {
      console.error('❌ שגיאה בחיפוש:', error.message);
      alert('❌ שגיאה בחיפוש');
    }
  };

  // הוספת רכב ללקוח
  const handleAddCar = async () => {
    try {
      if (!vehicleNumber || vehicleNumber.length < 5) {
        alert("❌ הזן מספר רכב חוקי");
        return;
      }

      await axios.put(`http://localhost:5000/api/customers/${selectedCustomer._id}/add-car`, {
        vehicleNumber,
      });

      alert("✅ רכב נוסף ללקוח בהצלחה!");
      handleCloseModal();
      fetchCustomers();
    } catch (error) {
      console.error("❌ שגיאה בהוספת רכב:", error);
      const msg = error.response?.data?.message || "❌ שגיאה בהוספת רכב";
      alert(msg);
    }
  };

  // עיצוב טלפון לפורמט ישראלי
  const formatPhone = (phone) => {
    const digits = phone.replace(/\D/g, '');
    return digits.startsWith("0") ? "972" + digits.slice(1) : digits;
  };

  // מחיקת לקוח + רכבים
  const handleDeleteCustomer = async (id) => {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק את הלקוח וכל הרכבים שלו?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/customers/${id}`);
      alert("✅ הלקוח וכל הרכבים שלו נמחקו בהצלחה!");
      fetchCustomers();
    } catch (error) {
      console.error("❌ שגיאה במחיקת לקוח:", error.message);
      alert(error.response?.data?.message || "❌ שגיאה במחיקה");
    }
  };


  const handleValidatedInput = (e) => {
  const input = e.target.value;

  // בדיקה אם זה מספר בלבד
  if (/^\d*$/.test(input)) {
    // הגבלת ת"ז ל־9 ספרות בלבד
    if (input.length <= 9) {
      setSearchQuery(input);
    }
  }
  // בדיקה אם זה תווים בלבד (עברית/אנגלית ורווחים)
  else if (/^[a-zA-Zא-ת\s]*$/.test(input)) {
    setSearchQuery(input);
  }
};


  return (
    <div>
      <div className="text-center">
        <h2 className="me-3">לקוחות</h2>
      </div>

      <div className="d-flex mb-3">

        <button className="btn btn-primary me-3" onClick={() => handleShowModal("searchID")}>
          חיפוש לפי ת"ז או שם
        </button>
      </div>

      {/* ✅ Responsive Wrapper */}
   <div className="table-responsive" dir="rtl">
      <table className="table table-striped table-bordered align-middle">
        <thead>
            <tr>
              <th>#</th>
              <th>שם לקוח</th>
              <th>ת"ז</th>
              <th>מספר טלפון</th>
              <th>מייל</th>
              <th>רכבים</th>
              <th>פעולה</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer, index) => (
              <tr key={customer._id}>
                <td>{index + 1}</td>
                <td>{customer.name || '-'}</td>
                <td>{customer.idNumber || '-'}</td>
                <td>
                  <a
                    href={`https://wa.me/${formatPhone(customer.phone)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {customer.phone}
                  </a>
                </td>
                <td>{customer.email || '-'}</td>
                <td>
                  <span
                    style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                    onClick={() => navigate(`/customer-vehicles/${customer._id}`)}
                  >
                    רכבים
                  </span>
                </td>
                <td>
                  <button className="btn btn-primary btn-sm me-2" onClick={() => handleShowModal("edit", customer)}>
                    עריכה
                  </button>
                  <button className="btn btn-success btn-sm me-2" onClick={() => handleShowModal("addCar", customer)}>
                    הוסף רכב
                  </button>
                  <button 
                    className="btn btn-success btn-sm me-2"
                    onClick={() => handleDeleteCustomer(customer._id)}
                  >
                    מחק
                  </button>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* מודלים */}
      {modalType === "edit" && (
        <Modal isOpen={true} onClose={handleCloseModal} onSave={handleSave}>
          <h3>{modalType === "edit" ? "עריכת לקוח" : "הוספת לקוח ורכב"}</h3>
          <form>
            <div className="form-group mb-3">
              <label>שם לקוח מלא</label>
              <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value.replace(/[^א-תa-zA-Z\s]/g, ''))} required />
            </div>
            <div className="form-group mb-3">
              <label>תעודת זהות</label>
              <input type="text" className="form-control" value={idNumber} onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, ''))} maxLength={9} required />
            </div>
            <div className="form-group mb-3">
              <label>מספר טלפון</label>
              <div className="d-flex gap-2">
                <input type="text" className="form-control" value={phoneSuffix} onChange={(e) => setPhoneSuffix(e.target.value.replace(/\D/g, ''))} maxLength={7} required />
                <select className="form-select" style={{ maxWidth: "100px" }} value={phonePrefix} onChange={(e) => setPhonePrefix(e.target.value)} required>
                  <option value="050">050</option>
                  <option value="052">052</option>
                  <option value="053">053</option>
                  <option value="054">054</option>
                  <option value="055">055</option>
                  <option value="058">058</option>
                </select>
              </div>
            </div>
            <div className="form-group mb-3">
              <label>מייל</label>
              <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </form>
        </Modal>
      )}

      {modalType === "searchID" && (
        <Modal isOpen={true} onClose={handleCloseModal} onSave={handleSearch}>
          <h3>חיפוש לקוח לפי תעודת זהות או שם</h3>
          <div className="form-group mb-3">
            <label>הזן ת"ז / שם</label>
            <input
              type="text"
              className="form-control"
              placeholder="תעודת זהות / שם"
              value={searchQuery}
              onChange={handleValidatedInput}
              required
            />
          </div>
        </Modal>
      )}

      {modalType === "addCar" && selectedCustomer && (
        <Modal isOpen={true} onClose={handleCloseModal} onSave={handleAddCar}>
          <h4>הוספת רכב ללקוח: {selectedCustomer.name}</h4>
          <div className="form-group mb-3">
            <label>מספר רכב חדש</label>
            <input type="text" className="form-control" value={vehicleNumber} onChange={(e) => setvehicleNumber(e.target.value.replace(/\D/g, ""))} maxLength={9} required />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Customers;


