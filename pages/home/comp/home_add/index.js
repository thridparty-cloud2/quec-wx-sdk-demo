const plugin = requirePlugin('quecPlugin')
let app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    fid: {
      type: String,
      value: ''
    },
    frole: {
      type: Number,
      value: 1
    },
    show: {
      type: Boolean,
      value: false
    },
    frid: {
      type: String,
      value: ''
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    i18n: '',
    skin: '',
    selShow: false,
    env: app.globalData.envData
  },

  lifetimes: {
    ready: function () {
      let self = this
      self.setData({
        i18n: plugin.main.getLang(),
        skin: plugin.main.getSkin(),
      })
    },
    detached: function () {
      this.setData({
        selShow: false
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 显示添加方式弹框
     */
    show (e) {
      let self = this
      if (self.properties.frole === 3) {
        return plugin.jsUtil.tip(self.data.i18n['comMemberAddTip'])
      } else {
        self.setData({
          selShow: true
        })
      }
    },

    /**
     * 关闭
     */
    onClose () {
      this.setData({
        selShow: false
      })
    },

    /**
     * 扫码添加
     */
    scan () {
      let self = this
      self.setData({
        selShow: false
      })
      plugin.jsUtil.toSafe(self, () => {
        plugin.jsUtil.delayCb(() => {
          plugin.quecManage.scan({
            success (res) {
              let rs = res
              rs.fid = self.properties.fid
              self.triggerEvent('scanSuccess', rs)
            },
            fail (res) {
              plugin.jsUtil.invalidCb(res, self, true)
            }
          })
        }, 100)
      })
    },

    // 跳转蓝牙配网
    toNetwork () {
      let self = this
      self.setData({
        selShow: false
      })
      plugin.jsUtil.toSafe(self, () => {
        self.closePluginBle()
        wx.nextTick(() => {
          if (self.data.env['bleVersion'] == 'v1') {
            self.triggerEvent('toNear', true)
          } else if (self.data.env['bleVersion'] == 'v2') {
            self.triggerEvent('toNetwork', true)
          }
        })
      })
    },

    /**
     * 关闭蓝牙
     */
    closePluginBle () {
      plugin.quecBle.stopBleScan({
        success () { },
        fail (res) { }
      })
      plugin.quecBle.closeBle({
        success () { },
        fail (res) { }
      })
    },

    /**
     * 无扫一扫/近场控制 页面跳转
     */
    noScanAndNear () {
      let self = this
      plugin.jsUtil.toSafe(self, () => {
        self.triggerEvent('noScanAndNear')
      })
    }
  }
})
