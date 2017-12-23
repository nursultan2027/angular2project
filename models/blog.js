var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

let titleLenghtChecker = (title) => {
    if (!title){
        return false;
    } else {
        if (title.lenght<5 || title.lenght>50)
        {
            return false;
        }
        else {
            return true;
        }
    }

};

let alphaNumericTitleChecker = (title) => {
    if (!title){
        return false;
    } else {
        const regExp = new RegExp(/^[a-z0-9-]+$/);
        return regExp.test(title);
    }

};


const titleValidators = [{
    validator: titleLenghtChecker,
    message:'title must be at least 5 but no more than 50'
},
{
    validator: alphaNumericTitleChecker,
    message:'Title must be valid'
}
];

const blogSchema = new Schema({
    title: {
        type:String, 
        required: true,
        validate: titleValidators
    },
    body: {
        type:String, 
        required: true
    },
    createdBy: {
        type:String
    },
    createdAt: {
        type:Date, 
        default:Date.now()
    },
    likes: {
        type: Number, 
        default:0
    },
    likedBy: {
        type: Array,
    },
    dislikes: {
        type:Number, 
        default:0
    },
    dislikedBy: {
        type: Array
    },
    comments: [
        {
            comment: {type:String},
            commentator: {type: String}
        }
    ] 
});

module.exports = mongoose.model('Blog', blogSchema);