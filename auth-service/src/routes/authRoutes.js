const express = require("express");
const {
    register,
    login,
    getProfile,
    adminTest,
    getUsers,
    updateUserRole,
    deleteUser
} = require("../controllers/authController");

const {authenticateToken} = require("../middleware/authMiddleware");

const {authorizeRoles} = require("../middleware/roleMiddleware");

const {loginRateLimiter} = require("../middleware/rateLimiter");

const {validateRegistration,validateLogin} = require("../middleware/validation");

const router = express.Router();

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ruchira
 *               email:
 *                 type: string
 *                 example: ruchira@example.com
 *               password:
 *                 type: string
 *                 example: Test@12345
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid request
 *       409:
 *         description: Email already exists
 */
router.post("/register",validateRegistration,register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Authenticate a user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: ruchira@example.com
 *               password:
 *                 type: string
 *                 example: Test@12345
 *     responses:
 *       200:
 *         description: Login successful and JWT returned
 *       401:
 *         description: Invalid email or password
 */
router.post("/login",validateLogin,loginRateLimiter,login);

/**
 * @swagger
 * /api/v1/auth/profile:
 *   get:
 *     summary: Get authenticated user profile
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile returned
 *       401:
 *         description: Missing or invalid JWT
 *       404:
 *         description: User not found
 */
router.get(
    "/profile",
    authenticateToken,
    getProfile
);

/**
 * @swagger
 * /api/v1/auth/admin-test:
 *   get:
 *     summary: Test administrator authorization
 *     tags:
 *       - Authorization
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Administrator access granted
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
router.get(
    "/admin-test",
    authenticateToken,
    authorizeRoles("ADMIN"),
    adminTest
);
router.get(
    "/users",
    authenticateToken,
    authorizeRoles("ADMIN"),
    getUsers
);

router.patch(
    "/users/:id/role",
    authenticateToken,
    authorizeRoles("ADMIN"),
    updateUserRole
);

router.delete(
    "/users/:id",
    authenticateToken,
    authorizeRoles("ADMIN"),
    deleteUser
);

module.exports = router;