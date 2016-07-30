
(function() {
  $(function() {

    var elSelector = '#nerdmatrix';

    if (!$(elSelector)) {
      return;
    }

    var el = $(elSelector).append('<canvas></canvas>');
    var canvasSelector = elSelector + " canvas";

    $(canvasSelector)
      .height(el.height())
      .width(el.width());

    var
      minPadding = {
        x: 30,
        y: 30
      },
      dot = { w: 5, h: 5, x_space: 3, y_space: 3 },
      canvas = {
        _instance: $(canvasSelector),
        width: $(canvasSelector).width(),
        height: $(canvasSelector).height(),
      },
      matrix = {
        w: Math.floor((canvas.width - minPadding.x * 2 - dot.x_space) / (dot.w + dot.x_space)),
        h: Math.floor((canvas.height - minPadding.y * 2 - dot.y_space) / (dot.h + dot.y_space)),
      },
      offset = {
        x: canvas.width - (matrix.w * (dot.w + dot.x_space)) - dot.x_space - minPadding.x,
        y: canvas.height - (matrix.h * (dot.h + dot.y_space)) - dot.y_space - minPadding.y
      };

    console.log(canvas, dot, matrix, offset);

  });
}).call(this)
