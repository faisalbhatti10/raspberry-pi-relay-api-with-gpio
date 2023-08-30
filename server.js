const http    = require('http').createServer(handler); //require http server, and create server with function handler()
const fs      = require('fs'); //require filesystem module
const io      = require('socket.io')(http) //require socket.io module and pass the http object (server)
const gpio    = require('onoff').Gpio;

const relays  = [
    new gpio(18, 'out'),
    new gpio(23, 'out'),
    new gpio(24, 'out'),
    new gpio(25, 'out'),
    new gpio(08, 'out'),
    new gpio(12, 'out')
];

const allRelaysOff = () => {
  relays.forEach(relay => relay.writeSync(0));
};

// Create a web server and listen on 8080.
function handler(req, res)
{
    fs.readFile(__dirname + '/index.html', function (err, data) { //read file index.html in public folder
        if (err) {
            res.writeHead(404, {'Content-Type': 'text/html'}); //display 404 on error
            return res.end("404 Not Found");
        }
        res.writeHead(200, {'Content-Type': 'text/html'}); //write HTML
        res.write(data); //write data from index.html
        return res.end();
    });
}

io.sockets.on('connection', function (socket) {// WebSocket Connection

    socket.on('light', function (data) { //get light switch status from client

        var dataParts     = data.split('_');
        var relayNumber   = dataParts[0];
	    relayNumber 	  = relayNumber - 1;
        var relayValue    = dataParts[1];
        relays[parseInt(relayNumber)].writeSync(parseInt(relayValue));
    });
});

http.listen(8080); //listen to port 8080

// Turn off all relays on start up.
allRelaysOff();

// Handle Ctrl+C exit cleanly by turning off all relays.
process.on('SIGINT', () => {

    allRelaysOff();
    process.exit();
});    
