// 获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    headImage: '',
    nikeName: '',
    phonenumber: '',
    email: '',
    isFinish: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let self = this
    self.initUinfo()
    if (typeof self.getTabBar === 'function' && self.getTabBar()) {
      wx.nextTick(() => {
        self.getTabBar().setData({
          selected: 2
        })
      })
    }
  },

  initUinfo () {
    let self = this
    self.setData({
      headImage: '',
      nikeName: ''
    })
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 2000
    })
    requirePlugin.async('quecPlugin').then(plugin => {
      plugin.quecUser.getUInfo({
        success (res) {
          let result = res.data
          let hImg = result.headimg
          let imgs = plugin.config.getHeadImg(false)
          if (imgs.indexOf(hImg) < 0) {
            hImg = imgs[0]
          }
          self.setData({
            headImage: hImg
          })
          self.setData({
            nikeName: result.nikeName ? result.nikeName : ''
          })
        },
        fail (res) { },
        complete () {
          wx.hideToast()
          self.setData({
            isFinish: true
          })
        }
      })
    }).catch(({ mod, errMsg }) => {
      console.error(`path: ${mod}, ${errMsg}`)
    })

  },

  /**
   * 个人中心
   */
  goUserInfo () {
    this.pageRouter.navigateTo({
      url: '/pages/info/index'
    })
  },
  /**
   * 关于我们
   */
  goUserAbout () {
    this.pageRouter.navigateTo({
      url: '/pages/about/index'
    })
  },


  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },


})
