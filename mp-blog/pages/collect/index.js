// pages/collect/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    articles: {},
    nodata: true,
    loading: true,
  },
  onLoad: function (options) {
    this.setData({
      articles: [],
      nodata: true,
      loading: false
    })
    wx.http.request({
      url: 'blogApis/web/article/getCollectList',
      method: 'GET',
      callBack: res => {
        console.log(res)
        if (res.code != 200) {
          return
        }
        var nodata = true
        if (res.data.length > 0) {
          nodata = false
        }
        for (let object of res.data) {
          object.createTime = object.createTime.slice(0, 10)
        }
        this.setData({
          articles: res.data,
          nodata: nodata,
          loading: false
        })
      }
    })
  },
  detail(e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/detail/index?id=' + id,
    })
  }
})