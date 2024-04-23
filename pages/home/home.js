import { goShare, jump } from '../../utils/jump.js'
import { getCurPanel } from '../../utils/panel.js'
let app = getApp()
const plugin = requirePlugin('quecPlugin')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    gradientHeight: 100,
    model: {}, //手机型号
    env: app.globalData.envData,
    isToken: false,
    attentionShow: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    let self = this
    self.setData({
      gradientHeight: (150 / wx.getWindowInfo().windowHeight).toFixed(2) * 100
    })

    wx.getSystemInfoAsync({
      success (res) {
        let model = {
          brand: res.brand,
          model: res.model
        }
        self.setData({
          model
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow () {
    let self = this
    if (typeof self.getTabBar === 'function' && self.getTabBar()) {
      self.setData({
        isToken: plugin.config.getToken(),
        attentionShow: true
      })
      self.getTabBar().setData({
        selected: 0
      })
    }
  },

  goSearch (e) {
    if (e.detail.fid) {
      this.pageRouter.navigateTo({
        url: '/mode/house/search/index?item=' + JSON.stringify(e.detail)
      })
    } else {
      this.pageRouter.navigateTo({
        url: '/mode/non/search/index'
      })
    }
  },

  /**
   * 跳转到蓝牙配网V2
   */
  toNetwork () {
    this.pageRouter.navigateTo({
      url: '/ble/v2/scan/index'
    })
  },

  //去扫码安装
  toScan (e) {
    this.pageRouter.navigateTo({
      url: '/ble/device_add/index?item=' + e.detail,
    })
  },

  /**
 * 家庭管理
 */
  familyList (e) {
    this.pageRouter.navigateTo({
      url: '/mode/house/family/list/index'
    })
  },

  /**
   * 房间管理
   */
  goRoomList (e) {
    this.pageRouter.navigateTo({
      url: '/mode/house/room/list/index?info=' + JSON.stringify(e.detail)
    })
  },
  /**
  * 去设备详情
  */
  goDetail (e) {
    getCurPanel(this, e.detail)
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
      url: '/ble/device_add/index?item=' + e.detail
    })
  },

  /**
    * 功能介绍
    */
  introduct () {
    this.pageRouter.navigateTo({
      url: '/user/introduct/index'
    })
  },

  /**
   * 家居模式介绍
   */
  mode () {
    this.pageRouter.navigateTo({
      url: '/user/mode/index'
    })
  },

  // 跳转到蓝牙配网V1
  toNear () {
    this.pageRouter.navigateTo({
      url: '/ble/v1/scan/index'
    })
  },

  jump () {
    jump(this)
  },

  /**
   * 泰和banner连接跳转
   */
  bannerLink (e) {
    this.pageRouter.navigateTo({
      url: '/saas/taihe/banlink/index?url=' + e.detail
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload () {

  },


})
