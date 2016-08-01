var DEBUG = true;

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
    liveDraw: false,
    baseColour: {r:245, g: 245, b: 245}
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
  this.context.lineWidth = 1;

  this.dotProperties = {};
  this.dotProperties.width = _settings.dotWidth;
  this.dotProperties.height = _settings.dotHeight;
  this.dotProperties.xSpace = _settings.dotXSpace;
  this.dotProperties.ySpace = _settings.dotXSpace;
  this.dotProperties.xArea = this.dotProperties.width + this.dotProperties.xSpace;
  this.dotProperties.yArea = this.dotProperties.height + this.dotProperties.ySpace;

  this.dotProperties.baseColour = new Colour(_settings.baseColour.r, _settings.baseColour.g, _settings.baseColour.b);

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

      this.colour = new Colour(_settings.baseColour.r, _settings.baseColour.g, _settings.baseColour.b);
      this.currentColour = new Colour(_settings.baseColour.r, _settings.baseColour.g, _settings.baseColour.b);
      this.magicColour = new Colour(_settings.baseColour.r, _settings.baseColour.g, _settings.baseColour.b);
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

      this.setMagicColour = function ( newCol ){
        this.magicColour.r = newCol.r;
        this.magicColour.g = newCol.g;
        this.magicColour.b = newCol.b;
        return this.magicColour;
      }

      this.getMagicColour = function (){
        return this.magicColour;
      }

      this.setNeighbours = function( neighbours ) {
        this.neighbours = neighbours;
      }

      this.draw = function() {

        var ctx = this.context;

        ctx.fillStyle = this.getMagicColour().toRgba(1);

        ctx.beginPath();
        ctx.ellipse(this.centerX, this.centerY, this.radiusX, this.radiusY, 0, 0, 2 * Math.PI);
        ctx.fill();

      }

      this.magic = function() {
        if(this.magicColour.r != this.colour.r || this.magicColour.g != this.colour.g || this.magicColour.g != this.colour.b){
            this.setMagicColour(averageColours( this.colour, this.magicColour));
        }
      }

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
      x: 1,
      y: 1,
      position: 0,
      defaultX: 1,
    },
    alphabet: {
      a: [[1,4],[2,4],[3,4],[4,4],[5,4],[6,5],[6,6],[6,7],[6,8],[6,9],[6,10],[5,10],[3,10],[4,10],[2,10],[1,10],[0,9],[0,8],[0,7],[1,6],[2,6],[3,6],[4,6]],
      b: [[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[0,8],[0,9],[0,10],[1,10],[2,10],[3,10],[4,10],[5,10],[6,9],[6,8],[6,7],[6,6],[6,5],[5,4],[4,4],[3,4],[2,4],[1,4]],
      c: [[6,4],[5,4],[4,4],[3,4],[2,4],[1,4],[0,5],[0,6],[0,8],[0,7],[0,9],[1,10],[2,10],[3,10],[4,10],[5,10],[6,10]],
      d: [[5,4],[4,4],[3,4],[2,4],[1,4],[0,5],[0,6],[0,7],[0,8],[0,9],[1,10],[2,10],[3,10],[4,10],[5,10],[6,10],[6,9],[6,8],[6,7],[6,6],[6,5],[6,4],[6,3],[6,2],[6,1],[6,0]],
      e: [[6,9],[5,10],[4,10],[3,10],[2,10],[1,10],[0,9],[0,8],[0,7],[0,6],[0,5],[1,4],[2,4],[3,4],[4,4],[5,4],[6,5],[6,6],[6,7],[5,7],[4,7],[3,7],[2,7]],
      f: [[0,10],[0,9],[0,8],[0,7],[0,6],[0,5],[0,4],[0,3],[0,2],[0,1],[1,0],[2,0],[3,0],[4,0],[1,4],[2,4]],
      g: [[5,10],[4,10],[3,10],[2,10],[1,10],[0,9],[0,8],[0,7],[0,6],[0,5],[1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[6,5],[6,6],[6,7],[6,8],[6,9],[6,10],[6,11],[6,12],[6,13],[6,14],[5,14],[4,14],[3,14],[2,14],[1,14]],
      h: [[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,8],[0,7],[0,9],[0,10],[1,5],[2,4],[3,4],[4,4],[5,4],[6,4],[6,5],[6,6],[6,7],[6,8],[6,9],[6,10]],
      i: [[1,10],[2,10],[3,10],[2,9],[2,8],[2,7],[2,6],[2,5],[2,4],[2,2]],
      j: [[3,2],[2,4],[3,4],[4,4],[4,5],[4,6],[4,7],[4,8],[4,9],[4,10],[4,11],[4,12],[4,13],[3,14],[2,14],[1,13]],
      k: [[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[0,8],[0,9],[0,10],[1,6],[2,6],[3,7],[4,8],[5,9],[6,10],[2,5],[3,4]],
      l: [[0,0],[1,0],[1,1],[1,2],[1,3],[1,4],[1,5],[1,6],[1,7],[1,8],[1,9],[2,10],[3,10]],
      m: [[0,4],[0,5],[0,6],[0,7],[0,8],[0,9],[0,10],[1,5],[2,4],[3,4],[3,5],[3,6],[3,7],[4,5],[5,4],[6,4],[6,5],[6,6],[6,7],[6,8],[6,9],[6,10]],
      n: [[0,4],[0,5],[0,6],[0,8],[0,7],[0,9],[0,10],[1,5],[2,4],[3,4],[4,4],[5,4],[6,4],[6,5],[6,6],[6,7],[6,8],[6,9],[6,10]],
      o: [[0,5],[0,6],[0,7],[0,8],[0,9],[1,10],[2,10],[3,10],[4,10],[5,10],[6,9],[6,8],[6,7],[6,6],[6,5],[5,4],[4,4],[3,4],[2,4],[1,4]],
      p: [[0,14],[0,13],[0,12],[0,11],[0,10],[0,9],[0,8],[0,7],[0,6],[0,5],[1,4],[2,4],[3,4],[4,4],[5,4],[6,5],[6,6],[6,7],[6,8],[6,9],[5,10],[4,10],[3,10],[2,10],[1,10]],
      q: [[5,10],[4,10],[3,10],[2,10],[1,10],[0,9],[0,8],[0,7],[0,6],[0,5],[1,4],[2,4],[3,4],[4,4],[5,4],[6,5],[6,6],[6,7],[6,8],[6,9],[6,10],[6,11],[6,12],[6,13],[6,14]],
      r: [[0,10],[0,9],[0,8],[0,7],[0,6],[0,5],[0,4],[1,5],[2,4],[3,4],[4,4],[5,4],[6,5]],
      s: [[0,9],[1,10],[2,10],[3,10],[4,10],[5,10],[6,9],[6,8],[5,7],[4,7],[3,7],[2,7],[1,7],[0,6],[0,5],[1,4],[2,4],[3,4],[4,4],[5,4],[6,5]],
      t: [[2,0],[2,1],[2,2],[2,3],[2,4],[2,5],[2,6],[2,7],[2,8],[2,9],[3,10],[4,10],[0,2],[1,2],[3,2],[4,2]],
      u: [[0,4],[0,5],[0,6],[0,7],[0,8],[0,9],[1,10],[2,10],[3,10],[4,10],[5,10],[6,9],[6,8],[6,7],[6,6],[6,5],[6,4]],
      v: [[0,4],[0,5],[1,6],[1,7],[2,8],[2,9],[3,10],[4,9],[4,8],[5,7],[5,6],[6,5],[6,4]],
      w: [[0,4],[0,5],[0,6],[0,7],[0,8],[0,9],[1,10],[2,10],[3,9],[3,8],[4,10],[5,10],[6,9],[6,8],[6,7],[6,6],[6,5],[6,4]],
      x: [[0,4],[1,5],[2,6],[3,7],[4,8],[5,9],[6,10],[0,10],[1,9],[2,8],[4,6],[5,5],[6,4]],
      y: [[0,4],[0,5],[0,6],[0,7],[0,8],[0,9],[1,10],[2,10],[3,10],[4,10],[5,10],[6,9],[6,8],[6,7],[6,6],[6,5],[6,4],[6,10],[6,11],[6,12],[6,13],[6,13],[5,14],[4,14]],
      z: [[0,4],[1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[5,5],[4,6],[3,7],[2,8],[1,9],[0,10],[1,10],[2,10],[3,10],[4,10],[5,10],[6,10]]
    },
    newLine: function(){
      this.cursor.x = this.cursor.defaultX,
      this.cursor.y += 15;
    },
    write: function( word ){

      if(word == undefined) return;

      var charWidth = 0;

      var count = 0;

      var theColour = new Colour(127,240,70);
      var magicColour = new Colour(127,240,70);
      magicColour.add(100);

      for(i = 0; i < word.length; i++){
        count++;
        charWidth = 0;
        var character = word.charAt(i);
        for(cxy in this.alphabet[character]){
          var x = this.alphabet[character][cxy][0]+ this.cursor.x;
          var y = this.alphabet[character][cxy][1]+ this.cursor.y;
          var dot = _matrix.grid.dots[x][y];
          dot.setMagicColour(theColour);
          dot.setColour(magicColour);
          charWidth = (this.alphabet[character][cxy][0] > charWidth)?this.alphabet[character][cxy][0]:charWidth;
        }
        this.cursor.x += charWidth + 2;
      }

    }
  };

  /** / Type Machine **/

  /** World Map **/

  this.world = {
    data: {
        live: {
            0: [
                [35, 41]
            ],
            1: [
                [33, 39]
            ],
            2: [
                [27],
                [30],
                [32],
                [35, 37],
                [39, 40]
            ],
            3: [
                [23, 25],
                [27],
                [29, 35]
            ],
            4: [
                [25],
                [30, 34]
            ],
            5: [
                [20, 23],
                [26],
                [28, 36]
            ],
            6: [
                [8, 9],
                [21, 26],
                [29],
                [32, 37]
            ],
            7: [
                [4, 19],
                [21, 30],
                [32],
                [34, 38]
            ],
            8: [
                [2, 31],
                [34, 38]
            ],
            9: [
                [2, 28],
                [30, 31],
                [34, 36],
                [38]
            ],
            10: [
                [0, 26],
                [32, 36]
            ],
            11: [
                [0, 5],
                [7, 25],
                [32, 36]
            ],
            12: [
                [1, 2],
                [9, 25],
                [31, 36],
                [58]
            ],
            13: [
                [9, 26],
                [31, 36],
                [57, 58]
            ],
            14: [
                [10, 28],
                [30, 37],
                [54, 55],
                [58, 59]
            ],
            15: [
                [10, 28],
                [30, 38],
                [54, 55],
                [57, 59]
            ],
            16: [
                [10, 38],
                [57, 59]
            ],
            17: [
                [11, 38]
            ],
            18: [
                [11, 33],
                [38]
            ],
            19: [
                [10, 35]
            ],
            20: [
                [9, 32],
                [34]
            ],
            21: [
                [8, 31]
            ],
            22: [
                [8, 29],
                [56]
            ],
            23: [
                [8, 28],
                [56]
            ],
            24: [
                [8, 28]
            ],
            25: [
                [8, 27]
            ],
            26: [
                [9, 26]
            ],
            27: [
                [10, 25]
            ],
            28: [
                [11, 18],
                [20, 21],
                [24]
            ],
            29: [
                [14, 17],
                [25]
            ],
            30: [
                [16, 17],
                [25]
            ],
            31: [
                [111]
            ],
            41: [
                [37]
            ],
            42: [
                [32],
                [34, 36]
            ],
            47: [
                [28]
            ],
            55: [
                [35]
            ],
            64: [
                [134, 135]
            ],
            65: [
                [133]
            ],
            66: [
                [131]
            ],
            67: [
                [129, 130]
            ],
            68: [
                [128, 129]
            ]
        },
        beta: {
            1: [
                [66, 67]
            ],
            2: [
                [64, 66]
            ],
            6: [
                [66, 70]
            ],
            7: [
                [65, 70]
            ],
            8: [
                [64, 67],
                [69, 70]
            ],
            9: [
                [63, 67],
                [69, 71]
            ],
            10: [
                [62, 66],
                [68, 71]
            ],
            11: [
                [62, 66],
                [68, 71]
            ],
            12: [
                [62],
                [64, 67],
                [69, 70]
            ],
            13: [
                [63, 66]
            ],
            14: [
                [64, 65]
            ],
            15: [
                [62, 65]
            ],
            16: [
                [60, 65]
            ],
            17: [
                [60, 64]
            ],
            18: [
                [59, 64]
            ],
            19: [
                [59, 63]
            ],
            20: [
                [59, 65]
            ],
            21: [
                [56, 60],
                [65, 66]
            ],
            22: [
                [56, 59],
                [64],
                [66, 67],
                [119]
            ],
            23: [
                [56, 59],
                [67],
                [118]
            ],
            24: [
                [57, 58],
                [118]
            ],
            25: [
                [117, 118]
            ],
            26: [
                [116, 117]
            ],
            29: [
                [11, 13]
            ],
            30: [
                [12, 15]
            ],
            31: [
                [13, 16]
            ],
            32: [
                [13, 16]
            ],
            33: [
                [14, 17],
                [20, 21]
            ],
            34: [
                [15, 20]
            ],
            35: [
                [19]
            ],
            40: [
                [106]
            ],
            41: [
                [33],
                [37]
            ],
            42: [
                [32, 37]
            ],
            43: [
                [30],
                [32, 38]
            ],
            44: [
                [30, 39]
            ],
            45: [
                [29, 41]
            ],
            46: [
                [29, 44]
            ],
            47: [
                [28, 45]
            ],
            48: [
                [28, 45]
            ],
            49: [
                [30, 45],
                [120]
            ],
            50: [
                [32, 44],
                [119, 121],
                [125]
            ],
            51: [
                [34, 43],
                [117, 121],
                [125]
            ],
            52: [
                [34, 43],
                [115, 122],
                [124, 125]
            ],
            53: [
                [34, 43],
                [115, 126]
            ],
            54: [
                [35, 42],
                [113, 126]
            ],
            55: [
                [35, 42],
                [111, 127]
            ],
            56: [
                [36, 41],
                [110, 127]
            ],
            57: [
                [37, 39],
                [110, 127]
            ],
            58: [
                [37, 38],
                [110, 127]
            ],
            59: [
                [37, 38],
                [110, 127]
            ],
            60: [
                [36, 38],
                [110, 126]
            ],
            61: [
                [37],
                [110, 113],
                [119, 125]
            ],
            62: [
                [119, 124]
            ],
            63: [
                [120, 123]
            ],
            66: [
                [121]
            ]
        },
        default: {
            0: [
                [42, 54]
            ],
            1: [
                [42, 55],
                [87, 88]
            ],
            2: [
                [41, 54]
            ],
            3: [
                [40, 54],
                [80],
                [90, 94]
            ],
            4: [
                [43, 53],
                [78],
                [87, 95],
                [105]
            ],
            5: [
                [43, 52],
                [77],
                [83, 101],
                [106]
            ],
            6: [
                [43, 52],
                [83, 110]
            ],
            7: [
                [43, 51],
                [71],
                [80, 81],
                [83, 120]
            ],
            8: [
                [42, 49],
                [71, 122]
            ],
            9: [
                [42, 46],
                [51, 54],
                [72, 123]
            ],
            10: [
                [42, 46],
                [52],
                [72, 124]
            ],
            11: [
                [43, 45],
                [72, 121]
            ],
            12: [
                [44],
                [71, 116],
                [120, 121]
            ],
            13: [
                [69, 115],
                [120, 122]
            ],
            14: [
                [68, 114],
                [121, 122]
            ],
            15: [
                [66, 115],
                [122]
            ],
            16: [
                [66, 116]
            ],
            17: [
                [65, 115],
                [117]
            ],
            18: [
                [65, 116],
                [118]
            ],
            19: [
                [64, 71],
                [73],
                [75, 79],
                [82, 115],
                [118]
            ],
            20: [
                [67, 70],
                [76, 79],
                [81, 115]
            ],
            21: [
                [68, 70],
                [77, 79],
                [82, 113]
            ],
            22: [
                [68, 80],
                [83, 113]
            ],
            23: [
                [69],
                [71, 80],
                [83, 111],
                [113]
            ],
            24: [
                [63],
                [65],
                [72, 81],
                [83, 111],
                [114]
            ],
            25: [
                [57, 64],
                [75, 110],
                [114]
            ],
            26: [
                [56, 64],
                [75, 111]
            ],
            27: [
                [56, 66],
                [68, 71],
                [75, 112]
            ],
            28: [
                [55, 80],
                [82, 112]
            ],
            29: [
                [54, 81],
                [83, 112]
            ],
            30: [
                [53, 74],
                [76, 82],
                [84, 112]
            ],
            31: [
                [53, 75],
                [77, 85],
                [90, 110],
                [113]
            ],
            32: [
                [24, 25],
                [52, 76],
                [78, 86],
                [90, 98],
                [102, 107]
            ],
            33: [
                [26],
                [52, 76],
                [79, 86],
                [92, 97],
                [103, 107]
            ],
            34: [
                [28, 29],
                [52, 76],
                [79, 84],
                [93, 96],
                [103, 108],
                [114]
            ],
            35: [
                [20, 22],
                [52, 77],
                [79, 82],
                [93, 95],
                [105, 109],
                [114]
            ],
            36: [
                [20, 22],
                [52, 80],
                [94, 95],
                [105, 109],
                [115]
            ],
            37: [
                [22, 23],
                [28],
                [52, 79],
                [94, 95],
                [105],
                [107, 109],
                [115, 116]
            ],
            38: [
                [22, 23],
                [27, 33],
                [53, 82],
                [95],
                [105],
                [107, 108],
                [116]
            ],
            39: [
                [23, 33],
                [54, 82],
                [96],
                [105],
                [116, 117]
            ],
            40: [
                [26, 35],
                [55, 60],
                [62, 82],
                [113]
            ],
            41: [
                [26, 32],
                [34, 36],
                [64, 81],
                [104],
                [106, 107],
                [112, 113]
            ],
            42: [
                [25, 31],
                [65, 80],
                [105, 107],
                [111, 113]
            ],
            43: [
                [25, 29],
                [31],
                [65, 79],
                [106, 107],
                [110, 113],
                [118]
            ],
            44: [
                [24, 29],
                [64, 78],
                [106, 107],
                [110, 112],
                [120]
            ],
            45: [
                [24, 28],
                [65, 77],
                [107, 108],
                [110, 112],
                [114, 115],
                [121, 124]
            ],
            46: [
                [24, 28],
                [66, 77],
                [107, 108],
                [123, 126]
            ],
            47: [
                [24, 27],
                [66, 77],
                [109],
                [124, 127]
            ],
            48: [
                [25, 27],
                [66, 77],
                [110],
                [117],
                [123, 127]
            ],
            49: [
                [26, 29],
                [66, 77],
                [128]
            ],
            50: [
                [26, 31],
                [66, 77],
                [82]
            ],
            51: [
                [27, 33],
                [66, 77],
                [81, 82]
            ],
            52: [
                [27, 33],
                [66, 76],
                [80, 81]
            ],
            53: [
                [29, 33],
                [66, 75],
                [80, 81]
            ],
            54: [
                [30, 34],
                [66, 74],
                [80, 81]
            ],
            55: [
                [30, 34],
                [67, 75],
                [79, 80]
            ],
            56: [
                [30, 35],
                [67, 74],
                [80]
            ],
            57: [
                [30, 36],
                [67, 73]
            ],
            58: [
                [30, 36],
                [67, 73]
            ],
            59: [
                [30, 36],
                [68, 72]
            ],
            60: [
                [30, 35],
                [68, 72]
            ],
            61: [
                [30, 36],
                [68, 70]
            ],
            62: [
                [30, 37]
            ],
            63: [
                [30, 35]
            ],
            64: [
                [30, 35]
            ],
            65: [
                [30, 34]
            ],
            66: [
                [31, 33]
            ],
            67: [
                [31, 33]
            ],
            68: [
                [31, 33]
            ],
            69: [
                [31, 34]
            ],
            70: [
                [31, 33]
            ],
            71: [
                [32, 33]
            ],
            72: [
                [32, 34]
            ],
            73: [
                [34, 35]
            ]
        }
    },
    draw: function(){

      function doDot(x,y,c,m){
        if(!this.matrix.grid.dots[x] || !this.matrix.grid.dots[x][y]) return;
        var dot = this.matrix.grid.dots[x][y];
        dot.setMagicColour(m);
        dot.setColour(c);
      }

      function processData(dataSet, colour){
        colour = new Colour(colour.r,colour.g,colour.b);
        magic = new Colour(colour.r,colour.g,colour.b);
        magic.add(200);
        for(var y in dataSet){
          for(var ix in dataSet[y]){
            if(dataSet[y][ix].length > 1){
              for(x = dataSet[y][ix][0]; x <= dataSet[y][ix][1]; x++){
                doDot(x,y,colour,magic);
              }
            }else{
              x = dataSet[y][ix][0];
              doDot(x,y,colour,magic);
            }
          }
        }
      }

      processData(this.data.default, {r:52,g:177,b:255});
      processData(this.data.live, {r:177,g:52,b:255});
      processData(this.data.beta, {r:255,g:52,b:177});

    }
  }

  /* / World Map */

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

  var avused = 0;

  function averageColours(col2, col1) {

    newCol = new Colour;
    if (col1.r < col2.r) newCol.r = col1.r + 10;
    else if (col1.r > col2.r) newCol.r = col1.r - 10;
    else newCol.r = col1.r;

    if (col1.g < col2.g) newCol.g = col1.g + 10;
    else if (col1.g > col2.g) newCol.g = col1.g - 10;
    else newCol.g = col1.g;

    if (col1.b < col2.b) newCol.b = col1.b + 10;
    else if (col1.b > col2.b) newCol.b = col1.b - 10;
    else newCol.b = col1.b;

    return newCol;

  }

  this.liveDrawDots = Array();

  if(_settings.liveDraw){
    setTimeout(function(){
      log('liveDraw!');
      _matrix.canvas.addEventListener('click', function(e) {
        var dot;
        if(dot = _matrix.grid.getDotAt(e.offsetX, e.offsetY)){
          _matrix.liveDrawDots.push([dot.x,dot.y]);
          dot.setMagicColour(new Colour(100,100,100));
          dot.setColour(new Colour(127,240,70));
        }
      }, true);
    }, 1000);
  }

  this.grid = new this.Grid(this.width, this.height, this.context);

  var tickCounter = 0;

  this.tick = function() {

    _matrix.context.clearRect(0, 0, _matrix.canvas.width / 2, _matrix.canvas.height / 2);
    _matrix.context.save();

    var start = new Date();

    for (x = 0; x < _matrix.grid.dots.length-1; x ++) {
      for (y = 0; y < _matrix.grid.dots[x].length-1; y ++) {
        _matrix.grid.dots[x][y].magic();
        _matrix.grid.dots[x][y].draw();
      }
    }
    _matrix.context.restore();

    var end = new Date();
    console.log(end-start);

  };

  this.ticker = setInterval(this.tick, 500);

  return this;

};

$(document).ready(function(){

  matrix = new Matrix({
      containerSelector: '#nerdmatrix',
      dotWidth: 5,
      dotHeight: 5,
      dotXSpace: 2,
      dotYSpace: 2,
      minPaddingX: 5,
      minPaddingY: 5,
      liveDraw: true,
      baseColour: {r:230,g:230,b:230}
  });

  matrix.world.draw();

  matrix.typemachine.newLine();
  matrix.typemachine.newLine();
  matrix.typemachine.newLine();
  matrix.typemachine.write('bestest world');

});
