const Constant = require("./constants.js");

//获取TOKEN
function getToken() {
	let user = uni.getStorageSync(Constant.JQ_USER_KEY);

	if (!user) {
		return false;
	}

	return user.token;
}

//注销
function logout() {
	uni.setStorageSync(Constant.JQ_USER_KEY, false);
}

module.exports = {
	//检查登录态
	checkSession() {
		uni.checkSession({
			fail: () => {
				logout();
			}
		});
	},

	logout: logout,

	//获取TOKEN
	getToken: getToken,

	//是否已登录
	isLogin: getToken,

	setUser(user) {
		uni.setStorageSync(Constant.JQ_USER_KEY, user);
	},

	getUser() {
		return uni.getStorageSync(Constant.JQ_USER_KEY);
	}
};