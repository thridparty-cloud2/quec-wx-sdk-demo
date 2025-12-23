import { setDeviceInfo } from '../../util/tool.js'
import { addRecord } from '../../util/record.js'

const plugin = requirePlugin('quecPlugin')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    agreecheck: {
      type: Boolean,
      value: false
    },
    privacyVersion: {
      type: String,
      value: ''
    },
    protocolVersion: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    phoneNoVisible: false,
    wxUserInfoDecrypData: {},
    random: '',
    wxCode: '',
    wxPhoneDecryptData: {},
    authorizedMobliePhone: true,
    authorizedUserInfo: true,
    i18n: ''
  },

  lifetimes: {
    ready: function () {
      let self = this
      self.setData({
        i18n: plugin.main.getLang(),
      })
    },
    detached: function () { }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
    * 获取用户信息
    * @param {*} 
    */
    getUserInfo (e) {
      let self = this
      let result = JSON.parse(e.detail)
      let wxUserInfoDecrypData = {
        iv: result.iv,
        encryptedData: result.encryptedData
      }
      self.setData({
        wxUserInfoDecrypData: wxUserInfoDecrypData,
        wxCode: result.wxCode
      })
      self.apiLogin()
      plugin.config.setUserInfo(result.rawData)
    },

    /**
     * 获取手机号
     * @param {*} 
     */
    getPhoneNumber (e) {
      let self = this
      let wxPhoneDecryptData = {
        encryptedData: e.detail.encryptedData,
        iv: e.detail.iv
      }
      self.setData({
        wxPhoneDecryptData: wxPhoneDecryptData
      })
      self.apiLogin()
    },

    apiLogin () {
      let self = this
      plugin.jsUtil.load()
      plugin.quecUser.wxLogin({
        appId: plugin.jsConst.APPID,
        authorizedMobliePhone: self.data.authorizedMobliePhone,
        authorizedUserInfo: self.data.authorizedUserInfo,
        wxCode: self.data.wxCode,
        wxUserInfoDecrypData: self.data.wxUserInfoDecrypData ? self.data.wxUserInfoDecrypData : {},
        random: self.data.random ? self.data.random : '',
        wxPhoneDecryptData: self.data.wxPhoneDecryptData ? self.data.wxPhoneDecryptData : {},
        success (res) {
          if (res.code === 200) {
            if (res.data.accessToken) {
              plugin.jsUtil.tip(self.data.i18n['loginSuccTip'], 'success')
              plugin.jsUtil.delayCb(() => {
                self.setData({
                  authorizedMobliePhone: false,
                  authorizedUserInfo: false,
                  phoneNoVisible: false
                })
                setDeviceInfo()
                addRecord(3, 2, self)
                plugin.config.clearStorageByKey('scene')
                plugin.config.clearStorageByKey('activefrid')
                self.triggerEvent('wxLoginSuccess', true)
              })
            } else {
              if (res.data.random) {
                self.setData({
                  random: res.data.random
                })
              }
              self.setData({
                authorizedMobliePhone: true,
                authorizedUserInfo: true,
                phoneNoVisible: true
              })
              self.triggerEvent('wxLoginSuccess', false)
            }
          }
        },
        fail (res) {
        }
      })
    }
  }
})
