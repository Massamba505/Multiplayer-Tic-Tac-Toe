const express = require("express");
const PORT = process.env.PORT || 3000;
const app = express();
const path = require("path");
const session = require("express-session");

const http = require("http");

const indexRouter = require("./routes/index");
const gameRouter = require("./routes/game");

const server = http.createServer(app);
const serverIO = require("./conf/serverIO2.js");
const io = serverIO(server);

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(express.static(path.join(__dirname,"public")));

const sessionMiddleware = session({
    secret:"my_secret_key",
    resave:false,
    saveUninitialized:false,
    expires: 60 * 60 * 1000 // 1hr
});

app.use(sessionMiddleware);

app.use("/",indexRouter);
app.use("/game",gameRouter);


server.listen(PORT,()=>{
    console.log(`server running on ${PORT}`);
});