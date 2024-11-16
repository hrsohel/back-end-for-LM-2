"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
var UserType;
(function (UserType) {
    UserType["User"] = "user";
    UserType["Admin"] = "admin";
    UserType["SuperAdmin"] = "super-admin";
})(UserType || (UserType = {}));
const UserSchema = new mongoose_1.Schema({
    userId: {
        type: Number
    },
    fullName: {
        type: String,
        trim: true,
        required: [true, "Fullname is required."],
        minlength: [5, "Fullname must be at least 5 characters long."],
        match: [/^[A-Za-z\s]+$/, "Fullname should only contain letters and spaces"]
    },
    email: {
        type: String,
        trim: true,
        required: [true, "Eamil is required."],
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address."],
        index: true
    },
    password: {
        type: String,
        required: [true, "Password is required."],
        minlength: [5, "Password must be at least 5 characters long."],
    },
    phone: {
        type: String,
        trim: true,
        required: [true, "Phone is required."],
        minlength: [11, "Phone number must be 11 characters long."],
        maxlength: [11, "Phone number should not be more than 11 characters long."]
    },
    type: {
        type: String,
        enum: Object.values(UserType),
        default: UserType.User
    },
    postCode: {
        type: String,
        match: [/^[0-9]+$/, "Post code must be numbers."],
        required: [true, "Post code is required"]
    },
    address: {
        type: String,
        trim: true,
        required: [true, "Address is required."],
    },
    image: {
        type: String,
        default: null
    }
}, { timestamps: true });
const User = (0, mongoose_1.model)("User", UserSchema);
exports.default = User;