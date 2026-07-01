const plugin = requirePlugin('quecPlugin')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    confirmTxt: {
      type: String,
      value: '确定'
    },
    confirmColor: {
      type: String,
      value: plugin.main.getSkin()['confirm']
    },
    cancelTxt: {
      type: String,
      value: '取消'
    },
    cancelColor: {
      type: String,
      value: plugin.main.getSkin()['cancel']
    },
    isCancel: {
      type: Boolean,
      value: true
    },
    title: {
      type: String,
      value: ''
    },
    tip: {
      type: String,
      value: ''
    },
    tipAlign: {
      type: String,
      value: 'center'
    },
    isShowTitle: {
      type: Boolean,
      value: true
    },
    isFmtTitle: {
      type: Boolean,
      value: false
    },
    fmtTitle1: {
      type: String,
      value: ''
    },
    fmtTitle2: {
      type: String,
      value: ''
    },
    fmtTitle3: {
      type: String,
      value: ''
    },
    tipColor:{
      type:String,
      value:'#333333'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    i18n: '',
    skin: ''
  },

  lifetimes: {
    ready: function () {
      let self = this
      self.setData({
        i18n: plugin.main.getLang(),
        skin: plugin.main.getSkin(),
      })
    },
    detached: function () { }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 取消
     */
    cancel () {
      this.triggerEvent('Cancel', true)
    },
    /**
     * 确定
     */
    confirm () {
      this.triggerEvent('Confirm', true)
    }
  }
})
