Object.defineProperty(Object.prototype, "extend", {
  enumerable: false,
  value: function(from) {
    var
      props = Object.getOwnPropertyNames(from),
      dest = this;
    props.forEach(function(name) {
      if (name in dest) {
        var destination = Object.getOwnPropertyDescriptor(from, name);
        Object.defineProperty(dest, name, destination);
      }
    });
    return this;
  }
});
