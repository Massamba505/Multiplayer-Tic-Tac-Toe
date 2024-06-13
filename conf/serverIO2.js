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

function removePlayerFromGame(code, username) {
    if (all_active_games[code]) {
        // Remove the player from the players array
        all_active_games[code].players = all_active_games[code].players.filter(player => player.username !== username);

        // Optionally, you can check if the players array is empty and perform further actions
        if (all_active_games[code].players.length === 0) {
            delete all_active_games[code]; // Remove the game if no players are left
        }
    }
}

const all_active_games = {};

function serverIO(server) {
    const io = socketIO(server);

    io.on("connection", (socket) => {
        console.log(`user connected: ${socket.id}`);

        socket.on("create-game", ({ username }) => {
            let code = generateRandomLetters();
            all_active_games[code] = {
                players: [
                    {
                        username,
                        value: "X",
                        socket: socket.id
                    }
                ],
                moves: []
            };

            socket.join(code);
            socket.username = username;
            socket.gameCode = code;

            console.log(`Created room code: ${code}: ${JSON.stringify(all_active_games[code].players)}`);
            socket.emit("code", { code: code });
        });

        socket.on("check", ({ code }) => {
            if (!all_active_games[code]) {
                socket.emit("invalid-code", {});
            } else {
                socket.emit("valid-code", {});
            }
        });

        socket.on("join-game", (data) => {
            const code = data.code;
            if (!all_active_games[code]) {
                socket.emit("invalid-code", {});
                return;
            }

            if (all_active_games[code].players.length >= 2) {
                socket.emit("full", {});
                return;
            }

            all_active_games[code].players.push(
                {
                    username: data.username,
                    value: "O",
                    socket: socket.id
                }
            );

            socket.join(code);
            socket.username = data.username;
            socket.gameCode = code;

            console.log(`Joined room code: ${code}: ${JSON.stringify(all_active_games[code].players)}`);

            io.to(code).emit("all-players", { players: all_active_games[code].players });

            if (all_active_games[code].players.length === 2) {
                io.to(code).emit("play-game", {});
            }
        });

        socket.on("coming-back", () => {
            socket.what = "coming-back";
        });

        socket.on("back", ({ username, code }) => {
            let all_back = true;
            if (all_active_games[code]) {
                all_active_games[code].players.forEach(player => {
                    if (player.username == username) {
                        player.socket = socket.id;
                    }
                    if (player.socket === "socket") {
                        all_back = false;
                    }
                });
                socket.join(code);
                socket.username = username;
                socket.gameCode = code;
                socket.what = "start";
                console.log("My name is " + socket.username + " and I am back!!!!");
                if (all_back) {
                    let type = ["X","O"];
                    const randomIndex = Math.floor(Math.random() * type.length);
                    let playing = type[randomIndex];
                    const players = all_active_games[code].players;
                    io.to(code).emit("setup", { players, playing,moves:all_active_games[code]["moves"]});
                }
            }
        });
// ==========================moves=================================
        socket.on("move",({move})=>{
            move["who"] = socket.username;
            all_active_games[socket.gameCode].moves.push(move);
            io.to(socket.gameCode).emit("player-moved",{move});
        });



        socket.on("disconnect", () => {
            console.log("user disconnected: " + socket.id);
            
            if (socket.what == "coming-back") {
                console.log("User is in coming-back state, not removing from game");
                return;
            }

            if (socket.gameCode && socket.username) {
                io.to(socket.gameCode).emit("stop",{});
                removePlayerFromGame(socket.gameCode, socket.username);
                if(socket.what == "start"){
                    io.to(socket.gameCode).emit("terminate",{message: `${socket.username} disconnected`});
                }
                else if (all_active_games[socket.gameCode]) {
                    io.to(socket.gameCode).emit("user-left", {
                        message: `${socket.username} disconnected`,
                        players: all_active_games[socket.gameCode].players
                    });
                }
            }
        });
    });

    return io;
}

module.exports = serverIO;
