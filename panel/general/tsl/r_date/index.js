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
    fmt: 'yyyy-MM-dd hh:mm',
    i18n: '',
    skin: ''
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
        skin: plugin.theme.getSkin(),
        i18n: plugin.main.getLang()
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
      let self = this
      const { tslData } = self.data
      if (tslData.vdata) {
        self.setData({
          tslVal: plugin.jsUtil.formatDate(new Date(+tslData.vdata), self.data.fmt)
        })
      }
    }
  }
})
