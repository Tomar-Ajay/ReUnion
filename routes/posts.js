const Post = require("../models/Post");
const User = require("../models/User");
const router = require("express").Router();

router.post("/", async (req,res)=>{
    const newPost = new Post(req.body);
    try {
        const savedPost = await newPost.save();
        const { userId, updatedAt, __v, ...other } = savedPost._doc;
        res.status(200).json(other);
    } catch(err) {
        return res.status(500).json(err);
    }
})

router.put("/:id", async (req,res)=>{
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.body.userId) {
            await post.updateOne( { $set: req.body } );
            res.status(200).json("The Post Has Been Updated.")
        } else {
            res.status(403).json("You Can Update Only Your Post.")
        }
    } catch(err) {
        return res.status(500).json(err);
    }
})

router.delete("/:id", async (req,res)=>{
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.body.userId) {
            await post.deleteOne();
            res.status(200).json("The Post Has Been Deleted.")
        } else {
            res.status(403).json("You Can Delete Only Your Post.")
        }
    } catch(err) {
        return res.status(500).json(err);
    }
})

router.put("/:id/like", async (req,res)=>{
    try {
        const post = await Post.findById(req.params.id);
        if (!post.likes.includes(req.body.userId)) {
            await post.updateOne( { $push: { likes: req.body.userId } } );
            res.status(200).json("The Post Has Been Liked.")
        } else {
            await post.updateOne( { $pull: { likes: req.body.userId } } );
            res.status(200).json("The Post Has Been Disliked.")
        }
    } catch(err) {
        return res.status(500).json(err);
    }
})

router.put("/:id/comment", async (req,res)=>{
    try {
        const post = await Post.findById(req.params.id);
        await post.update( { $push: { comments: req.body.comments } } );
        res.status(200).json(post);
    } catch(err) {
        return res.status(500).json(err);
    }
})

router.get("/:id", async (req,res)=>{
    try {
        const post = await Post.findById(req.params.id);
        res.status(200).json(post);
    } catch(err) {
        return res.status(500).json(err);
    }
})

router.get("/timeline/all", async (req,res)=>{
    try {
        const currentUser = await User.findById(req.body.userId);
        const userPosts = await Post.find( { userId: currentUser._id } );
        const friendPosts = await Promise.all(
            currentUser.followings.map((friendId) => {
                return Post.find( { userId: friendId } );
            })
        );

        const allPosts = userPosts.concat(...friendPosts);
        // for increasing 
        allPosts.sort( (a,b) => a.createdAt > b.createdAt ? 1 : -1 );
        // for decreasing 
        // allPosts.sort( (a,b) => a.createdAt > b.createdAt ? -1 : 1 );
        
        res.status(200).json(allPosts);
    } catch(err) {
        return res.status(500).json(err);
    }
})

module.exports = router;