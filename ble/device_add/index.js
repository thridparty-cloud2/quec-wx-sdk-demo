import { home } from '../../utils/jump.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    dItem: undefined,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    let self = this
    if (options.item) {
      self.setData({
        dItem: JSON.parse(options.item)
      })
    }
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

  },

  addSuccess () {
    home(this)
  },

  /**
   * 二维码扫码成功
   * @param {*} e 
   */
  scanSuccess (e) {
    this.pageRouter.navigateTo({
      url: '/ble/device_add/index?item=' + JSON.stringify(e.detail),
    })
  },

  toFamily (e) {
    if (e.detail) {
      this.pageRouter.redirectTo({
        url: '/ble/v2/config/index?item=' + e.detail,
      })
    }
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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom () {

  },

})
