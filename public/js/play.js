const username = localStorage.getItem("username");
if(!username){
    window.location.href = "/";
}
const code = localStorage.getItem("code");
if(!code){
    window.location.href = "/home";
}
localStorage.removeItem("code");
const socket = io();
let currentplayer = "none";
let my_value = "none";

socket.on("terminate", ({message}) => {
    alert(message);
    window.location.href = "/home";
});

socket.emit("back",{username,code});

socket.on("setup",({players,playing, moves})=>{
    let left = document.getElementById("left");
    let right = document.getElementById("right");
    let my_valueT = document.getElementById("my_value");

    left.textContent = players[0].username;
    right.textContent = players[1].username;

    if(players[0].username == username){
        my_valueT.textContent = players[0].value;
        my_value = players[0].value;
    }
    else{
        my_valueT.textContent = players[1].value;
        my_value = players[1].value;
    }

    currentplayer = playing;
    let what = document.getElementById("what");
    what.textContent = currentplayer;
    console.log(moves);
    start();
});

function start(){
    const all_btn = document.getElementsByClassName("btn");

    for (let col = 0; col < all_btn.length; col++) {
        const btn = all_btn[col];
        btn.addEventListener("click", clicked);

        // Calculate row and column positions
        const currentCol = col % 3;
        const currentRow = Math.floor(col / 3);
        btn.setAttribute("pos", `${currentRow},${currentCol}`);
    }
}

socket.on("player-moved", ({ move }) => {
    currentplayer = currentplayer == "X" ? "O" : "X";
    let what = document.getElementById("what");
    what.textContent = currentplayer;

    const all_btn = document.getElementsByClassName("btn");
    for (let col = 0; col < all_btn.length; col++) {
        const btn = all_btn[col];
        if (btn.getAttribute("pos") == move.where) {
            btn.removeEventListener("click", clicked);
            const span = btn.querySelector('span'); 
            span.textContent = move.value;
        }
    }

    const winner = checkWinner();
    if (winner) {
        if (winner === 'draw') {
            document.getElementById("turn").textContent = `draw 🤝`;
            
        } else {
            document.getElementById("turn").textContent = `🔥 ${winner} wins! 🏆🥇`;
        }

        const all_btn = document.getElementsByClassName("btn");
        for (let col = 0; col < all_btn.length; col++) {
            const btn = all_btn[col];
            btn.removeEventListener("click", clicked);
        }
    }

});

function checkWinner() {
    const all_btn = document.getElementsByClassName("btn");
    const board = Array.from(all_btn).map(btn => btn.querySelector('span').textContent);

    const winningCombinations = [
        // Rows
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        // Columns
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        // Diagonals
        [0, 4, 8],
        [2, 4, 6]
    ];

    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            all_btn[a].classList.add("win");
            all_btn[b].classList.add("win");
            all_btn[c].classList.add("win");
            return board[a];  // Return the winner ('X' or 'O')
        }
    }

    if (board.every(cell => cell)) {
        return "draw"; 
    }

    return null;
}


function clicked(e){
    if(currentplayer != my_value){
        alert("It is not you turn");
        return;
    }
    console.log("clicked a button");
    const btn = e.target;
    const move = {
        who: "",
        where: btn.getAttribute("pos"),
        value:my_value
    }
    socket.emit("move",{move});
}