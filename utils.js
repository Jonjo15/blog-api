var jwt = require('jsonwebtoken');
var token = jwt.sign({ foo: 'bar' }, 'shhhhh');
require("dotenv").config()
const issueJWT = (user) => {
    const id = user._id
    const expiresIn = "1d"

    const payload = {
        sub: id,
        iat: Date.now()
    }
    // const signedToken = jwt.sign(payload, process.env.SECRET_KEY, {expiresIn, algorithm: "RS256"})
    let token = jwt.sign(payload, process.env.SECRET_KEY);
    return {
        token: "Bearer " + token,
        expires: expiresIn
    }
}

module.exports.issueJWT = issueJWT