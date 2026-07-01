const plugin = requirePlugin('quecPlugin')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    type: { //1- 立即删除 2- 7天后删除
      type: Number,
      value: 2
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
    i18n: '',
    skin: ''
  },

  lifetimes: {
    ready: function () {
      let self = this
      self.setData({
        i18n: plugin.main.getLang(),
        skin: plugin.main.getSkin()
      })
    },
    detached: function () { }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 立即注销
     */
    confirmCancel () {
      let self = this
      plugin.jsUtil.load()
      plugin.quecUser.userCancel({
        type: self.properties.type,
        success (res) {
          plugin.jsUtil.tip(self.data.i18n['cancelSuccTip'], 'success')
          plugin.jsUtil.delayCb(() => {
            self.triggerEvent('cancelSuccess', true)
          })
        },
        fail (res) { },
      })
    }

  }
})
