const plugin = requirePlugin('quecPlugin')
let app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: {
      type: Boolean,
      value: false
    }

  },

  /**
   * 组件的初始数据
   */
  data: {
    i18n: '',
    skin: '',
    funImg: '',
    houseImg: '',
    env: app.globalData.envData
  },

  lifetimes: {
    attached: function () {
      this.setData({
        i18n: plugin.main.getLang(),
        skin: plugin.main.getSkin(),
        funImg: plugin.main.getBaseImgUrl() + 'images/device/fun.png',
        houseImg: plugin.main.getBaseImgUrl() + 'images/device/house.png'
      })
    },
    detached: function () { }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    introduct () {
      this.triggerEvent("Introduct", true)
    },
    mode () {
      this.triggerEvent('Mode', true)
    }
  }
})
