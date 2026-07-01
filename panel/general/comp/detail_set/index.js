const app = getApp()

const plugin = requirePlugin('quecPlugin')
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item: {
      type: Object,
      value: {}
    }
  },
  data: {
    primaryColor: '',
    item: {},
    baseImgUrl: app.globalData.baseImgUrl
  },

  lifetimes: {
    attached: function () {
      let self = this
      let skin = plugin.theme.getSkin()
      self.setData({
        primaryColor: skin['primary']
      })
    },
    detached: function () { }
  },
  methods: {
    toSet () {
      this.pageRouter.navigateTo({
        url: `/panel/general/set/list/index?item=${encodeURIComponent(JSON.stringify(this.data.item))}`
      })
    }
  }
})
