/* globals DVue */
'use strict';

var app = new DVue({
  el: '[include]',
  data: {
    'seen': true,
    'name': 'My Name',
    'job': 'My Job',
    'num-1': 12,
    'num-2': 5
  },
  expressions: {
    add: function() {
      return this['num-1'] + this['num-2'];
    }
  },
  methods: {
    toggleView: function() {
      this.seen = this.seen === false;
    }
  }
});
