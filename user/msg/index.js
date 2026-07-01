import { getCurPanel } from '../../utils/panel.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollHieght: 400
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    var self = this
    wx.getSystemInfoAsync({
      success: (res) => {
        // 取高度
        self.setData({
          scrollHieght: res.safeArea.bottom - 130,
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
      wx.nextTick(() => {
        self.getTabBar().setData({
          selected: 1
        })
      })
    }
  },

  toDetail (e) {
    getCurPanel(this, e.detail)
  },

  /**
    * 物模型属性不存在或出错
    */
  TslError (e) {
    wx.navigateTo({
      url: `/panel/no_data/index?item=${encodeURIComponent(JSON.stringify(e.detail.item))}`,
    })
  },

  /**
  * 
  * 删除成功
  */
  delSuccess (e) {
    this.setData({
      isSet: true
    })
  },

  /**
   * 
   * 标记已读成功
   */
  readSuccess () {
    this.setData({
      isSet: true
    })
  },

  Back () {
    wx.switchTab({
      url: '/pages/mine/mine',
    })
  },

  /**
  * 
  * 场景详情
  */
  LogDetail (e) {
    // Demo: 智能场景页面已移除
  },

  AutoDetail (e) {
    // Demo: 智能自动化页面已移除
  },

  /**
   * 前往服务详情
   */
  OpenService (e) {
    // Demo: 增值服务页面已移除
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
