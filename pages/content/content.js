//问题详情&回复&修改
const app = getApp();
const util = require('../../utils/util.js');

Page({
    data: {
        content: '',
        id: '',
        commentlist: [],
        listdata: '',
        modeltitle: '',
        modelcontent: '',
        modelpic: '',
        closebutton: false,
        replybutton: true,
        replystatus: false,
        editstatus: false,
        self: false
    },
    onLoad: function (option) {
        this.data.id = option.id;
        //加载问题内容
        app.wxGet(app.path.api + 'faqlist/' + this.data.id, (res) => {
            this.data.listdata = res.data;
            this.setData({
                content: res.data
            });
            app.wxLogin((loginInfo) => {
                let user = true;
                for (let i in app.path.authority) {
                    if (app.path.authority[i] == loginInfo.openid) {
                        user = false;
                        break;
                    }
                }

                if (this.data.listdata.status == '3') {
                    //被关闭的问题
                    this.setData({
                        closebutton: true,
                        replybutton: false
                    });
                } else if (user) {
                    //非管理员
                    this.setData({
                        replystatus: false
                    });
                } else if (loginInfo.openid == this.data.listdata.wxid) {
                    //自己可以修改,删除,关闭
                    this.setData({
                        replybutton: false,
                        self: true
                    });
                }
            });
        });
        this.loadComment();
    },
    loadComment: function () {
        //加载评论内容
        app.wxGet(app.path.api + 'comment?ctid=' + this.data.id, (res) => {
            this.setData({
                commentlist: res.data
            });
        });
    },
    //点击回复按钮
    reply: function () {
        this.setData({
            replystatus: true,
            replybutton: false
        });
    },
    //提交回复
    replyok: function (e) {
        if (e.detail.value.replycontent == '') {
            wx.showToast({
                title: '回复内容不能为空',
                icon: 'none',
                duration: 1000,
                mask: true
            });
        } else {
            app.wxGet(app.path.api + 'comment', (init) => {
                app.wxSetting((userInfo) => {
                    app.wxLogin((loginInfo) => {
                        app.wxPost(app.path.api + 'comment', {
                            'id': init.data.length + 1,
                            "ctid": parseInt(this.data.id),
                            "ctlist": [{
                                "name": userInfo.nickName,
                                "wxid": loginInfo.openid,
                                "avatar": userInfo.avatarUrl,
                                "time": util.formatTime(new Date),
                                "content": e.detail.value.replycontent
                            }]
                        }, () => {
                            this.data.listdata = JSON.stringify(this.data.listdata);
                            this.data.listdata = JSON.parse(this.data.listdata.replace(/"status":"(1|3|4)"/g, '"status":"2"'));
                            //提交数据
                            app.wxPut(app.path.api + 'faqlist/' + this.data.id, this.data.listdata, () => {
                                wx.showToast({
                                    title: '提交成功',
                                    icon: 'success',
                                    duration: 1000,
                                    mask: true
                                });
                                this.loadComment();
                                this.replycancal();
                            });
                        });
                    });
                });
            });
        }
    },
    //取消回复
    replycancal: function () {
        this.setData({
            replystatus: false,
            replybutton: true
        });
    },
    //点击修改按钮
    faqedit: function () {
        this.setData({
            editstatus: true,
            modeltitle: this.data.content.title,
            modelcontent: this.data.content.content,
            modelpic: this.data.content.image
        });
    },
    //提交修改
    editok: function (e) {
        app.wxPut(app.path.api + 'images' + this.data.listdata.id, {
            
        })
        // app.wxPut(app.path.api + 'faqlist/' + this.data.listdata.id, {
        //     'id': this.data.listdata.id,
        //     "wxid": this.data.listdata.wxid,
        //     "name": this.data.listdata.name,
        //     "title": e.detail.value.edittitle,
        //     "content": e.detail.value.editcontent,
        //     "avatar": this.data.listdata.avatar,
        //     "time": util.formatTime(new Date),
        //     "status": this.data.listdata.status,
        //     "image": [
        //         this.data.modelpic
        //     ]
        // }, () => {
        //     wx.showToast({
        //         title: '提交成功',
        //         icon: 'success',
        //         duration: 1000,
        //         mask: true
        //     });
        //     app.wxGet(app.path.api + 'faqlist/' + this.data.id, (res) => {
        //         this.setData({
        //             content: res.data
        //         });
        //     });
        //     this.loadComment();
        //     this.editcancal();
        // });
    },
    //取消修改
    editcancal: function () {
        this.setData({
            editstatus: false,
            self: true
        });
    },
    addpic: function () {
        app.addpic('1', (res) => {
            this.setData({
                modelpic: res.tempFilePaths
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
                        modelpic: ''
                    });
                }
            }
        });
    },
    //删除
    faqdel: function () {
        wx.showModal({
            title: '提示',
            content: '是否删除该条问题？',
            success: (res) => {
                if (res.confirm) {                    
                    //逻辑删除
                    this.data.listdata = JSON.stringify(this.data.listdata);
                    this.data.listdata = JSON.parse(this.data.listdata.replace(/"status":"(1|2|3)"/g, '"status":"4"'));
                    app.wxPut(app.path.api + 'faqlist/' + this.data.id, this.data.listdata, () => {
                        wx.showToast({
                            title: '删除成功',
                            icon: 'success',
                            duration: 1000,
                            mask: true
                        });
                        wx.redirectTo({
                            url: '../list/list'
                        });
                    });

                    //物理删除！！！
                    //删除问题          
                    // app.wxDelete(app.path.api + 'faqlist/' + this.data.id, () => {
                    //     //删除回复
                    //     app.wxGet(app.path.api + 'comment?ctid=' + this.data.id, (msg) => {
                    //         for (let i in msg.data) {
                    //             app.wxDelete(app.path.api + 'comment/' + msg.data[i].id, () => {

                    //             });
                    //         }
                    //     });
                    //     wx.showToast({
                    //         title: '删除成功',
                    //         icon: 'success',
                    //         duration: 1000,
                    //         mask: true
                    //     });
                    //     wx.redirectTo({
                    //         url: '../list/list'
                    //     });
                    // });
                }
            }
        })
    },
    //点击关闭问题按钮
    faqclose: function () {
        wx.showModal({
            title: '提示',
            content: '是否关闭该条问题？',
            success: (res) => {
                if (res.confirm) {
                    this.data.listdata = JSON.stringify(this.data.listdata);
                    this.data.listdata = JSON.parse(this.data.listdata.replace(/"status":"(1|2|4)"/g, '"status":"3"'));
                    app.wxPut(app.path.api + 'faqlist/' + this.data.id, this.data.listdata, () => {
                        wx.showToast({
                            title: '关闭成功',
                            icon: 'success',
                            duration: 1000,
                            mask: true
                        });
                        wx.redirectTo({
                            url: '../list/list'
                        })
                    });
                }
            }
        });
    }    
})