const User = require("../models/User");

// ✅ יצירת משתמש חדש
const createUser = async (req, res) => {
  try {
    const { idNumber, fullName, phone, email, username, password, role } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "שם המשתמש כבר תפוס" });
    }

    const user = new User({
      idNumber,
      fullName,
      phone,
      email,
      username,
      password,
      role,
    });

    await user.save();
    res.status(201).json({ message: "✅ משתמש נוצר בהצלחה", user });
  } catch (error) {
    console.error("❌ שגיאה ביצירת משתמש:", error);
    res.status(500).json({ message: "שגיאת שרת", error });
  }
};

// ✅ שליפת כל המשתמשים
const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error("❌ שגיאה בשליפת משתמשים:", error);
    res.status(500).json({ message: "שגיאת שרת" });
  }
};

// ✅ עדכון משתמש (רק idNumber, fullName, email, phone)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // נשלוף את המשתמש
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "❌ משתמש לא נמצא" });
    }

    // עדכון רק של השדות המותרים
    const { idNumber, fullName, phone, email } = req.body;

    if (idNumber !== undefined) user.idNumber = idNumber;
    if (fullName !== undefined) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (email !== undefined) user.email = email;

    await user.save();
    res.json({ message: "✅ המשתמש עודכן בהצלחה", user });
  } catch (error) {
    console.error("❌ שגיאה בעדכון משתמש:", error);
    res.status(500).json({ message: "שגיאת שרת", error });
  }
};

// ✅ מחיקת משתמש לפי ID
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "❌ משתמש לא נמצא" });
    }

    res.json({ message: "✅ המשתמש נמחק בהצלחה" });
  } catch (error) {
    console.error("❌ שגיאה במחיקת משתמש:", error);
    res.status(500).json({ message: "שגיאת שרת", error });
  }
};

module.exports = { createUser, getUsers, updateUser,deleteUser };
