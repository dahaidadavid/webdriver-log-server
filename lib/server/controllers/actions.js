'use strict';

module.exports = function *actions(next) {
  const body = this.request.body;
  const actions = body.actions;
  this.state.value = yield this.device.handleActions(actions);
  yield next;
};
