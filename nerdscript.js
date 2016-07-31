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
    minPaddingY: 5
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
  this.minPadding.x = _settings.minPaddingX * 2;
  this.minPadding.y = _settings.minPaddingY * 2;

  this.canvasHeight = function (){ return this.canvas.height; }
  this.canvasWidth = function (){ return this.canvas.width; }

  this.width = Math.floor(((this.canvasWidth() - this.minPadding.x * 2 - this.dotProperties.xSpace) / (this.dotProperties.width + this.dotProperties.xSpace))/2);
  this.height = Math.floor(((this.canvasHeight() - this.minPadding.y * 2 - this.dotProperties.ySpace) / (this.dotProperties.height + this.dotProperties.ySpace))/2);

  this.padding = {};
  this.padding.x = Math.floor(this.canvas.width / 2 - (this.width * (this.dotProperties.width + this.dotProperties.xSpace)) - this.dotProperties.xSpace - this.minPadding.x)*2;
  this.padding.y = Math.floor(this.canvas.height / 2 - (this.height * (this.dotProperties.height + this.dotProperties.ySpace)) - this.dotProperties.ySpace - this.minPadding.y)*2;

  this.Grid = function(width, height, context){

    var _grid = this;

    this.w = _matrix.width;
    this.h = _matrix.height;
    this.context = _matrix.context;

    this.Dot = function ( x, y ) {

      _dot = this;

      this.context = _grid.context;

      this.colour = new Colour(50,50,50);
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

        this.setColour( new Colour(200,200,200) );

        ctx.fillStyle = this.getColour().toRgba(1);

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

    return this;

  }

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

  this.grid = new this.Grid(this.width, this.height, this.context);

  return this;

};

$(document).ready(function(){
  matrix = new Matrix({
      containerSelector: '#nerdmatrix',
      dotWidth: 6,
      dotHeight: 6,
      dotXSpace: 2,
      dotYSpace: 2
  });
  log(matrix);
});
