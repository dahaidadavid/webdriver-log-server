'use strict';

module.exports = function *title(next) {
  this.state.value = yield this.device.title();
  yield next;
};
