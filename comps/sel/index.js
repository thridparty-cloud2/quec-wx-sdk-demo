const plugin = requirePlugin('quecPlugin')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    selDevice: {
      type: Array,
      value: []
    },
    from: {
      type: String,
      value: 'home'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    selNo: 0,
    i18n: '',
    skin: '',
    saveTop: 0
  },

  lifetimes: {
    ready: function () {
      this.setData({
        i18n: plugin.main.getLang(),
        skin: plugin.main.getSkin(),
        saveTop: wx.getWindowInfo().safeArea.top ? wx.getWindowInfo().safeArea.top : 40
      })
    },
    detached: function () { }
  },

  observers: {
    'selDevice': function (selDevice) {
      this.setData({
        selNo: selDevice.length
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    close () {
      this.triggerEvent('isEdit', false)
    },
    /**
     * 场景设置页面返回
     */
    back () {
      this.triggerEvent('Back')
    }
  }
})
