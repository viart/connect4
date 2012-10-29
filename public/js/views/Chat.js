define([
  'jquery',
  'underscore',
  'backbone',
  'pubsub',
  'text!templates/userMessage.html',
  'text!templates/chat.html'
  ], function ($, _, Backbone, pubsub, msgTemplate, template) {
    "use strict";

    return Backbone.View.extend({
      events: {
        'submit form': 'send',
        'click .js-toggle': 'toggleTab'
      },

      template: _.template(template),
      msgTemplate: _.template(msgTemplate),

      initialize: function () {
        _.bindAll(this);
        pubsub.on('msg', this.msg);
        pubsub.on('history', this.history);
      },

      render: function () {
        this.$el.append(this.template());

        return this;
      },

      //TODO: add unread msgs counter
      toggleTab: function (e) {
        var $el = $(e.currentTarget);

        e.preventDefault();

        this.$('.active').removeClass('active');
        $el.addClass('active');

        this.$('.well:visible').hide();
        this.$('.chat-' + $el.data('type')).show();
      },

      send: function (e) {
        var
          $msgEl = this.$('.msg'),
          msg = $msgEl.val(),
          type = this.$('.js-toggle.active').data('type');

        e.preventDefault();

        if (msg) {
          $msgEl.val('');
          pubsub.emit('msg', {
            msg: msg,
            type: type
          });
        }
      },

      //TODO: add moment.js, autoscroll
      msg: function (msgData) {
        if (!_.isEmpty(msgData)) {
          this.$('.chat-' + (msgData.type === 'public' ? 'public' : 'private'))
              .append(this.msgTemplate(msgData) + '<hr>');
        }
      },

      history: function (msgsData) {
        if (_.isArray(msgsData) && !_.isEmpty(msgsData)) {
          this.$('.chat-public').append(_.map(msgsData, this.msgTemplate, this).join('<hr>'));
        }
      }
    });
  }
);
