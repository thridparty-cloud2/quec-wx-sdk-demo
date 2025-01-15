const plugin = requirePlugin('quecPlugin')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    curDevice: {},
    noDataImg: '',
    i18n: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    if (options.item) {
      let item = JSON.parse(decodeURIComponent(options.item))
      this.setData({
        curDevice: item,
        noDataImg: plugin.assetBase.getBaseImgUrl() + 'images/device/set_v2.png',
        i18n: plugin.main.getLang()
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

})
