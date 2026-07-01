import { sendCodeWithNoPhoneValid, validateSmsCode, validateEmailCode } from '../../util/tool.js'
const plugin = requirePlugin('quecPlugin')

var timer = null
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    type: {//7-注销 2-关联手机号
      type: Number
    },
    uname: {
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
    keyHeight: 0,
    label: '',
    btnTxt: ''

  },

  lifetimes: {
    ready: function () {
      this.setData({
        i18n: plugin.main.getLang(),
        skin: plugin.main.getSkin()
      })
      this.initTxt()
    },
    detached: function () { }
  },

  observers: {
    'uname': function (uname) {
      let self = this
      if (uname.indexOf('@') > 0) {
        self.setData({
          isPhone: false
        })
      } else {
        self.setData({
          isPhone: true
        })
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    initTxt () {
      let self = this
      self.setData({
        codeText: '获取'
      })
      switch (self.properties.type) {
        case 7:
          self.setData({
            label: '账号',
            btnTxt: '立即注销'
          })
          break
        case 2:
          self.setData({
            label: '手机号',
            btnTxt: '立即授权'
          })
          break
        default:
          break
      }
    },
    // 发送验证码
    sendCode () {
      let self = this
      self.setData({
        codeDisabled: true
      })
      self.doLoop()
      wx.nextTick(() => {
        let { uname } = self.data
        let { type } = self.properties
        sendCodeWithNoPhoneValid(uname, type, () => {
          self.setData({
            isPhone: true
          })
          self.sendSucc()
        }, () => {
          self.setData({
            isPhone: false
          })
          self.sendSucc()
        }, () => {
          self.resetTimer()
        })
      })
    },

    /**
     * 发送成功回调
     */
    sendSucc () {
      let self = this
      plugin.jsUtil.tip(self.data.i18n['sendSucc'])
      self.setData({
        isShow: true
      })
    },

    // 获取验证码倒计时
    doLoop () {
      let self = this
      self.clearTimer()
      timer = setInterval(() => {
        let { times } = self.data
        self.setData({
          times: times - 1
        })
        if (times > 0) {
          self.setData({
            codeText: `${times}s`,
            codeDisabled: true,
          })
        } else {
          self.resetTimer()
        }
      }, 1000)
    },

    /**
     * 重置
     */
    resetTimer () {
      let self = this
      self.clearTimer()
      self.setData({
        codeDisabled: false,
        codeText: '重新获取',
        times: 60 //重置时间
      })
    },

    /**
     * 清除定时器
     */
    clearTimer () {
      if (timer) {
        clearInterval(timer) //清除js定时器
        timer = null
      }
    },

    // 表单提交
    sendSubmit () {
      const self = this
      let { uname, code } = self.data
      if (uname.indexOf('@') < 0) {
        validateSmsCode(uname, code, () => {
          self.validSucc()
        })
      } else {
        validateEmailCode(uname, code, () => {
          self.validSucc()
        })
      }
    },

    /**
     * 验证通过后回调
     */
    validSucc () {
      let self = this
      let { type } = self.properties
      if (type == 2) {
        self.authPhone()
      } else if (type == 7) {
        self.triggerEvent('confrimCancel')
      }
    },

    //关联手机号
    authPhone () {
      let self = this
      plugin.quecUser.relationPhone({
        code: self.data.code,
        phone: self.data.uname,
        success (res) {
          if (res.code === 200) {
            plugin.jsUtil.tip(self.data.i18n['authSucc'], 'success')
            plugin.jsUtil.delayCb(() => {
              self.triggerEvent('authSuccess', true)
            })
          }
        },
        fail (res) { }
      })
    },

    /**
     * 输入框focus
     */
    inputFocus (e) {
      let self = this
      if (e.detail.height) {
        self.setData({
          keyHeight: e.detail.height
        })
        self.triggerEvent('KeyHeight', self.data.keyHeight)
      }
    },

    /**
     * 输入框blur
     */
    inputBlur (e) {
      let self = this
      self.setData({
        keyHeight: 0
      })
      self.triggerEvent('KeyHeight', self.data.keyHeight)
    }

  }
})
