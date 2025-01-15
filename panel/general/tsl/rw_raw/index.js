const plugin = requirePlugin('quecPlugin')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    tslData: {
      type: Object
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    tslVal: '',
  },

  lifetimes: {
    ready: function () { },
    detached: function () {

    }
  },

  observers: {
    'tslData': function (tslData) {
      console.log(tslData)
      this.getTslVal()
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    valChange (e) {
      let vals = e.detail
      let pat = /^[0-9A-F]+$/
      if (!pat.test(vals)) {
        return plugin.jsUtil.tip("仅支持16进制内容输入('0 - 9','A - F')")
      }

      this.setData({
        tslVal: e.detail
      })
    },
    // 提交
    tj () {
      let { tslData, tslVal } = this.data
      console.log(tslVal)
      if (tslVal.length <= 0) return

      let pat = /^[0-9A-F]+$/
      if (!pat.test(tslVal)) {
        return plugin.jsUtil.tip("仅支持16进制内容输入('0 - 9','A - F')")
      }

      let sendData = [{
        [tslData.code]: tslVal
      }]
      console.log(sendData)
      this.triggerEvent('submit', {
        code: tslData.code,
        value: tslVal,
        sendData
      })
    },
    // 获取物模型属性值
    getTslVal () {
      let self = this
      const { tslData } = self.data
      if (tslData.vdata) {
        self.setData({
          tslVal: tslData.vdata
        })
      }
    }
  }
})
