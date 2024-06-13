const frmName = document.getElementById("frmName");
frmName.addEventListener("submit",(e)=>{
    e.preventDefault();
    
    let code = document.getElementById("code").value;
    if(!code || !code.trim() || code.trim().length != 6){
        alert("Invalid Code");
        return;
    }

    const socket = io();
    socket.emit("check",{code});
    
    socket.on("invalid-code",()=>{
        alert("Invalid Code");
        return;
    });

    socket.on("valid-code",()=>{
        localStorage.setItem("code",code.trim());
        localStorage.setItem("what","join-game");
        window.location.href = "/game/waiting-room";
    });
});