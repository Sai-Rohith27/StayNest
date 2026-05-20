const mongoose=require("mongoose");
const schema=mongoose.Schema;

const reviewschema=new schema(
    {
        comment:{
            type:String,
            required:true,
            trim:true,
            minlength:12,
            maxlength:500
        },
        rating:{
            type:Number,
            min:1,
            max:5,
            required:true
        },
        photoUrls:[
            {
                type:String,
                trim:true
            }
        ],
        createdAt:{
            type:Date,
            default:Date.now
        },
        author:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    }
);
module.exports=mongoose.model("Review",reviewschema);
