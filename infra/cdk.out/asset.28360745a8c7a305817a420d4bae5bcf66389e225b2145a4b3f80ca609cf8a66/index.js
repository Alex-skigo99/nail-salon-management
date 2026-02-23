"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const prisma_1 = require("./lib/prisma");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
// Middleware
// Allow credentials (cookies/auth) from the frontend origin
app.use((0, cors_1.default)({
    origin: frontendUrl,
    credentials: true,
}));
app.use(express_1.default.json());
app.use(body_parser_1.default.json());
// Middleware
app.use(express_1.default.json());
app.use(body_parser_1.default.json());
// Routes
app.get("/", (req, res) => {
    res.send("Hello from Nail Salon Management API!");
});
app.get("/welcome", async (req, res) => {
    // Fetch all users with their posts
    const allUsers = await prisma_1.prisma.user.findMany();
    console.log("All users:", JSON.stringify(allUsers, null, 2));
    res.json(allUsers);
});
// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
exports.default = app;
