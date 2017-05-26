'use strict';

const os = require('os');

const _ = require('../../common/helper');
const logger = require('../../common/logger');

const arch = os.arch();
const name = os.platform();
const version = '';

module.exports = function *getStatus(next) {
  this.state.value = {
    'build': {

    },
    'os': {
      arch,
      name,
      version
    }
  };
  yield next;
};
