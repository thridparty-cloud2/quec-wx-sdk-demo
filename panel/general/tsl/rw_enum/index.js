import * as TSLConfig from '../util/tslConfig.js'
const plugin = requirePlugin('quecPlugin')
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    tslData: {
      type: Object,
      value: {}
    },
    deviceStatus: {
      type: String
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    show: false,
    tslData: {},
    tslVal: '',
    i18n: '',
    TSLConfig: TSLConfig,
    skin: ''
  },

  lifetimes: {
    ready: function () {
      this.setData({
        i18n: plugin.main.getLang(),
        skin: plugin.main.getSkin()
      })
      this.getTslVal()
    },
    detached: function () {

    }
  },

  observers: {
    'tslData': function (val) {
      if (val == null) return
      this.getTslVal()
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    showSel () {
      if (this.data.deviceStatus === '离线' || this.data.deviceStatus === '0') {
        return plugin.jsUtil.tip(this.data.i18n['offlineTip'])
      }
      let self = this
      self.setData({
        show: true
      })
    },
    onClose () {
      let self = this
      self.setData({
        show: false
      })
    },
    onSelect (e) {
      const { tslData } = this.data
      let sendData = [{
        [tslData.code]: e.detail.value
      }]

      this.triggerEvent('sendAttr', {
        code: tslData.code,
        value: e.detail.value,
        sendData
      })
      this.setData({
        show: false
      })
    },
    getTslVal () {
      let value = plugin.jsUtil.getEnumAttrValue(this.data.tslData)
      this.setData({
        tslVal: value
      })
    }
  }
})
