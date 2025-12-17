import { sendCode, sendPhoneCode, sendRegEmailCode } from '../../util/tool.js'
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
    uname: '',
    code: '',
    i18n: '',
    skin: '',
    existShow: false,
    unamefocus: false,
    btnDisabled: false
  },

  pageLifetimes: {
    show: function () {
      this.setData({
        i18n: plugin.main.getLang(),
        skin: plugin.main.getSkin()
      })
    },
    hide: function () {
      this.setData({
        code: ''
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    unameFocus () {
      this.setData({
        unamefocus: true
      })
    },
    unameBlur () {
      this.setData({
        unamefocus: false
      })
    },
    // 发送验证码
    sendCode () {
      let self = this
      const { uname } = self.data
      sendCode(uname, (res) => {
        if (res.data) {
          self.setData({
            existShow: true
          })
        } else {
          self.sendPhoneCode(uname)
        }
      }, (res) => {
        if (res.data) {
          self.setData({
            existShow: true
          })
        } else {
          self.sendEmailCode(uname)
        }
      })
    },

    // 发送手机验证码
    sendPhoneCode (phone) {
      const self = this
      self.setData({
        btnDisabled: true
      })
      sendPhoneCode(phone, 3, () => {
        let item = {
          uname: phone,
          type: 3
        }
        self.triggerEvent("toEnterCode", item)

      }, (fail) => {

      }, () => {
        self.setData({ btnDisabled: false })
      })
    },
    // 发送邮箱验证码
    sendEmailCode (email) {
      const self = this
      self.setData({
        btnDisabled: true
      })
      sendRegEmailCode(email, () => {
        let item = {
          uname: email,
          type: 3
        }
        self.triggerEvent("toEnterCode", item)
      }, () => {

      }, () => {
        self.setData({
          btnDisabled: false
        })
      })
    },

    onClose () {
      this.setData({
        existShow: false
      })
    },

    /**
     * 去登录
     */
    toLogin () {
      this.triggerEvent('toLogin')
    }
  }
})
