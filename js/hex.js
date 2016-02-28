var Hexagon = function() {
  var leftX;
  var leftY;
  var width;
  var height;

  function init(x, y, w) {
    leftX = x;
    leftY = y;
    width = w;
    height = Math.sqrt(3) / 2 * width;
  };

  function getCoords() {
    return [
      [leftX, leftY],
      [leftX + .25 * width, leftY + .5 * height],
      [leftX + .75 * width, leftY + .5 * height],
      [leftX + width, leftY],
      [leftX + .75 * width, leftY - .5 * height],
      [leftX + .25 * width, leftY - .5 * height],
    ];
  };

  function getPathstring() {
    var coords = getCoords();
    var pathstring = "M";
    for (pair of coords) {
      pathstring += pair[0] + "," + pair[1] + "L";
    }
    pathstring = pathstring.substring(0, pathstring.length - 1) + "Z";
    return pathstring;
  };
  
  return {
    init: init,
    getPathstring: getPathstring,
    getCoords: getCoords,
  }
}();

function labelNode(x, y, z, rElement, hexGrid){
  rElement.node.setAttribute('data-x', x);
  rElement.node.setAttribute('data-y', y);
  rElement.node.setAttribute('data-z', z);
  rElement.node.setAttribute('id', ''+x+"_"+y+"_"+z);

  if (x in hexGrid) {
    if (y in hexGrid[x]){
      hexGrid[x][y][z] = rElement;
    } else {
      hexGrid[x][y] = { z: rElement};
    }
  } else {
    hexGrid[x] = { y : {z: rElement}};
  }
  return hexGrid;
}

function drawBoard(paper){
  var W = 50;
  var H = Math.sqrt(3) / 2 * W;
  var hexGrid = {};

  for (var col = 0; col<6; col++){
    for (var row = 0; row < 6 + col; row++){
      Hexagon.init(col * .75 * W, (3 - .5 * col)*H + (row * H), W);
      var h = paper.path(Hexagon.getPathstring());
      var h_x = col - 5;
      var h_y = 5 - row;
      var h_z = row - col;
      h.node.setAttribute('class', 'hex hex' + (col+row)%3);
      hexGrid = labelNode(h_x, h_y, h_z, h, hexGrid);
    }
  }

  for (var col = 6; col<11; col++){
    for (var row = 0; row < 16 - col; row++){
      Hexagon.init(col * .75 * W, (.5 * H * (col-6)) + ((row+ 1) * H), W);
      var h = paper.path(Hexagon.getPathstring());
      var h_x = col - 5;
      var h_y = 10 - col;
      var h_z = row - 5;
      h.node.setAttribute('class', 'hex hex' + ((2*col)+row+1)%3);
      hexGrid = labelNode(h_x, h_y, h_z, h, hexGrid);
    }
  }
  return hexGrid;
}

document.addEventListener("DOMContentLoaded", function(event) { 
  var paper = Raphael("board", "100%", "100%");
  var hexGrid = drawBoard(paper);
  console.log(hexGrid);
});