import { home } from "../../utils/jump.js"
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    checked: false,
    env: app.globalData.envData,
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

  },
  /**
   * 去登陆页面
   */
  toLogin () {
    this.pageRouter.navigateTo({
      url: '/user/login/index'
    })
  },

  // 勾选用户协议
  changeProtocol (e) {
    const { detail } = e
    this.setData({
      checked: detail
    })
  },

  /**
    * 微信一键登录回调
    */
  wxLoginResult (e) {
    let self = this
    if (e.detail) {
      home(self)
    }
  },

  // 跳转服务协议
  toProtocol () {
    this.pageRouter.navigateTo({
      url: '/user/protocol/index',
    })
  },
  // 跳转隐私协议
  toPrivacy () {
    this.pageRouter.navigateTo({
      url: '/user/privacy/index',
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
