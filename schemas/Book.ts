import {Schema, model, Document, Types} from "mongoose"

interface BookT extends Document {
     name: string,
     image: any,
     category: string,
     author: string,
     comments?: Array<{
          user: Types.ObjectId,
          body: string,
          date: Date
     }>,
     userRequestedLists?: Array<{
          user: Types.ObjectId,
          date: Date
          forHowManyDays: Number
     }>,
     userIssuedList?: Array<{
          user: Types.ObjectId,
          date: Date
     }>,
     userReturnedList?: Array<{
          user: Types.ObjectId,
          date: Date
     }>,
     description? :string
}

const BookSchema: Schema = new Schema({
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
               user: {type: Types.ObjectId},
               body: {type: String, trim: true},
               date: {type: Date}
          }
     ],
     userRequestedLists: [
          {
               user: {type: Types.ObjectId},
               date: {type: Date},
               forHowManyDays: {
                    type: Number, 
                    requied: [true, "Please enter for how many days the user is taking this book."]
               }
          }
     ],
     userIssuedList: [
          {
               user: {type: Types.ObjectId},
               date: {type: Date}
          }
     ],
     userReturnedList: [
          {
               user: {type: Types.ObjectId},
               date: {type: Date}
          }
     ],
     description: {
          type: String,
          trim: true
     }
}, {timestamps: true})

BookSchema.pre<BookT>("save", function (next) {
     if (this.comments && this.comments.length > 10) {
       this.comments = this.comments.slice(-10);
     }
     next();
   });

const Book = model<BookT>("Book", BookSchema)

export default Book