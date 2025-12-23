const plugin = requirePlugin('quecPlugin')
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    tslData: {
      type: Object,
      value: {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    tslData: {},
    tslVal: '',
    i18n: ''
  },
  observers: {
    'tslData': function (val) {
      if (val == null) return
      this.getTslVal()
    }
  },

  lifetimes: {
    // 组件所在页面的生命周期函数
    attached: function () {
      this.setData({
        i18n: plugin.main.getLang(),
      })
    },
    detached: function () {

    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    getTslVal () {
      let value = plugin.jsUtil.getEnumAttrValue(this.data.tslData)
      this.setData({
        tslVal: value
      })
    }
  }
})
