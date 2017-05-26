'use strict';

function *url(next) {
  this.state.value = yield this.device.url();
  yield next;
}

function *getUrl(next) {
  const body = this.request.body;
  const url = body.url;

  this.state.value = yield this.device.get(url);
  yield next;
}

function *forward(next) {
  this.state.value = yield this.device.forward();
  yield next;
}

function *back(next) {
  this.state.value = yield this.device.back();
  yield next;
}

function *refresh(next) {
  this.state.value = yield this.device.refresh();
  yield next;
}

module.exports = {
  url,
  getUrl,
  forward,
  back,
  refresh
};
