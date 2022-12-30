const Config = require("./config.js");
const http = require("./http.js");
function makeURL(url) {
	return `https://${Config.JQ_DOMAIN}/apis/${url}`;
}

const getArticleList = (params)=>{
  const requestParam = {
    url: "blogApis/web/article/list",
    method: "GET",
    data: params



  };

  return http.request(requestParam);
}

module.exports = {
  getArticleList: getArticleList,
};