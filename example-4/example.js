'use strict';

var app = new DVue({
  el: '[include]',
  data: {
    html: '...'
  },
  methods: {
    compile: function({target}) {
      const {value} = target;
      this.html = marked(value, { sanitize: true });
    }
  }
});
