import tConst from "../../js/homeConst.js"
import eventBus from '../../../common/eventBus.js'

Component({

  /**
   * 组件的属性列表
   */
  properties: {
    device: {
      tyep: Object
    },
    role: {
      type: Object
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    tConst: tConst,
    constTsl: ['chargeStatusSt', 'batteryPercentSt'], //充电状态、电量
    chargeStatusStTsl: {},
    batteryPercentStTsl: {},
  },

  lifetimes: {
    ready: function () {
      let self = this
      // 处理上报数据，实时更新页面显示
      eventBus.on('updateAiWsReport', (wsReport) => {
        //console.log('组件上报的数据：', 'color:green', wsReport)
        self.handleWsReport(wsReport)
      })
    },
    detached: function () {

    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 渲染WS上报数据
     * @param {*} wsReport 
     */
    handleWsReport (wsReport) {
      let self = this
      let constTsl = self.data.constTsl
      let newVal = wsReport
      for (let nv of newVal) {
        if (constTsl.indexOf(nv.code) >= 0) {
          self.setData({
            [`${nv.code}Tsl`]: nv,
          })
        }
      }
    }
  }
})