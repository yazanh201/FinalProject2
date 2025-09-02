require('dotenv').config(); // טען משתני סביבה
const mongoose = require('mongoose');
const User = require('./models/User'); // ודא שהנתיב נכון לפי הפרויקט שלך

// התחברות ל-MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("📦 מחובר למסד הנתונים");

    // יצירת משתמשים
    const users = [
      { username: 'admin2', password: '12345', role: 'admin' },
      { username: 'employee2', password: '12345', role: 'employee' },
    ];

    for (const userData of users) {
      const existingUser = await User.findOne({ username: userData.username });
      if (existingUser) {
        console.log(`🔁 המשתמש "${userData.username}" כבר קיים`);
      } else {
        const user = new User(userData);
        await user.save();
        console.log(`✅ נוצר משתמש: ${user.username}`);
      }
    }

    mongoose.disconnect();
    console.log("🚪 נותק מהמסד בהצלחה");
  })
  .catch((err) => {
    console.error("❌ שגיאה בחיבור למסד:", err);
  });
