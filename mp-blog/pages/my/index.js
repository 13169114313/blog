// pages/my/index.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userData: {},
    signNum: 0,
    sign: false,
    signTime: '',
    loading: true,
    noReadNewsCount: 0
  },

  onLoad: function (options) {
    wx.showLoading({
      title: '加载中'
    })
    var that = this
    if (wx.getStorageSync('userInfo')) {
      const userData = wx.getStorageSync('userInfo')
      that.setData({
        userData: userData
      })
    }

    //获取消息未读
    this.setData({
      noReadNewsCount: 100
    })

    wx.http.request({
      url: "blogApis/user/getSignNum",
      method: 'GET',
      callBack: res => {
        var day = new Date(res.data.lastTime).toDateString();
        if (day == new Date().toDateString()){
          that.setData({
            sign:true,
            signTime:res.data.lastTime
          })
        }
        that.setData({
          signNum: res.data.signSum
        })
        that.spinShow()
      }
    })
    // wx.u.getNewsCount().then(res=>{
    //   this.setData({
    //     noReadNewsCount:res.result
    //   })
    // })
  },
  adLoad() {
    wx.hideLoading();
    console.log('Banner 广告加载成功')
  },
  adError(err) {
    wx.hideLoading();
    console.log('Banner 广告加载失败', err)
  },
  adClose() {
    wx.hideLoading();
    console.log('Banner 广告关闭')
  },
  //授权获取用户数据
  bindGetUserInfo() {
    wx.showLoading({
      title: '授权中',
    })

    var that = this
    if (!wx.getStorageSync('userInfo')) {
      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            console.log("用户授权用户信息")
            wx.getUserProfile({
              desc: '用于完善会员资料',
              success: (result) => {
                wx.login({
                  success: (wxLoginRes) => {
                    wx.http.request({
                      url: 'blogApis/user/wxLogin',
                      method: 'POST',
                      data: {
                        code: wxLoginRes.code,
                        encryptedData: result.encryptedData,
                        iv: result.iv,
                        signature: result.signature,
                        rawData: result.rawData,
                        nickName: result.userInfo.nickName,
                        avatarUrl: result.userInfo.avatarUrl
                      },
                      callBack: res => {
                        console.log('登录返回' + res)
                        if (res.code == 200) {
                          wx.setStorageSync('userInfo', res.data)
                          app.globalData.isHasUserInfo = true
                          that.setData({
                            userData: res.data
                          })
                        }
                      }
                    })
                  },
                })

                wx.hideLoading()
              }
            })
          }
        }
      })
    } else {
      that.setData({
        userData: wx.getStorageSync('userInfo')
      })
      wx.hideLoading()
    }
  },
  //签到
  sign() {
    var that = this
    wx.showLoading({
      title: '签到中',
    })
    wx.http.request({
      url: "blogApis/user/saveSign",
      method: 'POST',
      data: {},
      callBack: (res) => {
        if (res.code != 200) {
          return
        }
        that.setData({
          // sign: true,
          signShow: true,
          signTime: res.data.lastTime,
          signNum: res.data.signSum
        })
      }
    });
  },
  //赞赏
  praise() {
    wx.navigateToMiniProgram({
      appId: 'wx18a2ac992306a5a4',
      path: 'pages/apps/largess/detail?id=H1DJCmq6QvY%3D',
      envVersion: 'release',
      success(res) {
        // 打开成功
      }
    })
  },
  //分享
  share() {
  },
  spinShow: function () {
    var that = this
    setTimeout(function () {
      that.setData({
        loading: !that.data.loading,
      });
      console.log("spinShow");
    }, 1500)
  },
  onShareAppMessage() {
    return {
      title: '辻弍博客',
      path: 'pages/index/index',
      imageUrl: '/images/blog.png'
    }
  }
})