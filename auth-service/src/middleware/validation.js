const validateRegistration = (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Name, email and password are required"
        });
    }

    if (typeof name !== "string" || name.trim().length < 2) {
        return res.status(400).json({
            success: false,
            message: "Name must contain at least 2 characters"
        });
    }

    if (typeof email !== "string" || !email.includes("@")) {
        return res.status(400).json({
            success: false,
            message: "A valid email address is required"
        });
    }

    if (typeof password !== "string" || password.length < 8) {
        return res.status(400).json({
            success: false,
            message: "Password must contain at least 8 characters"
        });
    }

    next();
};

const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });
    }

    next();
};

module.exports = {
    validateRegistration,
    validateLogin
};