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

// FOLLOW USER
// http://localhost:1810/api/users/62fc6a0c2f532e6ca165214e/follow
router.put("/:id/follow", async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);

            if (!user.followers.includes(req.body.userId)) {
                await user.updateOne({ $push: { followers: req.body.userId } });
                await currentUser.updateOne({
                    $push: { followings: req.params.id },
                });
                res.status(200).json("You has been followed");
            } else {
                res.status(403).json("You already follow this user");
            }
        } catch (error) {
            res.status(500).json(error);
        }
    } else {
        res.status(500).json("You can't follow yourself");
    }
});

// UNFOLLOW USER
// http://localhost:1810/api/users/62fc6a0c2f532e6ca165214e/unfollow
router.put("/:id/unfollow", async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);

            if (user.followers.includes(req.body.userId)) {
                await user.updateOne({ $pull: { followers: req.body.userId } });
                await currentUser.updateOne({
                    $pull: { followings: req.params.id },
                });
                res.status(200).json("You has been unfollowed");
            } else {
                res.status(403).json("You already unfollow this user");
            }
        } catch (error) {
            res.status(500).json(error);
        }
    } else {
        res.status(500).json("You can't follow yourself");
    }
});


module.exports = router