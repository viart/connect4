define(['underscore', 'backbone'], function (_, Backbone) {
  "use strict";

  return Backbone.Model.extend({
    defaults: {
      id: null,
      name: null
    },
    initialize: function () {
      // login simulation
      this.on('change:name', function () {
        this.trigger('login');
      });
    }
  });
});
