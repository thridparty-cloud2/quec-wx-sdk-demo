import { home } from "../../utils/jump.js"

let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    env: app.globalData.envData,
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
  // 跳转验证码登录
  toCodeLogin () {
    this.pageRouter.navigateTo({
      url: '/user/login_code/index',
    })
  },
  // 跳转忘记密码
  toForgetPwd () {
    this.pageRouter.navigateTo({
      url: '/user/forget/index',
    })
  },
  // 登录成功
  loginSuccess () {
    home(this)
  },

  // 跳转注册
  toRegister () {
    this.pageRouter.navigateTo({
      url: '/user/register/index',
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
