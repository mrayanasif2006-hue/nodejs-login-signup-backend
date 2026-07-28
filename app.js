
require("dotenv").config();
 
const path = require("path");
const express = require("express");
const cors = require("cors");

const verifyToken = require("./middleware/verifyToken");
const authRoutes = require("./routes/auth.routes");
const usersRoutes = require("./routes/users.routes");
const applicationsRoutes = require("./routes/applications.routes");

const app = express();

// --- Global middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Public routes ---
app.get("/", (req, res) => {
    res.send("Hello World");
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "login.html"));
});

app.use(authRoutes); // adds POST /signup and POST /login

// --- Protected routes (valid login token required) ---
app.get("/profile", verifyToken, (req, res) => {
    res.json({ success: true, message: "Welcome to your profile!" });
});

app.use("/users", verifyToken, usersRoutes);
app.use("/applications", verifyToken, applicationsRoutes);

// --- Start server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
