'use strict';

module.exports = function *execute(next) {
  const body = this.request.body;
  const script = body.script;
  const args = body.args;
  this.state.value = yield this.device.execute(script, args);
  yield next;
};
