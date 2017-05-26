'use strict';

const chalk = require('chalk');
const errors = require('webdriver-dfn-error-code').errors;

const appium = require('appium-ios-log');
const IOSLog = appium.IOSLog;
const CrashLog = appium.IOSCrashLog;

var mIosLog = null;
var mCrashLog = null;

const _ = require('../../common/helper');
const logger = require('../../common/logger');

const createDevice = function*(caps) {
	const device = detectDevice(caps);

	if(caps.app) {
		caps.app = _.configApp(caps.app);
	}
	caps.show = this._options.window;
	device.proxyMode = false;
	yield device.startDevice(caps);
	return device;
};

const detectDevice = function(desiredCapabilities) {
	let platformName = desiredCapabilities.platformName && desiredCapabilities.platformName.toLowerCase();

	if(platformName === 'desktop') {
		let browserName = desiredCapabilities.browserName && desiredCapabilities.browserName.toLowerCase();

		try {
			var Driver = require(`macaca-${browserName}`)
			return new Driver();
		} catch(e) {
			logger.info(`please run: \`npm install macaca-${browserName} -g\``);
			logger.error(e);
		}
	} else {
		try {
			var Driver = require(`macaca-${platformName}`)
			return new Driver();
		} catch(e) {
			logger.info(`please run: \`npm install macaca-${platformName} -g\``);
			logger.error(e);
		}
	}
};

function* createSession(next) {
	this.sessionId = _.uuid();
	logger.debug(`Creating session, sessionId: ${this.sessionId}.`);
	const body = this.request.body;
	const caps = body.desiredCapabilities;
	const device = yield createDevice.call(this, caps);
	this.device = device;
	this.devices.set(this.sessionId, device);
	this.state.value = caps;
	yield next;
}

function* getSessions(next) {
	this.state.value = Array.from(this.devices.entries()).map(device => {
		const id = device[0];
		const deviceInstances = device[1];
		const capabilities = deviceInstances.getCaps && deviceInstances.getCaps();
		return {
			id,
			capabilities
		};
	});
	yield next;
}

function* delSession(next) {
	const sessionId = this.params.sessionId;
	this.sessionId = sessionId;
	const device = this.devices.get(sessionId);
	if(!device) {
		this.status = 200;
		yield next;
	} else {
		yield device.stopDevice();
		this.devices.delete(sessionId);
		logger.debug(`Delete session, sessionId: ${sessionId}`);
		this.device = null;
		this.status = 200;
		yield next;
	}
}

function* sessionAvailable(sessionId, next) {
	if(this.devices.has(sessionId)) {
		this.sessionId = sessionId;
		this.device = this.devices.get(sessionId);

		var hitProxy = () => {
			if(this.device) {
				return !this.device.whiteList(this) && this.device.proxyMode;
			}
		};

		if(hitProxy()) {
			const body = yield this.device.proxyCommand(this.url, this.method, this.request.body);
			this.body = body;

			const log = _.clone(body);

			if(log.value) {
				log.value = _.trunc(JSON.stringify(log.value), 400);
			}
			logger.debug(`${chalk.magenta('Send HTTP Respone to Client')}[${_.moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')}]: ${JSON.stringify(log)}`);
		} else {
			yield next;
		}
	} else {
		throw new errors.NoSuchDriver();
	}
}

function* startLog(next) {

	const body = this.request.body;
	const opts = body.settings;
	try {
		if(mIosLog == null || mIosLog == undefined) {
			mIosLog = new IOSLog(opts);
		} else {
			mIosLog.stopCapture();
			mIosLog = new IOSLog(opts);
		}
		mCrashLog = new CrashLog();

		mIosLog.startCapture();
		mCrashLog.startCapture();
		this.state.value = {code:0,msg:'success',data:{}};
	} catch(e) {
		this.state.value = {code:1,msg:'error',data:{}};
		console.error(e.message);
	}

	yield next;
}

function* stopLog(next) {
	try {
		if(mIosLog != null )mIosLog.stopCapture();
		if(mCrashLog != null)mCrashLog.stopCapture();
		this.state.value = {code:0,msg:'success',data:{}};
	} catch(e) {
		console.error(e.message);
		this.state.value = {code:1,msg:'stop error',data:{}};
	}
	
	yield next;
}

function* getLogs(next) {
	if(mIosLog == null || mIosLog == undefined){
			this.state.value = {code:1,msg:'you should start first',data:{}};
	}else{
		const logs = mIosLog.getAllLogs();
		this.state.value = {code:0,msg:'success',data:logs};
	}
	yield next;
}

function* getCrashs(next) {
		if(mCrashLog == null || mCrashLog == undefined){
			this.state.value = {code:1,msg:'you should start first',data:{}};
	}else{
		const logs = mCrashLog.getAllLogs();
		this.state.value = {code:0,msg:'success',data:logs};
	}
	yield next;
}

module.exports = {
	sessionAvailable,
	createSession,
	getSessions,
	delSession,
	startLog,
	stopLog,
	getLogs,
	getCrashs
};