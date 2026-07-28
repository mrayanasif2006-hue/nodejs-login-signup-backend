/**
 * routes/applications.routes.js
 * ------------------------------------------------------------
 * Mounted at /applications (and protected by verifyToken) in app.js.
 * ------------------------------------------------------------
 */

const express = require("express");
const router = express.Router();

const {
    getAllApplications,
    getApplicationById,
    createApplication,
    updateApplication,
    deleteApplication,
} = require("../controllers/applications.controller");

router.get("/", getAllApplications);

router.get("/stats", (req, res) => {
    res.send("Applications stats");
});

router.get("/:id", getApplicationById);
router.post("/", createApplication);
router.put("/:id", updateApplication);
router.delete("/:id", deleteApplication);

module.exports = router;
