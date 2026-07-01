import * as TSLConfig from '../util/tslConfig.js'
const plugin = requirePlugin('quecPlugin')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    attrData: {
      type: Object,
      value: {}
    },
    pk: {
      type: String
    },
    dk: {
      type: String
    }
  },

  /**
   * 组件的初始数据 
   */
  data: {
    dataArr: [],
    fieldType: undefined,
    winHeight: 0,
    inputType: 'text',
    toView: '',
    nav_scroll_height: 0, //键盘挤压时，input被遮挡的高度
    TSLConfig: TSLConfig,
    i18n: '',
    skin: '',
    isFinish: false
  },
  lifetimes: {
    ready: function () {
      this.setData({
        i18n: plugin.main.getLang(),
        skin: plugin.main.getSkin()
      })

      this.init()
      this.getFieldType()
      const that = this
      that.setData({
        winHeight: wx.getSystemInfoSync().windowHeight - 180
      })
    },
    detached: function () {

    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    init () {
      plugin.jsUtil.load()
      let self = this
      let arr = []
      let vdata = self.data.attrData.vdata.split(' ')
      for (let i = 0; i < Number(self.data.attrData.specs.size); i++) {
        arr.push(vdata[i])
      }
      self.setData({
        dataArr: arr
      })
      plugin.jsUtil.delayCb(() => {
        self.setData({
          isFinish: true
        })
      }, 100)
    },

    getFieldType () {
      const { attrData } = this.data
      if (attrData.specs.dataType === TSLConfig.TSL_ATTR_DATA_TYPE_INT) {
        this.setData({
          fieldType: 'number'
        })
      } else if (attrData.specs.dataType === TSLConfig.TSL_ATTR_DATA_TYPE_FLOAT || attrData.specs.dataType === TSLConfig.TSL_ATTR_DATA_TYPE_DOUBLE) {
        this.setData({
          fieldType: 'digit'
        })
      } else {
        this.setData({
          fieldType: 'text'
        })
      }
    },
    // 改变input值
    changeVal (e) {
      const { index } = e.currentTarget.dataset
      let val = plugin.jsValid.trimField(e.detail)
      let data = `dataArr[${index}]`
      this.setData({
        [data]: val
      })
    },

    formSubmit () {
      const { attrData } = this.data
      let arr = this.data.dataArr.filter(item => { return item != undefined })

      let n = 0
      arr.forEach(a => {
        if (attrData.specs.dataType === TSLConfig.TSL_ATTR_DATA_TYPE_INT) {
          if (a) {
            let reg = /^-?(0|([1-9][0-9]*))?$/
            if (!reg.test(a)) {
              n++
            }
          }
        }
        if (attrData.specs.dataType === TSLConfig.TSL_ATTR_DATA_TYPE_FLOAT || attrData.specs.dataType === TSLConfig.TSL_ATTR_DATA_TYPE_DOUBLE) {
          if (a) {
            let reg = /^-?(0|([1-9][0-9]*))(\.[\d]+)?$/
            if (!reg.test(a)) {
              n++
            }
          }
        }
      })
      if (n > 0) {
        return plugin.jsUtil.tip('超出取值范围，请重新输入')
      }
      let sendValue = []
      let arrv = []
      arr.forEach(item => {
        if (item) {
          if (plugin.jsUtil.checkFloatDecimal(item) && attrData.specs.dataType === TSLConfig.TSL_ATTR_DATA_TYPE_FLOAT) {
            sendValue.push({ 0: item })
            arrv.push({
              id: 0,
              value: item
            })
          } else if (plugin.jsUtil.checkDoubleDecimal(item) && attrData.specs.dataType === TSLConfig.TSL_ATTR_DATA_TYPE_DOUBLE) {
            sendValue.push({ 0: item })
            arrv.push({
              id: 0,
              value: item
            })
          } else {
            sendValue.push({ 0: item })
            arrv.push({
              id: 0,
              value: item
            })
          }
        }
      })

      if (sendValue.length <= 0) {
        return plugin.jsUtil.tip(this.data.i18n['attrHolder'])
      }
      let sendData = [{
        [attrData.code]: sendValue
      }]

      this.triggerEvent('submit', {
        code: attrData.code,
        value: JSON.stringify(arrv),
        sendData
      })
    },
    //键盘弹起时，解决键盘遮挡问题
    keyboardOcclusion (e) {
      let windowHeight = wx.getSystemInfoSync().windowHeight
      const query = wx.createSelectorQuery().in(this)
      query.select('#' + e.currentTarget.id).boundingClientRect()
      query.selectViewport().scrollOffset()
      var that = this
      query.exec(function (res) {
        let inputBottom = windowHeight - res[0].bottom
        //如果input没有被键盘遮挡，不做任何事
        if (!res[0] || e.detail.height <= inputBottom) {
          that.setData({ nav_scroll_height: 0 })
          return
        }
        //获取input被键盘遮挡的高度
        that.setData({
          nav_scroll_height: e.detail.height - 80
        })
        plugin.jsUtil.delayCb(() => {
          that.setData({
            toView: e.currentTarget.id
          })
        }, 200)
      })
    },
    //键盘关闭时，解决键盘遮挡问题
    offKeyboardOcclusion () {
      this.setData({ nav_scroll_height: 0 })
    }
  }
})
