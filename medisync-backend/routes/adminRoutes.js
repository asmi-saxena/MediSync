const express = require("express");
const router = express.Router();
const User = require("../models/User");

// GET all users
router.get("/users", async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST new user (Admin adds a user)
router.post("/users", async (req, res) => {
    const newUser = new User({
        username: req.body.username,
        role: req.body.role,
        password: req.body.password, // Note: Hash password in real applications
    });

    try {
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
