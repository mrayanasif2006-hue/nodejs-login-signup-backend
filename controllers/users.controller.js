
const db = require("../config/db");
const { sendSuccess, sendError } = require("../utils/response");

const USERS_PER_PAGE = 5;

// Is the logged-in user allowed to manage the account with this id?
// -> either it's their own account, or they are an admin.
function canManage(req, targetId) {
    return req.user.role === "admin" || String(req.user.id) === String(targetId);
}

// GET /users?page=1
exports.getUsers = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * USERS_PER_PAGE;

    // Never select/return the password column, even hashed.
    const users = db.prepare(`
        SELECT id, name, email, role
        FROM users
        LIMIT ? OFFSET ?
    `).all(USERS_PER_PAGE, offset);

    return sendSuccess(res, users);
};

// GET /users/:id
exports.getUserById = (req, res) => {
    const { id } = req.params;

    if (!canManage(req, id)) {
        return sendError(res, "You are not allowed to view this account", 403);
    }

    const user = db.prepare("SELECT id, name, email, role FROM users WHERE id = ?").get(id);

    if (!user) {
        return sendError(res, "User not found", 404);
    }

    return sendSuccess(res, user);
};

// PUT /users/:id
exports.updateUser = (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;

    if (!canManage(req, id)) {
        return sendError(res, "You are not allowed to edit this account", 403);
    }

    if (!name || !email) {
        return sendError(res, "Name and email are required", 400);
    }

    const result = db.prepare(
        "UPDATE users SET name = ?, email = ? WHERE id = ?"
    ).run(name, email, id);

    if (result.changes === 0) {
        return sendError(res, "User not found", 404);
    }

    return sendSuccess(res, { id, name, email }, 200);
};

// DELETE /users/:id
exports.deleteUser = (req, res) => {
    const { id } = req.params;

    if (!canManage(req, id)) {
        return sendError(res, "You are not allowed to delete this account", 403);
    }

    const result = db.prepare("DELETE FROM users WHERE id = ?").run(id);

    if (result.changes === 0) {
        return sendError(res, "User not found", 404);
    }

    return sendSuccess(res, { id }, 200);
};
