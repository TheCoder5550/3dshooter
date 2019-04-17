//Aceer

var camera = {x: 0, y: 0, z: 0};
var cameraRot = {x: 0, y: 0, z: 0};
var player = {x: Math.random() * 5000 - 2500, y: 0, z: Math.random() * 5000 - 2500, vx: 0, vy: 0, vz: 0, speed: 10, speedChange: 0, rotY: 0, health: 100, isDead: false, name: "UNKNOWN"};
var inGame = false;
var myId = Math.round(Math.random() * 100000);
var bullets = [];

var mobileCheck = function() {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};

var keys = [];
keys["shift"] = false;
var lastTouch = {x: 0, y: 0};
var joyStick = {x: 0, y: 0, inited: false};
var isMobile = mobileCheck();

var planes = [];
var collisionBoxes = [];
var headCollisionBoxes = [];
var bodyCollisionBoxes = [];

var t = 0;

var simpleFPS;
var scene;
var camera;
var titleDiv;
var playerName;
var joinGameButton;
var hand;
var hitmark;
var blood;
var fpsCounter;
var healthBar;
var blackScreen;
var ui;
var mainSocket;
var connectedPlayers = [];
var remotePlayers = [];

var hitSoundEffect = new Audio();

window.onload = function() {
    simpleFPS = new SimpleFPS(false);
    scene = document.getElementById("scene");
    camera = document.getElementById("camera");
    titleDiv = document.getElementById("titleDiv");
    playerName = document.getElementById("playerName");
    joinGameButton = document.getElementById("joinGame");
    hand = document.getElementById("hand");
    hitmark = document.getElementById("hitmark");
    blood = document.getElementById("blood");
    fpsCounter = document.getElementById("fps");
    healthBar = document.getElementById("healthbar");
    blackScreen = document.getElementById("blackscreen");
    ui = document.getElementById("UI");

    hitSoundEffect.src = "./assets/hit.mp3";

    generateWorld(isMobile);
    shadePlanes();

    loop();
    function loop() {
        if (inGame) {
            playerControlls();

            for (var i = 0; i < remotePlayers.length; i++) {
                var p = remotePlayers[i];
                if (p.data.ownData.id != myId)
                    p.run();
            }

            for (var i = 0; i < bullets.length; i++) {
                bullets[i].run();
            }

            for (var i = 0; i < planes.length; i++) {
                var p = planes[i];
                if (p.pos != p.lastPos || p.rot != p.lastRot) {
                    p.element.style.transform = "translate3d(" + p.pos.x + "px," + p.pos.y + "px," + p.pos.z + "px)" +
                                                "rotateX(" + p.rot.x + "deg) rotateY(" + p.rot.y + "deg) rotateZ(" + p.rot.z + "deg)";
                    
                    p.lastPos = Object.assign({}, p.pos);
                    p.lastRot = Object.assign({}, p.rot);
                }
            }
        }
        else {
            camera.x = Math.cos(t / 200) * 1500;
            camera.z = Math.sin(t / 200) * 1500;
            camera.y = 500;
            cameraRot.y = (t / 200) / Math.PI * 180 + 90;
            cameraRot.x = -25;
        }

        updateCameraTransform();

        t++;
        simpleFPS.update();
        if (t % 10 == 0)
            fpsCounter.innerHTML = "FPS: " + simpleFPS.FPS;
        requestAnimationFrame(loop);
    }

    document.onkeydown = function(e) {
        keys[e.key.toLowerCase()] = true;
        if (e.key == "Shift") player.speed = 20;
    }
    document.onkeyup = function(e) {
        keys[e.key.toLowerCase()] = false;
    }

    document.body.onmousedown = function() {
        if (inGame && !player.isDead) {
            document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock;
            document.body.requestPointerLock();

            bullets.push(new Bullet());

            var offset = 0;
            var handInterval = setInterval(function() {
                offset -= 400;
                if (offset <= -2000) {
                    clearInterval(handInterval);
                    offset = 0;
                }
                hand.style.backgroundPositionX = offset + "px";
            }, 100);
        }
    }
    document.body.onmousemove = function(e) {
        cameraRot.y += e.movementX / 7;
        cameraRot.x -= e.movementY / 7;
    }
    document.addEventListener("touchstart", function(e) {
        lastTouch.x = e.touches[0].pageX;
        lastTouch.y = e.touches[0].pageY;

        joyStick.x = e.touches[0].pageX;
        joyStick.y = e.touches[0].pageY;

        isMobile = true;
    });
    document.addEventListener("touchmove", function(e) {
        if (e.touches[0].pageX < window.innerWidth / 2) {
            var a = Math.atan2(joyStick.y - e.touches[0].pageY, joyStick.x - e.touches[0].pageX);
            player.vx = Math.cos(a + cameraRot.y * Math.PI / 180) * player.speed;
            player.vz = Math.sin(a + cameraRot.y * Math.PI / 180) * player.speed;
        }
        else {
            cameraRot.y += (e.touches[0].pageX - lastTouch.x) / 3;
            cameraRot.x -= (e.touches[0].pageY - lastTouch.y) / 3;
            lastTouch.x = e.touches[0].pageX;
            lastTouch.y = e.touches[0].pageY;
        }
    });
    document.addEventListener("touchend", function(e) {
        player.vx = 0;
        player.vz = 0;
    });
}

