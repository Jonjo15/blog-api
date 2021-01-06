var express = require('express');
var router = express.Router();
const Comment = require("../models/comment")
const Post = require("../models/post")
const { body, validationResult } = require("express-validator");

/* GET users listing. */
router.get('/posts', function(req, res, next) {
  Post.find({published: true})
  .populate("author", "first_name family_name email")
  .exec(function (err, list_posts) {
    if (err) { return next(err); }
    //Successful, so render
    res.status(200).json({published_posts: list_posts});
  });
});

router.get("/posts/:postId", (req, res, next) => {
  let data = {}
  Post.findById(req.params.postId)
  .then(post => {
    data.post = post;
    return Comment.find({post: req.params.postId })
  })
  .then(comments => {
    data.comments = comments;
    return res.status(200).json({success: true, post: data.post, comments: data.comments})
  })
  .catch(err => res.status(404).json({success: false, msg:"post doesnt exist"}))
})

router.post("/posts/:postId", [
  body('author', 'Author required').trim().isLength({ min: 1 }).escape(),
  body('body', 'Post Body required').trim().isLength({ min: 1 }).escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.status(401).json({success: false, msg: "input error"})
      return;
    }
    const comment = new Comment({
      author: req.body.author,
      body: req.body.body,
      created_at: Date.now(),
      post: req.params.postId
    })

    comment.save()
    .then((com) => {
      return Post.findByIdAndUpdate(req.params.postId,  {$inc: {comment_count: 1}})
    })
    .then((post) => {
      return res.status(200).json({success: true, msg: "Comment saved and comment count incremented"})
    })
    .catch(err => {
      res.status(401).json({success: false, msg: "Something went wrong"})
    })
    // Promise.all([
    //   comment.save(),
    //   Post.findByIdAndUpdate(req.params.postId, { published: true})
    // ]).then( ([ user, member ]) => {
    //   console.log( util.format( "user=%O member=%O", user, member ) );
    // });
  }
])

router.get("/posts/:postId/comments", (req, res, next) => {
  Comment.find({post: req.params.postId }, 'author body')
      .populate("post")
      .exec(function (err, list_comments) {
        if (err) { return next(err); }
        //Successful, so render
        res.status(200).json({comments: list_comments});
      });
})
module.exports = router;
