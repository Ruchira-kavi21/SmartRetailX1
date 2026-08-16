const express = require("express");
const {
    register,
    login,
    getProfile,
    adminTest
} = require("../controllers/authController");

const {authenticateToken} = require("../middleware/authMiddleware");

const {authorizeRoles} = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get(
    "/profile",
    authenticateToken,
    getProfile
);

router.get(
    "/admin-test",
    authenticateToken,
    authorizeRoles("ADMIN"),
    adminTest
);

module.exports = router;