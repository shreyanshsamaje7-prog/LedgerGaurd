const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const emailService = require("../services/email.service")
const tokenBlackListModel = require("../models/blackList.model")

/**
* - user register controller
* - POST /api/auth/register
*/
async function userRegisterController(req, res) {
    const { email, password, name, isSystemUser, systemUserKey } = req.body

    const isExists = await userModel.findOne({
        email: email
    })

    if (isExists) {
        return res.status(422).json({
            message: "User already exists with email.",
            status: "failed"
        })
    }

    // Validate System User Key if user chose System User role
    let shouldBeSystemUser = false;
    if (isSystemUser) {
        const expectedKey = process.env.SYSTEM_USER_KEY || "Ledger123";
        if (!systemUserKey || systemUserKey.trim() !== expectedKey) {
            return res.status(403).json({
                message: "Invalid System User Key. Authorization failed.",
                status: "failed"
            });
        }
        shouldBeSystemUser = true;
    }

    const user = await userModel.create({
        email, 
        password, 
        name,
        systemUser: shouldBeSystemUser
    })

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" })

    res.cookie("token", token)

    res.status(201).json({
        user: {
            _id: user._id,
            email: user.email,
            name: user.name,
            systemUser: !!user.systemUser
        },
        token
    })

    await emailService.sendRegistrationEmail(user.email, user.name)
}

/**
 * - User Login Controller
 * - POST /api/auth/login
  */

async function userLoginController(req, res) {
    const { email, password } = req.body

    const user = await userModel.findOne({ email }).select("+password +systemUser")

    if (!user) {
        return res.status(401).json({
            message: "Email or password is INVALID"
        })
    }

    const isValidPassword = await user.comparePassword(password)

    if (!isValidPassword) {
        return res.status(401).json({
            message: "Email or password is INVALID"
        })
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" })

    res.cookie("token", token)

    res.status(200).json({
        user: {
            _id: user._id,
            email: user.email,
            name: user.name,
            systemUser: !!user.systemUser
        },
        token
    })

}


/**
 * - User Logout Controller
 * - POST /api/auth/logout
  */
async function userLogoutController(req, res) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[ 1 ]

    if (!token) {
        return res.status(200).json({
            message: "User logged out successfully"
        })
    }



    await tokenBlackListModel.create({
        token: token
    })

    res.clearCookie("token")

    res.status(200).json({
        message: "User logged out successfully"
    })

}

async function getMeController(req, res) {
    res.status(200).json({
        user: {
            _id: req.user._id,
            email: req.user.email,
            name: req.user.name,
            systemUser: !!req.user.systemUser
        }
    })
}

module.exports = {
    userRegisterController,
    userLoginController,
    userLogoutController,
    getMeController
}