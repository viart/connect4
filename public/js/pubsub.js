define([
  'socket'
  ], function () {
    "use strict";

    //FIXME: read from the config
    return io.connect('http://localhost');
});

