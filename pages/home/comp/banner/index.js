const plugin = requirePlugin('quecPlugin')
let app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isRefresh: {//是否刷新
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    bData: [],
    defaultImg: plugin.main.getBaseImgUrl() + 'images/banner/banner_qingwa.png',
    interVal: 5,
    env: app.globalData.envData,
  },

  observers: {
    'isRefresh': function (isRefresh) {
      if (isRefresh) {
        if (plugin.config.getToken()) {
          this.getBanner()
        }
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 获取banner列表
     */
    getBanner () {
      let self = this
      plugin.saas.bannerList({
        success (res) {
          if (res.data) {
            let bList = []
            let list = res.data
            bList = list.length > 10 ? list.slice(0, 10) : list
            self.setData({
              bData: bList
            })
            self.bannerConfig()
          }
        },
        fail (res) { },
        complete (res) { }
      })
    },

    /**
    * 获取banner列表
    */
    bannerConfig () {
      let self = this
      plugin.saas.bannerConfig({
        success (res) {
          if (res.data.carouselInterval) {
            self.setData({
              interVal: res.data.carouselInterval
            })
          }
        },
        fail (res) { },
        complete (res) { }
      })
    },

    /**
     * banner link
     */
    link (e) {
      this.triggerEvent('Link', e.currentTarget.dataset.item.skipLink)
    }
  }
})
