import { setDeviceInfo } from '../../util/tool.js'
import { addRecord } from '../../util/record.js'

const plugin = requirePlugin('quecPlugin')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
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
    // 是否显示密码
    invisiblePwd: true,
    // 用户名
    uname: '',
    // 密码
    pwd: '',
    i18n: '',
    skin: '',
    icon_eye_no: plugin.main.getBaseImgUrl() + 'images/icon_eye_no.png',
    icon_eye: plugin.main.getBaseImgUrl() + 'images/icon_eye.png',
    valid_icon: plugin.main.getBaseImgUrl() + 'images/valid_icon.png',
    unamefocus: false,
    pwdfocus: false,
    tipShow: false,
    confirmTxt: '',
    cancelTxt: '',
    isCancel: '',
    tipcon: '',
    isFmtTitle: false,
    fmtTitle1: '',
    fmtTitle2: '',
    fmtTitle3: '',
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
    pwdFocus () {
      this.setData({
        pwdfocus: true
      })
    },
    pwdBlur () {
      this.setData({
        pwdfocus: false
      })
    },
    // 登录提交
    loginSubmit () {
      let self = this
      const { uname, pwd } = self.data
      if (uname.length == 0 || pwd.length < 6) return
      let params = {}
      if (uname.indexOf('@') < 0) {
        // 校验手机号
        if (!self.validPhone(uname)) {
          return plugin.jsUtil.tip(self.data.i18n['phonePlace'])
        }
        params = {
          internationalCode: '86',
          phone: uname,
          pwd,
        }
        // 手机号登录
        self.submitPhone(params)
      } else {
        // 校验邮箱
        if (!self.validEmail(uname)) {
          return plugin.jsUtil.tip(self.data.i18n['emailPlace'])
        }
        params = {
          email: uname,
          pwd,
        }
        // 邮箱登录
        self.submitEmail(params)
      }
    },
    // 切换密码显示状态
    changePwdState () {
      let self = this
      self.setData({
        unamefocus: false,
        pwdfocus: false,
      })
      wx.nextTick(() => {
        self.setData({
          invisiblePwd: !self.data.invisiblePwd,
        })
      })
    },
    // 更改账号
    changeUname (e) {
      let self = this
      let uname = plugin.jsValid.trimField(e.detail)
      self.setData({ uname })
    },
    // 更改密码
    changePwd (e) {
      let self = this
      let pwd = plugin.jsValid.trimField(e.detail)
      pwd = plugin.jsValid.noChinese(pwd)
      pwd = plugin.jsValid.noEmo(pwd)
      self.setData({ pwd })
    },
    // 手机号校验
    validPhone (value) {
      let valid = true
      if (plugin.jsValid.validPhone(value)) {
        valid = false
      }
      return valid
    },
    // 邮箱校验
    validEmail (value) {
      let valid = true
      if (plugin.jsValid.validEmail(value)) {
        valid = false
      }
      return valid
    },
    // 手机号登录
    submitPhone (params) {
      plugin.jsUtil.load()
      let self = this
      self.setData({
        btnDisabled: true
      })
      plugin.quecUser.phonePwdLogin({
        ...params,
        success () {
          plugin.jsUtil.tip(self.data.i18n['loginSuccTip'], 'success')
          plugin.jsUtil.delayCb(() => {
            addRecord(1, 2, self)
            setDeviceInfo()
            plugin.config.clearStorageByKey('scene')
            plugin.config.clearStorageByKey('activefrid')
            self.triggerEvent('loginSuccess')
          })

        },
        fail (res) {
          self.tipShow(res)
        },
        complete () {
          self.setData({
            btnDisabled: false
          })
        }
      })
    },
    // 邮箱登录
    submitEmail (params) {
      plugin.jsUtil.load()
      let self = this
      self.setData({
        btnDisabled: true
      })
      plugin.quecUser.emailPwdLogin({
        ...params,
        success () {
          plugin.jsUtil.tip(self.data.i18n['loginSuccTip'], 'success')
          plugin.jsUtil.delayCb(() => {
            addRecord(7, 2, self)
            plugin.config.clearStorageByKey('scene')
            plugin.config.clearStorageByKey('activefrid')
            self.triggerEvent('loginSuccess')
          })
        },
        fail (res) {
          self.tipShow(res)
        },
        complete () {
          self.setData({
            btnDisabled: false
          })
        }
      })
    },
    //显示提示
    tipShow (err) {
      let self = this
      if (err.code === 5147) {
        self.setData({
          tipShow: true,
          tipcon: self.data.i18n['timesTip1'],
          confirmTxt: self.data.i18n['timesBtn'],
          isCancel: false,
          isFmtTitle: false,
          fmtTitle1: '',
          fmtTitle2: '',
          fmtTitle3: ''
        })
      } else if (err.code === 5579) {
        self.setData({
          tipShow: true,
          tipcon: '',
          confirmTxt: self.data.i18n['codeTip1'],
          cancelTxt: self.data.i18n['codeContinue'],
          isCancel: true,
          isFmtTitle: true,
          fmtTitle1: self.data.i18n['codeTip2'],
          fmtTitle2: '20',
          fmtTitle3: self.data.i18n['codeTip3']
        })
      }
    },
    // 跳转验证码登录
    toCodeLogin () {
      this.triggerEvent('toCodeLogin')
    },
    // 跳转忘记密码
    toForgetPwd () {
      this.triggerEvent('toForgetPwd')
    },
    //立即注册
    toRegister () {
      this.triggerEvent('toRegister')
    },

    /**
     * 关闭提示弹框
     */
    onClose () {
      this.setData({
        tipShow: false
      })
    },

    /**
     * 确认提示弹框
     */
    tipConfirm () {
      let self = this
      if (self.data.isFmtTitle) {
        self.triggerEvent('toCodeLogin')
      } else {
        self.onClose()
      }
    }
  }
})
