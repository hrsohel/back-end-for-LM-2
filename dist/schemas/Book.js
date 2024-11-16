"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const BookSchema = new mongoose_1.Schema({
    bookId: {
        type: Number
    },
    name: {
        type: String,
        required: [true, "Book name is required."],
        trim: true,
        index: true
    },
    image: {
        type: String,
        default: null
    },
    category: {
        type: String,
        trim: true,
        required: [true, "Book category is required."],
        index: true,
        match: [/^[A-Za-z\s]+$/, "Category should only contain letters and spaces."]
    },
    author: {
        type: String,
        required: [true, "Book author is required."],
        index: true,
    },
    comments: [
        {
            user: { type: mongoose_1.Types.ObjectId },
            body: { type: String, trim: true },
            date: { type: Date }
        }
    ],
    userRequestedLists: [
        {
            user: { type: mongoose_1.Types.ObjectId },
            date: { type: Date },
            forHowManyDays: {
                type: Number,
                requied: [true, "Please enter for how many days the user is taking this book."]
            }
        }
    ],
    userIssuedList: [
        {
            user: { type: mongoose_1.Types.ObjectId },
            date: { type: Date }
        }
    ],
    userReturnedList: [
        {
            user: { type: mongoose_1.Types.ObjectId },
            date: { type: Date }
        }
    ],
    description: {
        type: String,
        trim: true
    }
}, { timestamps: true });
BookSchema.pre("save", function (next) {
    if (this.comments && this.comments.length > 10) {
        this.comments = this.comments.slice(-10);
    }
    next();
});
const Book = (0, mongoose_1.model)("Book", BookSchema);
exports.default = Book;
