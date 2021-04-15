var socket = io();
let ul = document.getElementById("notificationMain");
let deleteAll = document.getElementById("deleteNotifications");

function createNotifications() {
  socket.on("dept completed", (msg) => {
    msg = "One " + msg;
    let li = document.createElement("li");
    li.innerText = msg;
    let p = document.createElement("p");
    let time = moment().format("llll");
    p.innerText = time;
    li.appendChild(p);
    ul.appendChild(li);
    try {
      document.getElementById("notification").muted = false;
      document.getElementById("notification").play();
    } catch (error) {
      alert("click somewhere on the page to get notification sound");
    }
  });
}

createNotifications();
