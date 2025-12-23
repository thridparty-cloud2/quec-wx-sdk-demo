const plugin = requirePlugin('quecPlugin')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    /**
     * 扫描的返回的结果信息
     */
    item: {
      type: Object,
      value: {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    deviceName: '',
    item: {},
    i18n: '',
    skin: '',
    fid: '',
    mode: false
  },

  pageLifetimes: {
    show: function () {
      this.initHouse()
    },
    hide: function () { }
  },

  lifetimes: {
    attached: function () {
      this.setData({
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
     * 初始化模式
     */
    initHouse () {
      let self = this
      plugin.jsUtil.getMode({
        success (res) {
          self.setData({
            mode: res.data.enabledFamilyMode
          })
          if (res.data.enabledFamilyMode) {
            plugin.jsUtil.getFid({
              success (res) {
                self.setData({
                  fid: res.fid
                })
              }
            })
          }
        }
      })
    },

    /**
     * 修改设备名称
     * @param {*} e 
     */
    changeDeviceName (e) {
      let self = this
      let deviceName = plugin.jsValid.trimField(e.detail)
      self.setData({
        deviceName: deviceName
      })
    },

    /**
     * 失去焦点时修改设备名称
     * @param {*} e 
     */
    blurDeviceName (e) {
      let self = this
      let deviceName = e.detail.value
      self.setData({
        deviceName: deviceName
      })
    },

    /**
     * 扫码
     */
    saoma () {
      let self = this
      plugin.quecManage.scan({
        success (res) {
          self.triggerEvent('scanSuccess', res)
        },
        fail (res) { }
      })
    },

    /**
     * 提交
     * @param {*} e 
     */
    addSubmit (e) {
      let self = this
      let item = self.data.item
      if (item.shareCode) {
        self.shareAdd()
      } else {
        self.bindAdd()
      }
    },

    /**
     * 接受分享
     */
    shareAdd () {
      let self = this
      let item = self.data.item
      plugin.quecShare.sharedAccept({
        shareCode: item.shareCode,
        deviceName: self.data.deviceName,
        success (res) {
          plugin.jsUtil.tip(res.msg)
          plugin.jsUtil.delayCb(() => {
            self.triggerEvent('addSuccess', true)
          })
        },
        fail (res) { }
      })
    },

    /** 
     * 安装
     */
    bindAdd () {
      let self = this
      let item = self.data.item
      plugin.quecManage.bindSubmit({
        pk: item.pk,
        sn: item.sn,
        deviceName: self.data.deviceName,
        fid: self.data.fid,
        isCommonDevice: self.data.fid ? true : '',
        success (res) {
          plugin.jsUtil.tip(self.data.i18n['addBindTip'])
          let result = res.data
          plugin.jsUtil.delayCb(() => {
            if (self.data.mode) {
              let bindItem = []
              let dm = {
                "name": self.data.deviceName,
                "localName": self.data.deviceName,
                "pk": item.pk,
                "productName": self.data.deviceName,
                "vstate": 4,
                "isCommon": true,
                "dk": result.dk ? result.dk : ''
              }
              plugin.quecManage.getDeviceInfoByBinding({
                pk: item.pk,
                fid: self.data.fid,
                success (info) {
                  if (info.data) {
                    let rs = info.data
                    dm.productLogo = rs.productLogo ? rs.productLogo : ''
                    dm.bindingMode = rs.bindingMode ? rs.bindingMode : ''
                  }
                  bindItem.push(dm)
                  let data = {
                    mode: self.data.mode,
                    fid: self.data.fid,
                    successData: bindItem
                  }
                  self.triggerEvent('toFamily', JSON.stringify(data))
                }
              })
            } else {
              self.triggerEvent('addSuccess', true)
            }
          })
        },
        fail (res) { }
      })
    }
  }
})
