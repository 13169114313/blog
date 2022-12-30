//app.js
const Bmob = require('utils/Bmob-1.6.5.min.js')
const http = require('utils/http.js')
const Api = require('utils/Api.js')
const utils = require('utils/util.js')
wx.u = utils
wx.http = http
wx.api = Api
App({
  towxml: require('/towxml/index'),
  onLaunch: function () {
    //一键登录
    // Bmob.User.auth().then(res=>{
    //   console.log(res)
    // }).catch(err => {
    //   console.log(err)
    // });
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    if (!wx.getStorageSync('userInfo')) {
      //登录
      wx.login({
        success: res => {
          if (res.code) {
            wx.http.request({
              url: "blogApis/user/getLoginCertificate",
              method: 'GET',
              data: { 'code': res.code },
              callBack: (res) => {
                if (res.data) {
                  wx.setStorageSync('userInfo', res.data);
                  this.globalData.userInfo = res.data
                  this.globalData.isHasUserInfo = true
                }
              }
            })
          }
        }
      })
    }else{
      this.globalData.userInfo = wx.getStorageSync('userInfo')
      this.globalData.isHasUserInfo = true
    }
  },
  globalData: {
    userInfo: null,
    isHasUserInfo: false
  }
})