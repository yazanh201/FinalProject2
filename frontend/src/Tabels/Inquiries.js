import React, { useState, useEffect } from "react";
import Modal from "./Modal";

const Inquiries = () => {
  // משתנים לניהול מצב המודאלים, החיפוש, הסינון והפנייה שנבחרה
  const [modalType, setModalType] = useState(null);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);
  const [filterDate, setFilterDate] = useState('');

  // פנייה חדשה (שמור לעתיד - כרגע לא בשימוש)
  const [newInquiry, setNewInquiry] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    status: "פתוחה",
  });

  // כל הפניות ממסד הנתונים
  const [inquiries, setInquiries] = useState([]);

  // שליפת כל הפניות מהשרת עם טעינת הקומפוננטה
  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/inquiries");
        const data = await res.json();
        setInquiries(data);
      } catch (err) {
        console.error("שגיאה בשליפת פניות:", err);
      }
    };
    fetchInquiries();
  }, []);

  // פתיחת מודאל (חיפוש או עריכה)
  const handleShowModal = (type, inquiry = null) => {
    setModalType(type);
    setSelectedInquiry(inquiry);
  };

  // סגירת מודאל
  const handleCloseModal = () => {
    setModalType(null);
    setSelectedInquiry(null);
  };

  // שמירת פנייה (עדכון)
  const handleSave = async () => {
    if (modalType === "edit") {
      try {
        const response = await fetch(`http://localhost:5000/api/inquiries/${selectedInquiry._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(selectedInquiry),
        });
        const updated = await response.json();
        if (response.ok) {
          // עדכון הפנייה בטבלה
          setInquiries((prev) =>
            prev.map((inq) => (inq._id === updated._id ? updated : inq))
          );
          alert("✅ הפנייה עודכנה בהצלחה!");
        } else {
          alert("❌ שגיאה בעדכון הפנייה");
        }
      } catch (err) {
        console.error("❌ שגיאה:", err);
        alert("❌ שגיאה בעדכון");
      }
    }
    handleCloseModal();
  };

  // סינון הפניות לפי חיפוש, סטטוס ותאריך
  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchSearch =
      inquiry.name.includes(searchTerm) || inquiry.phone.includes(searchTerm);

    const matchStatus = showOnlyOpen ? inquiry.status === "פתוחה" : true;

    const matchDate = filterDate
      ? new Date(inquiry.createdAt).toISOString().split("T")[0] === filterDate
      : true;

    return matchSearch && matchStatus && matchDate;
  });

  // מחיקת פנייה
  const handleDelete = async (id) => {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק את הפנייה הזו?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/inquiries/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        alert("✅ הפנייה נמחקה בהצלחה!");
        setInquiries((prev) => prev.filter((inq) => inq._id !== id));
      } else {
        alert(data.message || "❌ שגיאה במחיקת הפנייה");
      }
    } catch (err) {
      console.error("❌ שגיאה במחיקה:", err);
      alert("❌ שגיאה בחיבור לשרת");
    }
  };

  // רנדר הקומפוננטה
  return (
    <div>
      {/* כותרת */}
      <div className="text-center mb-4">
        <h2 className="me-3">פניות</h2>
      </div>

      {/* כפתורים וסינון */}
      <div className="d-flex mb-3">
        <button className="btn btn-primary me-3" onClick={() => handleShowModal("search")}>
          חיפוש לפי מספר טלפון או שם
        </button>
        <button
          className="btn btn-primary me-3"
          onClick={() => setShowOnlyOpen(!showOnlyOpen)}
        >
          {showOnlyOpen ? "הצג הכול" : "הצג רק פניות פתוחות"}
        </button>
        <input
          type="date"
          className="form-control me-3"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          style={{ maxWidth: "200px" }}
        />
      </div>

      {/* טבלה להצגת הפניות */}
      <div className="table-responsive">
        <table className="table table-striped table-bordered text-center align-middle">
          <thead className="table">
            <tr>
              <th>#</th>
              <th>שם לקוח</th>
              <th>אימייל</th>
              <th>טלפון</th>
              <th>הודעה</th>
              <th>סטטוס</th>
              <th>תאריך פנייה</th>
              <th>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {filteredInquiries.map((inquiry, index) => (
              <tr key={inquiry._id}>
                <td>{index + 1}</td>
                <td>{inquiry.name}</td>
                <td>{inquiry.email}</td>
                <td>
                  <a
                    href={`https://wa.me/${inquiry.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-decoration"
                  >
                    {inquiry.phone}
                  </a>
                </td>

                <td>{inquiry.message}</td>
                <td className={inquiry.status === "פתוחה" ? "text-success" : "text-danger"}>
                  {inquiry.status}
                </td>
                <td>{new Date(inquiry.createdAt).toLocaleDateString("he-IL")}</td>
                <td>
                  <button className="btn btn-sm btn-primary me-2" onClick={() => handleShowModal("edit", inquiry)}>
                    ערוך
                  </button>
                  <button className="btn btn-sm btn-danger me-2" onClick={() => handleDelete(inquiry._id)}>
                    מחק
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      {/* מודאל עריכה */}
      {modalType === "edit" && selectedInquiry && (
        <Modal isOpen={true} onClose={handleCloseModal} onSave={handleSave}>
          <h3>עריכת פנייה</h3>
          <form>
            <input
              type="text"
              className="form-control mb-2"
              value={selectedInquiry.name}
              onChange={(e) =>
                setSelectedInquiry({ ...selectedInquiry, name: e.target.value })
              }
              required
            />
            <input
              type="email"
              className="form-control mb-2"
              value={selectedInquiry.email}
              onChange={(e) =>
                setSelectedInquiry({ ...selectedInquiry, email: e.target.value })
              }
              required
            />
            <input
              type="text"
              className="form-control mb-2"
              value={selectedInquiry.phone}
              onChange={(e) =>
                setSelectedInquiry({ ...selectedInquiry, phone: e.target.value })
              }
              required
            />
            <textarea
              className="form-control mb-2"
              value={selectedInquiry.message}
              onChange={(e) =>
                setSelectedInquiry({ ...selectedInquiry, message: e.target.value })
              }
              required
            />
            <select
              className="form-control mb-2"
              value={selectedInquiry.status}
              onChange={(e) =>
                setSelectedInquiry({ ...selectedInquiry, status: e.target.value })
              }
            >
              <option value="פתוחה">פתוחה</option>
              <option value="סגורה">סגורה</option>
            </select>
          </form>
        </Modal>
      )}

      {/* מודאל חיפוש */}
      {modalType === "search" && (
        <Modal isOpen={true} onClose={handleCloseModal}>
          <h3>חיפוש פנייה</h3>
          <input
            type="text"
            className="form-control"
            placeholder="הזן שם או טלפון"
            value={searchTerm}
            onChange={(e) => {
              const input = e.target.value;
              
              // אם זה רק ספרות – מגביל ל-10 ספרות
              if (/^\d*$/.test(input)) {
                if (input.length <= 10) {
                  setSearchTerm(input);
                }
              }
              // אם זה טקסט – אותיות ורווחים בלבד
              else if (/^[a-zA-Zא-ת\s]*$/.test(input)) {
                setSearchTerm(input);
              }
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default Inquiries;
