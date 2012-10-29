define([
  'socket'
  ], function () {
    "use strict";

    //FIXME: read from the config
    var backend = document.location.origin;
    return io.connect(backend);
});

