var Board = function() {
  var grid = {};

  /* This is when you use computed literals in ES2015 */
  function addHex(x, y, z, Hex) {
    if (grid[x] !== undefined) {
      if (grid[x][y] !== undefined) {
        grid[x][y][z] = Hex;
      } else {
        grid[x][y] = {};
        grid[x][y][z] = Hex;
      }
    } else {
      grid[x] = {};
      grid[x][y] = {};
      grid[x][y][z] = Hex;
    }
    return this;
  }

  function getHex(x, y, z) {
    return grid[x][y][z] !== undefined ? grid[x][y][z] : null;
  }

  /* for debugging purposes */
  function getGrid(){
    return grid;
  }

  return {
    addHex: addHex,
    getHex: getHex,
    getGrid: getGrid,
  };
};


var Hex = function(x, y, z, raphael_element) {
  var x = x;
  var y = y;
  var z = z;
  var raphael_element = raphael_element;
  var piece = null;

  function getCoords() {
    return [x, y, z];
  }

  function getId() {
    return 'h'+x+"_"+y+"_"+z; // ex: h0_1_-1
  }
  
  function getOrigin() {
    return [
      raphael_element.attrs.path[5][1] - 3, 
      raphael_element.attrs.path[5][2] + 5,
    ];
  }

  function getPiece() {
    return piece;
  }

  function setPiece(Piece) {
    var piece = Piece;
    return this;
  }

  return {
    getCoords: getCoords,
    getId: getId,
    getOrigin: getOrigin,
    getPiece: getPiece,
    setPiece: setPiece,
  }
};


var Piece = function(type, color) {
  var type = type;
  var color = color;
  var captured = false;

  function getType() {
    return type;
  }

  // for pawn promotions!
  function setType(Type) {
    type = Type;
    return this;
  }

  function getColor() {
    return color;
  }

  function isCaptured() {
    return captured;
  }

  function capture() {
    captured = true;
    return this;
  }

  return {
    getType: getType,
    setType: setType,
    getColor: getColor,
    isCaptured: captured,
    capture: capture,
  }
};

var Game = function() {
  var paper = Raphael("board", "100%", "100%");
  var board = new Board();
  var whiteToMove = true;
  var variant = "Glinski";
  var config = variants["Glinski"];

  /* TODO: Abstract these values into the Glinski configuration */
  var HEX_WIDTH = 50;
  var HEX_HEIGHT = Math.sqrt(3) / 2 * HEX_WIDTH;

  /* TODO: Abstract to rely on the variant's configuration, to allow
   * for different size and shape boards 
   */
  var _drawBoard = function() {
    var w = HEX_WIDTH;
    var h = HEX_HEIGHT;

    var _getHexPathstring = function(x, y, w) {
      var coords = [[x, y],
        [x + .25 * w, y + .5 * h],
        [x + .75 * w, y + .5 * h],
        [x + w, y],
        [x + .75 * w, y - .5 * h],
        [x + .25 * w, y - .5 * h]];
      var pathstring = "M";

      for (pair of coords) {
        pathstring += pair[0] + "," + pair[1] + "L";
      }
      pathstring = pathstring.substring(0, pathstring.length - 1) + "Z";
      return pathstring;
    };

    var _addTile = function(x, y, z, rElement) {
      var hex = new Hex(x, y, z, rElement);
      rElement.node.setAttribute('data-x', x);
      rElement.node.setAttribute('data-y', y);
      rElement.node.setAttribute('data-z', z);
      rElement.node.setAttribute('id', 'h' + x + "_" + y + "_" + z);
      board.addHex(x, y, z, hex);
    };

    for (var col = 0; col < 6; col++) {
      for (var row = 0; row < 6 + col; row++) {
        var x = col * .75 * w;
        var y = h * (-.5 * col + row + 3);
        var pathstring = _getHexPathstring(x, y, w)
        var raphael_element = paper.path(pathstring);

        var h_x = col - 5;
        var h_y = 5 - row;
        var h_z = row - col;
        raphael_element.node.setAttribute('class', 'hex hex' + (col + row) % 3);
        _addTile(h_x, h_y, h_z, raphael_element);
      }
    }

    for (var col = 6; col < 11; col++) {
      for (var row = 0; row < 16 - col; row++) {
        var x = col * .75 * w;
        var y = h * (.5 * col + row - 2);
        var pathstring = _getHexPathstring(x, y, w);
        var raphael_element = paper.path(pathstring);

        var h_x = col - 5;
        var h_y = 10 - col;
        var h_z = row - 5;
        raphael_element.node.setAttribute('class', 'hex hex' + ((2 * col) + row + 1) % 3);
        _addTile(h_x, h_y, h_z, raphael_element);
      }
    }
  };

  var _drawPieces = function() {
    for (var color in config.pieces) {
      if (!config.pieces.hasOwnProperty(color)) continue;
      var piecesByColor = config.pieces[color];

      for (var piece in piecesByColor) {
        if (!piecesByColor.hasOwnProperty(piece)) continue;
        var locations = piecesByColor[piece];
        var fileName = "assets/" + color + piece.charAt(0).toUpperCase() + piece.slice(1) + ".svg"
        
        for (var i = 0; i < locations.length; i++) {
          var coordinates = locations[i];
          var hex = board.getHex(coordinates[0], coordinates[1], coordinates[2]);
          var pieceOrigin = hex.getOrigin();
          var newPiece = new Piece(piece, color);
          hex.setPiece(newPiece);
          paper.image(fileName, pieceOrigin[0], pieceOrigin[1], 30, 30);
        }
      }
    }
  };

  function newGame(newVariant) {
    variant = (newVariant === undefined) ? "Glinski" : newVariant;
    config = (newVariant === undefined) ? variants["Glinski"] : variants[newVariant];
    _drawBoard();
    _drawPieces();
  }

  return {
    newGame: newGame,
  }
};


document.addEventListener("DOMContentLoaded", function(event) { 
  var game = new Game();
  game.newGame();  
});