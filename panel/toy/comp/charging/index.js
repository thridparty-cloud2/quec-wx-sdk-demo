import tConst from "../../js/homeConst.js"

Component({

  /**
   * 组件的属性列表
   */
  properties: {
    statusStTsl: {
      type: Object
    },
    percentStTsl: {
      type: Object
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    tConst: tConst,
    bgHei: 9,
    bgColor: '#0DFFB7',
    isCharging: false
  },

  observers: {
    "statusStTsl,percentStTsl": function (statusStTsl, percentStTsl) {
      let self = this
      if (JSON.stringify(statusStTsl) !== '{}') {
        self.fmtStatus(statusStTsl)
      }

      if (JSON.stringify(percentStTsl) !== '{}') {
        self.fmtPercent(percentStTsl)
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 充电状态
     * 1 - 未充电 2 - 充电中 3 - 充电完成
     */
    fmtStatus (statusStTsl) {
      let self = this
      if (Number(statusStTsl.vdata) == 2) {//充电中
        self.setData({
          isCharging: true
        })
      } else {
        self.setData({
          isCharging: false
        })
      }
    },

    /**
     * 电量
     * @param {*} percentStTsl 
     */
    fmtPercent (percentStTsl) {
      let self = this
      if (percentStTsl.vdata) {
        let hei = Math.ceil((Number(percentStTsl.vdata) / 100) * 9)
        self.setData({
          bgHei: hei
        })
        if (Number(percentStTsl.vdata) <= 10) {
          self.setData({
            bgColor: '#FF5B5B'
          })
        } else if (Number(percentStTsl.vdata) > 10 && Number(percentStTsl.vdata) <= 20) {
          self.setData({
            bgColor: '#FFD35B',
          })
        } else {
          self.setData({
            bgColor: '#0DFFB7',
          })
        }
      }
    }
  }
})