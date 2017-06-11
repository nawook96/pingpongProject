// 기본적인 APP 설정
var express = require('express');
var app     = express();
var http    = require('http').Server(app);
var io      = require('socket.io')(http);
var path    = require('path');
var MongoClient = require('mongodb').MongoClient;

var uri = "mongodb://admin:admin@cluster0-shard-00-00-qkzvq.mongodb.net:27017,cluster0-shard-00-01-qkzvq.mongodb.net:27017,cluster0-shard-00-02-qkzvq.mongodb.net:27017/admin?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin";
MongoClient.connect(uri, function(err) {
  console.log("DB connected!");
});

app.use(express.static(path.join(__dirname,"public")));

var port = process.env.PORT || 3000;
http.listen(port, function(){
  console.log("server on!");
});

var SETTINGS = require("./js/Setting.js");

var lobbyManager = new (require('./js/LobbyManager.js'))(io);
var roomManager = new (require('./js/RoomManager.js'))(io);
var gameManager = new (require('./js/GameManager.js'))(io, roomManager);

// 접속 유저의 정보를 저장하는 개체 생성
io.on('connection', function(socket){
  console.log('user connected: ', socket.id);
  lobbyManager.push(socket);
  lobbyManager.dispatch(roomManager);

  io.to(socket.id).emit('connected', SETTINGS);

  socket.on('disconnect', function(){
    var roomIndex = roomManager.roomIndex[socket.id];
    if(roomIndex){
      roomManager.destroy(roomIndex, lobbyManager);
    }
    lobbyManager.kick(socket);
    lobbyManager.dispatch(roomManager);
    console.log('user disconnected: ', socket.id);
  });
  socket.on('keydown', function(keyCode){
    var roomIndex = roomManager.roomIndex[socket.id];
    if(roomIndex){
      roomManager.rooms[roomIndex].objects[socket.id].keypress[keyCode] = true;
    }
  });
  socket.on('keyup', function(keyCode){
    var roomIndex = roomManager.roomIndex[socket.id];
    if(roomIndex)
      delete roomManager.rooms[roomIndex].objects[socket.id].keypress[keyCode];
  });
});
