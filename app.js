function restart(id, url) {
    // restart the gif
    var img = document.getElementById(id);
    img.src = "";
    img.src = url + "?a=" + Math.random();
}

window.onload = restart("graph-image", "./images/graph-image.gif")