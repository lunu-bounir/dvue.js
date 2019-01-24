/* global DVue */
'use strict';

var app = new DVue({
  el: '#app',
  data: {
    message: 'Hello Vue!'
  }
});
var app2 = new DVue({
  el: '#app-2',
  data: {
    message: 'You loaded this page on ' + new Date().toLocaleString()
  }
});
var app3 = new DVue({
  el: '#app-3',
  data: {
    seen: true
  }
});
var app4 = new DVue({
  el: '#app-4',
  data: {
    todos: [
      {text: 'Learn JavaScript'},
      {text: 'Learn Vue'},
      {text: 'Build something awesome'}
    ]
  }
});
var app5 = new DVue({
  el: '#app-5',
  data: {
    message: 'Hello Vue.js!'
  },
  methods: {
    reverseMessage: function() {
      this.message = this.message.split('').reverse().join('');
    }
  }
});
