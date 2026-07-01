const plugin = requirePlugin('quecPlugin')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isFoucs: {
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
    deviceName: ''
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
     * 搜索
     */
    onSearch () {
      this.triggerEvent('StartSearch', this.data.deviceName)
    },
    /**
     * 清空
     */
    clear () {
      this.triggerEvent('ClearSearch', true)
    }
  }
})
