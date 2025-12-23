const plugin = requirePlugin('quecPlugin')
let app = getApp()
Component({
  properties: {
    fid: {
      type: String,
      value: ''
    }
  },
  data: {
    hidden: false,
    scrollTop: 0,
    show: false,
    baseImgUrl: plugin.main.getExampleUrl(),
    skin: '',
    act: '',
    isAdd: false,
    env: app.globalData.envData,
  },
  pageLifetimes: {
    show: function () {
      this.setData({
        show: false,
        act: '',
        isAdd: false
      })
      this.triggerEvent('noScroll', true)
    }
  },

  lifetimes: {
    ready: function () {
      const self = this
      self.setData({
        skin: plugin.main.getSkin()
      })
    },
    detached: function () { }
  },

  methods: {
    pageScroll (ev) {
      let self = this
      if (ev.scrollTop <= 0) {
        ev.scrollTop = 0
      }
      if (ev.scrollTop > self.data.scrollTop || ev.scrollTop == wx.getSystemInfoSync().windowHeight) {
        self.setData({
          hidden: true
        })
      } else {
        self.setData({
          hidden: false
        })
      }
      plugin.jsUtil.delayCb(() => {
        self.setData({
          scrollTop: ev.scrollTop
        })
      })
    },
    onClickShow (e) {
      this.setData({
        act: e.currentTarget.dataset.act
      })
      let act = e.currentTarget.dataset.act
      if (act == 'add') {
        this.setData({
          isAdd: true
        })
      } else if (act == 'close') {
        this.setData({
          isAdd: false
        })
      }

      let show = this.data.show
      this.setData({
        show: !show
      })
      this.triggerEvent('noScroll', show)
      this.closePluginBle()
    },
    // 跳转蓝牙配网V2
    toNetwork () {
      let self = this
      plugin.jsUtil.toSafe(self, () => {
        self.setData({
          show: false
        })
        self.triggerEvent('noScroll', true)
        self.closePluginBle()
        wx.nextTick(() => {
          self.triggerEvent('toNetwork', true)
        })
      })

    },
    //去扫码安装
    toScan () {
      let self = this
      plugin.jsUtil.toSafe(self, () => {
        plugin.quecManage.scan({
          success (res) {
            let rs = res
            rs.fid = self.properties.fid
            self.triggerEvent('toScan', JSON.stringify(rs))
          }, fail (res) {
            plugin.jsUtil.invalidCb(res, self, true)
          }
        })
      })
    },
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
    // V1版本
    toNear () {
      let self = this
      plugin.jsUtil.toSafe(self, () => {
        self.setData({
          show: false
        })
        self.triggerEvent('noScroll', true)
        self.closePluginBle()
        wx.nextTick(() => {
          self.triggerEvent('toNear', true)
        })
      })

    }
  }
})
