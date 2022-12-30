// pages/category/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: true,
    cateList: {},
    current: '',
    current_scroll: '',
    category: '',
    nodata: false, //更多数据
    moreData: true,//更多数据
    articles: [],
    pagination: 1,
    pageSize: 6
  },

  onLoad: function (options) {
    wx.showLoading({
      title: '加载中'
    })
    var that = this
    wx.http.request({
      url: 'blogApis/web/tags/categoryList',
      method: "GET",
      callBack: (res) => {
        this.setData({
          cateList: res.data,
          current: res.data[0].id,
          current_scroll: res.data[0].id,
        })
        this.getArticleList(res.data[0].id, that.data.pagination, that.data.pageSize);
      }
    });
  },
  onReachBottom: function () {
    console.log('加载更多数据')
    if(this.data.moreData){
      this.setData({
        'loadMore': true,
        'bottomWord': '加载中',
      })
      this.getArticleList(this.data.current_scroll, this.data.pageSize, this.data.pagination);
    }
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
  getArticleList(category,pageNo, pageSize) {
    wx.http.request({
      url: 'blogApis/web/article/condition',
      method: "GET",
      data: { categoryId: category, pageNo: pageNo, pageSize: pageSize },
      callBack: (res) => {
          if(res.code != '200'){
            this.spinShow();
            wx.showToast({
              title: res.message,
              icon: "none",
              duration:1500
            });
            return
          }

          if (this.data.pagination == 1) {
            this.spinShow()
          }

        if (res.data.records.length) {
          let pagination = this.data.pagination;
          pagination = pagination ? pagination + 1 : 1;
          this.setData({
            'articles': res.data.records,
            'nodata': false,
            'pagination': pagination
          })
        } else {
          this.setData({
            'moreData':false,
            'articles': [],
            'nodata': true,
          })
        }
      }
    });
  },
  handleChangeScroll({
    detail
  }) {
    console.log(detail)
    this.setData({
      loading: true,
      current_scroll: detail.key,
      pagination: 1
    });
    this.getArticleList(detail.key, this.data.pagination, this.data.pageSize)
  },
  spinShow: function () {
    var that = this
    setTimeout(function () {
      that.setData({
        loading: false,
      });
      console.log("spinShow");
    }, 500)
  },
  detail(e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/detail/index?id=' + id,
    })
  },
  onShareAppMessage() {
    return {
      title: '辻弍博客',
      path: 'pages/index/index',
      imageUrl: '/images/blog.png'
    }
  },
})