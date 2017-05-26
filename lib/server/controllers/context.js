'use strict';

function *getContext(next) {
  this.state.value = yield this.device.getContext();
  yield next;
}

function *getContexts(next) {
  this.state.value = yield this.device.getContexts();
  yield next;
}

function *setContext(next) {
  const body = this.request.body;
  const name = body.name;
  yield this.device.setContext(name);
  this.state.value = null;
  yield next;
}

module.exports = {
  getContext,
  getContexts,
  setContext
};
