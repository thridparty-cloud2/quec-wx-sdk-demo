import { goShare, jump } from '../../utils/jump.js'
import { getCurPanel } from '../../utils/panel.js'
import resourceKeys from '../../utils/constant.js'
import { getDifLang } from '../../utils/dLang.js'

let app = getApp()
const plugin = requirePlugin('quecPlugin')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    model: {}, //手机型号
    env: app.globalData.envData,
    isToken: false,
    attentionShow: false,
    valaddTxt: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    let self = this

    let diff = getDifLang()
    let valTxt = {
      telTit: diff['valadd'].telTit,
      more: diff['valadd'].more,
      smsTit: diff['valadd'].smsTit,
      serTit: diff['valadd'].serTit
    }
    self.setData({
      valaddTxt: valTxt
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
   * 生命周metadataValue期函数--监听页面初次渲染完成
   */
  onReady () { },

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
    // Demo: house 搜索已移除，仅保留通用搜索
    this.pageRouter.navigateTo({
      url: '/pages/home/sub/non/search/index'
    })
  },

  /**
   * 跳转到蓝牙配网V2
   */
  toNetwork () {
    // Demo: ble/v2 已移除
  },

  //去扫码安装
  toScan (e) {
    this.pageRouter.navigateTo({
      url: '/ble/device_add/index?item=' + e.detail
    })
  },

  /**
   * 家庭管理
   */
  familyList (e) {
    // Demo: mode 已移除
  },

  /**
   * 房间管理
   */
  goRoomList (e) {
    // Demo: mode 已移除
  },
  /**
   * 去设备详情
   */
  goDetail (e) {
    //console.log(e)
    let detail = e.detail
    if (detail.isOta && (detail.shareCode || detail.memberRole == 3)) { //升级中，分享者或普通成员
      return plugin.jsUtil.tip('没有权限')
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
      url: '/ble/device_add/index?item=' + e.detail
    })
  },

  /**
   * 功能介绍
   */
  introduct () {
    // Demo: introduct 页面已移除
  },

  /**
   * 家居模式介绍
   */
  mode () {
    // Demo: mode 页面已移除
  },

  // 跳转到蓝牙配网V1
  toNear () {
    // Demo: ble/v1 已移除
  },

  jump () {
    jump(this)
  },

  /**
   * 泰和banner连接跳转
   */
  bannerLink (e) {
    // Demo: saas 已移除
  },

  /**
   * 青蛙OEM小程序跳转到定制扫一扫
   */
  noScanAndNear () {
    // Demo: dtuScan 已移除
  },

  /**
   * 电话推送
   */
  goTel () {
    // Demo: valadd 已移除
  },

  /**
   * 电话推送
   */
  goSms () {
    // Demo: valadd 已移除
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
  onShareAppMessage () { }
})
