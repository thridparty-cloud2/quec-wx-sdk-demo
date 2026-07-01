const plugin = requirePlugin('quecPlugin')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    img: {
      type: String,
      value: ''
    },
    flag1: {
      type: Boolean,
      value: true
    },
    tip1: {
      type: String,
      value: ''
    },
    flag2: {
      type: Boolean,
      value: false
    },
    tip2: {
      type: String,
      value: ''
    },
    bflag: {
      type: Boolean,
      value: true
    },
    butxt: {
      type: String,
      value: ''
    },
    isIcon: {
      type: Boolean,
      value: false
    },
    iconCls: {
      type: String,
      value: ''
    },
    isAuto: {
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
  },

  lifetimes: {
    attached: function () {
      let self = this
      self.setData({
        i18n: plugin.main.getLang(),
        skin: plugin.main.getSkin()
      })
    },
    detached: function () { }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    act () {
      this.triggerEvent('Act')
    }
  }
})
