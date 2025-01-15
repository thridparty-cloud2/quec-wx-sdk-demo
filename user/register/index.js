Page({

  /**
   * 页面的初始数据
   */
  data: {
    gradientHeight: 100
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    let self = this
    self.setData({
      gradientHeight: (200 / wx.getWindowInfo().windowHeight).toFixed(2) * 100
    })
  },

  /**
   * 去登录
   */
  toLogin () {
    this.pageRouter.navigateTo({
      url: '/user/login/index'
    })
  },

  /**
   * 去输入验证码页面
   */
  toEnterCode (e) {
    this.pageRouter.navigateTo({
      url: '/user/valid_code/index?item=' + JSON.stringify(e.detail)
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