function generateWorld(lite) {
    for (var y = -2500; y <= 2500; y += 1000) {
        for (var x = -2500; x <= 2500; x += 1000) {
            createPlane({x: x, y: 200, z: y}, {x: 1005, y: 1005}, {x: 90, y: 0, z: 0}, lite ? "rgb(210,180,140)" : "url('./assets/wood.jpg')", false, "floor");
        }
    }

    if (!lite) {
        for (var y = -2500; y <= 2500; y += 1000) {
            for (var x = -2500; x <= 2500; x += 1000) {
                createPlane({x: x, y: -800, z: y}, {x: 1005, y: 1005}, {x: 90, y: 0, z: 0}, "white");
            }
        }
    }

    createPlane({x: 0, y: -300, z: 2500}, {x: 5000, y: 1000}, {x: 0, y: 0, z: 0}, "lightblue", true, "cornerShadow");
    createPlane({x: 0, y: -300, z: -2500}, {x: 5000, y: 1000}, {x: 0, y: 0, z: 0}, "lightblue", true, "cornerShadow");
    createPlane({x: 2500, y: -300, z: 0}, {x: 5000, y: 1000}, {x: 0, y: 90, z: 0}, "lightblue", true, "cornerShadow");
    createPlane({x: -2500, y: -300, z: 0}, {x: 5000, y: 1000}, {x: 0, y: 90, z: 0}, "lightblue", true, "cornerShadow");

    createCube({x: 0, y: 100, z: 0}, {x: 500, y: 200, z: 200}, "white");
    createCube({x: 0, y: -100, z: 0}, {x: 500, y: 200, z: 200}, "rgba(200, 200, 255, 0.3)");

    createCube({x: -1750, y: 0, z: -1750}, {x: 500, y: 500, z: 500}, "white");
    createCube({x: 1750, y: 0, z: -1750}, {x: 500, y: 500, z: 500}, "white");
    createCube({x: 1750, y: 0, z: 1750}, {x: 500, y: 500, z: 500}, "white");
    createCube({x: -1750, y: 0, z: 1750}, {x: 500, y: 500, z: 500}, "white");

    createCylinder({x: 0, y: -300, z: 1500}, 1000, 100, 10, "white");
    createCylinder({x: 0, y: -300, z: -1500}, 1000, 100, 10, "white");
}

