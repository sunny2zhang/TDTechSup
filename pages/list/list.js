//问题列表
const app = getApp();

Page({
    data: {
        faqlist: [],
        faqbutton: false,
        tempdata: false
    },
    onShow: function () {
        app.wxLogin((loginInfo) => {
            //管理员看到所有问题,个人只能看到自己的问题
            let listurl = '';
            for (let i in app.path.authority) {
                if (app.path.authority[i] == loginInfo.openid) {
                    listurl = app.path.api + 'faqlist?_sort=id&_order=DESC';
                    this.setData({
                        faqbutton: true
                    });
                    break;
                } else {
                    listurl = app.path.api + 'faqlist?_sort=id&_order=DESC&wxid=' + loginInfo.openid;
                }
            }
            //加载列表
            app.wxGet(listurl, (res) => {
                if (res.data != '') {
                    this.setData({
                        tempdata: false
                    });
                    this.setData({
                        faqlist: res.data
                    });
                } else {
                    this.setData({
                        tempdata: true
                    });
                }
            });
        });
    },
    onLoad: function () {
        app.wxSetting((userInfo) => {
            app.wxLogin((loginInfo) => {
                wx.request({
                    url: app.path.api + 'authenticate',
                    method: 'POST',
                    data: {
                        "password": "tddx123456",
                        "rememberMe": true,
                        "username": loginInfo.openid
                    },
                    header: {
                        'content-type': 'application/json'
                    },
                    success: (res) => {
                        if (res.statusCode == 200) {
                            wx.setStorage({
                                key: "authorization",
                                data: 'Bearer ' + res.data.id_token
                            })
                        } else {
                            this.register(userInfo, loginInfo, (res) => {
                                if (res.data == 'success'){
                                    wx.showToast({
                                        title: '注册成功！',
                                        icon: 'success',
                                        duration: 1000,
                                        mask: true
                                    });
                                }else{
                                    //注册失败跳转提示信息
                                    wx.showToast({
                                        title: '注册失败，请重新登录小程序',
                                        icon: 'success',
                                        duration: 99999999,
                                        mask: true
                                    });
                                }
                            })
                        }
                    },
                    fail: (err) => {
                        //接口服务没开启
                        console.log(res)
                    }
                });
            })
        })
    },
    register: function (userInfo, loginInfo, callback) {
        console.log(userInfo, loginInfo)
        wx.request({
            url: app.path.api + 'register',
            method: 'POST',
            data: {
                "activated": true,
                "authorities": [
                    "tddx_authorities"
                ],
                "createdBy": "auto",
                "createdDate": new Date(),
                "email": userInfo.nickName + "@tddx.com",
                "firstName": userInfo.nickName,
                "id": parseInt(100000000 * Math.random()),
                "lastModifiedBy": "auto",
                "lastModifiedDate": new Date(),
                "login": loginInfo.openid,
                "password": "tddx123456"
            },
            header: {
                'content-type': 'application/json'
            },
            success: (res) => {
                console.log(res);
                if (callback != undefined) {
                    callback(res);
                }
            },
            fail: (err) => {
                console.log(err);
            }
        })
        // app.wxPost(app.path.api + 'register', {
        //     "activated": true,
        //     "authorities": [
        //         "tddx_authorities"
        //     ],
        //     "createdBy": "auto",
        //     "createdDate": new Date(),
        //     "email": userInfo.nickName + "@tddx.com",
        //     "firstName": userInfo.nickName,
        //     "id": parseInt(100000000 * Math.random()),
        //     "lastModifiedBy": "auto",
        //     "lastModifiedDate": new Date(),
        //     "login": loginInfo.openid,
        //     "password": "tddx123456"
        // }, (res) => {
        //     if (callback != undefined) {
        //         callback();
        //     }
        // }, (err) => {
        //     console.log(res)
        // });
    },
    link: function () {
        wx.navigateTo({
            url: '../release/release'
        });
    },
    content: function (e) {
        wx.navigateTo({
            url: '../content/content?id=' + e.currentTarget.dataset.id
        });
    }
})