"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const route_1 = __importDefault(require("./controllers/route"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_session_1 = __importDefault(require("express-session"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
dotenv_1.default.config();
const app = (0, express_1.default)();
mongoose_1.default.connect(process.env.MONGODB_URL)
    .then(() => console.log("Database connected."))
    .catch((error) => console.error(error.message));
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000", "https://library-management-2-black.vercel.app", "https://back-end-for-lm-2-5yck.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin", "X-Auth-Token", "X-CSRF-Token"],
}));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use((0, express_fileupload_1.default)());
app.use((0, cookie_parser_1.default)());
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true }
}));
app.use("/api", route_1.default);
app.listen(process.env.PORT, () => console.log(`Server running on http://localhost:${process.env.PORT}`));
