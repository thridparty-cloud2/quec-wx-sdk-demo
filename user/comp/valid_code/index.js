import { addRecord } from '../../util/record.js'
import { sendPhoneCode, sendForgetEmailCode, sendRegEmailCode, validateSmsCode, validateEmailCode, setDeviceInfo } from '../../util/tool.js'

const plugin = requirePlugin('quecPlugin')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    type: { //1:验证码登录 2：忘记密码 3：注册 4：修改密码
      type: Number,
      value: 1
    },
    uname: {
      type: String,
      value: ''
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
    uname: '',
    code: '',
    // 倒计时长
    times: 60,
    // 获取验证码按钮文字
    codeText: '',
    // 发送验证码按钮是否可点击
    codeDisabled: false,
    i18n: '',
    skin: '',
    isEmail: '',
    isVFocus: false,
    timer: null
  },

  lifetimes: {
    ready: function () {
      let self = this
      const deviceInfo = wx.getDeviceInfo()
      self.setData({
        i18n: plugin.main.getLang(),
        codeText: plugin.main.getLang()['getCode'],
        skin: plugin.main.getSkin(),
        platform: deviceInfo.platform
      })
    },
    detached: function () {
      // clearInterval(this.data.timer)
    }
  },

  pageLifetimes: {
    show: function () {
      this.initShow()
      this.doLoop()
    },
    hide: function () {
      clearInterval(this.data.timer)
    }
  },

  observers: {
    'uname': function (uname) {
      let self = this
      if (uname.length > 0) {
        self.isEmail(uname)
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    showVCode: function (e) {
      let self = this
      let val = e.detail.value
      self.setData({
        code: e.detail.value,
      })
      if (val.length == 6) {
        self.codeSubmit()
      }
    },

    tapFn (e) {
      this.setData({
        isVFocus: true,
      })
    },

    /**
     * 是否是邮箱
     */
    isEmail (uname) {
      let self = this
      if (uname.indexOf('@') < 0) {
        self.setData({
          isEmail: false
        })
      } else {
        self.setData({
          isEmail: true
        })
      }
    },
    /**
     * 重新获取
     */
    reGet () {
      let self = this
      let { type, uname } = self.properties
      switch (type) {
        case 1: //验证码登录
          sendPhoneCode(uname, 2, () => {
            self.sendSucc()
          }, () => {
            self.clearVal()
          })
          break
        case 2://忘记密码
          self.sendRegAndForget(type, uname)
          break
        case 3://注册
          self.sendRegAndForget(type, uname)
          break
        case 4://修改密码
          self.sendRegAndForget(type, uname)
          break
        default:
          break
      }
    },

    /**
     * 重新发送验证码
     */
    sendRegAndForget (type, uname) {
      let self = this
      let { isEmail } = self.data
      if (isEmail) {
        if (type == 2 || type == 4) { //验证码登录||修改密码
          sendForgetEmailCode(uname, () => {
            self.sendSucc()
          }, () => {
            self.clearVal()
          }, () => { })
        } else if (type == 3) {//注册
          sendRegEmailCode(uname, () => {
            self.sendSucc()
          }, () => {
            self.clearVal()
          })
        }
      } else {
        sendPhoneCode(uname, type, () => {
          self.sendSucc()
        }, () => {
          self.clearVal()
        })
      }
    },

    /**
     * 发送成功
     */
    sendSucc () {
      let self = this
      self.setData({
        times: 60,
        code: ''
      })
      self.doLoop()
    },

    // 获取验证码倒计时
    doLoop () {
      let self = this
      self.data.timer = setInterval(() => {
        let { times } = self.data
        self.setData({
          times: times - 1
        })
        if (times < 0) {
          clearInterval(self.data.timer) //清除js定时器
          self.setData({
            times: 0 //重置时间
          })
        }
      }, 1000)
    },

    // 登录表单提交
    codeSubmit (e) {
      let self = this
      let { uname, code } = self.data
      switch (self.properties.type) {
        case 1://验证码登录
          self.validCode(uname, code, self.properties.type)
          break
        case 2://忘记密码
          self.validCode(uname, code, self.properties.type)
          break
        case 3://注册
          self.validCode(uname, code, self.properties.type)
          break
        case 4://修改密码
          self.validCode(uname, code, self.properties.type)
          break
        default:
          break
      }
    },

    /**
     * 验证码登录
     */
    codeLogin (uname, code) {
      let self = this
      plugin.quecUser.phoneSmsCodeLogin({
        phone: uname,
        smsCode: code,
        success (res) {
          if (res.data.accessToken && res.data.accessToken.token) {
            setDeviceInfo()
            addRecord(2, 2, self)
            plugin.jsUtil.tip(self.data.i18n['loginSuccTip'], 'success')
            plugin.config.clearStorageByKey('scene')
            plugin.config.clearStorageByKey('activefrid')
            clearInterval(self.data.timer)
            self.triggerEvent('loginSuccess')
          }
        },
        fail (res) {
          self.clearVal()
        }
      })
    },

    /**
     * 验证验证码是否有效
     */
    validCode (uname, code, type) {
      let self = this
      let { isEmail } = self.data
      if (isEmail) {
        validateEmailCode(uname, code, () => {
          self.validSucc(uname, code, type)
        }, () => {
          self.validFali()
        })
      } else {
        validateSmsCode(uname, code, () => {
          self.validSucc(uname, code, type)
        }, () => {
          self.validFali()
        })
      }
    },

    /**
     * 验证成功
     */
    validSucc (uname, code, type) {
      let self = this
      if (type == 1) {
        self.codeLogin(uname, code)
      } else {
        clearInterval(self.data.timer)
        let info = { uname, code, type }
        self.triggerEvent('codeSuccess', info)
      }
    },

    /**
     * 验证失败
     */
    validFali () {
      let self = this
      self.setData({
        code: '',
        isVFocus: false
      })
    },

    /**
     * 验证码失败，清除定时器
     */
    clearVal () {
      let self = this
      self.setData({
        code: '',
        times: 0,
        isVFocus: false
      })
      clearInterval(self.data.timer)
    },

    /**
     * show 显示倒计时
     */
    initShow () {
      let self = this
      self.setData({
        code: '',
        times: 60,
        isVFocus: false
      })
    }
  }
})
