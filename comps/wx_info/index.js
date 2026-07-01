
const plugin = requirePlugin('quecPlugin')
let app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    phoneVisible: {
      type: Boolean,
      value: false
    },
    isCheck: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    primaryColor: '',
    env: app.globalData.envData,
  },

  lifetimes: {
    attached: function () {
      let self = this
      let skin = plugin.theme.getSkin()
      self.setData({
        primaryColor: skin['primary']
      })
    },
    detached: function () { }
  },


  /**
   * 组件的方法列表
   */
  methods: {
    checkTip () {
      return plugin.jsUtil.tip('请勾选服务协议')
    },

    /**
     * 获取用户信息
     * @param {*} e 
     */
    getUserInfo (e) {
      let self = this
      let rsData = {}
      wx.login({
        success: res => {
          rsData.wxCode = res.code
        }, fail () {
          self.triggerEvent('getUserInfo', '')
        }
      })

      wx.getUserProfile({
        desc: '小程序',
        success: (result) => {
          rsData.encryptedData = result.encryptedData
          rsData.iv = result.iv
          rsData.rawData = result.rawData
          rsData.signature = result.signature
          self.triggerEvent('getUserInfo', JSON.stringify(rsData))
        }, fail () {
          self.triggerEvent('getUserInfo', '')
        }
      })
    },

    /**
     * 获取手机号信息
     * @param {*} e 
     */
    getPhoneNumber (e) {
      let detail = e.detail
      if (detail.errMsg.indexOf('user deny') > 0) {
        return plugin.jsUtil.tip('请授权手机号登录')
      } else {
        this.triggerEvent('getPhoneNumber', e.detail)
      }
    },
  }
})
