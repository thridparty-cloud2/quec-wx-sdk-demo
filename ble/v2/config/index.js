import { home } from '../../../utils/jump.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    succData: [],
    fid: '',
    mode: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    let self = this
    if (options.item) {
      let item = JSON.parse(decodeURIComponent(options.item))
      self.setData({
        succData: item.successData,
        fid: item.fid,
        mode: item.mode
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

  saveSuccess () {
    home(this)
  },

  failOut () {
    home(this)
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
