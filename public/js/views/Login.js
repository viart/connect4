define([
    'jquery',
    'underscore',
    'backbone',
    'pubsub',
    'text!templates/login.html'
  ], function ($, _, Backbone, pubsub, template) {
    "use strict";
    return Backbone.View.extend({

      className: 'login',

      events: {
        'submit form': 'login'
      },

      template: _.template(template),

      initialize: function () {
        _.bindAll(this);
        this.model.on('change:name', this.remove);
      },

      render: function () {
        this.$el.append(this.template());
        return this;
      },

      login: function (e) {
        var name = this.$('.username').val();

        e.preventDefault();
        if (name) {
          pubsub.emit('login', {name: name}, _.bind(this.model.set, this.model));
        }
      }
    });
  }
);
