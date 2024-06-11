const express = require("express");
const PORT = process.env.PORT || 3000;
const app = express();
const path = require("path")

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(express.static(path.join(__dirname,"public")));

app.get("/",(req,res)=>{
    res.send("hello");
})

app.listen(PORT,()=>{
    console.log(`server running on ${PORT}`);
})