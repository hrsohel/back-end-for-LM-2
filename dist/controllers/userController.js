"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserForInfo = exports.infoForUserOrUpdateData = exports.updateUserInfo = exports.getReturnBooks = exports.getIssuedBooks = exports.getRequestedBooks = exports.updateImage = exports.getSingleUser = exports.loginInUser = exports.addUser = void 0;
const User_1 = __importDefault(require("../schemas/User"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mischalleneous_1 = require("./mischalleneous");
const firebase_1 = __importDefault(require("./firebase"));
const uploadImage_1 = __importDefault(require("./uploadImage"));
const Book_1 = __importDefault(require("../schemas/Book"));
const mongoose_1 = __importDefault(require("mongoose"));
const successFunction = (status, statusbar, message, data = []) => {
    return { status, statusbar, message, data };
};
const addUser = async (req, res) => {
    try {
        const { email, password } = req.body.formData;
        const existUser = await User_1.default.countDocuments({ email });
        if (existUser > 0)
            return res.status(409).json({ status: false, statusCode: 409, message: "User with this email already exists! Please try a different one.", data: [] });
        const hashedpassword = await bcryptjs_1.default.hash(password, 10);
        await User_1.default.create({ ...req.body.formData, password: hashedpassword, userId: (0, mischalleneous_1.getRandom8DigitNumber)() });
        return res.status(201).json({ status: true, statusCode: 201, message: "User created successfully", data: [] });
    }
    catch (error) {
        return res.status(500).json({ status: false, statusCode: 500, message: error.message, data: [] });
    }
};
exports.addUser = addUser;
const loginInUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const existUser = await User_1.default.findOne({ email: email });
        if (!existUser)
            return res.status(409).json(successFunction(false, 409, "User with this email does not exist!", []));
        const verifiedPassword = await bcryptjs_1.default.compare(password, existUser.password);
        if (!verifiedPassword)
            return res.status(401).json(successFunction(false, 401, "Wrong password", []));
        const token = jsonwebtoken_1.default.sign({ _id: existUser._id, type: existUser.type, userId: existUser.userId }, process.env.JWT_SECRET);
        return res.status(200).json(successFunction(true, 200, "User signed in.", { token }));
    }
    catch (error) {
        return res.status(500).json(successFunction(false, 500, error.message, []));
    }
};
exports.loginInUser = loginInUser;
const getSingleUser = async (req, res) => {
    try {
        const { id, userId } = req.query;
        let userData;
        if (id)
            userData = await User_1.default.findOne({ _id: id }, { password: 0 });
        else if (userId)
            userData = await User_1.default.findOne({ userId }, { password: 0 });
        return res.status(200).json(successFunction(true, 200, "single user data", userData));
    }
    catch (error) {
        return res.status(500).json(successFunction(false, 500, error.message, []));
    }
};
exports.getSingleUser = getSingleUser;
const updateImage = async (req, res) => {
    try {
        const userImage = await User_1.default.findOne({ _id: req.body._id }, { image: 1 });
        if (userImage?.image) {
            const fileName = userImage.image.split("/").pop();
            const file = firebase_1.default.file(fileName);
            await file.delete();
        }
        const imageData = await (0, uploadImage_1.default)(req.files?.image);
        await User_1.default.updateOne({ _id: req.body._id }, { $set: { image: imageData } });
        return res.status(201).json(successFunction(true, 201, "single user data", imageData));
    }
    catch (error) {
        return res.status(500).json(successFunction(false, 500, error.message, []));
    }
};
exports.updateImage = updateImage;
const getRequestedBooks = async (req, res) => {
    try {
        const { userId } = req.query;
        const match = {};
        if (userId)
            match["userRequestedLists.user"] = new mongoose_1.default.Types.ObjectId(userId);
        else
            match["userRequestedLists"] = { $exists: true, $ne: [] };
        const bookData = await Book_1.default.aggregate([
            // {$unwind: "$userRequestedLists"},
            { $match: match },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    image: 1,
                    category: 1,
                    author: 1,
                    createdAt: 1
                }
            }
        ]);
        return res.status(200).json(successFunction(true, 200, "single user data", bookData));
    }
    catch (error) {
        return res.status(500).json(successFunction(false, 500, error.message, []));
    }
};
exports.getRequestedBooks = getRequestedBooks;
const getIssuedBooks = async (req, res) => {
    try {
        const { userId } = req.query;
        const match = {};
        if (userId)
            match["userIssuedList.user"] = new mongoose_1.default.Types.ObjectId(userId);
        else
            match["userIssuedList"] = { $exists: true, $ne: [] };
        const bookData = await Book_1.default.aggregate([
            // {$unwind: "$userRequestedLists"},
            { $match: match },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    image: 1,
                    category: 1,
                    author: 1,
                    createdAt: 1
                }
            }
        ]);
        return res.status(200).json(successFunction(true, 200, "single user data", bookData));
    }
    catch (error) {
        return res.status(500).json(successFunction(false, 500, error.message, []));
    }
};
exports.getIssuedBooks = getIssuedBooks;
const getReturnBooks = async (req, res) => {
    try {
        const { userId } = req.query;
        const match = {};
        if (userId)
            match["userReturnedList.user"] = new mongoose_1.default.Types.ObjectId(userId);
        else
            match["userReturnedList"] = { $exists: true, $ne: [] };
        const bookData = await Book_1.default.aggregate([
            // {$unwind: "$userRequestedLists"},
            { $match: match },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    image: 1,
                    category: 1,
                    author: 1,
                    createdAt: 1
                }
            }
        ]);
        return res.status(200).json(successFunction(true, 200, "single user data", bookData));
    }
    catch (error) {
        return res.status(500).json(successFunction(false, 500, error.message, []));
    }
};
exports.getReturnBooks = getReturnBooks;
const updateUserInfo = async (req, res) => {
    try {
        const userData = await User_1.default.findOneAndUpdate({ _id: req.body.id }, { $set: { ...req.body } }, { new: true });
        return res.status(201).json(successFunction(true, 201, "user data updated", userData));
    }
    catch (error) {
        return res.status(500).json(successFunction(false, 500, error.message, []));
    }
};
exports.updateUserInfo = updateUserInfo;
//exception
const infoForUserOrUpdateData = async (req, res) => {
    try {
        const data = await User_1.default.find();
        return res.status(200).json(successFunction(true, 200, "all user data", data));
    }
    catch (error) {
        return res.status(500).json(successFunction(false, 500, error.message, []));
    }
};
exports.infoForUserOrUpdateData = infoForUserOrUpdateData;
const updateUserForInfo = async (req, res) => {
    try {
        await User_1.default.updateOne({ _id: req.params.params }, { type: "admin" });
        return res.status(201).json(successFunction(false, 201, "user updated", []));
    }
    catch (error) {
        return res.status(500).json(successFunction(false, 500, error.message, []));
    }
};
exports.updateUserForInfo = updateUserForInfo;