function joinGame() {
    mainSocket = new WebSocket("wss://tc5550-3dshooter.herokuapp.com");
    console.log("Connecting...");
    joinGameButton.innerHTML = "Connecting...";

    mainSocket.onerror = function() {
        console.log("Could not connect to websocket!");
        joinGameButton.innerHTML = "Connection error!";
    }

    mainSocket.onopen = function() {
        console.log("Connected successfully");
        titleDiv.style.visibility = "hidden";
        ui.style.visibility = "visible";
        inGame = true;
        player.name = playerName.value || ("UNKNOWN" + Math.round(Math.random() * 1000));

        setInterval(function() {
            mainSocket.send(JSON.stringify({type: "updateplayer", playerData: player, id: myId}));
        }, 50);
    }

    mainSocket.onclose = function() {
        alert("Lost connection!");
        location.reload();
    }

    mainSocket.onmessage = function(e) {
        var msg = JSON.parse(e.data);
        if (msg.type == "updateplayers") {
            for (var i = 0; i < msg.data.length; i++) {
                var d = msg.data[i];

                if (d && d.ownData) {
                    var found = remotePlayers.find(function(t) {
                        return t.data.ownData.id == d.ownData.id;
                    });
                    if (found) {
                        found.updateData(d);
                    }
                    else {
                        remotePlayers.push(new RemotePlayer(d));
                    }
                }
            }

            connectedPlayers = msg.data;
        }
        else if (msg.type == "hit") {
            player.health -= msg.damageTaken;
            healthBar.style.width = Math.max(0, player.health * 2) + "px";

            blood.style.visibility = "visible";
            setTimeout(function() {
                blood.style.visibility = "hidden";
            }, 1000);

            if (player.health <= 0) {
                blackScreen.style.visibility = "visible";
                player.isDead = true;
                setTimeout(function() {
                    blackScreen.style.visibility = "hidden";
                    player.health = 100;
                    healthBar.style.width = "200px";
                    player.isDead = false;
                    player.x = Math.random() * 5000 - 2500;
                    player.z = Math.random() * 5000 - 2500;
                    player.y = 100;
                }, 3000);
            } 
        }
        else if (msg.type == "playerleft") {
            for (var i = 0; i < remotePlayers.length; i++) {
                var p = remotePlayers[i];
                if (p.data.ownData.id == msg.id) {
                    for (var j = 0; j < p.planes.length; j++) {
                        removePlane(planes.indexOf(p.planes[j].plane));
                    }
                    remotePlayers.splice(i, 1);
                }
            }
        }
    }
}

