import { Request, Response } from "express"
import Book from "../schemas/Book"
import uploadImage from "./uploadImage"
import bucket from "./firebase"
import  jwt  from "jsonwebtoken"
import mongoose from "mongoose"

type FunctionSignature = (req: Request, res: Response) => Promise<any>
type JsonResponseSignature = (status: boolean, statusCode: number, message: string, data: any) => object
interface Query { 
     _id: string 
     type: string 
}

const successFunction: JsonResponseSignature = (status, statusbar, message, data = []) => {
     return {status, statusbar, message, data}
}

export const addBook: FunctionSignature = async(req, res) => {
     try {
          const imageUploaded = await uploadImage(req.files?.image)
          await Book.create({...req.body, image: imageUploaded})
          return res.status(201).json(successFunction(true, 201, "book data added", []))
     } catch (error: any) {
          console.log(error);
          return res.status(500).json(successFunction(false, 500, error.message as string, []))
     }
}

export const getAllBooksForTesting: FunctionSignature = async(req, res) => {
     try {
          const bookData = await Book.find()
          return res.status(200).json(successFunction(true, 200, "all book data", bookData))
     } catch (error: any) {
          return res.status(500).json(successFunction(false, 500, error.message as string, []))
     }
}

export const getSingleBook: FunctionSignature = async(req, res) => {
     try {
          const bookData = await Book.aggregate([
               {$match: {_id: new mongoose.Types.ObjectId(req.params.id)}},
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
          ])
          return res.status(200).json(successFunction(true, 200, "single book data", bookData))
     } catch (error: any) {
          return res.status(500).json(successFunction(false, 500, error.message as string, []))
     }
}

export const updateBook: FunctionSignature = async (req, res) => {
     try {
          const {old_image, _id} = req.body
          let imageResponse = old_image
          if(req.files?.new_image) {
               const fileName = old_image.split("/").pop()
               const file = bucket.file(fileName)
               await file.delete()
               imageResponse = await uploadImage(req.files.new_image)
          }
          await Book.updateOne({_id}, {$set: {...req.body, image: imageResponse}})
          return res.status(201).json(successFunction(true, 201, "book updated", []))
     } catch (error: any) {
          return res.status(500).json(successFunction(false, 500, error.message as string, []))
     }
}

export const deleteBook: FunctionSignature = async (req, res) => {
     try {
          const imageData = await Book.findOne({_id: req.params.id}, {image: 1})
          
          const fileName = imageData?.image && imageData.image.split("/").pop()
          if(fileName) {
               const file = bucket.file(fileName)
               await file.delete()
          }
          await Book.deleteOne({_id: req.params.id})
          return res.status(201).json(successFunction(true, 201, "book deleted", []))
     } catch (error: any) {
          return res.status(500).json(successFunction(false, 500, error.message as string, []))
     }
}

export const addComment: FunctionSignature = async (req, res) => {
     try {
          const {comment, _id, user} = req.body
          const parsedToken: any = jwt.verify(user, process.env.JWT_SECRET as string)
          await Book.updateOne({_id}, {
               $addToSet: {
                    comments: {
                         user: parsedToken._id,
                         body: comment,
                         date: new Date()
                    }
               }
          })
          return res.status(201).json(successFunction(true, 201, "comment added", []))
     } catch (error: any) {
          return res.status(500).json(successFunction(false, 500, error.message as string, []))
     }
}

export const addBookToRequest: FunctionSignature = async (req, res) => {
     try {
          const {token, bookId, days} = req.body
          const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET as string)
          const isRequested = await Book.countDocuments({$and: [
               {_id: bookId}, {"userRequestedLists.user": decodedToken._id}
          ]})
          if(isRequested)
               return res.status(401).json(successFunction(false, 401, "You already requested this book.", []))
          await Book.updateOne({_id: bookId}, {
               $addToSet: {
                    userRequestedLists: {
                         user: decodedToken._id,
                         date: new Date(),
                         forHowManyDays: days
                    }
               }
          })
          return res.status(201).json(successFunction(true, 201, "book requested", []))
     } catch (error: any) {
          return res.status(500).json(successFunction(false, 500, error.message as string, []))
     }
}

export const getRequestedBooksWithUsers: FunctionSignature = async (req, res) => {
     try {
          const {_id, type} = req.query as unknown as Query
          const bookDataWithUsers = await Book.aggregate([
               {$match: {_id: new mongoose.Types.ObjectId(_id)}},
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
                                                       cond: {$eq: ["$$userIssuedListValue.user", "$$user._id"]}
                                                  }
                                             }
                                        },
                                        in: {
                                             $cond: {
                                                  if: {$gt: [{$size: "$$userIssuedListData"}, 0]},
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
                                                       cond: {$eq: ["$$returnedBook.user", "$$user._id"]}
                                                  }
                                             }
                                        },
                                        in: {
                                             $cond: {
                                                  if: {$gt: [{$size: "$$takenBookList"}, 0]},
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
                  
          ])
          return res.status(201).json(successFunction(true, 201, "requested book data with users", bookDataWithUsers))
     } catch (error: any) {
          return res.status(500).json(successFunction(false, 500, error.message as string, []))
     }
}

export const acceptRequest: FunctionSignature = async (req, res) => {
     try {
          const {user, book_id} = req.body
          const isExist = await Book.countDocuments({_id: book_id, "userIssuedList.user": user})
          if(isExist) {
               return res.status(403).json(successFunction(true, 403, "request already accepted", []))
          }
          await Book.updateOne({_id: book_id}, {
               $addToSet: {
                    userIssuedList: {
                         user: user,
                         date: new Date()
                    }
               }
          })
          return res.status(201).json(successFunction(true, 201, "request accepted", []))
     } catch (error: any) {
          return res.status(500).json(successFunction(false, 500, error.message as string, []))
     }
} 

export const cancelRequest: FunctionSignature = async (req, res) => {
     try {
          const {user_id, book_id} = req.body
          await Book.updateOne({_id: book_id}, {
               $pull: {
                    userRequestedLists: {user: user_id}
               }
          })
          return res.status(201).json(successFunction(true, 201, "request cancelled", []))
     } catch (error: any) {
          return res.status(500).json(successFunction(false, 500, error.message as string, []))
     }
}

export const takeBackBook: FunctionSignature = async (req, res) =>{
     try {
          const {user, book_id} = req.body
          await Book.updateOne({_id: book_id}, {
               $addToSet: {
                    userReturnedList: {user: user, date: new Date()}
               },
               $pull: {
                    userRequestedLists: {user},
                    userIssuedList: {user}
               }
          })
          return res.status(201).json(successFunction(true, 201, "book taken", []))
     } catch (error: any) {
          return res.status(500).json(successFunction(false, 500, error.message as string, []))
     }
}

export const searchBook: FunctionSignature = async (req, res) => {
     console.log(req.query.search);
     
     try {
          const bookData = await Book.find({
               $or: [
                   { category: { $regex: `.*${req.query.search}.*`, $options: "i" } },
                   { name: { $regex: `.*${req.query.search}.*`, $options: "i" } }
               ]
           });           
          return res.status(201).json(successFunction(true, 201, "book data", bookData))
     } catch (error: any) {
          return res.status(500).json(successFunction(false, 500, error.message as string, []))
     }
}

//exceptional
export const updateBookForTesting: FunctionSignature = async(req, res) => {
     try {
          await Book.deleteOne({_id: req.params.id})
          return res.status(200).json(successFunction(true, 200, "book data deleted", []))
     } catch (error: any) {
          return res.status(500).json(successFunction(false, 500, error.message as string, []))
     }
} 