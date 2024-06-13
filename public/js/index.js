const frmName = document.getElementById("frmName");

frmName.addEventListener("submit",(e)=>{
    e.preventDefault();
    const username = document.getElementById("username").value;

    if(!username || !username.trim()){
        alert("Enter your username");
        return;
    }
    fetch("/home",{
        method: "POST",
        headers:{
            "Content-Type" : "application/json",
        },
        body:JSON.stringify({
            username
        })
    })
    .then(data=>{
       if (data.status == 200) {
            window.location.href = "/home";
       }
       else {
            return response.json().then(data => {
                alert(data.message);
            });
        }
    })
    .catch(err=>{
        console.log(err);
    });
    localStorage.getItem("username",username);
});
