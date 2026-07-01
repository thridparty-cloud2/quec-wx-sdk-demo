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
    unbindVisible: false,
    i18n: '',
    skin: '',
    role: 1
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

  observers: {
    'curItem': function (curItem) {
      let self = this
      if (JSON.stringify(curItem) !== '{}') {
        self.setData({
          role: curItem?.memberRole ? curItem.memberRole : 1
        })
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    unbind () {
      this.setData({
        unbindVisible: true
      })
    },
    onClose () {
      this.setData({
        unbindVisible: false
      })
    },
    confirm () {
      let self = this
      if (self.data.curItem.shareCode) {
        self.shareDelete()
      } else {
        self.dmpDelete()
      }
    },

    /**
     * 分享设备删除
     */
    shareDelete () {
      let self = this
      plugin.quecShare.beSharedRemove({
        shareCode: self.data.curItem.shareCode,
        success (res) {
          plugin.jsUtil.tip(self.data.i18n['delSuccTip'], 'success')
          plugin.jsUtil.delayCb(() => {
            self.triggerEvent('unbindSuccess', true)
          })
        },
        fail (res) { }
      })
    },
    /**
     * 设备删除
     */
    dmpDelete () {
      let self = this
      plugin.quecManage.unbind({
        dk: self.data.curItem.deviceKey,
        pk: self.data.curItem.productKey,
        success (res) {
          plugin.jsUtil.tip(self.data.i18n['delSuccTip'], 'success')
          plugin.jsUtil.delayCb(() => {
            self.triggerEvent('unbindSuccess', true)
          })
        },
        fail (res) { }
      })
    },
  }
})
