import { toLogin } from '../../utils/tool.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {

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

  goNikeName (e) {
    wx.redirectTo({
      url: '/pages/nickname/index?nikeName=' + e.detail,
    })
  },

  logoutSuccess () {
    toLogin()
  },

  goChangePwd (e) {
    this.pageRouter.navigateTo({
      url: '/pages/edit_pwd/index?uname=' + e.detail,
    })
  },

  goCancel (e) {
    this.pageRouter.navigateTo({
      url: '/pages/cancel_index/index?uname=' + e.detail
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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom () {

  }
})
