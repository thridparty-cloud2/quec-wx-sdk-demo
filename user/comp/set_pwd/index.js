const plugin = requirePlugin('quecPlugin')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item: {
      type: Object,
      value: {}
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
    pwd: '',
    confirmPwd: '',
    // 是否显示密码
    invisiblePwd: true,
    invisibleConfirmPwdPwd: true,
    i18n: '',
    skin: '',
    item: {},
    icon_eye: plugin.main.getBaseImgUrl() + 'images/icon_eye.png',
    icon_eye_no: plugin.main.getBaseImgUrl() + 'images/icon_eye_no.png',
    title: '',
    agreementList: [],
    btnDisabled: false,
    pwdfocus: false,
    confirmpwdfocus: false
  },

  lifetimes: {
    attached: function () {
      let alist = [
        {
          "privacyVersion": this.properties.privacyVersion,
          "protocolType": 1
        },
        {
          "privacyVersion": this.properties.protocolVersion,
          "protocolType": 2
        }
      ]
      this.setData({
        i18n: plugin.main.getLang(),
        skin: plugin.main.getSkin(),
        agreementList: alist
      })
      this.initTxt()
    },
    detached: function () { }
  },


  /**
   * 组件的方法列表
   */
  methods: {
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
    confirmpwdFocus () {
      this.setData({
        confirmpwdfocus: true
      })
    },
    confirmpwdBlur () {
      this.setData({
        confirmpwdfocus: false
      })
    },
    /**
     * 修改标题
     */
    initTxt () {
      let self = this
      if (self.properties.item.type == 3) {
        self.setData({
          title: self.data.i18n['setpwdTit']
        })
      } else {
        self.setData({
          title: self.data.i18n['resetTitle']
        })
      }
    },
    // 表单提交
    formSubmit () {
      const self = this
      const { pwd, confirmPwd, item, i18n } = self.data
      if (!pwd || pwd.length <= 0) {
        return plugin.jsUtil.tip(i18n['newPwdPlace'])
      }
      if (!confirmPwd || confirmPwd.length <= 0) {
        return plugin.jsUtil.tip(i18n['confirmPwdPlace'])
      }
      if (plugin.jsValid.validPwd(pwd)) {
        return plugin.jsUtil.tip(i18n['resetPwdDesc'])
      }
      if (pwd !== confirmPwd) {
        return plugin.jsUtil.tip(i18n['twicePwdDiff'])
      }

      switch (item.type) {
        case 2://忘记密码
          self.forgetPwd()
          break
        case 3://注册
          if (item.uname.indexOf('@') < 0) {
            self.phoneRegister()
          } else {
            self.emailRegister()
          }
          break
        case 4://修改密码
          self.forgetPwd()
          break
        default:
          break
      }
    },

    /**
     * 忘记密码提交
     */
    forgetPwd () {
      let self = this
      self.setData({
        btnDisabled: true
      })
      const { item, i18n, pwd } = self.data
      let params = {
        code: item.code,
        pwd
      }
      if (item.uname.indexOf('@') < 0) {
        params.internationalCode = '86'
        params.phone = item.uname
      } else {
        params.email = item.uname
      }
      plugin.quecUser.userPwdReset({
        ...params,
        success: () => {
          plugin.jsUtil.tip(i18n['resetPwdSucc'], 'success')
          plugin.jsUtil.delayCb(() => {
            self.triggerEvent('setSuccess')
          })
        },
        fail (res) {
          plugin.jsUtil.tip(res.msg)
        },
        complete () {
          self.setData({
            btnDisabled: false
          })
        }
      })
    },

    /**
     * 手机号注册
     */
    phoneRegister () {
      plugin.jsUtil.load()
      let self = this
      self.setData({
        btnDisabled: true
      })
      plugin.quecUser.phonePwdRegisterV2({
        phone: self.data.item.uname,
        pwd: self.data.pwd,
        smsCode: self.data.item.code,
        agreementList: self.data.agreementList,
        success (res) {
          plugin.jsUtil.tip(self.data.i18n['regSuccessTip'], 'success')
          plugin.jsUtil.delayCb(() => {
            self.triggerEvent('setSuccess', true)
          })
        },
        fail (res) { },
        complete () {
          self.setData({
            btnDisabled: false
          })
        }
      })
    },
    /**
     * 邮箱注册
     */
    emailRegister () {
      plugin.jsUtil.load()
      let self = this
      self.setData({
        btnDisabled: true
      })
      plugin.quecUser.emailPwdRegisterV2({
        email: self.data.item.uname,
        pwd: self.data.pwd,
        code: self.data.item.code,
        agreementList: self.data.agreementList,
        success (res) {
          plugin.jsUtil.tip(self.data.i18n['regSuccessTip'], 'success')
          plugin.jsUtil.delayCb(() => {
            self.triggerEvent('setSuccess', true)
          })
        },
        fail (res) {
          plugin.jsUtil.tip(res.msg)
        },
        complete () {
          self.setData({
            btnDisabled: false
          })
        }
      })
    },

    // 切换密码显示状态
    changePwdState () {
      let self = this
      self.setData({
        pwdfocus: false
      })
      wx.nextTick(() => {
        self.setData({
          invisiblePwd: !self.data.invisiblePwd
        })
      })
    },
    changeConfirmPwdState () {
      let self = this
      self.setData({
        confirmpwdfocus: false
      })
      wx.nextTick(() => {
        self.setData({
          invisibleConfirmPwdPwd: !self.data.invisibleConfirmPwdPwd
        })
      })
    },

    // 修改密码
    changePwd (e) {
      let self = this
      let pwd = plugin.jsValid.trimField(e.detail)
      pwd = plugin.jsValid.noChinese(pwd)
      pwd = plugin.jsValid.noEmo(pwd)
      self.setData({ pwd })
    },

    // 修改确认密码
    changeConfirmPwd (e) {
      let self = this
      let confirmPwd = plugin.jsValid.trimField(e.detail)
      confirmPwd = plugin.jsValid.noChinese(confirmPwd)
      confirmPwd = plugin.jsValid.noEmo(confirmPwd)
      self.setData({ confirmPwd })
    }
  }
})
