import express, { Request, Response } from "express";
import {
     addUser, getIssuedBooks, getRequestedBooks, getReturnBooks, getSingleUser, 
     infoForUserOrUpdateData, loginInUser, 
     updateImage, 
     updateUserForInfo,
     updateUserInfo
} from "./userController"
import { acceptRequest, addBook, addBookToRequest, addComment, cancelRequest, deleteBook, getAllBooksForTesting, getRequestedBooksWithUsers, getSingleBook, searchBook, takeBackBook, updateBook, updateBookForTesting } from "./bookController";

const router = express.Router()

router.get("/", (req: Request, res: Response) => {
     res.send("Hello world!!")
})
//user route
router.post("/add-user", addUser)
router.get("/get-single-user", getSingleUser)
router.post("/update-image", updateImage)
router.get("/get-requested-books", getRequestedBooks)
router.get("/get-issued-books", getIssuedBooks)
router.get("/get-returned-books", getReturnBooks)
router.post("/update-user-data", updateUserInfo)

//book route
router.post("/add-book", addBook)
router.get("/get-all-books", getAllBooksForTesting)
router.get("/get-single-book/:id", getSingleBook)
router.post("/update-book", updateBook)
router.delete("/delete-book/:id", deleteBook)
router.post("/add-comment", addComment)
router.post("/request-this-book", addBookToRequest)
router.get("/get-requested-users-with-book-data", getRequestedBooksWithUsers)
router.post("/accept-request", acceptRequest)
router.post("/cancel-request", cancelRequest)
router.post("/take-back-book", takeBackBook)
router.get("/search-book", searchBook)

//exceptional
router.get("/info-for-user", infoForUserOrUpdateData)
router.post("/update-user/:params", updateUserForInfo)
router.post("/login-user", loginInUser)
router.post("/update-book-data-for-testing/:id", updateBookForTesting)

export default router  
