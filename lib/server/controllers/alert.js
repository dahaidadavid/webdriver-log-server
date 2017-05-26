'use strict';

function *acceptAlert(next) {
  this.state.value = yield this.device.acceptAlert();
  yield next;
}

function *dismissAlert(next) {
  this.state.value = yield this.device.dismissAlert();
  yield next;
}

function *alertText(next) {
  this.state.value = yield this.device.alertText();
  yield next;
}

function *alertKeys(next) {
  const body = this.request.body;
  const text = body.text;

  this.state.value = yield this.device.alertKeys(text);
  yield next;
}

module.exports = {
  acceptAlert,
  dismissAlert,
  alertText,
  alertKeys
};
