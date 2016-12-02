const http = require('http');
const fs = require('fs');
const socketio = require('socket.io');
//const express = require('express');
const path = require('path');
//const utilities = require('./utilities');



//const expressApp = express();

const port = process.env.PORT || process.env.NODE_PORT || 3500;

// read the client html file into memory
// _dirname in node is the current directory
// (in this case the same folder as the server js file)

//file names in the client folder
const fileNames = ['/index.html', '/media/ghost.png', '/media/logo.png', '/media/dream_orphans/dreamorphans.ttf'];

const cachedFiles = {};

for (let i = 0; i < fileNames.length; i++){
  const currentName = fileNames[i];
  const resolvedPath = path.resolve(`${__dirname}/../client/${fileNames[i]}`);
  cachedFiles[currentName] = fs.readFileSync(resolvedPath);
}

const onRequest = (request, response) => {
  /*
  if (action === index) {
    response.writeHead(200, { 'Content-type': 'text/html' });
    response.write(index);
    response.end();
  } else if (action === testImage) {
    response.writeHead(200, { 'Content-type': 'image/png' });
    response.write(testImage);
    response.end();
  }
  */

  /*
  expressApp.use(express.static('media'));


  expressApp.get('/', (req, res) => {
    res.sendfile(path.resolve('client/index.html'));
  });


  expressApp.get('/ghost', (req, res) => {
    res.sendfile(path.resolve('media/ghost.png'));
  });
  */
  
  //console.log(request.url);
  
  if (request.url === "/")
  {
    response.writeHead(200);
    response.end(cachedFiles['/index.html']);
  }
  
  if (fileNames.indexOf(request.url) > -1) {
    response.writeHead(200);
    response.end(cachedFiles[request.url]);
  }
  
  /*
  const contentType = response.getHeader('content-type');
  response.writeHead(200, { 'Content-Type': contentType });

  if (request.url === index) {
    response.write(index);
  }  else if (request.url === testImage) {
    response.write(testImage);
  }
  */

  //response.end();
};


const app = http.createServer(onRequest).listen(port);

/*
const drawRectWithStrokeS = utilities.drawRectWithStroke;

const drawRectS = utilities.drawRect;

const fillTextS = utilities.fillText;

const genDirectionS = utilities.genDirection;

const getRandomNumS = utilities.getRandomNum;
*/

//console.dir(drawRect);

console.log(`Listening on 127.0.0.1:${port}`);

/*
function getRandNum(min, max) {
  const value = Math.floor((Math.random() * (max - min + 1)) + min);
  return value;
}
*/

// pass in the http server into socketio and grab the websocket server as io
const io = socketio(app);
let count = 0;
const users = {};
const openRooms = {};
const allTeams = {};
const teamInfo = {};
const waiting = {};

const onJoined = (sock) => {
  const socket = sock;
  count += 1;
  const yourTicketNum = count;
  users[yourTicketNum] = yourTicketNum;
  const roomNum = Math.floor((yourTicketNum + 1) / 2);
  console.dir(yourTicketNum);
  socket.join(`room${roomNum}`);
  if (!openRooms[roomNum]) {
    openRooms[roomNum] = roomNum;
  }
  
  //console.dir(drawRect);
  
  socket.emit('getTicketNum', { ticket: yourTicketNum, room: roomNum });
  
  //console.dir(drawRectS);
  
  /*
  socket.emit('sendUtils', { drawRectWithStroke: drawRectWithStrokeS, drawRect: drawRectS, fillText: fillTextS, genDirection: genDirectionS, getRandomNum: getRandomNumS });
  */
  
  
  socket.on("sendTeam", (data) => {
    
    const teamInfo = {
      ticket: data.ticket,
      room: data.room,
      team: data.team,
    };
    
    teamInfo[data.ticket] = teamInfo;
    
  });
  
    
  socket.on("awaitBothPlayers", (data) => {
    waiting[data.ticket] = true;
    //if you are not the first user and the person before you is waiting and you are an even-numbered player, stop waiting
    if (data.ticket !== 1 && waiting[data.ticket - 1] === true && users[data.ticket] % 2 == 0)
    {
      users[data.ticket].waiting = false;
      users[data.ticket - 1].waiting = false;
      io.sockets.in(`room${data.room}`).emit("stopWaiting");
    }
  });
    
  socket.on("bothPlayersAvailable", (data) => {
    const userInfo = {
      ticket: data.ticket,
      room: data.room,
      team: data.team,
    };

    io.sockets.in(`room${userInfo.room}`).emit("receiveEnemyTeam", {team: userInfo.team, ticket: userInfo.ticket });
  });
  
  socket.on("grabTeams", (data) => {
    socket.broadcast.to(`room${data.room}`).emit("sendEnemyTeam", {theBadGuys: data.team });
    
  });
  
  socket.on("takeTurn", (data) => {
    
    socket.emit("nextTurn", { next: data.turnOrder[0] });
    
  });
  
};

io.sockets.on('connection', (sock) => {
  console.log('started');
  onJoined(sock);

  sock.on('disconnect', () => {
    console.log('ended');
  });
});
