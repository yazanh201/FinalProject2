import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import CarsTable from "../Tabels/CarsTable";
import Customers from "../Tabels/CustomersTable";
import Inquiries from "../Tabels/Inquiries";
import TreatmentsTable from "../Tabels/TreatmentsTable";
import Appointment from "../Tabels/Appointments";
import Employees from "../Tabels/EmployeesTable";
import CarsUnderMaintance from "../Tabels/CarsUnderMaintance";
import CarOrders from "../Tabels/CarOrders";
import CameraPanel from "../components/CameraPanel";
import styles from "./cssfiles/Dashboard.module.css";
import {
  FaUserFriends,
  FaCar,
  FaEnvelope,
  FaTools,
  FaCalendarAlt,
  FaUserTie,
  FaWrench,
  FaClipboardList,
  FaPlusCircle,
  FaCamera,
  FaSignOutAlt,
  FaTachometerAlt,
  FaBars,
} from "react-icons/fa";

const Dashboard = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [activeView, setActiveView] = useState("home");
  const [selectedAppointmentNumber, setSelectedAppointmentNumber] = useState(null);
  const [selectedRepairId, setSelectedRepairId] = useState(null);
  const [selectedTreatmentNumber, setSelectedTreatmentNumber] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownTimeoutRef = useRef(null);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const userRole = localStorage.getItem("role");

    if (!isLoggedIn || !userRole) {
      navigate("/login");
    } else {
      setRole(userRole);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const handleMouseEnter = () => {
    clearTimeout(dropdownTimeoutRef.current);
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setShowDropdown(false);
    }, 200);
  };

  const goToRepairType = (repairId) => {
    setSelectedRepairId(repairId);
    setActiveView("Repairtypes");
  };

  const goToTreatment = async (treatmentId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/treatments/by-id/${treatmentId}`);
      const data = await res.json();
      if (data && data.appointmentNumber) {
        setSelectedAppointmentNumber(data.appointmentNumber);
        setSelectedTreatmentNumber(data.treatmentId);
        setActiveView("Treatments");
      } else {
        alert("לא נמצא מזהה תור בטיפול זה");
      }
    } catch (err) {
      console.error("שגיאה בשליפת טיפול:", err);
      alert("❌ שגיאה בשליפת טיפול");
    }
  };

  const goToAppointment = (appointmentNumber) => {
    setSelectedAppointmentNumber(appointmentNumber);
    setSelectedTreatmentNumber(null);
    setActiveView("Appointments");
  };

  const renderContent = () => {
    switch (activeView) {
      case "cars":
        return <CarsTable />;
      case "Customers":
        return <Customers />;
      case "Inquiries":
        return <Inquiries />;
      case "Treatments":
        return (
          <TreatmentsTable
            filterAppointment={selectedAppointmentNumber}
            filterTreatmentNumber={selectedTreatmentNumber}
            onNavigateToRepair={goToRepairType}
            onNavigateToAppointment={goToAppointment}
          />
        );
      case "Repairtypes":
        return (
          <Repairtypes
            filterRepairId={selectedRepairId}
            onNavigateToTreatment={goToTreatment}
          />
        );
      case "Appointments":
        return (
          <Appointment
            onSelectTreatment={(number) => {
              setSelectedAppointmentNumber(number);
              setActiveView("Treatments");
            }}
            filterAppointmentNumber={selectedAppointmentNumber}
          />
        );
      case "Employees":
        return <Employees />;
      case "CarsUnderMaintance":
        return <CarsUnderMaintance />;
      case "CarOrders":
        return <CarOrders />;
      default:
        return (
          <div className={`${styles.cardash} card p-4 shadow-sm`}>
            <h3>ברוך הבא למערכת הניהול</h3>
            <p>בחר פעולה מהתפריט כדי להתחיל</p>
          </div>
        );
    }
  };

  return (
    <div className={`${styles["dashboard-modern"]} container-fluid`} dir="ltr">
      <header className={`${styles["dashboard-header"]} d-flex justify-content-between align-items-center p-3 sticky-top shadow-sm`}>
        <div className="d-flex align-items-center gap-3">
          <span className={`${styles["role-label"]} fw-bold`}>תפקיד: {role === "admin" ? "מנהל" : "עובד"}</span>

          {/* Dropdown רק למחשב */}
            <div
              className="position-relative d-none d-md-block"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button className={styles["menu-button"]}>
                <FaTools /> פעולות נוספות
              </button>
              {showDropdown && (
                <div
                  className={styles["dashboard-dropdown"]}
                  style={{ position: "absolute", right: 0 }}
                >
                  {role === "admin" && (
                    <>
                      <button
                        className={styles["dropdown-item"]}
                        onClick={() => navigate("/add-customer-with-vehicle")}
                      >
                        לקוח ורכב <FaPlusCircle />
                      </button>
                      <button
                        className={styles["dropdown-item"]}
                        onClick={() => navigate("/create-treatment")}
                      >
                        טיפול חדש <FaWrench />
                      </button>
                      <button
                        className={styles["dropdown-item"]}
                        onClick={() => navigate("/AppointmentForm")}
                      >
                        קביעת תור <FaCalendarAlt />
                      </button>
                      <button
                          className={styles["dropdown-item"]}
                          onClick={() => navigate("/add-user-form")}
                        >
                        הוספת משתמש/עובד<FaPlusCircle />
                      </button>
                    </>
                  )}
                  <button
                    className={styles["dropdown-item"]}
                    onClick={() => setShowCamera(true)}
                  >
                    מצלמה <FaCamera />
                  </button>
                  <button
                    className={`${styles["dropdown-item"]} ${styles["text-danger"]}`}
                    onClick={handleLogout}
                  >
                    התנתקות <FaSignOutAlt />
                  </button>
                </div>
              )}
            </div>
            {role === "admin" && (
              <Link to="/AdvancedDashboard" className={`${styles["menu-button"]} ms-2`}>
                <FaTachometerAlt /> לוח מתקדם
              </Link>
            )}
        </div>
        

        <div className="d-none d-md-block">
          <span className={`${styles["dashboard-title"]} fw-bold fs-4 text-gradient`}>מערכת ניהול מוסך</span>
        </div>

        <div className="d-md-none">
          <button className="btn btn-outline-primary rounded-circle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <FaBars />
          </button>
        </div>
      </header>

      <div className="row">
        <main className="col-12 col-md-9 col-lg-10 p-4 bg-light text-end" dir="rtl">
          {renderContent()}
        </main>

        <aside className={`${styles["dashboard-sidebar"]} sidebar col-12 col-md-3 col-lg-2 ${isMenuOpen ? styles.open : ""}`}>
  <h6 className={`${styles["sidebar-title"]} text-muted mb-3`}>תפריט</h6>
  <ul className="nav flex-column gap-2">

    {/* פעולות מהירות - מוצג תמיד במסך קטן */}
<div className="d-md-none">
  <li className="text-warning small">פעולות מהירות</li>

  {/* הצגת פעולות מנהל */}
  {role === "admin" && (
    <>
      <li>
        <button
          className={`${styles["sidebar-btn"]} btn w-100 d-flex align-items-center gap-2`}
          onClick={() => {
            navigate("/add-customer-with-vehicle");
            setIsMenuOpen(false);
          }}
        >
          <FaPlusCircle /> לקוח ורכב
        </button>
      </li>
      <li>
        <button
          className={`${styles["sidebar-btn"]} btn w-100 d-flex align-items-center gap-2`}
          onClick={() => {
            navigate("/create-treatment");
            setIsMenuOpen(false);
          }}
        >
          <FaWrench /> טיפול חדש
        </button>
      </li>
      <li>
        <button
          className={`${styles["sidebar-btn"]} btn w-100 d-flex align-items-center gap-2`}
          onClick={() => {
            navigate("/AppointmentForm");
            setIsMenuOpen(false);
          }}
        >
          <FaCalendarAlt /> קביעת תור
        </button>
      </li>
    </>
  )}

  {/* פעולות שמוצגות לכולם */}
  <li>
    <button
      className={`${styles["sidebar-btn"]} btn w-100 d-flex align-items-center gap-2`}
      onClick={() => {
        setShowCamera(true);
        setIsMenuOpen(false);
      }}
    >
      <FaCamera /> מצלמה
    </button>
  </li>
  <li>
    <button
      className={`${styles["sidebar-btn"]} btn w-100 text-danger d-flex align-items-center gap-2`}
      onClick={() => {
        handleLogout();
        setIsMenuOpen(false);
      }}
    >
      <FaSignOutAlt /> התנתקות
    </button>
  </li>
  <hr className="my-3 border-white border-opacity-50" />
</div>


    {/* טבלאות */}
    {role === "admin" && (
      <>
        <li>
          <button className={`${styles["sidebar-btn"]} btn w-100 d-flex flex-row-reverse justify-content-start align-items-center gap-2 ${activeView === "Customers" ? styles.active : ""}`} onClick={() => {
            setActiveView("Customers");
            setIsMenuOpen(false);
          }}>
            <FaUserFriends /> לקוחות
          </button>
        </li>
        <li>
          <button className={`${styles["sidebar-btn"]} btn w-100 d-flex flex-row-reverse justify-content-start align-items-center gap-2 ${activeView === "cars" ? styles.active : ""}`} onClick={() => {
            setActiveView("cars");
            setIsMenuOpen(false);
          }}>
            <FaCar /> רכבים
          </button>
        </li>
        <li>
          <button className={`${styles["sidebar-btn"]} btn w-100 d-flex flex-row-reverse justify-content-start align-items-center gap-2 ${activeView === "Inquiries" ? styles.active : ""}`} onClick={() => {
            setActiveView("Inquiries");
            setIsMenuOpen(false);
          }}>
            <FaEnvelope /> פניות
          </button>
        </li>
        <li>
          <button className={`${styles["sidebar-btn"]} btn w-100 d-flex flex-row-reverse justify-content-start align-items-center gap-2 ${activeView === "CarOrders" ? styles.active : ""}`} onClick={() => {
            setActiveView("CarOrders");
            setIsMenuOpen(false);
          }}>
            <FaTools /> הזמנות
          </button>
        </li>
        <li>
          <button className={`${styles["sidebar-btn"]} btn w-100 d-flex flex-row-reverse justify-content-start align-items-center gap-2 ${activeView === "Appointments" ? styles.active : ""}`} onClick={() => {
            setActiveView("Appointments");
            setIsMenuOpen(false);
          }}>
            <FaCalendarAlt /> תורים
          </button>
        </li>
        <li>
          <button className={`${styles["sidebar-btn"]} btn w-100 d-flex flex-row-reverse justify-content-start align-items-center gap-2 ${activeView === "Employees" ? styles.active : ""}`} onClick={() => {
            setActiveView("Employees");
            setIsMenuOpen(false);
          }}>
            <FaUserTie /> עובדים
          </button>
        </li>
      </>
    )}

    <li>
      <button className={`${styles["sidebar-btn"]} btn w-100 d-flex flex-row-reverse justify-content-start align-items-center gap-2 ${activeView === "Treatments" ? styles.active : ""}`} onClick={() => {
        setActiveView("Treatments");
        setIsMenuOpen(false);
      }}>
        <FaClipboardList /> טיפולים
      </button>
    </li>
    <li>
      <button className={`${styles["sidebar-btn"]} btn w-100 d-flex flex-row-reverse justify-content-start align-items-center gap-2 ${activeView === "CarsUnderMaintance" ? styles.active : ""}`} onClick={() => {
        setActiveView("CarsUnderMaintance");
        setIsMenuOpen(false);
      }}>
        <FaWrench /> רכבים בטיפול
      </button>
    </li>
  </ul>
</aside>

      </div>

      {showCamera && <CameraPanel onClose={() => setShowCamera(false)} />}
    </div>
  );
};

export default Dashboard;
