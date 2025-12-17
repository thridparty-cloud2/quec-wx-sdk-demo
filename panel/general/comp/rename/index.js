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
    deviceName: '',
    curItem: {},
    i18n: '',
    skin: ''
  },

  lifetimes: {
    attached: function () {
      let self = this
      self.setData({
        i18n: plugin.main.getLang(),
        skin: plugin.theme.getSkin()
      })
    },
    ready: function () {
      let self = this
      if (JSON.stringify(self.data.curItem) !== '{}') {
        self.setData({
          deviceName: self.data.curItem.deviceName
        })
      }

    },
    detached: function () { }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    changeDeviceName (e) {
      let self = this
      let deviceName = plugin.jsValid.trimField(e.detail)
      self.setData({
        deviceName: deviceName
      })
    },

    blurDeviceName (e) {
      let self = this
      let deviceName = e.detail.value
      self.setData({
        deviceName: deviceName
      })
    },

    dnameSubmit () {
      let self = this
      if (self.data.curItem.shareCode) {
        self.shareRename()
      } else {
        self.dmpRename()
      }
    },

    /**
    * 分享设备重命名
    */
    shareRename () {
      let self = this
      plugin.quecShare.shareRename({
        shareCode: self.data.curItem.shareCode,
        deviceName: self.data.deviceName,
        success (res) {
          if (res.code === 200) {
            plugin.jsUtil.tip(self.data.i18n['renameTip'], 'success')
            plugin.jsUtil.delayCb(() => {
              self.triggerEvent('renameSuccess', true)
            })
          }
        },
        fail (res) { }
      })
    },
    /**
     * 设备重命名
     */
    dmpRename () {
      let self = this
      plugin.quecManage.rename({
        dk: self.data.curItem.deviceKey,
        pk: self.data.curItem.productKey,
        deviceName: self.data.deviceName,
        success (res) {
          if (res.code === 200) {
            plugin.jsUtil.tip(self.data.i18n['renameTip'], 'success')
            plugin.jsUtil.delayCb(() => {
              self.triggerEvent('renameSuccess', true)
            })
          }
        },
        fail (res) {
        }
      })
    },

  }
})
