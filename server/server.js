var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer();
server.listen({ port: process.env.PORT || 1337 }, function () {
    console.log("Running on address: ", server.address());
});

// create the server
wss = new WebSocketServer({ httpServer: server });

console.log("Webserver started!");

var clients = [];

wss.on('request', function (request) {
    var connection = request.accept(null, request.origin);

    connection.isOnline = true;
    var clientIndex = clients.push(connection) - 1;

    console.log("New connection: " + connection.remoteAddress);

    connection.on('message', function (message) {
        if (message.type === 'utf8') {
            var data = JSON.parse(message.utf8Data);

            if (data.type == "updateplayer") {
                clients[clientIndex].ownData = {};
                var c = clients[clientIndex].ownData;
                for (var prop in data) {
                    if (prop != "type") {
                        c[prop] = data[prop];
                    }
                }

                if (data.playerData && (data.playerData.health > 100 || data.playerData.speed > 25)) {
                    connection.close();
                }
                else {
                    //Get players
                    var d = [];
                    for (var i = 0; i < clients.length; i++) {
                        var c = clients[i];
                        if (c.isOnline)
                            d.push({ ownData: c.ownData });
                    }
                    connection.sendUTF(JSON.stringify({ data: d, type: "updateplayers" }));
                }
            }
            else if (data.type == "damageplayer") {
                for (var i = 0; i < clients.length; i++) {
                    var c = clients[i];
                    if (c.ownData && c.ownData.id == data.id)
                        c.sendUTF(JSON.stringify({ damageTaken: data.damage, type: "hit" }));
                }
            }
        }
    });

    connection.on('close', function (connection) {
        console.log("User left!");
        var id = clients[clientIndex].ownData && clients[clientIndex].ownData.id;
        for (var i = 0; i < clients.length; i++) {
            var c = clients[i];
            c.sendUTF(JSON.stringify({ id: id, type: "playerleft" }));
        }
        clients[clientIndex].isOnline = false;
    });
});