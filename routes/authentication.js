const User = require ('../models/user');
const jwt = require ('jsonwebtoken');
const config = require('../config/database')

module.exports = (router) => {

    router.post('/register', (req,res) => {
        if (!req.body.email){
            res.json ({
                success: false,
                message: "You must provide an email"
            });}
        else {
            if (!req.body.username){
                res.json ({
                    success: false,
                    message: "You must provide an username"
                });
            }
            else {
                if (!req.body.password){
                    res.json ({
                        success: false,
                        message: "You must provide an password"
                    }); 
                }
                else{
                    let user = new User({
                    email: req.body.email.toLowerCase(),    
                    username: req.body.username.toLowerCase(),
                    password: req.body.password    
                    }); 
                    user.save((err) =>{
                        if (err){
                            if (err.code===11000)
                            {
                                res.json ({
                                    success: false,
                                    message: "username of e-mail is already exist",
                                    err
                                });    
                            }
                            else{
                            if (err.errors){
                                if (err.errors.email)
                                {
                                    res.json({success:false, message: err.errors.email.message});
                                }
                            }
                            else{
                            res.json ({
                                success: false,
                                message: "Not saved",
                                err
                            })};
                            }            
                        } else {
                            res.json ({
                                success: true,
                                message: "saved"
                            });
                        }
                });                   
                }

            }
        }
    });
    router.post('/login', (req, res) => {
        if (!req.body.username){
            res.json({success: false, message: 'No username was provided'});
        } else {
            if (!req.body.password){
                res.json({success: false, message: 'No email was provided'});
            } else {
                User.findOne({username: req.body.username.toLowerCase()}, (err, user) => {
                    if (err){
                        res.json({success: false, message: err});
                    } else {
                        if (!user){
                            res.json({success: false, message: "username not found"});
                        } else {
                            const validPassword = user.comparePassword(req.body.password);
                            if (!validPassword){
                                res.json({success: false, message: "password invalid"});
                            } else {
                                const token = jwt.sign({ userId: user._id }, config.secret, {expiresIn: '24h'});
                                res.json({success: true, message: "success", token: token, user: { username: user.username } });
                            }
                        }
                    }
                });
     }
        }
    })

    router.use((req, res, next) => {
        const token = req.headers['authorization'];
        if (!token) {
            res.json({success: false, message: "no token provided"});
        } else {
            jwt.verify(token, config.secret, (err, decoded) => {
                if (err) {
                   res.json({success: false, message: "Token invalid: " + err});
                } else 
                {
                    req.decoded = decoded;
                    next();
                   }
                });
            }
        });

    router.get('/profile', (req, res) => {
        User.findOne({_id: req.decoded.userId}).select('username email').exec((err, user) => {
            if(err){
                res.json({success: false, message: err});
            } else {
                if (!user){
                    res.json({success: false, message: "User not found"});
                } else {
                    res.json({success: true, user: user});
                }
            }
        });
    });

    router.get('/publicProfile/:username', (req,res) => {
        if (!req.params.username){
            res.json({success: false, message: "no username was provided"});
        } else {
            User.findOne({username: req.params.username}).select('username email').exec((err, user) => {
                if(err){
                    res.json({success: false, message: err});
                } else {
                    if (!user){
                        res.json({success: false, message: "User not found"});
                    } else {
                        res.json({success: true, user: user});
                    }
                }
            });
        }
    });

    return router;
};