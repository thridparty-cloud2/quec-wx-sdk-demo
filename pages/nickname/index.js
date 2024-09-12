Page({

  /**
   * 页面的初始数据
   */
  data: {
    nikeName: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    if (options.nikeName) {
      this.setData({
        nikeName: options.nikeName
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

  nicknameEditSuccess () {
    wx.redirectTo({
      url: '/pages/account_info/index',
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