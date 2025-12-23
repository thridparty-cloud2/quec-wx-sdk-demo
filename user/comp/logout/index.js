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
    logoutVisible: false,
    i18n: '',
    skin: '',
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
    logout () {
      this.setData({
        logoutVisible: true
      })
    },
    onClose () {
      this.setData({
        logoutVisible: false
      })
    },
    confirmLogout () {
      const self = this
      plugin.quecUser.userLogout({
        success (res) {
          if (res.code === 200) {
            plugin.jsUtil.tip(self.data.i18n['logoutSuccTip'], 'success')
            plugin.config.clearStorageByKey('scene')
            plugin.config.clearStorageByKey('activefrid')
            plugin.jsUtil.delayCb(() => {
              self.triggerEvent('logoutSuccess', true)
            })
          }
        },
        fail (res) { }
      })
    }
  }
})
