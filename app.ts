import express, { Application } from "express"
import router from "./controllers/route"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import cors from "cors"
import helmet from "helmet"
import compression from "compression"
import session from "express-session"
import mongoose from "mongoose"
import dotenv from "dotenv"
import expressFileUpload from "express-fileupload"
dotenv.config()

const app: Application = express()

mongoose.connect(process.env.MONGODB_URL as string)
.then(() => console.log("Database connected."))
.catch((error: any) => console.error(error.message))

app.use(cors({
     origin: ["http://localhost:3000", "https://library-management-2-black.vercel.app", "https://back-end-for-lm-2-5yck.vercel.app"],
     credentials: true,
     methods: ["GET", "POST", "PUT", "DELETE"],
     allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin", "X-Auth-Token", "X-CSRF-Token"],
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(expressFileUpload())
app.use(cookieParser())
app.use(helmet())
app.use(compression())
app.use(session({ 
     secret: process.env.SESSION_SECRET as string,
     resave: false,
     saveUninitialized: true,
     cookie: {secure: false, httpOnly: true}
}))
app.use("/api", router)

app.listen(process.env.PORT as string, () => console.log(`Server running on http://localhost:${process.env.PORT}`))