const plugin = requirePlugin('quecPlugin')

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    checked: false,
    skin: '',
    i18n: ''
  },

  lifetimes: {
    ready: function () {
      this.setData({
        i18n: plugin.main.getLang(),
        skin: plugin.main.getSkin()
      })
    },
    detached: function () { }
  },
  pageLifetimes: {
    hide: function () {
      this.setData({
        checked: false
      })
      this.triggerEvent('changeProtocol', this.data.checked)
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 勾选用户协议
    onChange (event) {
      this.setData({
        checked: event.detail
      })
      this.triggerEvent('changeProtocol', event.detail)
    },
    /**
     * 点击文案触发勾选
     */
    txtChange (e) {
      let check = e.currentTarget.dataset.check
      this.setData({
        checked: !check
      })
      this.triggerEvent('changeProtocol', this.data.checked)
    },
    // 跳转服务协议
    toProtocol () {
      this.triggerEvent('toProtocol')
    },
    // 跳转隐私协议
    toPrivacy () {
      this.triggerEvent('toPrivacy')
    },
  }
})
