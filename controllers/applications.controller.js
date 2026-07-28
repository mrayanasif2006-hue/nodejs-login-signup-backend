
const fs = require("fs");
const path = require("path");
const { sendSuccess, sendError } = require("../utils/response");

const DATA_FILE_PATH = path.join(__dirname, "../data/applications.json");

function readData() {
    const rawData = fs.readFileSync(DATA_FILE_PATH, "utf8");
    return JSON.parse(rawData).applications;
}

function writeData(applications) {
    fs.writeFileSync(
        DATA_FILE_PATH,
        JSON.stringify({ applications }, null, 2),
        "utf8"
    );
}

// GET /applications
exports.getAllApplications = (req, res) => {
    try {
        let applications = readData();
        const { status, sort, page, limit } = req.query;

        if (status) {
            applications = applications.filter(
                (app) => app.status.toLowerCase() === status.toLowerCase()
            );
        }

        if (sort === "date") {
            applications.sort(
                (a, b) => new Date(a.appliedDate) - new Date(b.appliedDate)
            );
        }

        if (page && limit) {
            const pageNumber = parseInt(page);
            const limitNumber = parseInt(limit);
            const startIndex = (pageNumber - 1) * limitNumber;
            const endIndex = startIndex + limitNumber;
            applications = applications.slice(startIndex, endIndex);
        }

        return sendSuccess(res, applications);
    } catch (error) {
        return sendError(res, error.message);
    }
};

// GET /applications/:id
exports.getApplicationById = (req, res) => {
    const application = readData().find((app) => app.id === req.params.id);

    if (!application) {
        return sendError(res, "Application not found", 404);
    }

    return sendSuccess(res, application);
};

// POST /applications
exports.createApplication = (req, res) => {
    const { name, source, status } = req.body;

    if (!name || !source || !status) {
        return sendError(res, "Missing required fields", 400);
    }

    const applications = readData();
    const newApplication = {
        id: (applications.length + 1).toString(),
        name,
        source,
        status,
        appliedDate: new Date().toISOString().split("T")[0],
    };

    applications.push(newApplication);
    writeData(applications);

    return sendSuccess(res, newApplication, 201);
};

// PUT /applications/:id
exports.updateApplication = (req, res) => {
    const { id } = req.params;
    const { name, source, status } = req.body;

    const applications = readData();
    const index = applications.findIndex((app) => app.id === id);

    if (index === -1) {
        return sendError(res, "Application not found", 404);
    }

    if (name) applications[index].name = name;
    if (source) applications[index].source = source;
    if (status) applications[index].status = status;

    writeData(applications);

    return sendSuccess(res, applications[index]);
};

// DELETE /applications/:id
exports.deleteApplication = (req, res) => {
    const { id } = req.params;
    const applications = readData();
    const index = applications.findIndex((app) => app.id === id);

    if (index === -1) {
        return sendError(res, "Application not found", 404);
    }

    const [deletedApplication] = applications.splice(index, 1);
    writeData(applications);

    return sendSuccess(res, deletedApplication);
};
