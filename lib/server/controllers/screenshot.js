'use strict';

function *getScreenshot(next) {
  this.state.value = yield this.device.getScreenshot(this);
  yield next;
}

module.exports = {
  getScreenshot
};