function Bullet() {
    this.x = -player.x;
    this.y = -player.y;
    this.z = -player.z;
    this.speed = 10;
    this.vx = Math.cos(cameraRot.y * Math.PI / 180 - Math.PI * 0.5) * Math.cos(-cameraRot.x * Math.PI / 180) * this.speed;
    this.vy = Math.sin(-cameraRot.x * Math.PI / 180) * this.speed;
    this.vz = Math.sin(cameraRot.y * Math.PI / 180 - Math.PI * 0.5) * Math.cos(-cameraRot.x * Math.PI / 180) * this.speed;

    this.health = 100;

    createPlane({x: 0, y: 0, z: 0}, {x: 25, y: 25}, {x: 0, y: 0, z: 0}, "url('./assets/bullethole.png')", false, "bullethole");
    this.planes = [];
    for (var i = 0; i < 1; i++) {
        this.planes.push({startpos: Object.assign({}, planes[planes.length - 1 - i].pos), plane: planes[planes.length - 1 - i]});
    }
    shadePlanes();

    function hitEffect(color, damage) {
        hitmark.style.visibility = "visible";
        hitmark.style.color = color;

        hitSoundEffect.currentTime = 0;
        hitSoundEffect.play();

        mainSocket.send(JSON.stringify({type: "damageplayer", damage: damage, id: c.player.data.ownData.id}));

        setTimeout(function() {
            hitmark.style.visibility = "hidden";
        }, 500);
    }

    var noHitCounter = 0;
    mainLoop: while (noHitCounter < 8000) {
        this.x += this.vx * 1;
        this.y += this.vy * 1;
        this.z += this.vz * 1;

        if (Math.abs(this.x) > 2500 || this.y < -800 || this.y > 200 || Math.abs(this.z) > 2500)
            break mainLoop;
        else {
            for (var i = 0; i < headCollisionBoxes.length; i++) {
                var c = headCollisionBoxes[i];
                if (this.x > c.pos.x - c.size.x / 2 && this.x < c.pos.x + c.size.x / 2 &&
                    this.y > c.pos.y - c.size.y / 2 && this.y < c.pos.y + c.size.y / 2 &&
                    this.z > c.pos.z - c.size.z / 2 && this.z < c.pos.z + c.size.z / 2) {
                    hitEffect("red", 75);
                    break mainLoop;
                }
            }
            for (var i = 0; i < bodyCollisionBoxes.length; i++) {
                var c = bodyCollisionBoxes[i];
                if (this.x > c.pos.x - c.size.x / 2 && this.x < c.pos.x + c.size.x / 2 &&
                    this.y > c.pos.y - c.size.y / 2 && this.y < c.pos.y + c.size.y / 2 &&
                    this.z > c.pos.z - c.size.z / 2 && this.z < c.pos.z + c.size.z / 2) {
                    hitEffect("white", 34);
                    break mainLoop;
                }
            }
            for (var i = 0; i < collisionBoxes.length; i++) {
                var c = collisionBoxes[i];
                if (this.x > c.pos.x - c.size.x / 2 && this.x < c.pos.x + c.size.x / 2 &&
                    this.y > c.pos.y - c.size.y / 2 && this.y < c.pos.y + c.size.y / 2 &&
                    this.z > c.pos.z - c.size.z / 2 && this.z < c.pos.z + c.size.z / 2) {
                    break mainLoop;
                }
            }
        }

        noHitCounter += 1;
    }

    this.x -= this.vx;
    this.y -= this.vy;
    this.z -= this.vz;

    for (var i = 0; i < this.planes.length; i++) {
        var p = this.planes[i];
        p.plane.pos.x = p.startpos.x + this.x;
        p.plane.pos.y = p.startpos.y + this.y;
        p.plane.pos.z = p.startpos.z + this.z;
    }

    this.run = function() {
        this.health--;
        if (this.health <= 0) {
            for (var i = 0; i < this.planes.length; i++) {
                removePlane(planes.indexOf(this.planes[i].plane));
            }
            bullets.splice(bullets.indexOf(this), 1);
        }
    }
}

