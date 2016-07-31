var DEBUG = false;

var log = function(){
  if(!DEBUG) return;
  for (var i = 0; i < arguments.length; i++) {
    window.console.log(arguments[i]);
  }
}

function Matrix(containerSelector, dotWidth = 5, dotHeight = 5, dotXSpace = 3, dotYSpace = 3, minPaddingX = 5, minPaddingY = 5) {

  this.selector = containerSelector;
  this.container = $(containerSelector);
  this.canvas = this.container.append('<canvas></canvas>').children('canvas')[0];
  this.context = this.canvas.getContext("2d");

  this.canvas.height = this.container.height();
  this.canvas.width = this.container.width();

  this.dotProperties = {};
  this.dotProperties.width = dotWidth;
  this.dotProperties.height = dotHeight;
  this.dotProperties.xSpace = dotXSpace;
  this.dotProperties.ySpace = dotXSpace;

  this.minPadding = {};
  this.minPadding.x = minPaddingX;
  this.minPadding.y = minPaddingY;

  this.canvasHeight = function (){ return this.canvas.height; }
  this.canvasWidth = function (){ return this.canvas.width; }

  this.width = Math.floor((this.canvasWidth() - this.minPadding.x * 2 - this.dotProperties.xSpace) / (this.dotProperties.width + this.dotProperties.xSpace));
  this.height = Math.floor((this.canvasHeight() - this.minPadding.y * 2 - this.dotProperties.ySpace) / (this.dotProperties.height + this.dotProperties.ySpace));

  this.padding = {};
  this.padding.x = this.canvas.width - (this.width * (this.dotProperties.width + this.dotProperties.xSpace)) - this.dotProperties.xSpace - this.minPadding.x;
  this.padding.y = this.canvas.height - (this.height * (this.dotProperties.height + this.dotProperties.ySpace)) - this.dotProperties.ySpace - this.minPadding.y;

  return this;

};

$(document).ready(function(){
  matrix = new Matrix('#nerdmatrix');
  log(matrix);
});
