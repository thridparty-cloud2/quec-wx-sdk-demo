let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    attrData: {},
    pk: '',
    dk: '',
    textDetail: {}
  },

  handleBack (e) {
    const { detail } = e
    let pages = getCurrentPages()             //  获取页面栈
    let prevPage = pages[pages.length - 2]    // 上一个页面
    prevPage.setData({
      textDetail: detail
    })
    wx.navigateBack()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    let self = this
    if (options.item) {
      self.setData({
        attrData: JSON.parse(options.item),
        pk: options.pk,
        dk: options.dk
      })
    }
  },

  exitToHome () {
    let pages = getCurrentPages()             //  获取页面栈
    let prevPage = pages[pages.length - 2]    // 上一个页面
    prevPage.setData({
      wsBack: true
    })
  },


  reconnectPopup (res) {
    console.log('reconnectPopup:')
    console.log(res)
    let pages = getCurrentPages()             //  获取页面栈
    let prevPage = pages[pages.length - 2]    // 上一个页面
    prevPage.setData({
      wsCon: true
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
    if (app.globalData.appStatus == 'front') {
      this.reconnectPopup()
      wx.nextTick(() => {
        app.globalData.appStatus = ''
      })
    }
  },

  editStructText (e) {
    const { detail } = e
    this.pageRouter.navigateTo({
      url: `/panel/general/struct_txt/index?detail=${JSON.stringify(detail)}`,
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

  },


})
