//发布问题
const app = getApp();
const util = require('../../utils/util.js');

Page({
    data: {
        faqtitle: '',
        faqcontent: '',
        pic: '',
        testpic:''
    },
    onLoad: function () {
        // app.wxGet(app.path.api + 'images/9', (res) => {
        //     this.setData({
        //         testpic: 'data:image/jpeg;base64,' +res.data.wxfile
        //     });
        // });
       
    },
    faqpost: function (e) {
        app.wxGet(app.path.api + 'faqlists?title=' + e.detail.value.title, (msg) => {
            if (msg.data.length != 0){
                wx.showToast({
                    title: '标题重复请修改',
                    icon: 'none',
                    duration: 1000,
                    mask: true
                });
            }else if (e.detail.value.title == '') {
                wx.showToast({
                    title: '标题不能为空',
                    icon: 'none',
                    duration: 1000,
                    mask: true
                });
            } else {
                app.wxSetting((userInfo) => {
                    app.wxGet(app.path.api + 'faqlists', (res) => {
                        app.wxLogin((loginInfo) => {
                            app.wxPost(app.path.api + 'faqlists', {
                                'id': parseInt(res.data[res.data.length - 1].id) + 1,
                                "wxid": loginInfo.openid,
                                "name": userInfo.nickName,
                                "title": e.detail.value.title,
                                "content": e.detail.value.content,
                                "avatar": userInfo.avatarUrl,
                                "time": util.formatTime(new Date),
                                "status": "1",
                                "image": [
                                    this.data.pic
                                ]
                            }, () => {
                                wx.showToast({
                                    title: '提交成功',
                                    icon: 'success',
                                    duration: 1000,
                                    mask: true
                                });
                                setTimeout(() => {
                                    wx.navigateTo({
                                        url: '../list/list'
                                    });
                                }, 1000);
                            });
                        });
                    });
                });
            }
        });        
    },
    addpic: function () {
        app.addpic('9', (res) => {
            this.setData({
                pic: res.tempFilePaths
            });
            wx.getStorage({
                key: 'authorization',
                success(token) {
                    wx.uploadFile({
                        url: app.path.api + 'images', //仅为示例，非真实的接口地址
                        filePath: res.tempFilePaths[0],
                        name: 'file',
                        header: {
                            'content-type': 'application/json',
                            'authorization': token.data
                        },
                        success: (res) => {
                            console.log(JSON.parse(res.data).wxfile);
                            // this.testpic = 'data:image/jpeg;base64,' + res.wxfile;
                        },
                        fail: (err) => {
                            console.log(err);
                        }
                    })
                }
            });
        });
    },
    delpic: function () {
        wx.showModal({
            title: '提示',
            content: '你要删除当前图片吗',
            success: (res) => {
                if (res.confirm) {
                    this.setData({
                        pic: ''
                    });
                }
            }
        })
    }    
})