// 기본적인 APP 설정
var express = require('express');
var app     = express();
var http    = require('http').Server(app);
var io      = require('socket.io')(http);
var path    = require('path');

app.use(express.static(path.join(__dirname,"public")));

var port = process.env.PORT || 3000;
http.listen(port, function(){
  console.log("server on!: http://localhost:3000/");
});

var objects = {};

// 접속 유저의 정보를 저장하는 개체 생성
io.on('connection', function(socket){
  console.log('user connected: ', socket.id);
  objects[socket.id] = new UserObject();
  io.to(socket.id).emit('connected', GAME_SETTINGS);

// 접속 종료시 해당 개체 삭제, discinnect 이벤트를 client에 보냄
  socket.on('disconnect', function(){
    delete objects[socket.id];
    console.log('user disconnected: ', socket.id);
  });

// 키가 눌려졌을 시 키 값을 저장
  socket.on('keydown', function(keyCode){
    objects[socket.id].keypress[keyCode]=true;
  });

// 키를 안 누르고 있을 시 키 값 삭제
  socket.on('keyup', function(keyCode){
    delete objects[socket.id].keypress[keyCode];
  });
});

var LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40;
var GAME_SETTINGS = {
  WIDTH : 600, HEIGHT : 400, BACKGROUND_COLOR : "#FFFFFF"
};

// 10ms 마다 키가 눌려져 있는지 안 눌려져 있는지 확인 후 눌려져 있다면 좌표 이동 및 정보 업데이트
var update = setInterval(function(){
  var idArray=[];
  var statusArray={};
  for(var id in io.sockets.clients().connected){
    if(objects[id].keypress[LEFT])  objects[id].status.x -= 2;
    if(objects[id].keypress[UP])    objects[id].status.y -= 2;
    if(objects[id].keypress[RIGHT]) objects[id].status.x += 2;
    if(objects[id].keypress[DOWN])  objects[id].status.y += 2;

    idArray.push(id);
    statusArray[id]=objects[id].status;
  }
  io.emit('update',idArray, statusArray);
},10);

// 유저 개체의 생성자, x,y 좌표, width, height, color 저장
function UserObject() {
  var color="#";
  for(var i = 0; i < 6; i++ ){
    color += (Math.floor(Math.random()*16)).toString(16);
  }
  this.status = {};
  this.status.x = 0;
  this.status.y = 0;
  this.status.height = 20;
  this.status.width = 20;
  this.status.color = color;
  this.keypress = [];
}
