const plugin = requirePlugin('quecPlugin')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    attrData: {
      type: Object,
      value: {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    attrData: {},
    tslVal: '',
    maxlength: undefined,
    i18n: '',
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

  /**
   * 组件的方法列表
   */
  methods: {
    changeCon (e) {
      let self = this
      let val = plugin.jsValid.trimField(e.detail)
      let data = self.data.attrData
      data.vdata = val

      self.setData({
        attrData: data
      })
    },
    // 表单提交
    formSubmit () {
      let { attrData, tslVal, maxlength } = this.data
      if (tslVal.length <= 0) return
      if (maxlength) {
        tslVal = tslVal.slice(0, maxlength)
      }
      let sendData = [{
        [attrData.code]: tslVal
      }]
      this.triggerEvent('submit', {
        code: attrData.code,
        value: tslVal,
        sendData
      })
    },
    // 获取物模型属性值
    getTslVal () {
      let self = this
      const { attrData } = self.data
      if (attrData.vdata) {
        self.setData({
          tslVal: attrData.vdata
        })
      }
      if (attrData.specs && attrData.specs.length) {
        self.setData({
          maxlength: attrData.specs.length
        })
      }
    }
  }
})
