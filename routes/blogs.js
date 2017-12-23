const User = require ('../models/user');
const Blog = require ('../models/blog');
const jwt = require ('jsonwebtoken');
const config = require('../config/database');

module.exports = (router) => {
    router.post('/newBlog', (req, res) => {
        if(!req.body.title){
            res.json({ success: false, message: 'Blog title is required'});
        } else {
            if (!req.body.body) {
                res.json({ success: false, message: 'Blog body is required'});
            } else {
                if (!req.body.createdBy) {
                    res.json({ success: false, message: 'Blog cretor is required'});
                } else {
                    const blog = new Blog({
                        title: req.body.title,
                        body: req.body.body,
                        createdBy: req.body.createdBy
                    })
                    blog.save((err) => {
                        if(err) {
                            if (err.errors) {
                                if (err.errors.title) {
                                    res.json({success: false, message: err.errors.title.message});
                                } else {
                                    if (err.errors.body) {
                                        res.json({success: false, message: err.errors.body.message});
                                    } else {
                                        res.json({success: false, message: err.errmsg});
                                    }
                                }
                            } else {
                                res.json({ success: false, message: err});
                            }
                        } else {
                            res.json({ success: true, message: 'Blog saved'});
                        }
                    });
                }
            }
        }
    });
    router.get('/allBlogs', (req, res) => {
        Blog.find({}, (err, blogs) => {
            if (err) {
                res.json({ success: false, message: err});
            } else {
                if (!blogs){
                    res.json({ success: false, message: "no Blogs Found"});
                } else {
                    res.json({ success: true, blogs: blogs});
                }
            }
        }).sort({'_id': -1});
    })
    router.get('/singleBlog/:id', (req, res) => {
        if (!req.params.id){
            res.json({ success: false, message: 'no ID' });
        } else {
            Blog.findOne({ _id: req.params.id}, (err, blog) => {
                if (err) {
                    res.json({ success: false, message: 'not a valid blog id' });
                } else {
                    if (!blog){
                        res.json({ success: false, message: "no Blogs Found"});
                    } else {
                        User.findOne({_id: req.decoded.userId }, (err, user) => {
                            if (err){
                                res.json({ success: false, message: err});
                            } else {
                                if (!user){
                                    res.json({ success: false, message: "Unable to authenticate user"});
                                } else {
                                    if (user.username !== blog.createdBy) {
                                        res.json({ success: false, message: "You are not authorized to edit this blog post"});
                                    } else {
                                        res.json({ success: true, blog: blog});
                                    }
                                }
                            }
                        });
                    }
                }
            });
        }
    });
    
    router.put('/updateBlog', (req, res) => {
        if (!req.body._id) {
            res.json({ success: false, message: "no Blog id provided"});
        } else {
            Blog.findOne({_id: req.body._id }, (err, blog) => {
                if (err) {
                    res.json({ success: false, message: "not a valid blog id"});
                } else {
                    if (!blog) {
                        res.json({ success: false, message: "Blog id was not found"}); 
                    } else {
                        User.findOne({_id: req.decoded.userId }, (err, user) => {
                            if (err) {
                                res.json({ success: false, message: err});
                            } else {
                                if (!user) {
                                    res.json({ success: false, message: "Unable to authenticate user"});
                                } else {
                                    if (user.username !== blog.createdBy) {
                                        res.json({ success: false, message: "You are not authorized to edit this blog post"});
                                    } else {
                                        blog.title = req.body.title;
                                        blog.body = req.body.body;
                                        blog.save((err) => {
                                            if(err){
                                                res.json({ success: false, message: err});
                                            } else {
                                                res.json({ success: true, message: "Blogs updated"});
                                            }
                                        });
                                    }
                                }
                            }
                        })
                    }
                }
            })
        }
    });

    router.delete('/deleteBlog/:id', (req,res) => {
        if (!req.params.id)
        {
            res.json({ success: false, message: "No id provided"});
        } else {
            Blog.findOne({ _id: req.params.id}, (err, blog) => {
                if (err){
                    res.json({ success: false, message: "invalid id"});                
                } else {
                    if (!blog) {
                        res.json({ success: false, message: "Blog was not Found"});
                    } else {
                        User.findOne({_id: req.decoded.userId}, (err, user) => {
                            if (err) {
                                res.json({ success: false, message: err});
                            } else {
                                if (!user) {
                                    res.json({ success: false, message: "Unable to authenticate user"});
                                } else {
                                    if (user.username !== blog.createdBy) {
                                        res.json({ success: false, message: "You are not authorized"});
                                    } else {
                                        blog.remove((err) => {
                                            if (err) {
                                                res.json({ success: false, message: err});
                                            } else {
                                                res.json({ success: true, message: "Blogs deleted"});
                                            }
                                        });
                                    }
                                }
                            }
                        })
                    }
                }
            });
        }
    });

    router.put('/likeBlog', (req, res) => {
        if(!req.body.id) {
            res.json({ success: false, message: "No id was provided"});
        } else {
            Blog.findOne({ _id: req.body.id}, (err, blog) => {
                if(err) {
                    res.json({ success: false, message: "Invalid blog id"});
                } else {
                    if(!blog) {
                        res.json({ success: false, message: "Blog not found"});
                    } else {
                        User.findOne({ _id: req.decoded.userId}, (err, user) => { 
                            if (err) {
                                res.json({ success: false, message: "Smthg wrong"});
                            } else {
                                if (!user) {
                                    res.json({ success: false, message: "Could not authenticate User"});
                                } else {
                                    if (user.username === blog.createdBy) {
                                        res.json({ success: false, message: "Cann't like your own post"});
                                    } else {
                                        if (blog.likedBy.includes(user.username)) {
                                            res.json({ success: false, message: "you already liked this post"});
                                        } else {
                                            if (blog.dislikedBy.includes(user.username)) {
                                                blog.dislikes--;
                                                const arrayIndex = blog.dislikedBy.indexOf(user.username);
                                                blog.dislikedBy.splice(arrayIndex,1);
                                                blog.likes++;
                                                blog.likedBy = blog.likedBy.concat([user.username]);
                                                blog.save((err) => {
                                                    if (err) {
                                                        res.json({ success: false, message: "smthg wrong"});
                                                    } else {
                                                        res.json({ success: true, message: "Blog liked!"});
                                                    }
                                                });
                                            } else {
                                                blog.likes++;
                                                blog.likedBy = blog.likedBy.concat([user.username]);
                                                blog.save((err) => {
                                                    if (err) {
                                                        res.json({ success: false, message: "smthg wrong"});
                                                    } else {
                                                        res.json({ success: true, message: "Blog liked!"});
                                                    }
                                                });
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
            });
        }
    });

    router.put('/dislikeBlog', (req, res) => {
        if(!req.body.id) {
            res.json({ success: false, message: "No id was provided"});
        } else {
            Blog.findOne({ _id: req.body.id}, (err, blog) => {
                if(err) {
                    res.json({ success: false, message: "Invalid blog id"});
                } else {
                    if(!blog) {
                        res.json({ success: false, message: "Blog not found"});
                    } else {
                        User.findOne({ _id: req.decoded.userId}, (err, user) => { 
                            if (err) {
                                res.json({ success: false, message: "Smthg wrong"});
                            } else {
                                if (!user) {
                                    res.json({ success: false, message: "Could not authenticate User"});
                                } else {
                                    if (user.username === blog.createdBy) {
                                        res.json({ success: false, message: "Cann't dislike your own post"});
                                    } else {
                                        if (blog.dislikedBy.includes(user.username)) {
                                            res.json({ success: false, message: "you alredy disliked this post"});
                                        } else {
                                            if (blog.likedBy.includes(user.username)) {
                                                blog.likes--;
                                                const arrayIndex = blog.likedBy.indexOf(user.username);
                                                blog.likedBy.splice(arrayIndex,1);
                                                blog.dislikes++;
                                                blog.dislikedBy = blog.dislikedBy.concat([user.username]);
                                                blog.save((err) => {
                                                    if (err) {
                                                        res.json({ success: false, message: "smthg wrong"});
                                                    } else {
                                                        res.json({ success: true, message: "Blog disliked!"});
                                                    }
                                                });
                                            } else {
                                                blog.dislikes++;
                                                blog.dislikedBy = blog.dislikedBy.concat([user.username]);
                                                blog.save((err) => {
                                                    if (err) {
                                                        res.json({ success: false, message: "smthg wrong"});
                                                    } else {
                                                        res.json({ success: true, message: "Blog disliked!"});
                                                    }
                                                });
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
            });
        }
    });

    router.post('/comment',(req, res) => {
        if (!req.body.comment) {
            res.json({ success: false, message: "No comment provided"});
        } else {
            if (!req.body.id) {
                res.json({ success: false, message: "No id was provided"});
            } else {
                Blog.findOne({_id: req.body.id }, (err,blog) => {
                    if (err) {
                        res.json({ success: false, message: err});
                    } else {
                        if (!blog) {
                            res.json({ success: false, message: "Blog not found"});
                        } else {
                            User.findOne({_id: req.decoded.userId }, (err, user) => {
                                if (err) {
                                    res.json({ success: false, message: err});
                                } else {
                                    if (!user) {
                                        res.json({ success: false, message: 'User not found'});
                                    } else {
                                        blog.comments = blog.comments.concat([{
                                            comment: req.body.comment,
                                            commentator: user.username
                                        }]);
                                        blog.save((err) =>{
                                            if (err) {
                                                res.json({ success: false, message: err});
                                            } else {
                                                res.json({ success: true, message: 'comment saved'});
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    }
                });
            }
        }
    });
    return router;
};