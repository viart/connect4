require('./utils');

function Game(id, options) {
  options = options || {};

  this.id = id;

  this._history = [];
  this._players = [];

  this.initSettings(options);
  this.clear();
}

Game.prototype = {

  clear: function () {
    this.area = [];
    for (var y = this.options.h - 1; y > -1; y--) {
      this.area[y] = [];
      for (var x = this.options.w - 1; x > -1; x--) {
        this.area[y][x] = 0;
      }
    }
  },

  initSettings: function (options) {
    this.options = {
      playersToStart: 2,
      w: 7, h: 6,
      toWin: 4
    }.extend(options);
  },

  join: function (socket, name) {
    if (this._players.length < this.options.playersToStart) {
      this._players.push({
        id: socket.id,
        name: name,
        marker: socket.id,
        socket: socket
      });
      return true;
    }
    return false;
  },

  /**
   * Get Player info by SocketId
   */
  getPlayer: function (userId) {
    for (var i = this._players.length - 1; i > -1; i--) {
      if (this._players[i].id === userId) {
        return this._players[i];
      }
    }
    return false;
  },

  getOpponents: function (userId) {
    return this._players.filter(function (player) {
      return player.id !== userId;
    });
  },

  //FIXME: implement
  disconnect: function (userId) {
    console.error('Not implelemnted');
  },

  handleTurn: function (userId, col) {
    var
      wayToGlory,
      pos,
      marker,
      resp = {};

    if (!this._isMyTurn(userId)) {
      return {status: 'error', error: 'Isn\'t your turn.'};
    }

    marker = this._getMarker(userId);

    pos = this._placeChip(col, marker);
    if (!pos) {
      return {status: 'error', error: 'Wrong column.'};
    }
    resp.pos = pos;

    wayToGlory = this._isWinner(pos, marker);
    if (wayToGlory) {
      resp.status = 'win';
      resp.way = wayToGlory;
    }

    if (!resp.status) {
      resp.status = this._isDraw() ? 'draw' : 'turn';
    }

    this._updateHistory(userId, pos);
    return resp;
  },


  //TODO: can be used for Replays
  _updateHistory: function (userId, pos) {
    this._history.push({
      userId: userId,
      pos: pos
    });
  },

  _checks: [

    // Right Diagonal (mirrored):
    // *--
    // -+-
    // --*
    function (marker, pos) {
      var
        x, y,
        way = [];

      // Top part
      x = pos.x - 1;
      y = pos.y + 1;
      while (x > -1 && y < this.options.h && this._isMyCell(x, y, marker)) {
        way.push({x: x, y: y});
        x--;
        y++;
      }

      // Bottom part
      x = pos.x + 1;
      y = pos.y - 1;
      while (x < this.options.w && y > -1 && this._isMyCell(x, y, marker)) {
        way.push({x: x, y: y});
        x++;
        y--;
      }

      return way;
    },

    // Left Diagonal (mirrored):
    // --*
    // -+-
    // *--
    function (marker, pos) {
      var
        x, y,
        way = [];

      // Top part
      x = pos.x + 1;
      y = pos.y + 1;
      while (x < this.options.w && y < this.options.h && this._isMyCell(x, y, marker)) {
        way.push({x: x, y: y});
        x++;
        y++;
      }

      // Bottom part
      x = pos.x - 1;
      y = pos.y - 1;
      while (x > -1 && y > -1 && this._isMyCell(x, y, marker)) {
        way.push({x: x, y: y});
        x--;
        y--;
      }

      return way;
    },

    // Horizontal:
    // ---
    // *+*
    // ---
    function (marker, pos) {
      var
        x,
        way = [];

      // Left part
      x = pos.x - 1;
      while (x > -1 && this._isMyCell(x, pos.y, marker)) {
        way.push({x: x, y: pos.y});
        x--;
      }

      // Right part
      x = pos.x + 1;
      while (x < this.options.w && this._isMyCell(x, pos.y, marker)) {
        way.push({x: x, y: pos.y});
        x++;
      }

      return way;
    },

    // Vertical (mirrored):
    // - -
    // -+-
    // -*-
    function (marker, pos) {
      var
        way = [],
        y = pos.y - 1;

      while (y > -1 && this._isMyCell(pos.x, y, marker)) {
        way.push({x: pos.x, y: y});
        y--;
      }

      return way;
    }
  ],

  _isMyCell: function (x, y, marker) {
    return this.area[y][x] && this.area[y][x] === marker;
  },

  /**
   * Rules:
   *  - there should be more that 1 player
   *  - you should be one of them
   *  - first joined player should do 1st turn
   *  - previous turn shouldn't be yours
   */
  _isMyTurn: function (userId) {
    var prev = this._history[this._history.length - 1];
    return this._players.length === this.options.playersToStart &&
      this.getPlayer(userId) &&
      ((!prev && userId === this._players[0].id) || (prev && prev.userId !== userId));
  },

  _getMarker: function (userId) {
    return this.getPlayer(userId).marker;
  },

  /**
   * Return false if turn isn't possible and chip's position otherwise
   */
  _placeChip: function (col, marker) {
    var
      row,
      height = this.options.h - 1;

    col = parseInt(col, 10);

    // check is turn within limits and column is not full of chips
    if (col < 0 || col > this.options.w || this.area[height][col]) {
      return false;
    }

    for (var y = height; y > -1 ; y--) {
      if (this.area[y][col]) {
        break;
      }
      row = y;
    }

    this.area[row][col] = marker;
    return {x: col, y: row};
  },

  /**
   * Return Chips list (line) if turn was winning and Null otherwise.
   */
  _isWinner: function (pos, marker) {
    var
      wayToGlory,
      FoundException = {};

    try {

      this._checks.forEach(function (check) {
        var line = check.call(this, marker, pos).concat(pos);
        if (line.length >= this.options.toWin) {
          wayToGlory = line;
          // hack :)
          throw FoundException;
        }
      }, this);

    } catch (e)  {

      if (e === FoundException) {
        //TODO: can be done at the front-end side as well
        return wayToGlory.sort(function(a, b) { return (a.x * 10 + a.y) > (b.x * 10 + b.y); });
      }

      throw e;
    }

    return false;
  },

  _isDraw: function () {
    for (var x = this.options.w - 1; x > -1; x--) {
      for (var y = this.options.h - 1; y > -1; y--) {
        if (!this.area[y][x]) {
          return false;
        }
      }
    }
    return true;
  }
};

module.exports = Game;
