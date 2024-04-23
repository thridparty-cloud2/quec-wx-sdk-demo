import { tip } from '../../utils/tip.js'

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
    authVisible: false,
  },

  lifetimes: {
    attached: function () {
      let self = this
      requirePlugin.async('quecPlugin').then(plugin => {
        let skin = plugin.theme.getSkin()
        self.setData({
          primaryColor: skin['primary']
        })
      }).catch(({ mod, errMsg }) => {
        console.error(`path: ${mod}, ${errMsg}`)
      })
    },
    detached: function () { }
  },


  /**
   * 组件的方法列表
   */
  methods: {
    checkTip () {
      tip('请勾选服务协议')
      return
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
        desc: '微信小程序SDK',
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
      console.log(e)
      let self = this
      let detail = e.detail
      if (detail.errMsg.indexOf('user deny') > 0) {
        self.setData({
          authVisible: true
        })
      } else {
        self.setData({
          authVisible: false
        })
        this.triggerEvent('getPhoneNumber', e.detail)
      }
    },
  }
})
