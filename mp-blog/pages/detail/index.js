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
  //????????????
  reward() {
    wx.navigateToMiniProgram({
      appId: 'wx18a2ac992306a5a4',
      path: 'pages/apps/largess/detail?id=H1DJCmq6QvY%3D',
      envVersion: 'release',
      success(res) {
        // ????????????
      }
    })
  },
  //????????????
  createPic() {
    var id = this.data.detail.id
    var title = this.data.detail.title
    var shareCode = this.data.shareCode
    var listPic = this.data.detail.listPic
    wx.navigateTo({
      url: '/pages/share/index?id=' + id + '&title=' + title + '&shareCode=' + shareCode + '&listPic=' + listPic,
    })
  },
  //?????????????????????
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
              content: '????????????',
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
              content: '????????????',
              type: 'success'
            });
          }
        }
      })
    }
  },
  //?????????????????????
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
              content: '????????????',
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
              content: '????????????',
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
        content: '?????????????????????',
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
          createTime: "??????",
          commentContent: content,
          nickname: userData.nickname,
          avatar: userData.avatar,
          userId: userData.id
        });
        var comments = this.data.comments
        comments.push.apply(comments, data); //??????????????????????????????????????????????????????

        this.setData({
          comments: comments,
          commentContent: '',
          userId: '',
          comment_count: parseInt(this.data.comment_count) + 1
        })
        console.log(this.data.comments)
        $Message({
          content: '????????????',
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
    //       createdAt: "??????",
    //       content: content,
    //       user: user,
    //       formID: form_Id
    //     });
    //     var comments = this.data.comments

    //     comments.push.apply(comments, data); //??????????????????????????????????????????????????????

    //     this.setData({
    //       comments: comments,
    //       commentContent: '',
    //       userId: '',
    //       comment_count: parseInt(this.data.comment_count) + 1
    //     })
    //     console.log(this.data.comments)
    //     $Message({
    //       content: '????????????',
    //       type: 'success'
    //     });


    //     wx.u.sendNew('own', userData.nickName + "??????" + this.data.detail.title + "???????????????????????????", "", this.data.detail.objectId)
    //     if (userId != '') {
    //       wx.u.sendNew('user', userData.nickName + "??????" + this.data.detail.title + "???????????????????????????", userId, this.data.detail.objectId)
    //       //????????????????????????
    //       let modelData = {
    //         "touser": this.data.openid,
    //         "template_id": "WXM3zHZQX6X6IMqgKux5S6_Z8R3wWCPrQ_oSSH3zBSg", //??????id
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
    //         //?????????
    //         "emphasis_keyword": "keyword2.DATA"
    //       }
    //       //??????Bmob-SDK??????????????????
    //       wx.Bmob.sendWeAppMessage(modelData).then(function (response) {
    //         console.log(response);
    //       }).catch(function (error) {
    //         console.log(error);
    //       });
    //     }
    //   } else {
    //     $Message({
    //       content: '????????????',
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