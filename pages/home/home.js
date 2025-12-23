import { goShare, jump } from "../../utils/jump.js"
import { getCurPanel } from "../../utils/panel.js"

let app = getApp()
const plugin = requirePlugin("quecPlugin")
Page({
  /**
   * 页面的初始数据
   */
  data: {
    gradientHeight: 100,
    model: {}, //手机型号
    env: app.globalData.envData,
    isToken: false,
    attentionShow: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    let self = this
    self.setData({
      gradientHeight: (150 / wx.getWindowInfo().windowHeight).toFixed(2) * 100,
    })

    wx.getSystemInfoAsync({
      success (res) {
        let model = {
          brand: res.brand,
          model: res.model,
        }
        self.setData({
          model,
        })
      },
    })
  },

  /**
   * 生命周metadataValue期函数--监听页面初次渲染完成
   */
  onReady () { },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow () {
    let self = this
    if (typeof self.getTabBar === "function" && self.getTabBar()) {
      self.setData({
        isToken: plugin.config.getToken(),
        attentionShow: true,
      })
      self.getTabBar().setData({
        selected: 0,
      })
    }
  },

  //去扫码安装
  toScan (e) {
    this.pageRouter.navigateTo({
      url: "/ble/device_add/index?item=" + e.detail,
    })
  },

  /**
   * 去设备详情
   */
  goDetail (e) {
    //console.log(e)
    let detail = e.detail
    if (detail.isOta && (detail.shareCode || detail.memberRole == 3)) {
      //升级中，分享者或普通成员
      return plugin.jsUtil.tip("没有权限")
    }
    getCurPanel(this, detail)
  },

  /**
   * 去分享页面
   */
  goShare (e) {
    goShare(this, e)
  },
  /**
   * 去添加设备页面
   */
  scanSuccess (e) {
    this.pageRouter.navigateTo({
      url: "/ble/device_add/index?item=" + e.detail,
    })
  },

  /**
   * 功能介绍
   */
  introduct () {
    this.pageRouter.navigateTo({
      url: "/user/introduct/index",
    })
  },

  /**
   * 家居模式介绍
   */
  mode () {
    this.pageRouter.navigateTo({
      url: "/user/mode/index",
    })
  },

  // 跳转到蓝牙配网V1
  toNear () {
    this.pageRouter.navigateTo({
      url: "/ble/v1/scan/index",
    })
  },

  jump () {
    jump(this)
  },


  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide () { },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload () { },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage () { },
})