function RemotePlayer(data) {
    this.data = data;

    this.planes = [];
    if (this.data.ownData.id != myId) {
        createPlane({x: 0, y: -75, z: 0}, {x: 250, y: 50}, {x: 0, y: 180, z: 0}, "none", false, "nametag");
        createCube({x: 0, y: 0, z: 0}, {x: 75, y: 75, z: 75}, "url('./assets/placeholder.jpg')", true, "playerHead");
        createCube({x: 0, y: 75 + 37.5, z: 0}, {x: 75, y: 150, z: 50}, "rgb(141, 123, 99)", true);
        createCube({x: 50, y: 50 + 37.5, z: 0}, {x: 40, y: 100, z: 40}, "rgb(94, 81, 66)", true);
        createCube({x: -50, y: 50 + 37.5, z: 0}, {x: 40, y: 100, z: 40}, "rgb(94, 81, 66)", true);

        headCollisionBoxes.push({pos: {x: 0, y: 0, z: 0}, size: {x: 75, y: 75, z: 75}, player: this});
        bodyCollisionBoxes.push({pos: {x: 0, y: 75 + 37.5, z: 0}, size: {x: 75, y: 150, z: 75}, player: this});

        this.headCollisionBox = headCollisionBoxes[headCollisionBoxes.length - 1];
        this.bodyCollisionBox = bodyCollisionBoxes[bodyCollisionBoxes.length - 1];

        for (var i = 0; i < 25; i++) {
            var p = planes[planes.length - 1 - i];
            this.planes.push({startdist: Math.sqrt(p.pos.x * p.pos.x + p.pos.z * p.pos.z),
                            startangle: Math.atan2(p.pos.z, p.pos.x),
                            startrot: Object.assign({}, p.rot),
                            startpos: Object.assign({}, p.pos),
                            plane: p});
        }
    }

    this.updateData = function(data) {
        this.data = data;
        if (this.planes[24])
            this.planes[24].plane.element.innerHTML = this.data.ownData.playerData.name;
    }

    this.run = function() {
        var p = this.data.ownData.playerData;
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        for (var i = 0; i < this.planes.length; i++) {
            var pl = this.planes[i];

            pl.plane.pos.x = -p.x + Math.cos(p.rotY * Math.PI / 180 + pl.startangle) * pl.startdist;
            pl.plane.pos.y = pl.startpos.y - p.y;
            pl.plane.pos.z = -p.z + Math.sin(p.rotY * Math.PI / 180 + pl.startangle) * pl.startdist;

            pl.plane.rot.x = pl.startrot.x;
            pl.plane.rot.y = pl.startrot.y + (pl.startrot.x != 0 ? 0 : -p.rotY);
            pl.plane.rot.z = pl.startrot.z + (pl.startrot.x != 0 ? (p.rotY * (pl.startrot.x < 0 ? -1 : 1)) : 0);
        }
        
        this.headCollisionBox.pos.x = -p.x;
        this.headCollisionBox.pos.y = -p.y;
        this.headCollisionBox.pos.z = -p.z;

        this.bodyCollisionBox.pos.x = -p.x;
        this.bodyCollisionBox.pos.y = -p.y + 75 + 37.5;
        this.bodyCollisionBox.pos.z = -p.z;
    }
}

function updateCameraTransform() {
    camera.style.transform = "translateZ(600px)" +
                             "rotateX(" + cameraRot.x + "deg) rotateY(" + cameraRot.y + "deg) rotateZ(" + cameraRot.z + "deg)" +
                             "translate3d(" + (camera.x) + "px," + (camera.y) + "px," + (camera.z) + "px)";
}

function shadePlanes() {
    for (var i = 0; i < planes.length; i++) {
        var p = planes[i];

        if (p.isAffectedByLight)
            p.element.style.filter = "brightness(" + Math.max(20, Math.min(100, (Math.sin(p.rot.y * Math.PI / 180) + 1) * 50)) + "%)";
    }
}

function playerControlls() {
    if (!isMobile) {
        player.vx = 0;
        player.vz = 0;

        if (keys["w"]) {
            player.vx += Math.cos((player.rotY + 90) * Math.PI / 180) * player.speed;
            player.vz += Math.sin((player.rotY + 90) * Math.PI / 180) * player.speed;
        }
        if (keys["s"]) {
            player.vx += -Math.cos((player.rotY + 90) * Math.PI / 180) * player.speed;
            player.vz += -Math.sin((player.rotY + 90) * Math.PI / 180) * player.speed;
        }
        if (keys["a"]) {
            player.vx += Math.cos(player.rotY * Math.PI / 180) * player.speed;
            player.vz += Math.sin(player.rotY * Math.PI / 180) * player.speed;
        }
        if (keys["d"]) {
            player.vx += -Math.cos(player.rotY * Math.PI / 180) * player.speed;
            player.vz += -Math.sin(player.rotY * Math.PI / 180) * player.speed;
        }
    }

    if (player.y < 0) {
        player.vy = 0;

        if (keys[" "]) {
            player.vy = 15;
            player.y = 1;
        }
    }

    player.x += player.vx;
    player.y += player.vy;
    player.z += player.vz;
    player.vy -= 0.6;

    player.x = Math.min(2450, Math.max(-2450, player.x));
    player.z = Math.min(2450, Math.max(-2450, player.z));

    for (var i = 0; i < collisionBoxes.length; i++) {
        var c = collisionBoxes[i];
        if (player.x > c.pos.x - c.size.x * 0.6 && player.x < c.pos.x + c.size.x * 0.6 &&
            player.z > c.pos.z - c.size.z * 0.6 && player.z < c.pos.z + c.size.z * 0.6) {
            player.x -= player.vx;
            player.z -= player.vz;
        }
    }

    if (player.isDead) {
        player.y = 5000;
    }

    camera.x = player.x;
    camera.y = player.y - (keys["shift"] || false) * 40;
    camera.z = player.z;

    if (player.speed > 0 && keys["shift"]) {
        player.speed -= 0.2;
    }
    if (!keys["shift"]) {
        player.speed = 10;
        player.rotY = cameraRot.y;
    }

    cameraRot.x = Math.max(-90, Math.min(90, cameraRot.x));
}

