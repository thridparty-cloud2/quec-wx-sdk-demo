
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
    let self = this
    requirePlugin.async('quecPlugin').then(plugin => {
      if (!plugin.config.getToken()) return
      setMsgNum(self)
    }).catch(({ mod, errMsg }) => {
      console.error(`path: ${mod}, ${errMsg}`)
    })


    if (typeof self.getTabBar === 'function' && self.getTabBar()) {
      self.getTabBar().setData({
        selected: 0
      })
    }
  },

  goSearch (e) {
    if (e.detail.fid) {
      this.pageRouter.navigateTo({
        url: '/manage/pages/house/search/index?item=' + JSON.stringify(e.detail)
      })
    } else {
      this.pageRouter.navigateTo({
        url: '/manage/pages/non/device_search/index'
      })
    }
  },

  /**
   * 跳转到蓝牙配网
   */
  toNetwork () {
    this.pageRouter.navigateTo({
      url: '/bluetooth/pages/wifi_scan/index'
    })
  },

  //去扫码安装
  toScan (e) {
    this.pageRouter.navigateTo({
      url: '/bluetooth/pages/device_add/index?item=' + e.detail,
    })
  },

  /**
 * 家庭管理
 */
  familyList (e) {
    this.pageRouter.navigateTo({
      url: '/manage/pages/house/family/list/index'
    })
  },

  /**
   * 房间管理
   */
  goRoomList (e) {
    this.pageRouter.navigateTo({
      url: '/pages/house/room/list/index?info=' + JSON.stringify(e.detail)
    })
  },
  /**
  * 去设备详情
  */
  goDetail (e) {
    this.pageRouter.navigateTo({
      url: `/pages/${e.detail.path}/index/index?item=${encodeURIComponent(JSON.stringify(e.detail.item))}`
    })
  },
  /**
   * 去分享页面
   */
  goShare (e) {
    this.pageRouter.navigateTo({
      url: `/device_share/index?item=${encodeURIComponent(JSON.stringify(e.detail))}`,
    })
  },
  /**
    * 去添加设备页面
    */
  scanSuccess (e) {
    this.pageRouter.navigateTo({
      url: '/pages/device_add/index?item=' + JSON.stringify(e.detail)
    })
  },


  /**
   * 物模型属性不存在或出错
   */
  TslError (e) {

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
