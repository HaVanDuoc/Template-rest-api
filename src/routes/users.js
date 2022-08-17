const express = require('express')
const router = express.Router()
const User = require('../models/Users')

// GET USER
// http://localhost:1810/api/users?userId=62fc5fc2942bd5fe14cbd81b
// http://localhost:1810/api/users?userName=havanduoc
router.get("/", async (req, res) => {
    const userId = req.query.userId;
    const userName = req.query.userName;
    try {
        const user = userId
            ? await User.findById(userId)
            : await User.findOne({ username: userName });
        const { password, updateAt, ...other } = user._doc;
        res.status(200).json(other);
    } catch (error) {
        res.status(500).json(error);
    }
});

// UPDATE USER
// http://localhost:1810/api/users/62fc5fc2942bd5fe14cbd81b
router.put("/:id", async (req, res) => {
    if (req.body.userId === req.params.id) {
        if (req.body.password) {
            try {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            } catch (error) {
                return res.status(500).json(error);
            }
        }
        try {
            const user = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body,
            });
            res.status(200).json("Account has been updated");
        } catch (error) {
            return res.status(500).json(error);
        }
    } else {
        return res.status(403).json("You can update only your account");
    }
});

// DELETE USER
router.delete("/:id", async (req, res) => {
    if (req.body.userId === req.params.id) {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            res.status(200).json("Account has been deleted");
        } catch (error) {
            return res.status(500).json(error);
        }
    } else {
        return res.status(403).json("You can delete only your account");
    }
});


module.exports = router