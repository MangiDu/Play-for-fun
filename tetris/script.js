var DEFAULT = {
  time: 500,
  rate: 1,
  blockSize: 20,
  row: 20,
  col: 10
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

  this.tetris = new Tetris(options);
}

Game.prototype = {
  start: function(){
    this.tetris.start();
  }
}

// Tetris blocks
// Block only takes actions
// Tetris makes sure whether to act block or when to correct block's postion
function Node(x, y){
  this.x = x;
  this.y = y;
}

function Block(type){
  this.createSquare(type);
  this.setBirthPlace();
}

Block.prototype.createSquare = function(type){
  // get a spercific kind of block or a random one
  if(!type){
    type = Math.floor(Math.random() * 6); // 6 kinds of block
  }
  var squares = [];
  switch(type){
    // case('I'):
    case(0):
      squares.push(new Node(0, 0), new Node(0, 1), new Node(0, 2), new Node(0, 3));
      break;
    // case('J'):
    case(1):
      squares.push(new Node(0, 0), new Node(0, 1), new Node(1, 1), new Node(2, 1));
      break;
    // case('L'):
    case(2):
      squares.push(new Node(0, 1), new Node(1, 1), new Node(2, 0), new Node(2, 1));
      break;
    // case('O'):
    case(3):
      squares.push(new Node(0, 0), new Node(0, 1), new Node(1, 0), new Node(1, 1));
      break;
    // case('T'):
    case(4):
      squares.push(new Node(0, 0), new Node(1, 0), new Node(1, 1), new Node(2, 0));
      break;
    // case('Z'):
    case(5):
      squares.push(new Node(0, 0), new Node(1, 0), new Node(1, 1), new Node(2, 1));
      break;
  }
  this.squares = squares;
}

Block.prototype.setBirthPlace = function(){
  var offset = Math.floor(Math.random()*8);
  this.squares.forEach(function(node){
    node.x = node.x + offset;
  })
  this.squares = this.correctPlace(this.squares);
}

Block.prototype.rotate = function(){
  var sumX = 0, sumY = 0;
  for(var i = 0; i < this.squares.length; i++){
    var node = this.squares[i]
    sumX += node.x;
    sumY += node.y;
  }
  var centerX = Math.floor(sumX / 4);
  var centerY = Math.floor(sumY / 4);
  var leastX = 0;
  var greatestX = 0;
  var tempSquares = this.squares.map(function(node){
    var x = centerX + ( centerY - node.y );
    var y = centerY - ( centerX - node.x );

    leastX = leastX < x ? leastX : x;
    greatestX = greatestX > x ? greatestX : x;

    return new Node(x, y);
  });
  var correctNum = 0;
  if(leastX < 0){
    correctNum = 0 - leastX;
  }else if(greatestX > 100){
    correctNum = 100 - greatestX;
  }
  if(correctNum){
    tempSquares.forEach(function(node){
      node.x += correctNum;
    });
  }
  this.squares = tempSquares;
}

Block.prototype.correctPlace = function(squares){
  var leastX = 0;
  var greatestX = 0;
  for(var i = 0; i < this.squares.length; i++){
    var x = this.squares[i].x;
    leastX = leastX < x ? leastX : x;
    greatestX = greatestX > x ? greatestX : x;
  }
  var correctNum = 0;
  if(leastX < 0){
    correctNum = 0 - leastX;
  }else if(greatestX > 100){
    correctNum = 100 - greatestX;
  }
  if(correctNum){
    squares.forEach(function(node){
      node.x += correctNum;
    });
  }
  return squares;
}

Block.prototype.drop = function(){
  this.squares.forEach(function(node){
    node.y += 1;
  })
}

Block.prototype.toDrop = function(){
  var block = new Block();
  var squares = [];
  for(var i = 0; i < this.squares.length; i++){
    squares.push(new Node(this.squares[i].x, this.squares[i].y + 1));
  }
  block.squares = squares;
  return block;
}

Block.prototype.canDrop = function(){
  return this.squares.every(function(node){
    if(node.y + 1 < DEFAULT.row){
      return true;
    }
    return false;
  });
}

Block.prototype.left = function(){
  this.squares.forEach(function(node){
    node.x -= 1;
  })
}

Block.prototype.canLeft = function(){
  return this.squares.every(function(node){
    if(node.x - 1 >= 0){
      return true;
    }
    return false;
  });
}

Block.prototype.right = function(){
  this.squares.forEach(function(node){
    node.x += 1;
  })
}

