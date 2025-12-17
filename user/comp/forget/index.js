import { sendCode, sendPhoneCode, sendForgetEmailCode } from '../../util/tool.js'
const plugin = requirePlugin('quecPlugin')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    uname: {
      type: String,
      value: ''
    },
    type: {
      type: Number,
      value: 2 //2：忘记密码 4：修改密码
    }
  },

  /**
   * 组件的初始数据 
   */
  data: {
    uname: '',
    i18n: '',
    skin: '',
    noRegShow: false,
    unamefocus: false,
    title: '',
    desc: '',
    btnDisabled: false
  },

  lifetimes: {
    ready: function () {
      let self = this
      self.setData({
        i18n: plugin.main.getLang(),
        skin: plugin.main.getSkin()
      })
      this.initTxt()
    },
    detached: function () { }
  },


  /**
   * 组件的方法列表
   */
  methods: {
    initTxt () {
      let self = this
      let { type } = self.properties
      switch (type) {
        case 2:
          self.setData({
            title: self.data.i18n['forgetTitle'],
            desc: self.data.i18n['forgetDesc']
          })
          break
        case 4:
          self.setData({
            title: self.data.i18n['changePwdTit'],
            desc: self.data.i18n['changeDesc']
          })
          break
      }
    },
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
        if (!res.data) {
          self.setData({
            noRegShow: true
          })
        } else {
          self.sendPhoneCode(uname)
        }
      }, (res) => {
        if (!res.data) {
          self.setData({
            noRegShow: true
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
      sendPhoneCode(phone, 2, () => {
        let item = {
          uname: phone,
          type: self.properties.type
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
      sendForgetEmailCode(email, () => {
        let item = {
          uname: email,
          type: self.properties.type
        }
        self.triggerEvent("toEnterCode", item)
      }, (fail) => {

      }, () => {
        self.setData({ btnDisabled: false })
      })
    },

    /**
     * 去注册
     */
    toRegister () {
      this.triggerEvent('toRegister')
    }
  }
})
