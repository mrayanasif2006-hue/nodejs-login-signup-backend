/**
 * routes/users.routes.js
 * ------------------------------------------------------------
 * Every route in this file is protected by verifyToken
 * (mounted in app.js), so req.user is always available here.
 * ------------------------------------------------------------
 */

const express = require("express");
const router = express.Router();
const {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
} = require("../controllers/users.controller");

// Any logged-in user can view the users list (dashboard). Managing a
// single account (edit/delete) is still restricted to admins or the
// owner via canManage() inside the controller.
router.get("/", getUsers);

// Viewing/editing/deleting a single account is allowed for admins
// (any account) or the owner (their own) - enforced by canManage()
// inside the controller.
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
module.exports = router;
