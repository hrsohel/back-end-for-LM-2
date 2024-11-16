declare module "express-session" {
     interface SessionData {
          userToken: string
     }
}

import User from "../schemas/User";
import bcrypt from "bcryptjs"
import {Request, Response} from "express"
import jwt from "jsonwebtoken";
import { getRandom8DigitNumber } from "./mischalleneous";
import bucket from "./firebase";
import uploadImage from "./uploadImage";
import Book from "../schemas/Book";
import mongoose from "mongoose";

type FunctionSignature = (req: Request, res: Response) => Promise<any>
type JsonResponseSignature = (status: boolean, statusCode: number, message: string, data: any) => object
interface Query { userId: string; }

const successFunction: JsonResponseSignature = (status, statusbar, message, data = []) => {
     return {status, statusbar, message, data}
}

export const addUser: FunctionSignature = async (req, res) => {
     try {
          const {email, password} = req.body.formData
          const existUser = await User.countDocuments({email})
          if(existUser > 0) 
               return res.status(409).json({status: false, statusCode: 409, message: "User with this email already exists! Please try a different one.", data: []})
          const hashedpassword = await bcrypt.hash(password, 10)
          await User.create({...req.body.formData, password: hashedpassword, userId: getRandom8DigitNumber()})
          return res.status(201).json({status: true, statusCode: 201, message: "User created successfully", data: []})
     } catch (error: any) {
          return res.status(500).json({status: false, statusCode: 500, message: error.message, data: []})
     }
}

export const loginInUser: FunctionSignature = async (req, res) => {
     try {
          const {email, password} = req.body
          const existUser = await User.findOne({email: email})
          if(!existUser) 
               return res.status(409).json(successFunction(false, 409, "User with this email does not exist!", []))
          const verifiedPassword = await bcrypt.compare(password, existUser.password)
          if(!verifiedPassword) 
               return res.status(401).json(successFunction(false, 401, "Wrong password", []))
          const token = jwt.sign(
               {_id: existUser._id, type: existUser.type, userId: existUser.userId}, 
               process.env.JWT_SECRET as string
          )
          return res.status(200).json(successFunction(true, 200, "User signed in.", {token}))
     } catch (error: any) {
          return res.status(500).json(successFunction(false, 500, error.message as string, []))
     }
}

export const getSingleUser: FunctionSignature = async (req, res) => {
     try {
          const {id, userId} = req.query
          let userData
          if(id) userData =  await User.findOne({ _id: id  }, {password: 0})
          else if (userId) userData = await User.findOne({ userId }, {password: 0})
          return res.status(200).json(successFunction(true, 200, "single user data", userData))
     } catch (error: any) {
          return res.status(500).json(successFunction(false, 500, error.message as string, []))
     }
}

export const updateImage: FunctionSignature = async (req, res) => {
     try {
        const userImage = await User.findOne({_id: req.body._id}, {image: 1})
        if(userImage?.image) {
          const fileName = userImage.image.split("/").pop()
          const file = bucket.file(fileName as string)
          await file.delete()
        }
        const imageData = await uploadImage(req.files?.image)
        await User.updateOne({_id: req.body._id}, {$set: {image: imageData}})
        return res.status(201).json(successFunction(true, 201, "single user data", imageData))
     } catch (error: any) {
          return res.status(500).json(successFunction(false, 500, error.message as string, []))
     }
}

export const getRequestedBooks: FunctionSignature = async (req, res) => {
     try {
          const {userId} = req.query as unknown as Query
          const match: {[key: string]: any} = {}
          if(userId)
               match["userRequestedLists.user"] = new mongoose.Types.ObjectId(userId)
          else 
               match["userRequestedLists"] = {$exists: true, $ne: []}
          const bookData = await Book.aggregate([
               // {$unwind: "$userRequestedLists"},
               {$match: match},
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
          ])
          return res.status(200).json(successFunction(true, 200, "single user data", bookData))
     } catch (error: any) {
          return res.status(500).json(successFunction(false, 500, error.message as string, []))
     }
}

export const getIssuedBooks: FunctionSignature = async (req, res) => {
     try {
          const {userId} = req.query as unknown as Query
          const match: {[key: string]: any} = {}
          if(userId)
               match["userIssuedList.user"] = new mongoose.Types.ObjectId(userId)
          else 
               match["userIssuedList"] = {$exists: true, $ne: []}
          const bookData = await Book.aggregate([
               // {$unwind: "$userRequestedLists"},
               {$match: match},
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
          ])
          return res.status(200).json(successFunction(true, 200, "single user data", bookData))
     } catch (error: any) {
          return res.status(500).json(successFunction(false, 500, error.message as string, []))
     }
}

export const getReturnBooks: FunctionSignature = async (req, res) => {
     try {
          const {userId} = req.query as unknown as Query
          const match: {[key: string]: any} = {}
          if(userId)
               match["userReturnedList.user"] = new mongoose.Types.ObjectId(userId)
          else 
               match["userReturnedList"] = {$exists: true, $ne: []}
          const bookData = await Book.aggregate([
               // {$unwind: "$userRequestedLists"},
               {$match: match},
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
          ])
          return res.status(200).json(successFunction(true, 200, "single user data", bookData))
     } catch (error: any) {
          return res.status(500).json(successFunction(false, 500, error.message as string, []))
     }
}

export const updateUserInfo: FunctionSignature = async (req, res) => {
     try {
          const userData = await User.findOneAndUpdate({_id: req.body.id}, {$set: {...req.body}}, {new: true})
          
          return res.status(201).json(successFunction(true, 201, "user data updated", userData))
     } catch (error: any) {
          return res.status(500).json(successFunction(false, 500, error.message as string, []))
     }
}

//exception
export const infoForUserOrUpdateData: FunctionSignature = async (req, res) => {
     try {
          const data = await User.find()
          return res.status(200).json(successFunction(true, 200, "all user data", data))
     } catch (error: any) {
          return res.status(500).json(successFunction(false, 500, error.message, []))
     }
}

export const updateUserForInfo: FunctionSignature = async (req, res) => {
     try {
          await User.updateOne({_id: req.params.params}, {type: "admin"})
          return res.status(201).json(successFunction(false, 201, "user updated", []))
     } catch (error: any) {
          return res.status(500).json(successFunction(false, 500, error.message as string, []))
     }
}
