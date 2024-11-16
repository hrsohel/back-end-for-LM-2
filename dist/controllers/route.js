"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("./userController");
const bookController_1 = require("./bookController");
const router = express_1.default.Router();
router.get("/", (req, res) => {
    res.send("Hello world");
});
//user route
router.post("/add-user", userController_1.addUser);
router.get("/get-single-user", userController_1.getSingleUser);
router.post("/update-image", userController_1.updateImage);
router.get("/get-requested-books", userController_1.getRequestedBooks);
router.get("/get-issued-books", userController_1.getIssuedBooks);
router.get("/get-returned-books", userController_1.getReturnBooks);
router.post("/update-user-data", userController_1.updateUserInfo);
//book route
router.post("/add-book", bookController_1.addBook);
router.get("/get-all-books", bookController_1.getAllBooksForTesting);
router.get("/get-single-book/:id", bookController_1.getSingleBook);
router.post("/update-book", bookController_1.updateBook);
router.delete("/delete-book/:id", bookController_1.deleteBook);
router.post("/add-comment", bookController_1.addComment);
router.post("/request-this-book", bookController_1.addBookToRequest);
router.get("/get-requested-users-with-book-data", bookController_1.getRequestedBooksWithUsers);
router.post("/accept-request", bookController_1.acceptRequest);
router.post("/cancel-request", bookController_1.cancelRequest);
router.post("/take-back-book", bookController_1.takeBackBook);
router.get("/search-book", bookController_1.searchBook);
//exceptional
router.get("/info-for-user", userController_1.infoForUserOrUpdateData);
router.post("/update-user/:params", userController_1.updateUserForInfo);
router.post("/login-user", userController_1.loginInUser);
router.post("/update-book-data-for-testing/:id", bookController_1.updateBookForTesting);
exports.default = router;
