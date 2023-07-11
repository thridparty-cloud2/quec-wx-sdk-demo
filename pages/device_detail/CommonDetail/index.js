const plugin = requirePlugin('quecPlugin')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    curDevice: {},
    pk: '',
    dk: '',
    textDetail: {}
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
    //示例调用
    // plugin.quecManage.getTslList({
    //   pk: this.data.pk,
    //   success (res) {
    //     console.log(res)
    //   },
    //   fail (res) {
    //     console.log(JSON.stringify(res))
    //   }
    // })
  },
  editpage (e) {
    let item = e.detail
    const { pk, dk } = this.data
    switch (item.dataType) {
      case 'TEXT':
        wx.navigateTo({
          url: `./device_tsl_text/index?item=${JSON.stringify(item)}`
        })
        break
      case 'ARRAY':
        wx.navigateTo({
          url: `./device_tsl_array/index?item=${encodeURIComponent(JSON.stringify(item))}`
        })
        break
      case 'STRUCT':
        wx.navigateTo({
          url: `./device_tsl_struct/index?item=${JSON.stringify(item)}&pk=${pk}&dk=${dk}`
        })
        break
    }
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
