const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// ייבוא ראוטים
const customerRoutes = require('./routes/customer.routes');
const vehicleRoutes = require('./routes/vehicle.routes');
const inquiryRoutes = require('./routes/inquiry.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const treatmentRoutes = require('./routes/treatment.routes');
const employeeRoutes = require("./routes/employee.routes");
const authRoutes = require('./routes/auth.routes');
const carOrderRoutes = require('./routes/carOrder.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const emailRoutes = require('./routes/email.routes');
const userRoutes = require("./routes/userRoutes");


// יצירת אפליקציה
const app = express();

// 🎯 אמצעי עזר
app.use(cors());

// ✅ הגדרה לטיפול בבקשות גדולות כולל FormData
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// 🖼️ שירות קבצים סטטיים (לצפייה בתמונות/קבצים)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// חיבור למסד נתונים
require("dotenv").config(); // בראש הקובץ

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ חיבור למסד נתונים MongoDB
mongoose.connect(process.env.MONGO_URI, {})
  .then(() => console.log('✅ מחובר ל-MongoDB'))
  .catch((error) => console.error('❌ שגיאה בחיבור ל-MongoDB:', error));


// 📦 שימוש בנתיבים
app.use('/api/customers', customerRoutes);
app.use('/api/cars', vehicleRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/treatments', treatmentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/carorders', carOrderRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/email', emailRoutes);
app.use("/api/users", userRoutes);

// 🌐 מסלול בדיקה ראשי
app.get('/', (req, res) => {
  res.send('🚗 מוסך - API עובד!');
});

// 🚀 הפעלת השרת
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 השרת רץ על פורט: ${PORT}`);
});
