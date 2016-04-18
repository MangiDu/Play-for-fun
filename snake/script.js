var DEFAULT = {
  time: 500,
  rate: 1,
  blockSize: 20,
  row: 20,
  col: 20
}

var GAME = null;

window.onload = function(){
  var startBtn = document.getElementById('start');
  startBtn.addEventListener('click', startGame);
}

function startGame(){
  var canvas = document.getElementById('playboard');
  if(!GAME){
    GAME = new Game({
      canvas: canvas
    });
  }

  GAME.start();
}

// Game ==========
function Game(options){
  for(var i in DEFAULT){
    if(!options[i]){
      options[i] = DEFAULT[i];
    }
  }

  this.snake = new Snake(options);
}

Game.prototype = {
  start: function(){
    this.snake.start();
  }
}

// Snake ==========
function Node(x, y){
  this.x = x;
  this.y = y;
}

function Snake(options){
  for(var i in options){
    this[i] = options[i];
  }

  this.reset();
}

Snake.prototype.reset = function(){
  this.setCanvas();
  this.list = [];
  this.add(new Node(0, 0));
  this.direction = 'right';
  this.setScore(true);
}

Snake.prototype.setCanvas = function(){
  if(this.canvas){
    this.canvas.width = this.col * this.blockSize || this.defaultSize;
    this.canvas.height = this.row * this.blockSize || this.defaultSize;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

Snake.prototype.draw = function(){
  this.ctx.fillStyle = '#666';
  for(var i = 0; i < this.length(); i++){
    this.ctx.fillRect(this.getNode(i).x, this.getNode(i).y, this.blockSize, this.blockSize);
  }
}

Snake.prototype.drawNode = function(node){
  this.ctx.fillStyle = '#666';
  this.ctx.fillRect(node.x, node.y, this.blockSize, this.blockSize);
}

Snake.prototype.clearNode = function(node){
  this.ctx.clearRect(node.x, node.y, this.blockSize, this.blockSize);
}

Snake.prototype.start = function(){
  if(this.interval){
    window.clearInterval(this.interval);
  }

  this.setFood();

  me = this;
  this.interval = window.setInterval(function(){
    me.moveTo();
  }, this.time / this.rate);

  this.keydownHandler = function(e){
    me.setDirection(e.keyCode);
  }

  document.addEventListener('keydown', this.keydownHandler)

  this.draw();
}

Snake.prototype.moveTo = function(){
  var node = null;
  switch(this.direction){
    case('left'):
      node = new Node(this.front().x - this.blockSize, this.front().y);
      break;
    case('up'):
      node = new Node(this.front().x, this.front().y - this.blockSize);
      break;
    case('right'):
      node = new Node(this.front().x + this.blockSize, this.front().y);
      break;
    case('down'):
      node = new Node(this.front().x, this.front().y + this.blockSize);
      break;
  }
  this.doMove(node);
}

Snake.prototype.doMove = function(node){
  if(node.x < 0 || node.y < 0 || node.x >= this.blockSize * this.col || node.y >= this.blockSize * this.row){
    var text = 'Boom!!! Wanna try again?';
    this.confirm(text);
  }else if(this.inSnake(node)){
    var text = 'Never eat yourself!!! Wanna try again?';
    this.confirm(text);
  }else{
    this.add(node);
    this.drawNode(node);

    if(this.food.x == node.x && this.food.y == node.y){
      this.setScore();
      this.setFood();
    }else{
      var nodeToErase = this.remove();
      this.clearNode(nodeToErase);
    }
  }
}

Snake.prototype.confirm = function(text){
  this.stop();
  var tryAgain = window.confirm(text);
  this.reset();
  if(tryAgain){
    this.start();
  }
}

Snake.prototype.stop = function(){
  if(this.interval){
    window.clearInterval(this.interval);
  }

  document.removeEventListener('keydown', this.keydownHandler);
}

Snake.prototype.length = function(){
  return this.list.length;
}

Snake.prototype.getNode = function(i){
  return this.list[i];
}

Snake.prototype.front = function(){
  return this.list[0];
}

Snake.prototype.add = function(node){
  this.list.unshift(node);
}

Snake.prototype.remove = function(){
  return this.list.pop();
}

Snake.prototype.setScore = function(reset){
  if(!this.score) this.score = 0;
  if(!this.scoreSpan) this.scoreSpan = document.getElementById('score');
  if(reset){
    this.score = 0;
  }else{
    this.score++;
  }
  this.scoreSpan.innerHTML = this.score;
}

Snake.prototype.setDirection = function(code){
  var direction = this.direction;
  switch(code){
    case(37):
      direction = 'left';
      break;
    case(38):
      direction = 'up';
      break;
    case(39):
      direction = 'right';
      break;
    case(40):
      direction = 'down';
      break;
    default:
      direction;
  }
  this.direction = direction;
}

Snake.prototype.setFood = function(){
  do{
    var x = this.getRandom(this.col);
    var y = this.getRandom(this.row);
    this.food = new Node(x * this.blockSize, y * this.blockSize);
  }while(this.inSnake(this.food))

  this.drawFood();
}

Snake.prototype.drawFood = function(){
  this.ctx.fillStyle = '#ff0';
  var x = this.food.x;
  var y = this.food.y;
  this.ctx.fillRect(x, y, this.blockSize, this.blockSize);
}

Snake.prototype.getRandom = function(base){
  var n = Math.floor(Math.random() * base);
  return n;
}

Snake.prototype.inSnake = function(node){
  for(var i = 0; i < this.length(); i++){
    var snakeNode = this.getNode(i);
    if(snakeNode.x == node.x && snakeNode.y == node.y) return true;
  }
  return false;
}
