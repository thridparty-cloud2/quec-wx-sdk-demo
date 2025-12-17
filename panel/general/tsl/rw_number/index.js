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
    TSLConfig: TSLConfig,
    tslData: {},
    tslVal: 0,
    unit: '',
    max: undefined,
    min: undefined,
    step: 1,
    i18n: '',
    argVisible: false,
    param: '', //数值型参数设置
    skin: ''
  },
  lifetimes: {
    attached: function () {
      this.setData({
        i18n: plugin.main.getLang(),
        skin: plugin.main.getSkin()
      })
      this.getTslVal()
      this.getUnit()
      this.getMax()
      this.getMin()
      this.getStep()
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
    setArgs () {
      this.setData({
        argVisible: true,
        param: ''
      })
    },
    confirmArgs (e) {
      let self = this
      let pat = ''
      if (self.data.tslData.dataType == 'INT') {
        pat = /^-?(0|([1-9][0-9]*))?$/
      } else {
        pat = /^-?(0|([1-9][0-9]*))(\.[\d]+)?$/
      }
      if (!self.data.param) {
        return plugin.jsUtil.tip(self.data.i18n['enterAttr'])
      }
      if (!pat.test(self.data.param)) {
        return plugin.jsUtil.tip('超出取值范围，请重新输入')
      }
      let min = self.data.tslData.specs.min
      let max = self.data.tslData.specs.max
      if (Number(self.data.param) < Number(min) || Number(self.data.param) > Number(max)) {
        plugin.jsUtil.tip(self.data.i18n['inputTip1'] + Number(min) + self.data.i18n['inputTip2'] + Number(max) + self.data.i18n['inputTip3'])
        return
      }
      self.send(self.data.param)
    },
    paramChange (e) {
      this.setData({
        param: plugin.jsValid.trimField(e.detail)
      })
    },
    onChange (e) {
      let val = e.detail.value
      let tslData = this.properties.tslData
      if (tslData.dataType == TSLConfig.TSL_ATTR_DATA_TYPE_FLOAT || tslData.dataType == TSLConfig.TSL_ATTR_DATA_TYPE_DOUBLE) {
        let tslstep = tslData.specs.step
        if (tslstep.toString().indexOf('.') > -1) {
          let tarr = tslstep.toString().split('.')
          let point = tarr[1].toString().length
          let digit
          if (point > 2) {
            digit = 2
          } else {
            digit = point
          }
          val = val.toFixed(digit)
        }
      }
      this.send(val)
    },
    send (data) {
      const { tslData } = this.data
      let sendData = [{
        [tslData.code]: JSON.stringify(+data)
      }]
      this.triggerEvent('sendAttr', {
        code: tslData.code,
        value: data,
        sendData
      })
    },
    /**
    * 数值型弹框（整型、浮点型）关闭
    */
    onClose () {
      this.setData({
        argVisible: false
      })
    },
    getTslVal () {
      const { tslData } = this.data
      if (tslData.vdata) {
        this.setData({
          tslVal: +tslData.vdata
        })
      } else if (tslData.specs && tslData.specs.min) {
        this.setData({
          tslVal: +tslData.specs.min
        })
      }
    },
    getUnit () {
      const { tslData } = this.data
      if (tslData.specs && tslData.specs.unit) {
        this.setData({
          unit: `${tslData.specs.unit}`
        })
      }
    },
    getMax () {
      const { tslData } = this.data
      if (tslData.specs && tslData.specs.max) {
        this.setData({
          max: +tslData.specs.max
        })
      }
    },
    getMin () {
      const { tslData } = this.data
      if (tslData.specs && tslData.specs.min) {
        this.setData({
          min: +tslData.specs.min
        })
      }
    },
    getStep () {
      const { tslData } = this.data
      if (tslData.specs && tslData.specs.step) {
        this.setData({
          step: +tslData.specs.step
        })
      }
    },
    // 加
    plus () {
      const self = this
      let { tslVal, max, step, deviceStatus } = self.data
      if (deviceStatus === '离线' || deviceStatus === '0') {
        return plugin.jsUtil.tip(this.data.i18n['offLine'])
      }
      let num = plugin.jsUtil.add(+tslVal, step)
      if (num > max) return
      self.setData({
        tslVal: num
      })
      self.send(self.data.tslVal)
    },
    // 减
    minus () {
      const self = this
      let { tslVal, min, step, deviceStatus } = self.data
      if (deviceStatus === '离线' || deviceStatus === '0') {
        return plugin.jsUtil.tip(this.data.i18n['offLine'])
      }
      if (+tslVal <= min) return
      self.setData({
        tslVal: plugin.jsUtil.reduce(+tslVal, step)
      })
      self.send(self.data.tslVal)
    }
  }
})
