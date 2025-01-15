import { invalid } from '../../../utils/jump.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    curDevice: {},
    pk: '',
    dk: '',
    textDetail: {},
    isSet: true
  },

  handleBack () {
    wx.navigateBack()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    let self = this
    if (options.item) {
      let dItem = JSON.parse(decodeURIComponent(options.item))
      self.setData({
        pk: dItem.productKey,
        dk: dItem.deviceKey,
        curDevice: dItem,
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
    // 下发后清除数据
    this.setData({
      textDetail: {}
    })
  },

  editpage (e) {


  },

  invalid (e) {
    invalid(this)
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
