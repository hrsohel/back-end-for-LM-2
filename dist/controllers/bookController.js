"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBookForTesting = exports.searchBook = exports.takeBackBook = exports.cancelRequest = exports.acceptRequest = exports.getRequestedBooksWithUsers = exports.addBookToRequest = exports.addComment = exports.deleteBook = exports.updateBook = exports.getSingleBook = exports.getAllBooksForTesting = exports.addBook = void 0;
const Book_1 = __importDefault(require("../schemas/Book"));
const uploadImage_1 = __importDefault(require("./uploadImage"));
const firebase_1 = __importDefault(require("./firebase"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const successFunction = (status, statusbar, message, data = []) => {
    return { status, statusbar, message, data };
};
const addBook = async (req, res) => {
    try {
        const imageUploaded = await (0, uploadImage_1.default)(req.files?.image);
        await Book_1.default.create({ ...req.body, image: imageUploaded });
        return res.status(201).json(successFunction(true, 201, "book data added", []));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(successFunction(false, 500, error.message, []));
    }
};
exports.addBook = addBook;
const getAllBooksForTesting = async (req, res) => {
    try {
        const bookData = await Book_1.default.find();
        return res.status(200).json(successFunction(true, 200, "all book data", bookData));
    }
    catch (error) {
        return res.status(500).json(successFunction(false, 500, error.message, []));
    }
};
exports.getAllBooksForTesting = getAllBooksForTesting;
const getSingleBook = async (req, res) => {
    try {
        const bookData = await Book_1.default.aggregate([
            { $match: { _id: new mongoose_1.default.Types.ObjectId(req.params.id) } },
            {
                $lookup: {
                    from: "users",
                    localField: "comments.user",
                    foreignField: "_id",
                    as: "userData"
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    category: 1,
                    image: 1,
                    description: 1,
                    author: 1,
                    comments: 1,
                    "userData._id": 1,
                    "userData.image": 1,
                    "userData.fullName": 1,
                    // isUserRequestedThisBook
                }
            }
        ]);
        return res.status(200).json(successFunction(true, 200, "single book data", bookData));
    }
    catch (error) {
        return res.status(500).json(successFunction(false, 500, error.message, []));
    }
};
exports.getSingleBook = getSingleBook;
const updateBook = async (req, res) => {
    try {
        const { old_image, _id } = req.body;
        let imageResponse = old_image;
        if (req.files?.new_image) {
            const fileName = old_image.split("/").pop();
            const file = firebase_1.default.file(fileName);
            await file.delete();
            imageResponse = await (0, uploadImage_1.default)(req.files.new_image);
        }
        await Book_1.default.updateOne({ _id }, { $set: { ...req.body, image: imageResponse } });
        return res.status(201).json(successFunction(true, 201, "book updated", []));
    }
    catch (error) {
        return res.status(500).json(successFunction(false, 500, error.message, []));
    }
};
exports.updateBook = updateBook;
const deleteBook = async (req, res) => {
    try {
        const imageData = await Book_1.default.findOne({ _id: req.params.id }, { image: 1 });
        const fileName = imageData?.image && imageData.image.split("/").pop();
        if (fileName) {
            const file = firebase_1.default.file(fileName);
            await file.delete();
        }
        await Book_1.default.deleteOne({ _id: req.params.id });
        return res.status(201).json(successFunction(true, 201, "book deleted", []));
    }
    catch (error) {
        return res.status(500).json(successFunction(false, 500, error.message, []));
    }
};
exports.deleteBook = deleteBook;
const addComment = async (req, res) => {
    try {
        const { comment, _id, user } = req.body;
        const parsedToken = jsonwebtoken_1.default.verify(user, process.env.JWT_SECRET);
        await Book_1.default.updateOne({ _id }, {
            $addToSet: {
                comments: {
                    user: parsedToken._id,
                    body: comment,
                    date: new Date()
                }
            }
        });
        return res.status(201).json(successFunction(true, 201, "comment added", []));
    }
    catch (error) {
        return res.status(500).json(successFunction(false, 500, error.message, []));
    }
};
exports.addComment = addComment;
const addBookToRequest = async (req, res) => {
    try {
        const { token, bookId, days } = req.body;
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const isRequested = await Book_1.default.countDocuments({ $and: [
                { _id: bookId }, { "userRequestedLists.user": decodedToken._id }
            ] });
        if (isRequested)
            return res.status(401).json(successFunction(false, 401, "You already requested this book.", []));
        await Book_1.default.updateOne({ _id: bookId }, {
            $addToSet: {
                userRequestedLists: {
                    user: decodedToken._id,
                    date: new Date(),
                    forHowManyDays: days
                }
            }
        });
        return res.status(201).json(successFunction(true, 201, "book requested", []));
    }
    catch (error) {
        return res.status(500).json(successFunction(false, 500, error.message, []));
    }
};
exports.addBookToRequest = addBookToRequest;
const getRequestedBooksWithUsers = async (req, res) => {
    try {
        const { _id, type } = req.query;
        const bookDataWithUsers = await Book_1.default.aggregate([
            { $match: { _id: new mongoose_1.default.Types.ObjectId(_id) } },
            {
                $lookup: {
                    from: "users",
                    localField: `${type}.user`,
                    foreignField: "_id",
                    as: "requestedUsers"
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    image: 1,
                    category: 1,
                    author: 1,
                    createdAt: 1,
                    description: 1,
                    requestedUsers: {
                        $map: {
                            input: "$requestedUsers",
                            as: "user",
                            in: {
                                _id: "$$user._id",
                                fullName: "$$user.fullName",
                                email: "$$user.email",
                                phone: "$$user.phone",
                                address: "$$user.address",
                                image: "$$user.image",
                                days: {
                                    $let: {
                                        vars: {
                                            matchedUserList: {
                                                $filter: {
                                                    input: `$userRequestedLists`,
                                                    as: "listItem",
                                                    cond: { $eq: ["$$listItem.user", "$$user._id"] }
                                                }
                                            }
                                        },
                                        in: {
                                            $cond: {
                                                if: { $gt: [{ $size: "$$matchedUserList" }, 0] },
                                                then: { $arrayElemAt: ["$$matchedUserList.forHowManyDays", 0] },
                                                else: null
                                            }
                                        }
                                    }
                                },
                                requestedDate: {
                                    $let: {
                                        vars: {
                                            matchForDate: {
                                                $filter: {
                                                    input: `$${type}`,
                                                    as: "value",
                                                    cond: { $eq: ["$$value.user", "$$user._id"] }
                                                }
                                            }
                                        },
                                        in: {
                                            $cond: {
                                                if: { $gt: [{ $size: "$$matchForDate" }, 0] },
                                                then: { $arrayElemAt: ["$$matchForDate.date", 0] },
                                                else: null
                                            }
                                        }
                                    }
                                },
                                accepted: {
                                    $let: {
                                        vars: {
                                            userIssuedListData: {
                                                $filter: {
                                                    input: "$userIssuedList",
                                                    as: "userIssuedListValue",
                                                    cond: { $eq: ["$$userIssuedListValue.user", "$$user._id"] }
                                                }
                                            }
                                        },
                                        in: {
                                            $cond: {
                                                if: { $gt: [{ $size: "$$userIssuedListData" }, 0] },
                                                then: true,
                                                else: false
                                            }
                                        }
                                    }
                                },
                                taken: {
                                    $let: {
                                        vars: {
                                            takenBookList: {
                                                $filter: {
                                                    input: "$userReturnedList",
                                                    as: "returnedBook",
                                                    cond: { $eq: ["$$returnedBook.user", "$$user._id"] }
                                                }
                                            }
                                        },
                                        in: {
                                            $cond: {
                                                if: { $gt: [{ $size: "$$takenBookList" }, 0] },
                                                then: true,
                                                else: false
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                }
            }
        ]);
        return res.status(201).json(successFunction(true, 201, "requested book data with users", bookDataWithUsers));
    }
    catch (error) {
        return res.status(500).json(successFunction(false, 500, error.message, []));
    }
};
exports.getRequestedBooksWithUsers = getRequestedBooksWithUsers;
const acceptRequest = async (req, res) => {
    try {
        const { user, book_id } = req.body;
        const isExist = await Book_1.default.countDocuments({ _id: book_id, "userIssuedList.user": user });
        if (isExist) {
            return res.status(403).json(successFunction(true, 403, "request already accepted", []));
        }
        await Book_1.default.updateOne({ _id: book_id }, {
            $addToSet: {
                userIssuedList: {
                    user: user,
                    date: new Date()
                }
            }
        });
        return res.status(201).json(successFunction(true, 201, "request accepted", []));
    }
    catch (error) {
        return res.status(500).json(successFunction(false, 500, error.message, []));
    }
};
exports.acceptRequest = acceptRequest;
const cancelRequest = async (req, res) => {
    try {
        const { user_id, book_id } = req.body;
        await Book_1.default.updateOne({ _id: book_id }, {
            $pull: {
                userRequestedLists: { user: user_id }
            }
        });
        return res.status(201).json(successFunction(true, 201, "request cancelled", []));
    }
    catch (error) {
        return res.status(500).json(successFunction(false, 500, error.message, []));
    }
};
exports.cancelRequest = cancelRequest;
const takeBackBook = async (req, res) => {
    try {
        const { user, book_id } = req.body;
        await Book_1.default.updateOne({ _id: book_id }, {
            $addToSet: {
                userReturnedList: { user: user, date: new Date() }
            },
            $pull: {
                userRequestedLists: { user },
                userIssuedList: { user }
            }
        });
        return res.status(201).json(successFunction(true, 201, "book taken", []));
    }
    catch (error) {
        return res.status(500).json(successFunction(false, 500, error.message, []));
    }
};
exports.takeBackBook = takeBackBook;
const searchBook = async (req, res) => {
    console.log(req.query.search);
    try {
        const bookData = await Book_1.default.find({
            $or: [
                { category: { $regex: `.*${req.query.search}.*`, $options: "i" } },
                { name: { $regex: `.*${req.query.search}.*`, $options: "i" } }
            ]
        });
        return res.status(201).json(successFunction(true, 201, "book data", bookData));
    }
    catch (error) {
        return res.status(500).json(successFunction(false, 500, error.message, []));
    }
};
exports.searchBook = searchBook;
//exceptional
const updateBookForTesting = async (req, res) => {
    try {
        await Book_1.default.deleteOne({ _id: req.params.id });
        return res.status(200).json(successFunction(true, 200, "book data deleted", []));
    }
    catch (error) {
        return res.status(500).json(successFunction(false, 500, error.message, []));
    }
};
exports.updateBookForTesting = updateBookForTesting;
