
const plugin = requirePlugin('quecPlugin')

let app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    modeRefresh: {
      type: Boolean,
      value: undefined
    },
    mode: {
      type: Boolean,
      value: undefined
    },
    model: {
      type: Object,
      value: {}
    },
    valaddTxt: {
      type: Object
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    i18n: '',
    skin: '',
    isRefresh: undefined,
    isEdit: false,
    selDevice: [],
    sTop: 40,
    navRefresh: false,
    isSet: true,
    isToken: undefined,
    isValadd: false,
    env: app.globalData.envData,
  },

  pageLifetimes: {
    show: function () {
      this.setK()
    },
    hide: function () { }
  },

  lifetimes: {
    attached: function () {
      let self = this
      self.setData({
        i18n: plugin.main.getLang(),
        skin: plugin.main.getSkin(),
        sTop: wx.getWindowInfo().safeArea.top ? wx.getWindowInfo().safeArea.top : 40
      })
      self.setK()
    },
    detached: function () {
      this.setData({
        isRefresh: false,
        isToken: undefined
      })
    }
  },

  observers: {
    "modeRefresh": function (modeRefresh) {
      if (modeRefresh) {
        this.setData({
          isEdit: false,
          selDevice: [],
          isValadd: (plugin.config.getStorageByKey('telSmSwitch') && !JSON.parse(plugin.config.getStorageByKey('telSmSwitch')).tswitch) ? true : false
        })
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 获取token
     */
    setK () {
      this.setData({
        isToken: plugin.jsUtil.isToken(),
        navRefresh: false,
        isRefresh: false
      })
      if (this.data.isToken) {
        wx.nextTick(() => {
          this.setData({
            navRefresh: this.properties.modeRefresh,
            isRefresh: true
          })
        })
      }
    },
    /**
     * 编辑模式
     */
    getEdit (e) {
      this.setData({
        isEdit: e.detail
      })
    },
    /**
     * 编辑模式下，关闭
     */
    getSelIsEdit (e) {
      this.setData({
        isEdit: e.detail,
        isRefresh: true
      })
    },
    /**
     * 获取可编辑的设备
     */
    getselDevice (e) {
      this.setData({
        selDevice: e.detail
      })
    },
    /**
     * 分享
     */
    Share (e) {
      this.triggerEvent('toShare', e.detail)
    },

    /**
     * 设备详情
     */
    goDetail (e) {
      this.triggerEvent('goDetail', e.detail)
    },

    /**
     * 添加设备成功 
     */
    scanSuccess (e) {
      this.triggerEvent('scanSuccess', e.detail)
    },

    jump () {
      this.triggerEvent('Jump')
    },

    /**
     * 删除成功
     */
    unbindSuccess (e) {
      this.setData({
        isRefresh: true,
        isEdit: false
      })
    },

    /**
     * 重命名成功
     */
    renameSuccess (e) {
      this.setData({
        isRefresh: true,
        isEdit: false
      })
    },

    /**
     * 无效设备
     */
    invalidDevice () {
      this.setData({
        isRefresh: true,
      })
    },

    /**
     * 近场发现
     */
    toNetwork () {
      this.triggerEvent('toNetwork', true)
    },

    /**
     * 扫码安装
     */
    toScan (e) {
      this.triggerEvent('toScan', e.detail)
    },

    /**
     * 去搜索页面
     */
    goSearch () {
      this.triggerEvent('Search', true)
    },

    /**
      * 功能介绍
      */
    introduct () {
      this.triggerEvent("Introduct", true)
    },
    /**
     * 家居模式介绍
     */
    mode () {
      this.triggerEvent('Mode', true)
    },

    /**配网V1 */
    toNear () {
      this.triggerEvent('toNear')
    },

    /**
     * banner link
     */
    toLink (e) {
      this.triggerEvent('Link', e.detail)
    },

    /**青蛙oem小程序，跳转到指定添加页面 */
    noScanAndNear () {
      this.triggerEvent('noScanAndNear')
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
     * 关闭电话短信服务
     */
    cloeVaddEnter () {
      this.setData({
        isValadd: true
      })
    }
  }
})
