import { jump } from "../../utils/jump.js"
import { getDifLang } from "../../utils/dLang.js"

const plugin = requirePlugin("quecPlugin")
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    headImage: "",
    nikeName: "",
    phonenumber: "",
    email: "",
    baseImgUrl: app.globalData.baseImgUrl,
    gradientHeight: 150,
    isFinish: false,
    MsgNum: 0,
    isToken: false,
    env: app.globalData.envData,
    valaddTxt: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      gradientHeight: (150 / wx.getWindowInfo().windowHeight).toFixed(2) * 100,
    })

    let diff = getDifLang()
    let valTxt = {
      telTit: diff["valadd"].telTit,
      more: diff["valadd"].more,
      smsTit: diff["valadd"].smsTit,
      serTit: diff["valadd"].serTit,
      set: diff["valadd"].set,
    }
    this.setData({
      valaddTxt: valTxt,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let self = this
    if (typeof self.getTabBar === "function" && self.getTabBar()) {
      self.setData({
        isToken: plugin.config.getToken(),
      })
      if (plugin.config.getToken()) {
        self.initUinfo()
      } else {
        let imgs = plugin.config.getHeadImg(false)
        self.setData({
          headImage: imgs[0],
        })
      }
      wx.nextTick(() => {
        self.getTabBar().setData({
          selected: 1
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
          headImage: hImg,
        })
        self.setData({
          nikeName: result.nikeName ? result.nikeName : "",
        })
      },
      fail (res) { },
      complete () {
        wx.hideToast()
        self.setData({
          isFinish: true,
        })
      },
    })
  },

  /**
   * 个人中心
   */
  goUserInfo () {
    let self = this
    if (self.data.isToken) {
      self.pageRouter.navigateTo({
        url: "/user/info/index",
      })
    } else {
      jump(self)
    }
  },
  /**
   * 关于我们
   */
  goUserAbout () {
    let self = this
    this.pageRouter.navigateTo({
      url: "/user/about/v2/home/index",
    })
  },

  verifyToken () {
    if (!this.data.isToken) {
      this.pageRouter.navigateTo({
        url: "/user/index/index",
      })
      return false
    }
    return true
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () { },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () { },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage () { },
})
