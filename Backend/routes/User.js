const express=require("express");
const router=express.Router();
const User=require("../models/User");
const passport = require("passport");
router.get("/signup",(req,res)=>{
        res.send("Heloo");
});
router.post("/signup",async(req,res)=>{
    let{username,email,password}=req.body;
    try{
        if (!username || !email || !password) {
            return res.status(400).json({error:"Username, email, and password are required"});
        }

        const  newUser=new User({email,username});
        const registeredUser = await User.register(newUser, password);
        res.status(201).json({
            message:"User registered successfully. Please login to continue.",
            user: registeredUser.username
        });
    }catch(err){
        console.log(err);
        const statusCode = err.name === "UserExistsError" ? 409 : 500;
        res.status(statusCode).json({error:err.message || "An error occurred during registration"});
    }
})

router.get("/me", (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({error:"Not logged in"});
    }

    res.json({user:req.user.username});
});

router.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return next(err);
        }

        if (!user) {
            return res.status(401).json({
                error: info?.message || "Invalid username or password"
            });
        }

        req.login(user, (loginErr) => {
            if (loginErr) {
                return next(loginErr);
            }

            res.json({message:"Logged in successfully", user:req.user.username});
        });
    })(req, res, next);
});

router.post("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }

        res.json({message:"Logged out successfully"});
    });
});

module.exports=router;
