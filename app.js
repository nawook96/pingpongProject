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

var objects = {};
var posi = 0;

// 접속 유저의 정보를 저장하는 개체 생성
io.on('connection', function(socket){
  console.log('user connected: ', socket.id);
  switch(posi){
    case 0:
      objects[socket.id] = new UserObject(socket.id, "LEFT");
      posi = 1;
      break;
    case 1:
      objects[socket.id] = new UserObject(socket.id, "RIGHT");
      posi = 0;
      break;
  }

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
  WIDTH : 700, HEIGHT : 400, BORDER_WIDTH : 15, BACKGROUND_COLOR : "#FFFFFF"
};

// 10ms 마다 키가 눌려져 있는지 안 눌려져 있는지 확인 후 눌려져 있다면 좌표 이동 및 정보 업데이트
var update = setInterval(function(){
  var idArray=[];
  var statusArray={};
  for(var id in io.sockets.clients().connected){
    if(objects[id].keypress[LEFT])  objects[id].status.x -= 0;
    if(objects[id].keypress[UP])    objects[id].status.y -= 2;
    if(objects[id].keypress[RIGHT]) objects[id].status.x += 0;
    if(objects[id].keypress[DOWN])  objects[id].status.y += 2;

    idArray.push(id);
    statusArray[id]=objects[id].status;
  }
  io.emit('update',idArray, statusArray);
},10);

// 유저 개체의 생성자, x,y 좌표, width, height, color 저장
function UserObject(id, position) {
  var color="#";
  for(var i = 0; i < 6; i++ ){
    color += (Math.floor(Math.random()*16)).toString(16);
  }
  this.status = {};
  this.status.height = 80;
  this.status.width = 15;
  switch(position){
    case "LEFT":
      this.status.x = 0;
      break;
    case "RIGHT":
      this.status.x = GAME_SETTINGS.WIDTH -this.status.width;
      break;
  }
  this.status.y = 0;
  this.status.color = color;
  this.keypress = [];
}
