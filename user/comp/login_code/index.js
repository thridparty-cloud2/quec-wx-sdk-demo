import { sendCode, sendPhoneCode } from '../../util/tool.js'
const plugin = requirePlugin('quecPlugin')

Component({
  /**
   * 组件的属性列表
   */
  properties: {},

  /**
   * 组件的初始数据
   */
  data: {
    phone: '',
    i18n: '',
    skin: '',
    phonefocus: false,
    btnDisabled: false
  },

  lifetimes: {
    attached: function () {
      this.setData({
        i18n: plugin.main.getLang(),
        skin: plugin.main.getSkin()
      })
    },
    detached: function () {
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    phoneFocus () {
      this.setData({
        phonefocus: true
      })
    },
    phoneBlur () {
      this.setData({
        phonefocus: false
      })
    },

    /**
     * 密码登录
     */
    topwdLogin () {
      this.triggerEvent("topwdLogin")
    },

    /**
     * 立即注册
     */
    toRegister () {
      this.triggerEvent("toRegister")
    },

    // 发送验证码成功进入输入验证码页面
    sendCode () {
      let self = this
      const { phone } = self.data
      sendCode(phone, () => {
        self.sendPhoneCode(phone)
      })
    },

    /**
    * 发送手机验证码
    */
    sendPhoneCode (phone) {
      const self = this
      self.setData({
        btnDisabled: true
      })
      sendPhoneCode(phone, 2, () => {
        let item = {
          uname: phone,
          type: 1
        }
        self.triggerEvent("toEnterCode", item)
      }, (fail) => {

      }, () => {
        self.setData({ btnDisabled: false })
      })
    },

  }
})
