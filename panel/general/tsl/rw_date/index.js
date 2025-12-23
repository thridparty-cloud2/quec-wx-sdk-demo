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
    showFlag: false,
    changeDate: new Date().getTime(),
    apiDate: new Date().getTime(),
    fmt: 'yyyy-MM-dd hh:mm',
    tslVal: '',
    tslData: {},
    i18n: '',
    TSLConfig: TSLConfig,
    skin: ''
  },

  lifetimes: {
    ready: function () {
      this.setData({
        i18n: plugin.main.getLang(),
        skin: plugin.main.getSkin(),
      })
      this.getTslVal()
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
    showDate () {
      let { deviceStatus } = this.data
      let { tslData } = this.properties
      if (deviceStatus === '离线' || deviceStatus === '0') {
        return plugin.jsUtil.tip(this.data.i18n['offlineTip'])
      }
      this.setData({
        showFlag: true
      })

      if (tslData.vdata) {
        this.setData({
          changeDate: Number(tslData.vdata)
        })
      } else {
        this.setData({
          changeDate: new Date().getTime()
        })
      }
    },
    /**
     * 弹框日期选择
     */
    dayInput (event) {
      this.setData({
        changeDate: event.detail
      })
    },
    /**
     * 弹框日期确定
     */
    dayConfirm (e) {
      const { detail } = e
      const { tslData } = this.data
      let sendData = [{
        [tslData.code]: detail
      }]
      this.triggerEvent('sendAttr', {
        code: tslData.code,
        value: detail,
        sendData
      })
      this.setData({
        showFlag: false
      })
    },
    /**
     * 弹框日期取消
     */
    dayCancel () {
      let self = this
      self.setData({
        showFlag: false,
        changeDate: self.data.apiDate
      })
    },
    getTslVal () {
      let self = this
      const { tslData } = self.data
      if (tslData.vdata) {
        let tdata = tslData.vdata
        /**
         * 兼容报警器系统时间戳为10位的情况
         */
        if (tdata.length === 10) {
          tdata = Number(tdata) * 1000
        } else if (tdata.length === 13) {
          tdata = Number(tdata)
        }
        self.setData({
          tslVal: plugin.jsUtil.formatDate(new Date(tdata), self.data.fmt),
        })
      }
    },
  }
})
