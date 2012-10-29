define([
  'underscore',
  'backbone',
  'pubsub',
  'views/Login',
  'views/Table',
  'views/Chat'
  ], function (_, Backbone, pubsub, LoginView, TableView, ChatView) {
  "use strict";

  return Backbone.View.extend({
    initialize: function (options) {
      options = options || {};

      this.user = options.user;
      this.user.on('login', function () {
        this.initHandlers();
        this.render();
      }, this);

      this.login = new LoginView({
        model: this.user
      });

      this.table = new TableView({
        el: this.el,
        user: this.user
      });
      this.chat = new ChatView({
        el: this.el,
        user: this.user
      });
    },

    //TODO: error notify
    initHandlers: function () {
      var
        reciever,
        checker;

      function handler(isOwnEvent, context) {
        return _.bind(function (data) {
          if (!data.error) {
            if (data.pos) {
              this.placeChip(data.pos.x, data.pos.y, isOwnEvent);
            }
            this.lock(data.status, data, isOwnEvent);
          }
        }, context);
      }

      // listener for opponent-generated Events
      reciever = handler(false, this.table);

      // listener for self-generated Events
      checker = handler(true, this.table);

      pubsub.on('lose', reciever);
      pubsub.on('draw', reciever);
      pubsub.on('turn', reciever);
      pubsub.on('join', reciever);

      this.table.on('select', function (col) {
        pubsub.emit('turn', {col: col}, checker);
      });
    },

    render: function () {
      // render Login screen for guests
      if (!this.user.id) {
        this.$el.html(this.login.render().el);
      } else {
        this.$el.html('');
        this.table.render();
        this.chat.render();
      }
    }
  });
});
