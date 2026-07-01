const plugin = requirePlugin('quecPlugin')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    uname: {
      type: String,
      value: ''
    },
    isHouse: {
      type: Boolean,
      value: true
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    i18n: '',
    skin: '',
    result: []
  },

  lifetimes: {
    attached: function () {
      this.setData({
        i18n: plugin.main.getLang(),
        skin: plugin.main.getSkin()
      })
    },
    detached: function () {
      this.setData({
        result: []
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onChange (event) {
      let detail = event.detail
      if (detail.length == 0) {
        this.setData({
          result: [],
        })
      } else {
        detail = detail[detail.length - 1]
        this.setData({
          result: [detail],
        })
      }
    },

    /**
     * 跳过
     */
    skip () {
      this.setData({
        result: []
      })
      this.triggerEvent('skip', this.properties.uname)
    },

    /**
     * 提交
     */
    tj () {
      let self = this
      if (self.data.result.length == 0) {
        return plugin.jsUtil.tip(self.data.i18n['selcancel'])
      }
      plugin.quecUser.addReasonCancellation({
        mode: self.data.result,
        success (res) {
          self.triggerEvent('tj', self.properties.uname)
        },
        fail (res) { }
      })

    }

  }
})
