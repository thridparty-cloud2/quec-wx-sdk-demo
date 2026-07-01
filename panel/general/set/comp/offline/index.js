const plugin = requirePlugin("quecPlugin")

Component({

  /**
   * 组件的属性列表
   */
  properties: {
    curItem: {
      type: Object
    },
    argsItem: {
      type: Object
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    offlineTip: 0,
    tipVisible: false,
    changeVal: 0,
    i18n: plugin.main.getLang(),
    skin: plugin.main.getSkin(),
  },

  pageLifetimes: {
    show: function () {
      let self = this
      let { argsItem } = self.properties
      if (JSON.stringify(argsItem) !== "{}") {
        self.initOffline()
      }
    },
    hide: function () { }
  },

  /**
   * 组件的方法列表
   */
  methods: {

    /**
     * 离线提醒初始值
     */
    initOffline () {
      let self = this
      let { argsItem } = self.properties
      plugin.quecManage.getOfflineReminderInfo({
        productKey: argsItem.productKey,
        deviceKey: argsItem.deviceKey,
        success (res) {
          if (res.data) {
            self.setData({
              offlineTip: res.data.enableOfflineReminder,
            })
          }
        },
      })
    },

    /**
     * 离线开关
     */
    offlineTipChange (e) {
      let self = this
      self.setData({
        changeVal: e.detail,
      })
      if (e.detail == 1) {
        self.setData({
          tipVisible: true,
        })
      } else {
        self.offlineSet()
      }
    },

    /**
     * 设置离线提醒
     */
    offlineSet () {
      let self = this
      let { argsItem } = self.properties
      plugin.quecManage.setOfflineReminder({
        productKey: argsItem.productKey,
        deviceKey: argsItem.deviceKey,
        enableOfflineReminder: self.data.changeVal,
        success (res) {
          self.setData({
            offlineTip: self.data.changeVal,
          })
        },
      })
    },

  }
})