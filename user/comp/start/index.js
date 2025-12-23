const plugin = requirePlugin('quecPlugin')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
  },

  /**
   * 组件的初始数据
   */
  data: {
    loginSrc: '',
    i18n: '',
    skin: '',
    agreecheck: false
  },

  lifetimes: {
    ready: function () {
      this.setData({
        i18n: plugin.main.getLang(),
        loginSrc: plugin.theme.getLogo(),
        skin: plugin.main.getSkin()
      })
    },
    detached: function () {

    }
  },


  /**
   * 组件的方法列表
   */
  methods: {
    toLogin () {
      let self = this
      if (!self.data.agreecheck) {
        return plugin.jsUtil.tip(self.data.i18n['tipProtocol'])
      }
      self.triggerEvent('toLogin')
    },
    // 跳转服务协议
    toProtocol () {
      this.triggerEvent('toProtocol', true)
    },
    // 跳转隐私协议
    toPrivacy () {
      this.triggerEvent('toPrivacy', true)
    },

    /**
     * 协议值
     */
    changeProtocol (e) {
      this.setData({
        agreecheck: e.detail
      })
      this.triggerEvent('changeProtocol', e.detail)
    },
  }
})
