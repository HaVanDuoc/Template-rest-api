const express = require("express");
const router = express.Router();
const Post = require("../models/Posts");
const User = require("../models/Users");

// CREATE POST
// http://localhost:1810/api/posts/
router.post("/", async (req, res) => {
    const post = new Post(req.body);
    try {
        const savedPost = await post.save();
        res.status(200).json(savedPost);
    } catch (error) {
        res.status(500).json(error);
    }
});

// READ POST
// http://localhost:1810/api/posts/62fca67f59ed756e64fd85e6
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json(error);
    }
});

// UPDATE POST
// http://localhost:1810/api/posts/62fca67f59ed756e64fd85e6
router.put("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.body.userId) {
            await post.updateOne({ $set: req.body });
            res.status(200).json("The post has been updated");
        } else {
            res.status.apply(403).json("You can update only your post");
        }
    } catch (error) {
        res.status(500).json(error);
    }
});

// DELETE POST
// http://localhost:1810/api/posts/62fca67f59ed756e64fd85e6
router.delete("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.body.userId) {
            await post.deleteOne();
            res.status(200).json("The post has been deleted");
        } else {
            res.status(500).json("You can delete only your post");
        }
    } catch (error) {
        res.status(500).json(error);
    }
});

// LIKE/DISLIKE POST
// http://localhost:1810/api/posts/62fca67f59ed756e64fd85e6/like
router.put("/:id/like", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post.favourites.includes(req.body.userId)) {
            await post.updateOne({ $push: { favourites: req.body.userId } });
            res.status(200).json("The post has been liked");
        } else {
            await post.updateOne({ $pull: { favourites: req.body.userId } });
            res.status(200).json("The post has been disliked");
        }
    } catch (error) {
        res.status(500).json(error);
    }
});

// GET TIMELINE
// http://localhost:1810/api/posts/timeline/62fc6a0c2f532e6ca165214e
router.get("/timeline/:userId", async (req, res) => {
    try {
        const currentUser = await User.findById(req.params.userId);
        const userPosts = await Post.find({ userId: currentUser._id });
        const friendPosts = await Promise.all(
            currentUser.followings.map(async (friendId) => {
                return await Post.find({ userId: friendId });
            })
        );
        res.status(200).json(userPosts.concat(...friendPosts));
    } catch (error) {
        res.status(500).json(error);
    }
});

// GET TIMELINE FOR PROFILE USER
// http://localhost:1810/api/posts/profile/havanduoc
router.get("/profile/:username", async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        const posts = await Post.find({ userId: user._id });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json(error);
    }
});

module.exports = router;
