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
      value: plugin.main.getSkin()['primary']
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
    zIndex: {
      type: Number,
      value: 100
    },
    title: {
      type: String,
      value: ''
    },
    modelVal: {
      type: String,
      value: ''
    },
    valPlace: {
      type: String,
      value: '请输入设备名称'
    },
    vMaxLength: {
      type: Number,
      value: 64
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    i18n: '',
    skin: '',
    mVal: ''
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

  observers: {
    'modelVal': function (val) {
      if (val) {
        this.setData({
          mVal: val
        })
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    valChange (e) {
      let self = this
      let dname = plugin.jsValid.trimField(e.detail)
      dname = plugin.jsValid.noEmo(dname)
      self.setData({
        mVal: dname
      })
    },
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
      this.triggerEvent('Confirm', this.data.mVal)
    }
  }
})
