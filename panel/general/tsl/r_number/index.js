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
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    tslData: {},
    tslVal: '',
    unit: '',
    i18n: '',
    TSLConfig: TSLConfig,
  },

  lifetimes: {
    ready: function () {
      this.setData({
        i18n: plugin.main.getLang()
      })
      this.getUnit()
    },
    detached: function () { }
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
    getTslVal () {
      const { tslData } = this.data
      if (tslData.vdata) {
        if (tslData.dataType === TSLConfig.TSL_ATTR_DATA_TYPE_FLOAT || tslData.dataType === TSLConfig.TSL_ATTR_DATA_TYPE_DOUBLE) {
          this.setData({
            tslVal: parseFloat(tslData.vdata).toFixed(3)
          })
        } else {
          this.setData({
            tslVal: tslData.vdata
          })
        }
      }
    },
    getUnit () {
      const { tslData } = this.data
      if (tslData.specs && tslData.specs.unit) {
        this.setData({
          unit: `(${tslData.specs.unit})`
        })
      }
    }
  }
})
