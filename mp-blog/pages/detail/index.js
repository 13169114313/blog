// pages/detail/index.js
const {
  $Message
} = require('../../dist/base/index');

const app = getApp();

Page({

  data: {
    loading: true,
    result: '',
    detail: {},
    spinShows: '',
    isShow: !1,
    menuBackgroup: !1,
    isCollect: false,
    isLiked: false,
    userInfo: {},
    comments: {},
    comment_count: 0,
    userId: '',
    commentContent: ''
  },

  onLoad: function (options) {
    var that = this;
    var id = options.id
    var userInfo = wx.getStorageSync('userInfo')
    wx.http.request({
      url: "blogApis/web/article/info",
      method: "GET",
      data: { id },
      callBack: (res) => {
        let result = app.towxml(res.data.contentMd, 'markdown', {
          theme: 'light',
          events: {
            tap: (e) => {
              console.log('tap', e);
            }
          }
        });

        res.data.createTime = res.data.createTime.slice(0, 16)
        this.setData({
          result: result,
          detail: res.data,

        })
        spinShows: setTimeout(function () {
          that.setData({
            loading: !that.data.loading,
            userInfo: userInfo
          });
          console.log("spinShow");
        }, 1000)
      }
    })

    // wx.u.getArticleDetail(id).then(res => {
    //   console.log(res)
    //   res.result.createdAt = res.result.createdAt.slice(0, 16)
    // var shareCode = res.result.shareCode
    // if (shareCode == undefined || shareCode == '') {
    //   wx.u.getShareCode(id).then(res1 => {
    //     this.setData({
    //       shareCode: res1.shareCode
    //     })
    //   })
    // } else {
    //   this.setData({
    //     shareCode: shareCode
    //   })
    // }

    // })
    if (wx.getStorageSync('userInfo')) {
      wx.http.request({
        url: "blogApis/web/article/getIsCollect",
        method: 'GET',
        data: { articleId: id },
        callBack: res => {
          if (res.code == 200) {
            this.setData({
              isCollect: res.data
            })
          }
        }
      })

      wx.http.request({
        url: "blogApis/web/article/getIsLiked",
        method: 'GET',
        data: { articleId: id },
        callBack: res => {
          if (res.code == 200) {
            this.setData({
              isLiked: res.data
            })
          }
        }
      })
    }
    wx.http.request({
      url: "blogApis/web/comment/comments",
      method: 'GET',
      data: { articleId: id },
      callBack: res => {
        if (res.code == 200) {
          this.setData({
            comment_count: res.data.commentCount,
            comments: res.data.commentDTOList
          })
        }
      }
    })
  },
  onShareAppMessage() {
    return {
      title: this.data.detail.title,
      path: 'pages/detail/index?id=' + this.data.detail.id,
      imageUrl: '/images/blog.png'
    }
  },
  showHideMenu: function () {
    console.log('show')
    this.setData({
      isShow: !this.data.isShow,
      isLoad: !1,
      menuBackgroup: !this.data.false
    });
  },
  //打开赞赏
  reward() {
    wx.navigateToMiniProgram({
      appId: 'wx18a2ac992306a5a4',
      path: 'pages/apps/largess/detail?id=H1DJCmq6QvY%3D',
      envVersion: 'release',
      success(res) {
        // 打开成功
      }
    })
  },
  //生成海报
  createPic() {
    var id = this.data.detail.id
    var title = this.data.detail.title
    var shareCode = this.data.shareCode
    var listPic = this.data.detail.listPic
    wx.navigateTo({
      url: '/pages/share/index?id=' + id + '&title=' + title + '&shareCode=' + shareCode + '&listPic=' + listPic,
    })
  },
  //取消和收藏文章
  collection(e) {
    console.log(e)
    var id = this.data.detail.id
    var action = e.currentTarget.dataset.action
    if (action == 'noCollect') {
      wx.http.request({
        url: "blogApis/web/article/articleCollect",
        method: "GET",
        data: { articleId: id },
        callBack: res => {
          if (res.code == '200') {
            this.setData({
              isCollect: false
            })
            $Message({
              content: '取消成功',
              type: 'success'
            });
          }
        }
      })
    } else {
      wx.http.request({
        url: "blogApis/web/article/articleCollect",
        method: "GET",
        data: { articleId: id },
        callBack: res => {
          if (res.code == '200') {
            this.setData({
              isCollect: true
            })
            $Message({
              content: '收藏成功',
              type: 'success'
            });
          }
        }
      })
    }
  },
  //取消和点赞文章
  like(e) {
    var id = this.data.detail.id
    var action = e.currentTarget.dataset.action
    if (action == 'noLike') {
      wx.http.request({
        url: "blogApis/web/article/articleLike",
        method: "GET",
        data: { articleId: id },
        callBack: res => {
          if (res.code == '200') {
            this.setData({
              isLiked: false
            })
            $Message({
              content: '取消成功',
              type: 'success'
            });
          }
        }
      })
    } else {
      wx.http.request({
        url: "blogApis/web/article/articleLike",
        method: "GET",
        data: { articleId: id },
        callBack: res => {
          if (res.code == '200') {
            this.setData({
              isLiked: true
            })
            $Message({
              content: '点赞成功',
              type: 'success'
            });
          }
        }
      })
    }
  },
  formSubmit(e) {
    var replyUserId = this.data.userId;
    var content = e.detail.value.inputComment;
    var user = null;
    var articleId = this.data.detail.id
    var parentId = this.data.parentId

    if (!content) {
      $Message({
        content: '请输入评论内容',
        type: 'warning'
      });
      return false;
    }
    if (replyUserId != '') {
      content = content.replace('@' + this.data.userName + " ", "");
      user = {
        nickName: this.data.userName
      }
    }
    var userData = wx.getStorageSync('userInfo');

    wx.http.request({
      url: "blogApis/web/comment/addComment",
      method: 'POST',
      data: {
        replyUserId: replyUserId,
        articleId: articleId,
        commentContent: content,
        userId: userData.id,
        parentId: parentId
      },
      callBack: res => {
        if (res.code != 200) {
          return
        }
        var data = [];
        data.push({
          id: res.data.id,
          createTime: "刚刚",
          commentContent: content,
          nickname: userData.nickname,
          avatar: userData.avatar,
          userId: userData.id
        });
        var comments = this.data.comments
        comments.push.apply(comments, data); //将页面上的数据和最新获取到的数据合并

        this.setData({
          comments: comments,
          commentContent: '',
          userId: '',
          comment_count: parseInt(this.data.comment_count) + 1
        })
        console.log(this.data.comments)
        $Message({
          content: '评论成功',
          type: 'success'
        });
      }
    })

    // wx.u.saveComment(id, userId, content, form_Id).then(res => {
    //   if (res.result) {
    //     var openId = wx.getStorageSync('openid')
    //     var userData = wx.getStorageSync('userInfo');
    //     var objectId = wx.Bmob.User.current().id
    //     var replyer = {
    //       objectId: objectId,
    //       userPic: userData.userPic,
    //       nickName: userData.nickName,
    //       authData: {
    //         weapp: {
    //           openid: openId
    //         }
    //       }
    //     };

    //     var data = [];
    //     data.push({
    //       replyer: replyer,
    //       createdAt: "刚刚",
    //       content: content,
    //       user: user,
    //       formID: form_Id
    //     });
    //     var comments = this.data.comments

    //     comments.push.apply(comments, data); //将页面上的数据和最新获取到的数据合并

    //     this.setData({
    //       comments: comments,
    //       commentContent: '',
    //       userId: '',
    //       comment_count: parseInt(this.data.comment_count) + 1
    //     })
    //     console.log(this.data.comments)
    //     $Message({
    //       content: '评论成功',
    //       type: 'success'
    //     });


    //     wx.u.sendNew('own', userData.nickName + "在《" + this.data.detail.title + "》中评论，请查看！", "", this.data.detail.objectId)
    //     if (userId != '') {
    //       wx.u.sendNew('user', userData.nickName + "在《" + this.data.detail.title + "》中评论，请查看！", userId, this.data.detail.objectId)
    //       //发送模板消息通知
    //       let modelData = {
    //         "touser": this.data.openid,
    //         "template_id": "WXM3zHZQX6X6IMqgKux5S6_Z8R3wWCPrQ_oSSH3zBSg", //模板id
    //         "page": "pages/detail/index?id=" + this.data.detail.objectId,
    //         "form_id": this.data.formID,
    //         "data": {
    //           "keyword1": {
    //             "value": content
    //           },
    //           "keyword2": {
    //             "value": this.data.detail.title
    //           },
    //           "keyword3": {
    //             "value": new Date().toLocaleString()
    //           }
    //         },
    //         //关键字
    //         "emphasis_keyword": "keyword2.DATA"
    //       }
    //       //使用Bmob-SDK发送模板消息
    //       wx.Bmob.sendWeAppMessage(modelData).then(function (response) {
    //         console.log(response);
    //       }).catch(function (error) {
    //         console.log(error);
    //       });
    //     }
    //   } else {
    //     $Message({
    //       content: '评论失败',
    //       type: 'warning'
    //     });
    //   }
    // })


  },
  replyComment(e) {
    this.setData({
      userId: e.currentTarget.dataset.userid,
      userName: e.currentTarget.dataset.nickname,
      commentContent: '@' + e.currentTarget.dataset.nickname + " ",
      articleid: e.currentTarget.dataset.articleid,
      openid: e.currentTarget.dataset.openid,
      parentId: e.currentTarget.dataset.id
    })
  },
  goMy() {
    wx.switchTab({
      url: '/pages/my/index',
    })
  }
})