const http = require('http');
const fs = require('fs');
const socketio = require('socket.io');
// const path = require('path');
//const canvas = require('canvas');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// read the client html file into memory
// _dirname in node is the current directory
// (in this case the same folder as the server js file)
const index = fs.readFileSync(`${__dirname}/../client/index.html`);

//const image = new canvas.Image();
//image.src = '../media/ghost.png';

const onRequest = (request, response) => {
  const contentType = response.getHeader('content-type');
  response.writeHead(200, { 'Content-Type': contentType });
  response.write(index);
  response.end();
};

const app = http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);

/*
function getRandNum(min, max) {
  const value = Math.floor((Math.random() * (max - min + 1)) + min);
  return value;
}
*/

// pass in the http server into socketio and grab the websocket server as io
const io = socketio(app);
let userCount = 0;
const users = {};

const onJoined = (sock) => {
  const socket = sock;
  userCount += 1;
  const yourTicketNum = userCount;
  users[yourTicketNum] = yourTicketNum;
  const roomNum = Math.floor((yourTicketNum + 1) / 2);
  console.log(roomNum);
  socket.join(`room${roomNum}`);
  socket.emit('getTicketNum', { ticket: yourTicketNum, room: roomNum, /*testImage: image*/ });
};

io.sockets.on('connection', (sock) => {
  console.log('started');
  onJoined(sock);

  sock.on('disconnect', () => {
    userCount -= 1;
    console.log('ended');
  });
});
