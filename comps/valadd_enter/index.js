const plugin = requirePlugin('quecPlugin')
let app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    from: {
      type: String,
      value: 'home'
    },
    isRefresh: {
      type: Boolean
    },
    valaddTxt: {
      type: Object
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    bgImg: plugin.assetBase.getRootImg() + 'valadd/enter_bg.png',
    closeImg: plugin.assetBase.getRootImg() + 'valadd/close.png',
    telImg: plugin.assetBase.getRootImg() + 'valadd/tel.png',
    smsImg: plugin.assetBase.getRootImg() + 'valadd/msg.png',
    isShowSmsPush: {},
    isShowPhonePush: {},
    telSmSwitch: true,
    valaddTxt: {},
    env: app.globalData.envData
  },

  lifetimes: {
    ready: function () {
      this.getSwitch()
    },
    detached: function () { }
  },

  observers: {
    'isRefresh': function (isRefresh) {
      if (isRefresh) {
        this.getMetaData()
      }
    }
  },

  /**
   * 组件的方法列表 
   */
  methods: {
    getSwitch () {
      if (plugin.config.getStorageByKey('telSmSwitch')) {
        let telSmSwitch = JSON.parse(plugin.config.getStorageByKey('telSmSwitch'))
        this.setData({
          telSmSwitch: telSmSwitch.tswitch
        })
      }
      this.triggerEvent('Switch', this.data.telSmSwitch)
    },
    getMetaData () {
      let self = this
      if (plugin.config.getStorageByKey('telSmSwitch')) {
        let telSmSwitch = JSON.parse(plugin.config.getStorageByKey('telSmSwitch'))
        self.setData({
          telSmSwitch: telSmSwitch.tswitch
        })
      } else {
        if (self.data.env['isPushTel'] || self.data.env['isPushSms']) {
          self.setData({
            telSmSwitch: true
          })
          plugin.config.setStorage('telSmSwitch', { tswitch: true })
          self.triggerEvent('Switch', true)
        }
      }
      // valadd.metadata({
      //   fieldNames: [
      //     "isShowSmsPush",
      //     "isShowPhonePush",
      //     "merchantNo",
      //     "merchantSecret",
      //     "bssClientAppId",
      //     "wxAppId",
      //     "addValuesPushPanel",
      //     "universalLink"
      //   ],
      //   success (res) {
      //     if (res.data && res.data.length > 0) {
      //       let metadata = self.parseMetadata(res.data)
      //       config.setStorage('metadataObj', metadata)
      //       let isShowPhonePush = metadata.isShowPhonePush || {}
      //       let isShowSmsPush = metadata.isShowSmsPush || {}
      //       self.setData({
      //         isShowPhonePush: isShowPhonePush,
      //         isShowSmsPush: isShowSmsPush
      //       })
      //       if (wx.getStorageSync('telSmSwitch')) {
      //         let telSmSwitch = JSON.parse(config.getStorageByKey('telSmSwitch'))
      //         self.setData({
      //           telSmSwitch: telSmSwitch.tswitch
      //         })
      //       } else {
      //         if (isShowPhonePush.metadataValue || isShowSmsPush.metadataValue) {
      //           self.setData({
      //             telSmSwitch: true
      //           })
      //           config.setStorage('telSmSwitch', { tswitch: true })
      //         }
      //       }
      //     } else {
      //       console.log('ndknfkdnf')
      //       self.setData({
      //         telSmSwitch: false
      //       })
      //       config.setStorage('telSmSwitch', { tswitch: false })
      //     }
      //   },
      //   fail (res) { }
      // })
    },
    /**
     * 电话推送
     */
    goTel () {
      this.triggerEvent('Tel', true)
    },
    /**
     * 短信推送
     */
    goSms () {
      this.triggerEvent('Sms', true)
    },
    /**
     * 关闭
     */
    off () {
      let self = this
      self.setData({
        telSmSwitch: false
      })
      plugin.config.setStorage('telSmSwitch', { tswitch: self.data.telSmSwitch })
      self.triggerEvent('Close', true)
      self.triggerEvent('Switch', false)
    },
    /**
     * 转换元数据
     */
    parseMetadata (rawData) {
      const metadata = {}
      try {
        if (Array.isArray(rawData)) {
          rawData.forEach((meta) => {
            metadata[meta.fieldName] = meta
          })
          return metadata
        } else {
          return {}
        }
      } catch {
        return {}
      }
    }
  }
})
