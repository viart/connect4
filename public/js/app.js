require.config({
  baseUrl: './js/',
  //To get timely, correct error triggers in IE, force a define/shim exports check.
  //enforceDefine: true,
  paths: {
    //app: '../app'
    text: 'lib/require-text/text',
    jquery: 'lib/jquery-1.8.2.min',
    underscore: 'lib/underscore/underscore',
    backbone: 'lib/backbone/backbone',
    bootstrap: 'lib/bootstrap',
    socket: '/socket.io/socket.io'
  },
  shim: {
    jquery: {
      exports: '$'
    },
    underscore: {
      exports: '_'
    },
    backbone: {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },
    bootstrap: ['jquery'],
    socket: {
      exports: 'io'
    }
  }
});

//TODO: move to separated bootstrap-file
require([
    'jquery',
    'backbone',
    'bootstrap',
    'models/User',
    'views/Game',
    'text!templates/top.html',
    'text!templates/rules.html'
  ], function($, Backbone, bootstrap, User, GameView, topTemplate, rulesTemplate) {

  var Router = Backbone.Router.extend({
    routes: {
      '': 'main',
      'top': 'top',
      'rules': 'rules'
    },

    initialize: function () {
      this._container = $('.body');
      this._navBar = $('.navbar .nav');

      Backbone.history.on('route', this._updateNavBar, this);
    },

    main: function() {
      if (!this.gameView) {
        this.gameView = new GameView({
          el: this._container,
          user: new User()
        });
      }
      this.gameView.render();
    },

    top: function () {
      this._container.html(topTemplate);
    },

    rules: function () {
      this._container.html(rulesTemplate);
    },

    _updateNavBar: function () {
      var ancor = Backbone.history.getFragment();
      this._navBar.find('.active').removeClass('active');
      this._navBar.find('a[href="#' + ancor + '"]').parent().addClass('active');
    }
  });

  // Preload CSS Sprite
  //$('<img/>').attr('src', './css/glyphicons.png');

  var router = new Router();
  Backbone.history.start();
});