Block.prototype.canRight = function(){
  return this.squares.every(function(node){
    if(node.x + 1 < DEFAULT.col){
      return true;
    }
    return false;
  });
}

// Tetris
function Tetris(options){
  for(var i in options){
    this[i] = options[i];
  }

  this.reset();
}

Tetris.prototype.reset = function(){
  this.setCanvas();
  this.board = new Board();
}

Tetris.prototype.setCanvas = function(){
  if(this.canvas){
    this.canvas.width = this.col * this.blockSize;
    this.canvas.height = this.row * this.blockSize;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

Tetris.prototype.start = function(){
  if(this.interval){
    window.clearInterval(this.interval);
  }

  this.block = new Block();
  this.drawBlock(this.block);

  me = this;
  this.interval = window.setInterval(function(){
    me.takeAction(40);
  }, this.time / this.rate);

  if(this.keydownHandler){
    document.removeEventListener('keydown', this.keydownHandler);
  }

  this.keydownHandler = function(e){
    me.takeAction(e.keyCode);
  }

  document.addEventListener('keydown', this.keydownHandler)
}

Tetris.prototype.takeAction = function(code){
  this.clearBlock(this.block);
  switch(code){
    case(37):
      // direction = 'left';
      if(this.block.canLeft()){
        this.block.left();
      }
      break;
    case(38):
      // direction = 'up';
      this.block.rotate();
      break;
    case(39):
      // direction = 'right';
      if(this.block.canRight()){
        this.block.right();
      }
      break;
    case(40):
      // direction = 'down';
      if(this.block.canDrop() && !this.board.isCrashing(this.block.toDrop())){
        this.block.drop();
      }else{
        this.freezeBlock(this.block);
      }
      break;
  }
  this.drawBlock(this.block);
}
Tetris.prototype.freezeBlock = function(block){
  this.drawBlock(block);
  for(var i = 0; i < block.squares.length; i++){
    var x = block.squares[i].x;
    var y = block.squares[i].y;
    this.board.add(x, y);
  }
  var full = this.board.getFullRow();
  for(var rowNumber of full){
    this.board.removeRow(rowNumber);
    this.ctx.clearRect(0, rowNumber * DEFAULT.blockSize, DEFAULT.blockSize * DEFAULT.col, DEFAULT.blockSize);
    this.drawBoard(this.board);
  }
  this.block = new Block();
}

Tetris.prototype.drawBoard = function(board){
  this.ctx.clearRect(0, 0, 200, 400);
  for(var y = 0; y < DEFAULT.row; y++){
    for(var x = 0; x < DEFAULT.col; x++){
      if(board.get(x, y)){
        this.ctx.fillRect(x * DEFAULT.blockSize, y * DEFAULT.blockSize, DEFAULT.blockSize, DEFAULT.blockSize);
      }
    }
  }
}

Tetris.prototype.drawBlock = function(block){
  this.ctx.fillStyle = '#666';
  for(var i = 0; i < block.squares.length; i++){
    this.ctx.fillRect(block.squares[i].x * this.blockSize, block.squares[i].y * this.blockSize, this.blockSize, this.blockSize);
  }
}

Tetris.prototype.clearBlock = function(block){
  for(var i = 0; i < block.squares.length; i++){
    this.ctx.clearRect(block.squares[i].x * this.blockSize, block.squares[i].y * this.blockSize, this.blockSize, this.blockSize);
  }
}

// Row
function Board(){
  this.row = [];
  for(var i = 0; i < DEFAULT.row; i++){
    var col = [];
    for(var j = 0; j < DEFAULT.col; j++){
      col.push(false);
    }
    this.row.push(col);
  }
}

Board.prototype = {
  add: function(x, y){
    if(!this.row[y]){
      this.row[y] = [];
    }
    this.row[y][x] = true;
  },
  get: function(x, y){
    if(!this.row[y]){
      this.row[y] = [];
    }
    return this.row[y][x];
  },
  removeRow: function(rowNumber){
    var toClear = this.row.splice(rowNumber, 1);
    this.row.unshift([]);
    return toClear;
  },
  getFullRow: function(){
    var full = [];
    for(var i = 0; i < this.row.length; i++){
      var isFull = this.row[i].every(function(value){
        return value;
      })
      if(isFull){
        full.push(i);
      }
    }

    return full.sort(function(last, current){
      return current - last;
    })
  },
  isCrashing: function(block){
    var me = this;
    return block.squares.some(function(node){
      return me.get(node.x, node.y);
    })
  }
}


// TODO:
// 碰撞检测
// 旋转碰撞检测
// 消除整行
