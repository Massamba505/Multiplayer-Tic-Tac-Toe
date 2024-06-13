const express = require("express");
const router = express.Router();
const path  = require("path");

const verify = (req,res,next)=>{
    if(!req.session.username){
        return res.sendFile(path.join(__dirname,"../","public","index.html"));
    }
    next();
}

router.get("/",(req,res)=>{
    res.sendFile(path.join(__dirname,"../","public","index.html"));
});

router.get("/home", verify, (req,res)=>{
    res.sendFile(path.join(__dirname,"../","public","home.html"));
});

// =====================
router.post("/home", (req,res)=>{
    const {username} = req.body;

    if(!username){
        res.status(401).json({"message": "Invalid username"});
    }
    req.session.username = username;
    res.sendStatus(200);
});

router.get("/username", (req,res)=>{
    if(!req.session.username){
        return res.status(401).json({
            status:401,
            "message": "Invalid username"
        });
    }
    res.status(200).json({
        status:200,
        "username":req.session.username
    });
});


module.exports = router;
