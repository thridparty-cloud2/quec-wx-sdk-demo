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
          scrollHieght: res.safeArea.bottom - 60 - 130,
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
    this.pageRouter.navigateTo({
      url: `/pages/device_detail/CommonDetail/index?item=${encodeURIComponent(JSON.stringify(e.detail.item))}`,
    })
  },

  /**
    * 物模型属性不存在或出错
    */
  TslError (e) {
    wx.navigateTo({
      url: `/manage/pages/non/panel_no_data/index?item=${encodeURIComponent(JSON.stringify(e.detail.item))}`,
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
    setMsgNum(this)
  },

  /**
   * 
   * 标记已读成功
   */
  readSuccess () {
    this.setData({
      isSet: true
    })
    setMsgNum(this)
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
