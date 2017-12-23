const crypto = require('crypto').randomBytes(256).toString('hex');

module.exports = {
	uri: 'mongodb://localhost:27017/angular-2-project',
	secret:crypto,
	db:'angular-2-project'
}