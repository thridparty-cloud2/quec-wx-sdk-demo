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
    requirePlugin.async('quecPlugin').then(plugin => {
      if (!plugin.config.getToken()) {
        toLogin()
      }
    }).catch(({ mod, errMsg }) => {
      console.error(`path: ${mod}, ${errMsg}`)
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
      self.getTabBar().setData({
        selected: 0
      })
    }
  },

  /*
   * 跳转到蓝牙配网
   */
  toNetwork () {
    this.pageRouter.navigateTo({
      url: '/pages/wifi_scan/index'
    })
  },

  //去扫码安装
  toScan (e) {
    this.pageRouter.navigateTo({
      url: '/pages/device_add/index?item=' + e.detail,
    })
  },

  /**
  * 去设备详情
  */
  goDetail (e) {
    this.pageRouter.navigateTo({
      url: `/pages/device_detail/CommonDetail/index?item=${encodeURIComponent(JSON.stringify(e.detail.item))}`
    })
  },
  /**
   * 去分享页面
   */
  goShare (e) {
    this.pageRouter.navigateTo({
      url: `/pages/device_share/index?item=${encodeURIComponent(JSON.stringify(e.detail))}`,
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
