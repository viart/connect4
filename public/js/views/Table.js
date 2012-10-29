define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/chip.html',
  'text!templates/table.html'
  ], function ($, _, Backbone, chipTemplate, template) {
    "use strict";

    return Backbone.View.extend({
      events: {
        'click .js-col': 'doTurn'
      },

      template: _.template(template),
      chipTemplate: _.template(chipTemplate),

      //TODO: handle page reload
      //FIXME: use settings from the config
      render: function (lockTable) {
        this.$el.append(this.template({
          rows: 7,
          cols: 6
        }));

        return this;
      },

      wayToGlory: function (way) {
        _.each(way, function (point) {
          this.$('#cell-' + point.x + '_' + point.y + ' .chip').addClass('highlight');
        }, this);
      },

      placeChip: function (x, y, isMy) {
        this.$('#cell-' + x + '_' + y).html(this.chipTemplate({isMy: isMy}));
      },

      doTurn: function (e) {
        var col = $(e.currentTarget).data('col');
        this.trigger('select', col);
      },

      lock: function (type, data, isOwn) {
        var
          overlay = this.$('.overlay'),
          placeholder = overlay.find('.text');

        switch (type) {
          case 'win':
            overlay.addClass('win').show();
            placeholder.text('You Won!');
            this.wayToGlory(data.way);
          break;

          case 'lose':
            overlay.addClass('lose').show();
            placeholder.text('You Lose :(');
            this.wayToGlory(data.way);
          break;

          case 'draw':
            overlay.addClass('draw').show();
            placeholder.text('Draw.');
          break;

          case 'join':
          case 'turn':
            if (isOwn) {
              overlay.addClass('wait').show();
              placeholder.text('Waiting for the opponent.');
            } else {
              overlay.removeClass('wait').hide();
            }
          break;
        }
      }
    });
  }
);
