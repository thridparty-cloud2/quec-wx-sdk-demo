const app = getApp()
const plugin = requirePlugin('quecPlugin')

Component({
  options: {
    addGlobalClass: true,
  },
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: ''
    },
    isTab: {
      type: Boolean,
      value: false
    },
    backUrl: {
      type: String,
      value: ''
    },
    isHome: {
      type: Boolean,
      value: false
    },
    homeUrl: {
      type: String,
      value: ''
    },
    homeTab: {
      type: Boolean,
      value: false
    },
    setting: {
      type: Boolean,
      value: false
    },
    isWs: {
      type: Boolean,
      value: false
    },
    from: {
      type: String,
      value: ''
    },
    icon: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    title: '',
    isTab: false,
    backUrl: '',
    homeUrl: '',
    isHome: false,
    baseImgUrl: app.globalData.baseImgUrl
  },

  /**
   * 组件的方法列表
   */
  methods: {
    back () {
      let self = this
      if (self.data.from == 'ai' || self.data.from == 'upgrade') {
        self.triggerEvent('BackTip')
      } else {
        if (self.data.backUrl) {
          if (self.data.isTab) {
            this.pageRouter.switchTab({
              url: self.data.backUrl
            })
          } else {
            this.pageRouter.redirectTo({
              url: self.data.backUrl
            })
          }
        } else {
          this.pageRouter.navigateBack({
            delta: 1,
          })
        }
      }
    },
    home () {
      let self = this
      if (self.data.homeUrl) {
        wx.nextTick(() => {
          this.pageRouter.switchTab({
            url: self.data.homeUrl
          })
        })
      }
    },
    search () {
      this.pageRouter.navigateTo({
        url: '/pages/home/sub/non/search/index',
      })
    },
    toSetting () {
      this.triggerEvent("onSettingClick", { msg: "导航栏被点击了" })
    },

    /**
     * 订单
     */
    iconEv () {
      this.triggerEvent("IconEv", { msg: "图标被点击了" })
    }
  }
})
