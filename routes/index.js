var express = require('express');
var router = express.Router();
const User = require("../models/user")
const bcrypt = require("bcryptjs")
const utils = require("../utils")
const { body, validationResult } = require("express-validator");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({"message": "hi"});
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

// user
//       .save()
//       .then(user => {
//         let tokenObject = utils.issueJWT(user)
//         return res.json({success: true, user,token: tokenObject.token, expiresIn: tokenObject.expires, msg: "user created"})
//       })
//       .catch(err => {
//         return res.json({success: false, msg: "failed to create user"})
//       })
// .save(function(err, user) {
//   if (err) { 
//     return res.json({success: false, msg: "failed to create user"})
//   }
//   else {
//     const tokenObject = utils.issueJWT(user)
//     return res.json({success: true, user,token: tokenObject.token, expiresIn: tokenObject.expires, msg: "user created"})
//   }
// });
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