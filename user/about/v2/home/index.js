let app = getApp()
const plugin = requirePlugin('quecPlugin')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    version: '',
    env: app.globalData.envData,
    i18n: '',
    skin: '',
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
    this.setData({
      i18n: plugin.main.getLang(),
      skin: plugin.main.getSkin(),
      version: wx.getAccountInfoSync().miniProgram.version
    })
  },


  call () {
    wx.makePhoneCall({
      phoneNumber: this.data.env['phone']
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
})
