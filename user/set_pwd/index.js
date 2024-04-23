import { toLogin } from '../../utils/tool.js'

let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    env: app.globalData.envData,
    item: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    if (options.item) {
      let item = JSON.parse(options.item)
      this.setData({
        item
      })
    }
  },

  /**
   * 注册成功后跳转到登录页
   */
  setSuccess (e) {
    toLogin()
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