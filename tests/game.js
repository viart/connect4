var Game = require('../app/game');

module.exports = {

  setUp: function (callback) {
    this.game = new Game(1, {
      w: 6,
      h: 5,
      toWin: 3
    });
    callback();
  },
  tearDown: function (callback) {
    this.game.clear();
    callback();
  },

  testRightDiagonalCheck: function (test) {
    this.game.area = [
      [0,0,0,0,1,0],
      [0,0,0,1,0,0],
      [0,0,0,0,0,0],
      [0,1,0,0,0,0],
      [1,0,0,0,0,0]
    ];
    test.deepEqual(this.game._isWinner({x: 2, y: 2}, 1), [
      {x: 0, y: 4},
      {x: 1, y: 3},
      {x: 2, y: 2},
      {x: 3, y: 1},
      {x: 4, y: 0}
    ]);
    test.done();
  },

  testLeftDiagonalCheck: function (test) {
    this.game.area = [
      [1,0,0,0,0,0],
      [0,0,0,0,0,0],
      [0,0,1,0,0,0],
      [0,0,0,1,0,0],
      [0,0,0,0,1,0]
    ];
    test.deepEqual(this.game._isWinner({x: 1, y: 1}, 1), [
      {x: 0, y: 0},
      {x: 1, y: 1},
      {x: 2, y: 2},
      {x: 3, y: 3},
      {x: 4, y: 4}
    ]);
    test.done();
  },

  testHorizontalCheck: function (test) {
    this.game.area = [
      [0,0,0,0,0,0],
      [0,0,0,0,0,0],
      [1,1,0,1,1,0],
      [0,0,0,0,0,0],
      [0,0,0,0,0,0]
    ];
    test.deepEqual(this.game._isWinner({x: 2, y: 2}, 1), [
      {x: 0, y: 2},
      {x: 1, y: 2},
      {x: 2, y: 2},
      {x: 3, y: 2},
      {x: 4, y: 2}
    ]);
    test.done();
  },

  testVerticalCheck: function (test) {
    this.game.area = [
      [0,1,0,0,0,0],
      [0,1,0,0,0,0],
      [0,0,0,0,0,0],
      [0,1,0,0,0,0], // <--- impossible
      [0,1,0,0,0,0] // <--- impossible
    ];
    test.deepEqual(this.game._isWinner({x: 1, y: 2}, 1), [
      {x: 1, y: 0},
      {x: 1, y: 1},
      {x: 1, y: 2}
    ]);
    test.done();
  },

  testPlaceChip: function (test) {
    this.game.area = [
      [1,1,1,1,1,0],
      [1,1,1,1,0,0],
      [0,1,0,0,0,0],
      [0,1,0,0,0,0],
      [0,1,0,0,0,0]
    ];
    test.deepEqual(this.game._placeChip(3, 1), {x: 3, y: 2});
    test.deepEqual(this.game._placeChip(5, 1), {x: 5, y: 0});
    test.deepEqual(this.game._placeChip(1, 1), false);
    test.done();
  },

  testTableClear: function (test) {
    this.game.clear();
    test.deepEqual(this.game.area, [
      [0,0,0,0,0,0],
      [0,0,0,0,0,0],
      [0,0,0,0,0,0],
      [0,0,0,0,0,0],
      [0,0,0,0,0,0]
    ]);
    test.done();
  },

  testDraw: function (test) {
    this.game.area = [
      [1,1,1,1,1,1],
      [1,1,1,1,1,1],
      [1,1,1,1,1,1],
      [1,1,1,1,1,1],
      [1,1,1,1,1,1]
    ];
    test.equal(this.game._isDraw(), true);

    this.game.area = [
      [1,1,1,1,1,1],
      [1,1,1,1,1,1],
      [1,1,1,1,1,1],
      [1,1,1,1,1,1],
      [1,1,1,1,1,0]
    ];
    test.equal(this.game._isDraw(), false);
    test.done();
  },

  testJoin: function (test) {
    test.equal(this.game.join({id: 1}, 'UserName1'), true);
    test.equal(this.game.join({id: 2}, 'UserName2'), true);
    test.equal(this.game.join({id: 3}, 'UserName3'), false);
    test.done();
  },

  testIsMyTurn: function (test) {
    test.notEqual(this.game._isMyTurn(100), true);

    this.game.join({id: 1}, 'User1');
    test.notEqual(this.game._isMyTurn(1), true);

    this.game.join({id: 2}, 'User2');
    test.notEqual(this.game._isMyTurn(2), true);
    test.equal(this.game._isMyTurn(1), true);

    test.done();
  }
};
