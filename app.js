window.onload = restart("graph-image", "./images/graph-image.gif");

function restart(id, url) {
    // restart the gif
    var img = document.getElementById(id);
    img.src = "";
    img.src = url + "?a=" + Math.random();
};

function shrink_nav() {
    var x = document.getElementById("menu-bar");
    if (x.className === "menu-bar") {
        x.className += " responsive";
    } else {
        x.className = "menu-bar";
    }
}
