import { goShare, home } from '../../../utils/jump.js'
import { getCurPanel } from '../../../utils/panel.js'
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isRefresh: false,
    gradientHeight: 100,
    model: {},
    env: app.globalData.envData
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    let self = this
    self.setData({
      gradientHeight: (240 / wx.getWindowInfo().windowHeight).toFixed(2) * 100
    })
    wx.getSystemInfoAsync({
      success: (res) => {
        let model = {
          brand: res.brand,
          model: res.model
        }
        // 取高度
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
    this.setData({
      isRefresh: true
    })
  },

  back () {
    home(this, true)
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
