const username = localStorage.getItem("username");
if (!username) {
    window.location.href = "/";
}

const socket = io();

const container = document.getElementsByClassName("container")[0];
const what = localStorage.getItem("what");

socket.on("user-left", ({ message, players }) => {
    alert(message);
    container.innerHTML = "";
    players.forEach(element => {
        insert(element.username);
    });
});


socket.on("play-game", () => {
    let count = 5;
    const timerElement = document.getElementById("time");

    const countdown = setInterval(() => {
        timerElement.textContent = count;
        count--;

        if (count < 0) {
            clearInterval(countdown);

            localStorage.removeItem("what");
            socket.emit("coming-back", {});
            window.location.href = "/game/play";
        }
    }, 1000);
    
    socket.on("stop",()=>{
        clearInterval(countdown);
    });
});

socket.on("all-players", ({ players }) => {
    container.innerHTML = "";
    players.forEach(element => {
        insert(element.username);
    });
});

socket.on("full", () => {
    alert("Game Room is full");
    window.location.href = "/game/join";
});

socket.on("code", (data) => {
    document.getElementById("code").textContent = data.code;
    localStorage.setItem("code", data.code);
});

function create_new_game() {
    socket.emit("create-game", { username });
    insert(username);
    localStorage.setItem("what", "new-game");
}

function join_game() {
    const code = localStorage.getItem("code");
    if (!code) {
        window.location.href = "/game/join";
    }
    socket.emit("join-game", { code, username });
    document.getElementById("code").textContent = code;
}

function insert(username) {
    const userdiv = document.createElement("div");
    userdiv.classList.add("user");
    userdiv.textContent = username;
    if (userdiv.textContent.length > 15) {
        userdiv.textContent = username.substring(0, 15) + "...";
    }
    container.appendChild(userdiv);
}

if (what == "join-game" || what == "new-game") {
    if (what == "new-game" && container.childNodes.length == 1) {
        create_new_game();
    } else {
        join_game();
    }
}
else {
    create_new_game();
}
