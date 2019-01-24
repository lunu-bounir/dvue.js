/* globals DVue */
'use strict';

var app = new DVue({
  el: '#app',
  data: {
    seen: true,
    name: 'My Name',
    job: 'My Job',
    range: 7,
    percent: 7 / 20 * 100
  },
  methods: {
    toggleView: function() {
      this.seen = this.seen === false;
    },
    rangeChanged: function() {
      this.percent = (this.range / 20 * 100).toFixed(0);
    }
  }
});
