var SETTINGS = require("./Setting.js");
var BaseObject = require("./BaseObject.js");

var COLLUSION_TYPE = { NO_COLLUSION: -1, VERTICAL: 1, HORIZONTAL: 2};

function Ball(player0Id, player1Id){
  BaseObject.call(this);
  this.playerIds = [player0Id, player1Id];
  this.status.x = (SETTINGS.WIDTH-SETTINGS.BALL.WIDTH)/2;
  this.status.y = (SETTINGS.HEIGHT-SETTINGS.BALL.HEIGHT)/2;
  this.dx = 1;
  this.dy = 1;
  this.speed = 2;
  this.status.shape = "rectangle";
  this.status.width = SETTINGS.BALL.WIDTH;
  this.status.height = SETTINGS.BALL.HEIGHT;
  this.status.color = "#FFFFFF";
  this.move = true;
}
Ball.prototype = new BaseObject();
Ball.prototype.constructor = Ball;
Ball.prototype.update = function(objects){
  if(this.move)
  {
    this.status.x += this.dx*this.speed;
    this.status.y += this.dy*this.speed;

    if(this.status.x <= 0 - this.status.width*2)
    {
      objects[this.playerIds[1]].score++;
      this.dx = Math.abs(this.dx);
      this.initialize();
    }

    if(this.status.x + this.status.width >= SETTINGS.WIDTH + this.status.width*2)
    {
      objects[this.playerIds[0]].score++;
      this.dx = -Math.abs(this.dx);
      this.initialize();
    }

    if(this.status.y <= 0 + SETTINGS.BORDER_WIDTH)
      this.dy = Math.abs(this.dy);

    if(this.status.y + this.status.height >= SETTINGS.HEIGHT - SETTINGS.BORDER_WIDTH)
      this.dy = -Math.abs(this.dy);

      for(var object in objects){
        if(objects[object].role == "player"){
          var playerStat = objects[object].status;
          var collusionType = ballCollusionCheck(this.status, playerStat, this.dx*this.speed);
          switch(collusionType){
            case COLLUSION_TYPE.NO_COLLUSION:
            break;
            case COLLUSION_TYPE.VERTICAL:
            this.dy = bounce(this.status.y+this.status.height/2, playerStat.y+playerStat.height/2, this.dy);
            break;
            case COLLUSION_TYPE.HORIZONTAL:
            this.dx = bounce(this.status.x+this.status.width/2, playerStat.x+playerStat.width/2, this.dx);
            break;
          }
        }
      }
  }
};

Ball.prototype.initialize = function(objects){
  this.status.x = (SETTINGS.WIDTH-SETTINGS.BALL.WIDTH)/2;
  this.status.y = (SETTINGS.HEIGHT-SETTINGS.BALL.HEIGHT)/2;
};

module.exports = Ball;

function bounce (x, y, v){
  return x<y ? -Math.abs(v) : Math.abs(v);
}

function ballCollusionCheck(ballStat,playerStat,dx){
  if(pointSquareCollusionCheck(      ballStat.x                     , ballStat.y                  , playerStat)){
    return pointSquareCollusionCheck(ballStat.x - dx                , ballStat.y                  , playerStat)?
      COLLUSION_TYPE.VERTICAL:
      COLLUSION_TYPE.HORIZONTAL;
  }
  if(pointSquareCollusionCheck(      ballStat.x      + ballStat.width, ballStat.y                  , playerStat)){
    return pointSquareCollusionCheck(ballStat.x - dx + ballStat.width, ballStat.y                  , playerStat)?
      COLLUSION_TYPE.VERTICAL:
      COLLUSION_TYPE.HORIZONTAL;
  }
  if(pointSquareCollusionCheck(      ballStat.x                      , ballStat.y + ballStat.height, playerStat)){
    return pointSquareCollusionCheck(ballStat.x - dx                 , ballStat.y + ballStat.height, playerStat)?
      COLLUSION_TYPE.VERTICAL:
      COLLUSION_TYPE.HORIZONTAL;
  }
  if(pointSquareCollusionCheck(      ballStat.x      + ballStat.width, ballStat.y + ballStat.height, playerStat)){
    return pointSquareCollusionCheck(ballStat.x - dx + ballStat.width, ballStat.y + ballStat.height, playerStat)?
      COLLUSION_TYPE.VERTICAL:
      COLLUSION_TYPE.HORIZONTAL;
  }
  return COLLUSION_TYPE.NO_COLLUSION;
}

function pointSquareCollusionCheck(x,y,square){
  if(x >= square.x && x <= square.x + square.width && y >= square.y && y <= square.y + square.height )
    return true;
}
