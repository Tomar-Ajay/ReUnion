const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");

router.put("/:id", async (req,res)=>{
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        if (req.body.password) {
            try {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            } catch(err) {
                return res.status(500).json(err);
            }
        }
        try {
            const user = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body,
            });
            res.status(200).json("User Account Has Been Updated.");
        } catch (err) {
            return res.status(500).json(err);
        }
    } else {
        return res.status(403).json("You Can Update Only Your Account.");
    }
})

router.delete("/:id", async (req,res)=>{
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            res.status(200).json("User Account Has Been Deleted Successfully.");
        } catch (err) {
            return res.status(500).json(err);
        }
    } else {
        return res.status(403).json("You Can Delete Only Your Account.");
    }
})

router.get("/:id", async (req,res)=>{
    try {
        const user = await User.findById(req.params.id);
        const { password, updatedAt, createdAt, isAdmin, __v, ...other } = user._doc;
        res.status(200).json(other);
    } catch (err) {
        return res.status(500).json(err);
    }
})

router.put("/:id/follow", async (req,res)=>{
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);

            if (!user.followers.includes(req.body.userId)){
                await user.updateOne({ $push: { followers: req.body.userId } });
                await currentUser.updateOne({ $push: { followings: req.params.id } });
                res.status(200).json("User Has Been Followed.");
            } else {
                res.status(403).json("You Already Follow This User.");
            }
        } catch (err) {
            return res.status(500).json(err);
        }
    } else {
        return res.status(403).json("You Cannot Follow Yourself.");
    }
})

router.put("/:id/unfollow", async (req,res)=>{
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);

            if (user.followers.includes(req.body.userId)){
                await user.updateOne({ $pull: { followers: req.body.userId } });
                await currentUser.updateOne({ $pull: { followings: req.params.id } });
                res.status(200).json("User Has Been Unfollowed.");
            } else {
                res.status(403).json("You Don't Follow This User.");
            }
        } catch (err) {
            return res.status(500).json(err);
        }
    } else {
        return res.status(403).json("You Cannot Unfollow Yourself.");
    }
})

module.exports = router;