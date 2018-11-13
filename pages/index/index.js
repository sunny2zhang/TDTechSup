//首页&授权
const app = getApp();

Page({
    data: {
        authority: false,
        title: 'HI!互动式问答平台',
        copyright: 'Copyright © 2018 TDDX. All Rights Reserved.',
        buttontext: '授权并使用',
        picsrc: '../../img/logo.png',
        canIUse: wx.canIUse('button.open-type.getUserInfo')
    },
    onLoad: function() {       
        wx.showLoading({
            title: '加载中',
        });
        wx.getUserInfo({
            success: res => {
                wx.redirectTo({
                    url: '../list/list'
                })
            },
            fail: err => {
                wx.hideLoading();
                this.setData({
                    authority: true
                });
            }
        });        
    },    
    getUserInfo: function(e) {
        if (e.detail.rawData != undefined) {
            wx.redirectTo({
                url: '../list/list'
            })
        }
    }
})