/*
    3D Geometry helper functions
*/

function createPlane(pos, size, rot, background, isAffectedByLight, customClass) {
    var p = document.createElement("plane");
    p.style.backgroundImage = background;
    p.style.backgroundColor = background;
    p.style.width = size.x + "px";
    p.style.height = size.y + "px";
    if (customClass)
        p.classList.add(customClass);

    p.style.transform = "translate3d(" + (pos.x) + "px," + (pos.y) + "px," + (pos.z) + "px)" +
                        "rotateX(" + rot.x + "deg) rotateY(" + rot.y + "deg) rotateZ(" + rot.z + "deg)";

    camera.appendChild(p);
    planes.push({element: p, pos: pos, rot: rot, lastPos: Object.assign({}, pos), lastRot: Object.assign({}, rot), isAffectedByLight: typeof isAffectedByLight == "undefined" ? true : isAffectedByLight});
}

function removePlane(planeIndex) {
    camera.removeChild(planes[planeIndex].element);
    planes.splice(planeIndex, 1);
}

function createCube(pos, size, background, isAffectedByLight, customClass) {
    createPlane({x: pos.x, y: pos.y, z: pos.z + size.z / 2}, {x: size.x, y: size.y}, {x: 0, y: 0, z: 0}, background, isAffectedByLight, customClass);
    createPlane({x: pos.x, y: pos.y, z: pos.z - size.z / 2}, {x: size.x, y: size.y}, {x: 0, y: 180, z: 0}, background, isAffectedByLight, customClass);
    createPlane({x: pos.x - size.x / 2, y: pos.y, z: pos.z}, {x: size.z, y: size.y}, {x: 0, y: 90, z: 0}, background, isAffectedByLight, customClass);
    createPlane({x: pos.x + size.x / 2, y: pos.y, z: pos.z}, {x: size.z, y: size.y}, {x: 0, y: -90, z: 0}, background, isAffectedByLight, customClass);
    createPlane({x: pos.x, y: pos.y + size.y / 2, z: pos.z}, {x: size.x, y: size.z}, {x: -90, y: 0, z: 0}, background, isAffectedByLight, customClass);
    createPlane({x: pos.x, y: pos.y - size.y / 2, z: pos.z}, {x: size.x, y: size.z}, {x: 90, y: 0, z: 0}, background, isAffectedByLight, customClass);

    collisionBoxes.push({pos, size});
}

function createCylinder(pos, height, radius, segments, background) {
    var w = Math.PI * radius * 2 / segments * 1.1;
    for (var i = 0; i < 360; i += 360 / segments) {
        createPlane({x: pos.x + Math.cos(i * Math.PI / 180) * radius, y: pos.y, z: pos.z + Math.sin(i * Math.PI / 180) * radius}, {x: w, y: height}, {x: 0, y: -i + 270, z: 0}, background);
    }

    collisionBoxes.push({pos, size: {x: radius * 2, y: height, z: radius * 2}});
}