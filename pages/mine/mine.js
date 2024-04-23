import { jump } from '../../utils/jump.js'
const plugin = requirePlugin('quecPlugin')
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
    baseImgUrl: app.globalData.baseImgUrl,
    gradientHeight: 150,
    isFinish: false,
    MsgNum: 0,
    isToken: false,
    env: app.globalData.envData
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      gradientHeight: (150 / wx.getWindowInfo().windowHeight).toFixed(2) * 100
    })
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
    if (typeof self.getTabBar === 'function' && self.getTabBar()) {
      self.setData({
        isToken: plugin.config.getToken()
      })
      if (plugin.config.getToken()) {
        self.initUinfo()
        plugin.quecMsg.getMsgStats({
          success (res) {
            if (res.data) {
              let data = res.data
              let num = Number(data.fault.unRead) + Number(data.inform.unRead) + Number(data.warning.unRead)
              self.setData({
                MsgNum: num
              })
            }
          },
          fail (res) {
            self.setData({
              MsgNum: 0
            })
          }
        })
      } else {
        let imgs = plugin.config.getHeadImg(false)
        self.setData({
          headImage: imgs[0]
        })
      }
      wx.nextTick(() => {
        self.getTabBar().setData({
          selected: 2
        })
      })
    }
  },

  initUinfo () {
    plugin.jsUtil.load(2000)
    let self = this
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
  },

  /**
   * 个人中心
   */
  goUserInfo () {
    this.pageRouter.navigateTo({
      url: '/user/info/index'
    })
  },
  /**
   * 关于我们 
   */
  goUserAbout () {
    this.pageRouter.navigateTo({
      url: '/user/about/v2/home/index'
    })
  },
  /**
   * 系统设置
   */
  goSetting () {
    this.pageRouter.navigateTo({
      url: '/user/setting/index'
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

})
