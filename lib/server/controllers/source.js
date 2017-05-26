'use strict';

module.exports = function *source(next) {
  this.state.value = yield this.device.getSource();
  yield next;
};
