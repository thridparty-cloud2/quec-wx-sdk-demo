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
    isSet: true,
    wsBack: false,
    wsCon: false,
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

  getwsResult (res) {
    console.log('getwsResult:')
    console.log(res)
    let detail = res.detail
    this.setData({
      wsBack: detail.wsBack,
      wsCon: detail.wsCon
    })
  },

  editpage (e) {
    let item = e.detail
    const { pk, dk } = this.data
    switch (item.dataType) {
      case 'TEXT':
        this.pageRouter.navigateTo({
          url: `/panel/general/txt/index?item=${JSON.stringify(item)}`
        })
        break
      case 'ARRAY':
        this.pageRouter.navigateTo({
          url: `/panel/general/arr/index?item=${encodeURIComponent(JSON.stringify(item))}`
        })
        break
      case 'STRUCT':
        this.pageRouter.navigateTo({
          url: `/panel/general/struct/index?item=${JSON.stringify(item)}&pk=${pk}&dk=${dk}`
        })
        break
    }
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage (res) {
    // console.log('用户点击右上角分享')
    // console.log(res)
    // let item = res.target.dataset.cur
    // return {
    //   title: '分享设备' + item.deviceName,
    //   imageUrl: 'https://iot-oss.quectelcn.com/wxsdk_img/example/images/logo_v1.png',
    //   path: `/panel/general/index/index?item=${encodeURIComponent(JSON.stringify(item))}`,
    //   success: function (res) {
    //     console.log('分享成功')
    //     console.log(res)
    //     // 转发成功
    //     wx.showToast({
    //       title: "分享成功",
    //       icon: 'success',
    //       duration: 2000
    //     })
    //   },
    //   fail: function (res) {
    //     console.log('分享失败')
    //   },
    // }

  }

})
