var DEBUG = false;

var log = function(){
  if(!DEBUG) return;
  for (var i = 0; i < arguments.length; i++) {
    window.console.log(arguments[i]);
  }
}

function Matrix(args) {

  var _settings = {
    containerSelector: '',
    dotWidth: 5,
    dotHeight: 5,
    dotXSpace: 3,
    dotYSpace: 3,
    minPaddingX: 5,
    minPaddingY: 5,
    liveDraw: false
  }

  if(!args || args.length == 0){
    throw "To run the grid you need to input a jQuery selector for the container as a parameter";
  }

  if( typeof args === 'string' ) {
    args = {containerSelector: args};
  }

  jQuery.extend(_settings, args);

  var _matrix = this;

  this.selector = _settings.containerSelector;
  this.container = $(this.selector);
  this.canvas = this.container.append('<canvas></canvas>').children('canvas')[0];
  this.context = this.canvas.getContext("2d");

  this.canvas.height = this.container.height() * 2;
  this.canvas.width = this.container.width() * 2;
  this.canvas.style.width = this.container.width() + "px";
  this.canvas.style.height = this.container.height() + "px";
  this.context.scale(2,2);
  this.context.lineWidth = 0;

  this.dotProperties = {};
  this.dotProperties.width = _settings.dotWidth;
  this.dotProperties.height = _settings.dotHeight;
  this.dotProperties.xSpace = _settings.dotXSpace;
  this.dotProperties.ySpace = _settings.dotXSpace;
  this.dotProperties.xArea = this.dotProperties.width + this.dotProperties.xSpace;
  this.dotProperties.yArea = this.dotProperties.height + this.dotProperties.ySpace;

  this.minPadding = {};
  this.minPadding.x = _settings.minPaddingX;
  this.minPadding.y = _settings.minPaddingY;

  this.canvasHeight = function (){ return this.canvas.height / 2; }
  this.canvasWidth = function (){ return this.canvas.width / 2; }

  this.width = Math.floor(((this.canvasWidth() - this.minPadding.x - this.dotProperties.xSpace) / this.dotProperties.xArea));
  this.height = Math.floor(((this.canvasHeight() - this.minPadding.y - this.dotProperties.ySpace) / this.dotProperties.xArea));

  this.padding = {};
  this.padding.x = Math.floor((this.canvas.width / 2 - this.width * this.dotProperties.xArea)/2);
  this.padding.y = Math.floor((this.canvas.height / 2 - this.height * this.dotProperties.yArea)/2);

  this.Grid = function(width, height, context){

    var _grid = this;

    this.w = _matrix.width;
    this.h = _matrix.height;
    this.context = _matrix.context;

    this.Dot = function ( x, y ) {

      _dot = this;

      this.context = _grid.context;

      this.colour = new Colour(230,230,230);
      this.x = x;
      this.y = y;
      this.rotate = 0;
      this.centerX = x * _matrix.dotProperties.xArea + _matrix.dotProperties.xArea / 2 + _matrix.padding.x;
      this.centerY = y * _matrix.dotProperties.yArea + _matrix.dotProperties.yArea / 2 + _matrix.padding.y;
      this.radiusX = _matrix.dotProperties.width / 2;
      this.radiusY = _matrix.dotProperties.height / 2;
      this.neighbours = new Array;

      this.setColour = function( newCol ) {
        this.colour.r = newCol.r;
        this.colour.g = newCol.g;
        this.colour.b = newCol.b;
      }

      this.getColour = function (){
        return this.colour;
      }

      this.setNeighbours = function( neighbours ) {
      	this.neighbours = neighbours;
      }

      this.draw = function() {

        var ctx = this.context;

        ctx.fillStyle = this.getColour().toRgba(1);
        ctx.strokeStyle = this.getColour().toRgba(1);

        ctx.beginPath();
        ctx.ellipse(this.centerX, this.centerY, this.radiusX, this.radiusY, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.save();

        ctx.restore();

      }

      this.draw();

    }

    this.dots = new Array;

    for (cols = 0; cols < this.w; cols ++) {
      col = new Array;
      for (rows = 0; rows < this.h; rows ++ ) {
        col[rows] = new this.Dot( cols, rows);
      }
      this.dots[cols] = col;
    }

    this.dotsSequence = new Array;

    for (cols = 0; cols < this.w; cols ++) {
      for (rows = 0; rows < this.h; rows ++ ) {
        neighbours = new Array;
        if (rows < (this.h - 2)) {
          neighbours.push( this.dots[cols][rows + 1] );
        }
        if (cols < (this.w - 2)) {
          neighbours.push( this.dots[cols + 1][rows]  );
        }
        if (rows > 0) {
          neighbours.push( this.dots[cols][rows - 1]  );
        }
        if (cols > 0) {
          neighbours.push( this.dots[cols - 1][rows] );
        }
        this.dots[cols][rows].setNeighbours( neighbours );
        this.dotsSequence.push( this.dots[cols][rows] );
      }
    }

    this.getDotAt = function(x,y){
      x = x - _matrix.padding.x;
      y = y - _matrix.padding.y;
      var dotX = Math.floor(x / _matrix.dotProperties.xArea);
      var dotY = Math.floor(y / _matrix.dotProperties.yArea);
      if(this.dots[dotX][dotY] != undefined){
        return this.dots[dotX][dotY];
      }else{
        return false;
      }
      //Math.sqrt((x1-x0)*(x1-x0) + (y1-y0)*(y1-y0))
    }

  }

  /** Type Machine **/

  this.typemachine = {

    cursor: {
      x: 0,
      y: 0,
      width: 9,
      height: 12,
      position: 0
    },
    alphabet: {
      a: [[1,4],[2,4],[3,4],[4,4],[5,4],[6,5],[6,6],[6,7],[6,8],[6,9],[6,10],[5,10],[3,10],[4,10],[2,10],[1,10],[0,9],[0,8],[0,7],[1,6],[2,6],[3,6],[4,6]],
      b: [[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[0,8],[0,9],[0,10],[1,10],[2,10],[3,10],[4,10],[5,10],[6,9],[6,8],[6,7],[6,6],[6,5],[5,4],[4,4],[3,4],[2,4],[1,4]],
      c: [[6,4],[5,4],[4,4],[3,4],[2,4],[1,4],[0,5],[0,6],[0,8],[0,7],[0,9],[1,10],[2,10],[3,10],[4,10],[5,10],[6,10]],
      d: [[5,4],[4,4],[3,4],[2,4],[1,4],[0,5],[0,6],[0,7],[0,8],[0,9],[1,10],[2,10],[3,10],[4,10],[5,10],[6,10],[6,9],[6,8],[6,7],[6,6],[6,5],[6,4],[6,3],[6,2],[6,1],[6,0]],
      e: [[6,9],[5,10],[4,10],[3,10],[2,10],[1,10],[0,9],[0,8],[0,7],[0,6],[0,5],[1,4],[2,4],[3,4],[4,4],[5,4],[6,5],[6,6],[6,7],[5,7],[4,7],[3,7],[2,7]],
      f: [[0,10],[0,9],[0,8],[0,7],[0,6],[0,5],[0,4],[0,3],[0,2],[0,1],[1,0],[2,0],[3,0],[4,0],[1,4],[2,4]],
      g: [[5,10],[4,10],[3,10],[2,10],[1,10],[0,10],[0,9],[0,8],[0,7],[0,6],[0,5],[0,4],[1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[6,5],[6,6],[6,7],[6,8],[6,9],[6,10],[6,11],[6,12],[6,13],[6,14],[5,14],[4,14],[3,14],[2,14],[1,14]],
      h: [],
      i: [],
      j: [],
      k: [],
      l: [],
      m: [[0,4],[0,5],[0,6],[0,7],[0,8],[0,9],[0,10],[1,5],[2,4],[3,4],[3,5],[3,6],[3,7],[4,5],[5,4],[6,4],[6,5],[6,6],[6,7],[6,8],[6,9],[6,10]],
      n: [[0,4],[0,5],[0,6],[0,8],[0,7],[0,9],[0,10],[1,5],[2,4],[3,4],[4,4],[5,4],[6,4],[6,5],[6,6],[6,7],[6,8],[6,9],[6,10]],
      o: [[0,4],[0,5],[0,6],[0,7],[0,8],[0,9],[0,10],[1,10],[2,10],[3,10],[4,10],[5,10],[6,10],[6,9],[6,8],[6,7],[6,6],[6,5],[6,4],[5,4],[4,4],[3,4],[2,4],[1,4]],
      p: [[0,14],[0,13],[0,12],[0,11],[0,10],[0,9],[0,8],[0,7],[0,6],[0,5],[0,4],[1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[6,5],[6,6],[6,7],[6,8],[6,9],[6,10],[5,10],[4,10],[3,10],[2,10],[1,10]],
      q: [[5,10],[4,10],[3,10],[2,10],[1,10],[0,10],[0,9],[0,8],[0,7],[0,6],[0,5],[0,4],[1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[6,5],[6,6],[6,7],[6,8],[6,9],[6,10],[6,11],[6,12],[6,13],[6,14]],
      r: [],
      s: [],
      t: [],
      u: [],
      v: [],
      w: [],
      x: [],
      y: [],
      z: []
    },
    newLine: function(){
      this.cursor.x = 0,
      this.cursor.y++;
    },
    write: function( word ){

      if(word == undefined) return;

      for(i = 0; i < word.length; i++){
        var character = word.charAt(i);
        for(cxy in this.alphabet[character]){
          var x = this.alphabet[character][cxy][0]+ this.cursor.x * this.cursor.width;
          var y = this.alphabet[character][cxy][1]+ this.cursor.y * this.cursor.height;
          var dot = _matrix.grid.dots[x][y];
          dot.setColour(new Colour(0,155,69));
          dot.draw();
        }
        this.cursor.x++;
      }

    }
  };

  /** / Type Machine **/

  function Colour( r, g, b ) {
    this.r = r;
    this.g = g;
    this.b = b;

    this.add = function( num ) {
      this.r += num;
      this.g += num;
      this.b += num;
      if (this.r > 255) r = 255;
      if (this.g > 255) g = 255;
      if (this.b > 255) b = 255;
    }

    this.toRgba = function( alpha ) {
      return 'rgba(' + this.r + ', ' + this.g + ', ' + this.b + ', ' + alpha + ')';
    }
  }

  this.testHit = function(x,y){
    var hit;
    return this.grid.getDotAt(x,y);
  }

  this.liveDrawDots = Array();

  if(_settings.liveDraw){
    setTimeout(function(){
      log('liveDraw!');
      _matrix.canvas.addEventListener('click', function(e) {
        if(dot = _matrix.testHit(e.offsetX, e.offsetY)){
          _matrix.liveDrawDots.push([dot.x,dot.y]);
          dot.setColour(new Colour(204,0,0));
          dot.draw();
          log(JSON.stringify(_matrix.liveDrawDots));
        }
      }, true);
    }, 1000);
  }

  this.grid = new this.Grid(this.width, this.height, this.context);

  return this;

};

$(document).ready(function(){

  matrix = new Matrix({
      containerSelector: '#nerdmatrix',
      dotWidth: 6,
      dotHeight: 6,
      dotXSpace: 2,
      dotYSpace: 2,
      minPaddingX: 5,
      minPaddingY: 5,
      liveDraw: true
  });

  log(matrix.typemachine);

  matrix.typemachine.write('abcdefghi');
  matrix.typemachine.newLine();
  matrix.typemachine.write('jklmnopqr');
  matrix.typemachine.newLine();
  matrix.typemachine.write('stuvwxyz');

});
