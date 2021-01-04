const jwt = require("jsonwebtoken")

function issueJWT(user) {
    const id = user._id
    const expiresIn = "1d"

    const payload = {
        sub: id,
        iat: Date.now()
    }
    const signedToken = jwt.sign(payload, process.env.SECRET_KEY, {expiresIn, algorithm: "RS256"})

    return {
        token: "Bearer " + signedToken,
        expires: expiresIn
    }
}

module.exports.issueJWT = issueJWT