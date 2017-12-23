var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

let emailLenghtChecker = (email) => {
    if (!email){
        return false;
    } else {
        if (email.lenght<5 || email.lenght>30)
        {
            return false;
        }
        else {
            return true;
        }
    }

};

let emailValidChecker = (email) => {
    if (!email){
        return false;
    } else {
        const regExp = new RegExp(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/);
        return regExp.test(email);
    }

};


const emailValidators = [{
    validator: emailLenghtChecker,
    message:'E-mail must be at least 5 but no more than 30'
},
{
    validator: emailValidChecker,
    message:'E-mail must be valid'
}
];

const userSchema = new Schema({
    email: { type: String, required:true, unique: true,  lowercase: true, validate: emailValidators},
    username: { type: String, required:true, unique: true,  lowercase: true},
    password: { type: String, required:true}
});

userSchema.pre('save', function (next){
    if (!this.isModified('password'))
        return next();
    bcrypt.hash(this.password, null, null, (err, hash) =>{
        if (err) return next();
        this.password = hash;
        next();
    })
});

userSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};
module.exports = mongoose.model('User', userSchema);