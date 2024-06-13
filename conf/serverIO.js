const socketIO = require("socket.io");

function generateRandomLetters() {
    let letters = '';
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * alphabet.length);
      letters += alphabet[randomIndex];
    }
    return letters;
}
function removePlayerFromGame(code, socketId) {
    if (all_active_games[code]) {
        // Remove the player from the players array
        all_active_games[code].players = all_active_games[code].players.filter(player => player.socket !== socketId);
  
        // Optionally, you can check if the players array is empty and perform further actions
        if (all_active_games[code].players.length === 0) {
            delete all_active_games[code]; // Remove the game if no players are left
        }
    }
}

const all_active_games = []


function serverIO(server){
    const io = socketIO(server);

    io.on("connection",(socket)=>{
        let code = generateRandomLetters();
        console.log(`user connected and has code ${code}`);
        
        socket.on("create-game",({username})=>{
            all_active_games[code] = {
                players:[
                    {
                        socket:socket.id,
                        username
                    }
                ],
                moves:[]
            }

            socket.username = username;
            console.log(all_active_games);

            socket.join(code);
            socket.emit("code",{code:code});
        });

        socket.on("check",({code})=>{
            if(!all_active_games[code]){
                socket.emit("invalid-code",{});
            }
            else{
                socket.emit("valid-code",{});
            }
        });

        socket.on("join-game",(data)=>{
            code = data.code;

            if(all_active_games[code] && all_active_games[code].players.length == 2){
                socket.emit("full",{});
                return;
            }
            socket.join(code);


            all_active_games[code].players.push(
                {
                    socket:socket.id,
                    username:data.username
                }
            );
            socket.username = data.username;

            console.log(all_active_games);

            io.to(code).emit("newplayer",
                {
                    players:all_active_games[code].players
                }
            );
            
            if(all_active_games[code] && all_active_games[code].players.length == 2){
                io.to(code).emit("play-game",{});
                all_active_games[code].players.forEach(player => {
                    player.socket = "no-one";
                });
                return;
            }
        });

        // ================
        socket.on("back",({username,code})=>{
            let all_back = true;
            if(all_active_games[code]){
                all_active_games[code].players.forEach(player => {
                    if(player.username == username){
                        player.socket = socket.id
                    }
                    if(player.socket == "no-one"){
                        all_back = false;
                    }
                });
                socket.join(code);
                socket.username = username;
                console.log("My name is " + socket.username + " and I am back!!!!");
                if(all_back == true){
                    const players = all_active_games[code].players;
                    io.to(code).emit("everyone",{players});
                }
            }
        });

        socket.on("coming-back",()=>{
            socket.what = "coming-back";
        });

        socket.on("disconnect",()=>{
            if(!all_active_games[code]){
                return;
            }

            if(socket.what == "coming-back"){

                return;
            }

            console.log("user disconnected");
            removePlayerFromGame(code,socket.id);
            console.log(all_active_games);
            
            if(all_active_games[code]){
                io.to(code).emit("user-left",
                    {
                        message:`${socket.username} disconnected`,
                        players:all_active_games[code].players
                    }
                );
            }
        });

    });

    return io;

}


module.exports = serverIO;