const express = require("express");
const { createUser,getUsers,updateUser,deleteUser} = require("../controllers/userController");

const router = express.Router();

router.get("/", getUsers);


// POST /api/users
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);


module.exports = router;
