import React, { useState, useEffect } from "react"; // ייבוא React ו־hooks של useState ו־useEffect
import Modal from "./Modal"; // קומפוננטת מודל פנימית
import axios from "axios"; // ייבוא axios לשליחת בקשות HTTP
import "../Pages/cssfiles/TablesResponsive.css"; // קובץ עיצוב רספונסיבי לטבלאות

// קומפוננטת ניהול הזמנות רכב
const CarOrders = () => {
  // מצב להצגת המודל (add/edit/search)
  const [modalType, setModalType] = useState(null);
  // ההזמנה שנבחרה לעריכה
  const [selectedOrder, setSelectedOrder] = useState(null);
  // רשימת כל ההזמנות מהשרת
  const [orders, setOrders] = useState([]);
  // מונח חיפוש לפי מספר רכב
  const [searchTerm, setSearchTerm] = useState("");

  // שליפת ההזמנות ברגע שהקומפוננטה עולה
  useEffect(() => {
    fetchOrders();
  }, []);

  // פונקציה לשליפת הזמנות מהשרת
  const fetchOrders = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/carorders");
      setOrders(response.data); // שמירה ב־state
    } catch (error) {
      console.error("❌ שגיאה בשליפת הזמנות:", error);
    }
  };

  // פתיחת מודל לפי סוג פעולה (add/edit/search)
  const handleShowModal = (type, order = null) => {
    setModalType(type); // סוג המודל
    setSelectedOrder(order); // ההזמנה הנבחרת לעריכה
    if (type === "search") setSearchTerm(""); // איפוס שדה חיפוש
  };

  // סגירת מודל ואיפוס נתונים זמניים
  const handleCloseModal = () => {
    setModalType(null);
    setSelectedOrder(null);
  };

  // שמירה (עדכון או יצירה חדשה)
  const handleSave = async () => {
    const method = modalType === "edit" ? "put" : "post"; // האם עדכון או יצירה
    const url = modalType === "edit"
      ? `http://localhost:5000/api/carorders/${selectedOrder._id}` // עדכון לפי מזהה
      : "http://localhost:5000/api/carorders"; // יצירה חדשה

    try {
      // שליחת הבקשה לשרת
      const response = await axios({
        method,
        url,
        data: selectedOrder,
      });

      fetchOrders(); // רענון רשימת ההזמנות
      alert("✅ הפעולה בוצעה בהצלחה");
      handleCloseModal(); // סגירת המודל
    } catch (error) {
      console.error("❌ שגיאה בשמירה:", error);
      alert("❌ שגיאה בביצוע הפעולה");
    }
  };

  // סינון ההזמנות לפי מספר רכב
  const filteredOrders = orders.filter(order =>
    order.carNumber.includes(searchTerm)
  );

  // מחיקת הזמנה מהשרת
  const handleDelete = async (id) => {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק את ההזמנה הזו?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/carorders/${id}`);
      alert("✅ ההזמנה נמחקה בהצלחה!");
      fetchOrders(); // רענון אחרי מחיקה
    } catch (error) {
      console.error("❌ שגיאה במחיקת הזמנה:", error);
      alert("❌ שגיאה במחיקת הזמנה");
    }
  };


  return (
  <div>
    {/* כותרת עמוד */}
    <div className="text-center mb-4">
      <h2 className="me-3">הזמנות רכבים</h2>
    </div>

    {/* כפתורים לפעולות עיקריות */}
    <div className="d-flex mb-3">
      <button className="btn btn-primary me-3" onClick={() => handleShowModal("add")}>
        הוסף הזמנה
      </button>
      <button className="btn btn-primary me-3" onClick={() => handleShowModal("search")}>
        חיפוש הזמנה לפי מספר רכב
      </button>
    </div>

    {/* טבלת הזמנות רכב */}
    <div className="table-responsive" dir="rtl">
      <table className="table table-striped table-bordered align-middle">
        <thead>
          <tr>
            <th>מספר רכב</th>
            <th>תאריך הזמנה</th>
            <th>תאריך אספקה</th>
            <th>פרטי הזמנה</th>
            <th>עלות (ש"ח)</th>
            <th>סטטוס הזמנה</th>
            <th>פעולה</th>
          </tr>
        </thead>
        <tbody>
          {/* מעבר על כל ההזמנות המסוננות */}
          {filteredOrders.map((order) => (
            <tr key={order._id}>
              <td>{order.carNumber}</td>
              <td>{order.orderDate?.substring(0, 10)}</td>
              <td>{order.deliveryDate?.substring(0, 10)}</td>
              <td>{order.details}</td>
              <td>{order.cost}</td>
              <td className={order.status === "התקבלה" ? "text-success" : "text-warning"}>
                {order.status}
              </td>
              <td>
                <button
                  className="btn btn-primary btn-sm me-2"
                  onClick={() => handleShowModal("edit", order)}
                >
                  עריכה
                </button>
                <button
                  className="btn btn-danger btn-sm me-2"
                  onClick={() => handleDelete(order._id)}
                >
                  מחיקה
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* מודל הוספה או עריכה של הזמנה */}
    {(modalType === "add" || modalType === "edit") && (
      <Modal isOpen={true} onClose={handleCloseModal} onSave={handleSave}>
        <h3>{modalType === "edit" ? "עריכת הזמנה" : "הוספת הזמנה חדשה"}</h3>
        <form>
          {/* שדה מספר רכב – רק ספרות */}
          <div className="form-group mb-3">
            <label>מספר רכב</label>
            <input
              type="text"
              className="form-control"
              value={selectedOrder?.carNumber || ""}
              onChange={(e) =>
                setSelectedOrder({
                  ...selectedOrder,
                  carNumber: e.target.value.replace(/\D/g, "")
                })
              }
              maxLength={9}
              required
            />
          </div>

          {/* תאריך הזמנה */}
          <div className="form-group mb-3">
            <label>תאריך הזמנה</label>
            <input
              type="date"
              className="form-control"
              value={selectedOrder?.orderDate || ""}
              onChange={(e) =>
                setSelectedOrder({ ...selectedOrder, orderDate: e.target.value })
              }
              required
            />
          </div>

          {/* תאריך אספקה */}
          <div className="form-group mb-3">
            <label>תאריך אספקה</label>
            <input
              type="date"
              className="form-control"
              value={selectedOrder?.deliveryDate || ""}
              onChange={(e) =>
                setSelectedOrder({ ...selectedOrder, deliveryDate: e.target.value })
              }
              required
            />
          </div>

          {/* פרטי הזמנה – טקסט עד 200 תווים */}
          <div className="form-group mb-3">
            <label>פרטי הזמנה</label>
            <textarea
              className="form-control"
              value={selectedOrder?.details || ""}
              onChange={(e) =>
                setSelectedOrder({
                  ...selectedOrder,
                  details: e.target.value.slice(0, 200)
                })
              }
              required
            />
            <small className="text-muted">
              {selectedOrder?.details?.length || 0}/200 תווים
            </small>
          </div>

          {/* עלות – מספר חיובי בלבד */}
          <div className="form-group mb-3">
            <label>עלות (ש"ח)</label>
            <input
              type="number"
              className="form-control"
              min="0"
              step="0.01"
              value={selectedOrder?.cost || ""}
              onChange={(e) =>
                setSelectedOrder({
                  ...selectedOrder,
                  cost: e.target.value.replace(/[^0-9.]/g, "")
                })
              }
              required
            />
          </div>

          {/* סטטוס הזמנה – מתוך רשימת סטטוסים */}
          <div className="form-group mb-3">
            <label>סטטוס הזמנה</label>
            <select
              className="form-control"
              value={selectedOrder?.status || ""}
              onChange={(e) =>
                setSelectedOrder({ ...selectedOrder, status: e.target.value })
              }
              required
            >
              {["התקבלה", "בטיפול", "הושלמה", "בוטלה"].map((status, index) => (
                <option key={index} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>
    )}

    {/* מודל חיפוש לפי מספר רכב */}
    {modalType === "search" && (
      <Modal isOpen={true} onClose={handleCloseModal}>
        <h3>חיפוש לפי מספר רכב</h3>
        <div className="form-group mb-3">
          <label>מספר רכב</label>
          <input
            type="text"
            className="form-control"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.replace(/\D/g, ""))}
            placeholder="הכנס מספר רכב לחיפוש"
            maxLength={9}
          />
        </div>
      </Modal>
    )}
  </div>
);
};

export default CarOrders;
