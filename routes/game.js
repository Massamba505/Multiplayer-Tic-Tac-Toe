const express = require("express");
const router = express.Router();
const path  = require("path");


const verify = (req,res,next)=>{
    if(!req.session.username){
        return res.sendFile(path.join(__dirname,"../","public","index.html"));
    }
    next();
}

router.get("/waiting-room", verify, (req,res)=>{
    res.sendFile(path.join(__dirname,"../","public","waiting_room.html"));
});

router.get("/join", verify, (req,res)=>{
    res.sendFile(path.join(__dirname,"../","public","join.html"));
});

router.get("/play", verify, (req,res)=>{
    res.sendFile(path.join(__dirname,"../","public","play.html"));
});

module.exports = router;
