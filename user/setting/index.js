import { home, jump } from '../../utils/jump.js'
const plugin = requirePlugin('quecPlugin')
let app = getApp()
import { getDifLang } from '../../utils/dLang.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    env: app.globalData.envData,

    i18n: '',
    skin: '',
    mode: false,
    changeMode: false,
    modeShow: false,
    modeTip: {
      false: plugin.main.getLang()['closeSucc'],
      true: plugin.main.getLang()['openSucc']
    },
    openHouse: false,
    houseImg: plugin.main.getBaseImgUrl() + 'images/mine/house_img.png',
    homeqipao: plugin.main.getBaseImgUrl() + 'images/mine/house_qipao.png',
    isToken: undefined,
    cacheSize: 0,
    clearShow: false,

    valaddTxt: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    let self = this
    self.setData({
      i18n: plugin.main.getLang(),
      skin: plugin.main.getSkin()
    })

    let diff = getDifLang()
    let valTxt = {
      set: diff['valadd'].set
    }
    self.setData({
      valaddTxt: valTxt
    })

    wx.getStorageInfo({
      success (res) {
        console.log(res.currentSize) //KB

        self.setData({
          cacheSize: res.currentSize
        })
      }
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
    this.setData({
      isToken: plugin.jsUtil.isToken()
    })
    if (this.data.isToken) {
      this.initHouse()
    }
  },

  /**
   * 清空缓存
   */
  clearCache () {
    this.setData({
      clearShow: true
    })
  },

  confirmClear () {
    plugin.config.clearStorageByKey("telSmSwitch")
    this.setData({
      cacheSize: 0
    })
  },

  /**
   * 初始化模式
   */
  initHouse () {
    let self = this
    plugin.core.getMode({
      success (res) {
        self.setData({
          mode: res.data.enabledFamilyMode
        })
      }
    })
  },

  /**
   * 模式change
   */
  modeChange (e) {
    let self = this
    if (self.data.isToken) {
      let mode = e.detail
      self.setData({
        changeMode: mode
      })
      if (!mode) {
        self.setData({
          modeShow: true
        })
      } else {
        self.setData({
          openHouse: true
        })
      }
    } else {
      jump(self)
    }
  },

  /**
   * 关闭
   */
  onClose () {
    this.setData({
      modeShow: false
    })
  },

  /**
   * 关闭时确认修改
   */
  confirmMode () {
    let self = this
    let { changeMode } = self.data
    plugin.smartHome.enabledFamilyMode({
      enabled: changeMode,
      success (res) {
        self.setData({
          mode: changeMode
        })
        plugin.jsUtil.tip(self.data.modeTip[self.data.mode])
        plugin.jsUtil.delayCb(() => {
          plugin.config.clearStorageByKey('family')
          plugin.config.clearStorageByKey('activefrid')
          if (self.data.mode) {
            home(self)
          }
        })
      },
      fail (res) { }
    })
  },

  /**
   * 关闭
   */
  openClose () {
    this.setData({
      openHouse: false
    })
  },

  goPrivacyManage () {
    // Demo: privacy_manage 已移除
  },

  /**
   * 家庭管理
   */
  toHouse () {
    // Demo: mode 已移除
  },

  /**
    * 开启家居模式，进入家居模式介绍页面
    */
  toEnterDetail () {
    // Demo: mode 页面已移除
  },

  /**
   * 推送设置
   */
  goPush () {
    // Demo: valadd 已移除
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
