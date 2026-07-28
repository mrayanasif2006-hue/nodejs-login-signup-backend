
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const db = require("../config/db");
const { isValidEmail } = require("../utils/validators");
const { sendSuccess, sendError } = require("../utils/response");

function createToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );
}

// POST /signup
exports.signup = (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return sendError(res, "Name, email and password are required", 400);
    }

    if (!isValidEmail(email)) {
        return sendError(res, "Invalid email format", 400);
    }

    const existingUser = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existingUser) {
        return sendError(res, "Email already registered", 409);
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const result = db.prepare(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)"
    ).run(name, email, hashedPassword, "user");

    const newUser = { id: result.lastInsertRowid, name, email, role: "user" };
    const token = createToken(newUser);

    return sendSuccess(res, { id: newUser.id, name, email, token }, 201);
};

// POST /login
exports.login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return sendError(res, "Email and password are required", 400);
    }

    if (!isValidEmail(email)) {
        return sendError(res, "Invalid email format", 400);
    }

    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

    console.log(user);
    if (!user) {
        return sendError(res, "User not found", 404);
    }

    if (!bcrypt.compareSync(password, user.password)) {
        return sendError(res, "Invalid password", 401);
    }

    const token = createToken(user);

    return sendSuccess(res, {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
    });
    
    }; // <-- closes exports.login