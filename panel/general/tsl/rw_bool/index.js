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
    boolVal: false,
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
    onChange ({ detail }) {
      const { tslData } = this.data
      let sendData = [{
        [tslData.code]: detail.toString()
      }]
      this.triggerEvent('sendAttr', {
        code: tslData.code,
        value: detail,
        sendData
      })
    },
    getTslVal () {
      let self = this
      let tval = plugin.jsUtil.getBoolAttrValue(self.data.tslData)
      let value = self.data.tslData.vdata ? self.data.tslData.vdata : false
      let bval
      if (value === 'true' || value === true || value === '1' || value === 1) {
        bval = true
      }
      if (value === 'false' || value === false || value === '0' || value === 0) {
        bval = false
      }
      self.setData({
        tslVal: tval,
        boolVal: bval
      })
    }
  }
})
