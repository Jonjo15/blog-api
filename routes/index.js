var express = require('express');
var router = express.Router();
const User = require("../models/user")
const Post = require("../models/post")
const Comment = require("../models/comment")
const bcrypt = require("bcryptjs")
const passport = require("passport")
const utils = require("../utils")
const { body, validationResult } = require("express-validator");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({"message": "hi"});
});

router.get("/protected", passport.authenticate('jwt', { session: false }), (req, res, next) => {
  res.status(200).json({ success: true, msg: req.user});
});

router.post("/register", [
  body('first_name', 'First Name required').trim().isLength({ min: 1 }).escape(),
  body('family_name', 'Family Name required').trim().isLength({ min: 1 }).escape(),
  body('email', 'Email required').trim().isLength({ min: 1 }).escape(),
  body("email","Email Addres must be valid").normalizeEmail().isEmail(),
  body('password', 'Password required').trim().isLength({ min: 4 }).escape(),

  (req, res, next) => {

    const errors = validationResult(req);

    
    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.status(401).json({success: false, msg: "input error"})
      return;
    }
    bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
      // if err, do something
      // otherwise, store hashedPassword in DB
      const user = new User({
        first_name: req.body.first_name,
        family_name: req.body.family_name,
        email: req.body.email,
        password: hashedPassword,
      })
      try {
    
        user.save()
            .then((user) => {
              let tokenObject = utils.issueJWT(user)
              return res.json({success: true, user, token: tokenObject.token, expiresIn: tokenObject.expires, msg: "user created"})
            });

      } catch (err) {
        
        res.json({ success: false, msg: err });
    
      }

      
    });
}]);

router.post("/login", (req, res, next) => {
  User.findOne({email: req.body.email})
  .then(user => {
    if (!user) {
      return res.status(401).json({success: false, msg: "couldn't find the user"})
    }
    bcrypt.compare(req.body.password, user.password, (err, result) => {
      if (result) {
        const tokenObject = utils.issueJWT(user)

        res.status(200).json({success: true,user, token: tokenObject.token, expiresIn: tokenObject.expires })
      }
      else {
        res.status(401).json({success: false, msg: "wrong password"})
      }
    })
  })
  .catch(err => {
    next(err)
  })
})

router.post("/posts", passport.authenticate('jwt', { session: false }), [


  body('title', 'Title required').trim().isLength({ min: 1 }).escape(),
  body('body', 'Post Body required').trim().isLength({ min: 1 }).escape(),

  (req, res, next) => {

    const errors = validationResult(req);

    
    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.status(401).json({success: false, msg: "input error"})
      return;
    }
      const post = new Post({
        title: req.body.title,
        body: req.body.body,
        published: false,
        created_at: Date.now(),
        comment_count: 0,
        author: req.user._id
      })
      try {
        post.save()
            .then((post) => {
              return res.json({success: true, post, msg: "post created"})
            });

      } catch (err) {
        
        res.json({ success: false, msg: err });
    
      }
}])

router.get("/posts", passport.authenticate('jwt', { session: false }), (req, res, next) => {
  Post.find({}, 'title body published comment_count')
      .populate('author')
      .exec(function (err, list_posts) {
        if (err) { return next(err); }
        //Successful, so render
        res.status(200).json({posts: list_posts});
      });
})

router.put("/posts/:postId", passport.authenticate('jwt', { session: false }), (req, res, next) => {
  Post.findByIdAndUpdate(req.params.postId, { published: true}, function updateUser(err) {
    if (err) {return next(err)}
    res.json({success: true, msg: "Blog post published"})
    })
})

router.delete("/posts/:postId", passport.authenticate('jwt', { session: false }) , (req, res, next) => {
  Post.findByIdAndRemove(req.params.postId, function deletePost (err) {
    if (err) { return next(err); }
    res.status(200).json({success: true, msg: "post deleted successfully"})
  })

})

router.delete("/posts/:postId/comments/:commentId", passport.authenticate('jwt', { session: false }), (req, res, next) => {
  Comment.findByIdAndRemove(req.params.commentId)
  .then(() => {
    return Post.findByIdAndUpdate(req.params.postId,  {$inc: {comment_count: -1}})
  })
  .then(() => {
    return res.status(200).json({success: true, msg: "Comment saved and comment count decremented"})
  })
  .catch(err => {
    res.status(401).json({success: false, msg: "Something went wrong"})
  })
})
// router.get("/posts/:postId/comments", )
module.exports = router;

// bcrypt.compare(password, user.password, (err, res) => {
//   if (res) {
//     // passwords match! log user in
//     return done(null, user)
//   } else {
//     // passwords do not match!
//     return done(null, false, {msg: "Incorrect password"})
//   }
// })
// return done(null, user);