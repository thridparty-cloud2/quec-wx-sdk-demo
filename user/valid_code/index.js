import { home } from "../../utils/jump.js"

let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    uname: '',
    type: '',
    env: app.globalData.envData,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    let self = this
    if (options.item) {
      let item = JSON.parse(options.item)
      self.setData({
        uname: item.uname,
        type: item.type
      })
    }
  },

  /**
   * 验证码验证通过后跳转到密码设置页面
   */
  codeSuccess (e) {
    this.pageRouter.navigateTo({
      url: '/user/set_pwd/index?item=' + JSON.stringify(e.detail),
    })
  },

  // 登录成功
  loginSuccess () {
    home(this)
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
