const plugin = requirePlugin('quecPlugin')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    curItem: {
      type: Object,
      value: {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    skin: '',
    role: 1,
    i18n: ''
  },

  lifetimes: {
    ready: function () {
      let self = this
      self.setData({
        skin: plugin.theme.getSkin(),
        i18n: plugin.main.getLang()
      })
    },
    detached: function () { }
  },

  observers: {
    'curItem': function (curItem) {
      let self = this
      if (JSON.stringify(curItem) !== '{}') {
        self.setData({
          role: curItem.memberRole ? curItem.memberRole : 1
        })
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
       * 重命名页面
       */
    goRename () {
      let self = this
      self.triggerEvent('goRename', JSON.stringify(self.data.curItem))
    },

    /**
     * 去设备分享管理页面
     */
    goShare () {
      let self = this
      self.triggerEvent('goShare', JSON.stringify(self.data.curItem))
    },

    /**
     * 去设备告警页面
     */
    goDeviceAlarm () {
      let self = this
      self.triggerEvent('goAlarm', JSON.stringify(self.data.curItem))
    },
  }
})
