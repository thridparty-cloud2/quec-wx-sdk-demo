
const plugin = requirePlugin('quecPlugin')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    model: {
      type: Object,
      value: {}
    },
    showAllTxt: {//非家居模式下是否展示全部文案
      type: Boolean,
      value: true
    },
    valaddTxt: {
      type: Object
    }

  },

  /**
   * 组件的初始数据
   */
  data: {
    mode: undefined, //家居模式
    isComplete: false, //加载完成
    i18n: '',
    skin: '',
    modeRefresh: false,
    isToken: undefined
  },

  pageLifetimes: {
    show: function () {
      if (this.data.isToken) {
        this.initMode()
      }
    },
    hide: function () { }
  },

  lifetimes: {
    attached: function () {
      this.setData({
        i18n: plugin.main.getLang(),
        skin: plugin.main.getSkin(),
        isToken: plugin.jsUtil.isToken()
      })
    },
    detached: function () {
      this.setData({
        isComplete: false, //加载完成
        modeRefresh: false
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    initMode () {
      let self = this
      plugin.jsUtil.getMode({
        success (res) {
          self.setData({
            mode: res.data.enabledFamilyMode
          })
        },
        fail (res) { },
        complete (res) {
          self.setData({
            isComplete: true,
            modeRefresh: true
          })
        }
      })
    },
    /**
      * 房间管理
      */
    goRoomList (e) {
      this.triggerEvent('RoomList', e.detail)
    },

    /**
     * 分享
     */
    goShare (e) {
      this.triggerEvent('toShare', e.detail)
    },

    /**
     * 设备详情
     */
    goDetail (e) {
      this.triggerEvent('goDetail', e.detail)
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
     * 家庭管理
     */
    familyList (e) {
      this.triggerEvent('familyList', true)
    },

    /**
     * 去家居搜索页面
     */
    goHouseSearch (e) {
      this.triggerEvent('Search', e.detail)
    },

    /**
     * 去非家居搜索页面
     */
    goNonHouseSearch () {
      this.triggerEvent('Search', true)
    },

    /**
      * 添加设备成功 
      */
    scanSuccess (e) {
      this.triggerEvent('scanSuccess', e.detail)
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

    jump () {
      this.triggerEvent('Jump')
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
  }
})
