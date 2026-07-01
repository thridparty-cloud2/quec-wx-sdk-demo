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
    textDetail: {
      type: Object
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    actionVal: false,
    argVisible: false,
    param: '', //数值型参数设置
    enumData: [
      { name: '1111' },
      { name: '2222', color: 'red' },
      { name: '3333' },
      { name: '4444' }
    ],
    enumShow: false,
    dateShow: false,
    changeDate: new Date().getTime(),
    fmt: 'yyyy-MM-dd hh:mm',
    checkVal: false,
    dataArr: [],
    TSLConfig: TSLConfig,
    boolShow: false,
    subType: '',
    numberItem: {},
    chooseText: '全选',
    isChoose: true,
    i18n: '',
    skin: ''
  },

  ready () {
    let self = this
    self.setData({
      i18n: plugin.main.getLang(),
      skin: plugin.main.getSkin()
    })
    let aData = this.data.attrData
    if (aData && aData.specs) {
      let specsData = aData.specs
      for (let item of specsData) {
        item.checkVal = ''
        if (item.dataType === TSLConfig.TSL_ATTR_DATA_TYPE_BOOL) {
          if (item.vdata) {
            if (item.vdata === 'true') {
              item.vdata = true
            }
            if (item.vdata === 'false') {
              item.vdata = false
            }
          } else {
            item.vdata = item.vdata
          }
        } else if (item.dataType === TSLConfig.TSL_ATTR_DATA_TYPE_DATE) {
          if (item.vdata) {
            item.datafmt = plugin.jsUtil.formatDate(new Date(Number(item.vdata)), this.data.fmt)
            self.setData({
              changeDate: Number(item.vdata)
            })
          }
        }
      }
      self.setData({
        dataArr: specsData,
        subType: aData.subType
      })
    }
  },
  pageLifetimes: {
    show: function () {
      if (JSON.stringify(this.data.textDetail) !== '{}') {
        let textDetail = this.data.textDetail
        let data = `dataArr[${textDetail.curkey}].vdata`
        this.setData({
          [data]: textDetail.tslVal
        })
      }
    },
    hide: function () {

    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 显示勾选操作
     * @param {*} e 
     */
    actionChange (e) {
      this.setData({
        actionVal: e.detail
      })
    },
    /**
     * 勾选
     * @param {*} e 
     */
    onCheckChange (e) {
      let data = this.data.dataArr
      data[e.currentTarget.dataset.key].checkVal = Boolean(e.detail)
      this.setData({
        dataArr: data
      })
      this.changetTxt()
    },

    /**
     * 全选/全不选文字
     */
    changetTxt () {
      let n = 0
      for (let item of this.data.dataArr) {
        if (item.checkVal) {
          n++
        } else {
          if (n > 1) {
            n--
          }
        }
      }
      this.setData({
        chooseText: (n == this.data.dataArr.length ? this.data.i18n['chooseTextNo'] : this.data.i18n['chooseTextAll']),
        isChoose: (n == this.data.dataArr.length ? false : true)
      })
    },

    /***
     * 全选
     */
    chooseAll (e) {
      let choose = e.currentTarget.dataset.choose
      let data = this.data.dataArr
      let n = 0
      for (let item of data) {
        if (choose) {
          item.checkVal = true
        } else {
          item.checkVal = false
        }
        if (item.checkVal) {
          n++
        } else {
          if (n > 1) {
            n--
          }
        }
      }
      this.setData({
        dataArr: data,
        chooseText: (n == this.data.dataArr.length ? this.data.i18n['chooseTextNo'] : this.data.i18n['chooseTextAll']),
        isChoose: (n == this.data.dataArr.length ? false : true)
      })
    },

    /**
     * 布尔型
     */
    setBool (e) {
      let item = e.currentTarget.dataset.item
      item.curkey = e.currentTarget.dataset.key
      this.setData({
        boolShow: true,
        numberItem: item
      })
    },

    /**
     * 布尔型开关
     */
    boolChange (e) {
      let data = this.data.dataArr
      data[e.currentTarget.dataset.key].vdata = e.detail
      this.setData({
        dataArr: data
      })
    },

    /**
    * 布尔型关闭
    */
    onBoolClose () {
      this.setData({
        boolShow: false
      })
    },
    /**
     * 布尔型选中
     */
    onBoolSelect (e) {
      let obj = this.data.numberItem
      let data = this.data.dataArr
      data[obj.curkey].vdata = plugin.jsValid.trimField(e.detail.value)
      this.setData({
        dataArr: data,
        boolShow: false
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

    /**
     * (整型、浮点型）参数设置
     */
    confirmArgs (e) {
      let self = this
      let obj = self.data.numberItem
      let data = self.data.dataArr

      let min = obj.specs.min
      let max = obj.specs.max

      let pat = /[^\d-.]/g
      if (!obj.vdata || pat.test(obj.vdata)) {
        return plugin.jsUtil.tip(self.data.i18n['enterAttr'])
      }

      if (!((typeof min == 'string' && min.length == 0) && (typeof max == 'string' && max.length == 0))) {
        if (Number(obj.vdata) < Number(min) || Number(obj.vdata) > Number(max)) {
          return plugin.jsUtil.tip(self.data.i18n['inputTip1'] + min + self.data.i18n['inputTip2'] + max + self.data.i18n['inputTip3'])
        }
      }
      data[obj.curkey].vdata = obj.vdata
      self.setData({
        dataArr: data,
        argVisible: false
      })

    },

    /**
     * 数值型弹框（整型、浮点型）参数设置
     */
    setNumber (e) {
      let item = e.currentTarget.dataset.item
      item.curkey = e.currentTarget.dataset.key
      let self = this
      self.setData({
        numberItem: item
      })
      plugin.jsUtil.delayCb(() => {
        self.setData({
          argVisible: true
        })
      }, 200)
    },

    /**
     * （整型、浮点型）参数输入
     */
    paramChange (e) {
      let obj = this.data.numberItem
      obj.vdata = plugin.jsValid.trimField(e.detail)
      this.setData({
        numberItem: obj
      })
    },

    /**
     * 枚举型关闭
     */
    onEnumClose () {
      this.setData({
        enumShow: false
      })
    },

    /**
     * 枚举型选中
     */
    onEnumSelect (e) {
      let obj = this.data.numberItem
      let data = this.data.dataArr
      data[obj.curkey].vdata = e.detail.value
      this.setData({
        dataArr: data,
        enumShow: false
      })
    },

    /**
     * 显示枚举sheet
     */
    setEnum (e) {
      let item = e.currentTarget.dataset.item
      item.curkey = e.currentTarget.dataset.key
      this.setData({
        enumShow: true,
        numberItem: item
      })
    },

    /**
     * 设置文本类型
     */
    setText (e) {
      let item = e.currentTarget.dataset.item
      let curkey = e.currentTarget.dataset.key
      let info = {
        item: item,
        curkey: curkey
      }
      this.triggerEvent('editStructText', info)
    },

    /**
     * 日期
     */
    setDate (e) {
      let item = e.currentTarget.dataset.item
      item.curkey = e.currentTarget.dataset.key
      if (item.vdata) {
        this.setData({
          dateShow: true,
          numberItem: item
        })
      } else {
        item.vdata = new Date().getTime()
        this.setData({
          dateShow: true,
          numberItem: item,
          // changeDate: new Date().getTime()
        })
      }

    },

    /**
     * 弹框日期选择
     */
    dayInput (event) {
      let year = event.detail.getColumnValue(0).substr(0, 4)
      let mon = event.detail.getColumnValue(1).substr(0, 2)
      let day = event.detail.getColumnValue(2).substr(0, 2)
      let time = event.detail.getColumnValue(3).substr(0, 2)
      let min = event.detail.getColumnValue(4).substr(0, 2)
      let obj = this.data.numberItem
      let data = this.data.dataArr
      data[obj.curkey].vdata = new Date(year + '-' + mon + '-' + day + ' ' + time + ':' + min).getTime()
      this.setData({
        dataArr: data,
        changeDate: new Date(year + '-' + mon + '-' + day + ' ' + time + ':' + min).getTime()
      })
    },

    /**
     * 弹框日期确定
     */
    dayConfirm (event) {
      let obj = this.data.numberItem
      let data = this.data.dataArr
      data[obj.curkey].vdata = event.detail
      data[obj.curkey].datafmt = plugin.jsUtil.formatDate(new Date(event.detail), this.data.fmt)
      this.setData({
        dataArr: data,
        changeDate: event.detail,
        dateShow: false
      })

      // self.getData()
    },

    /**
     * 弹框日期取消
     */
    dayCancel () {
      let self = this
      self.setData({
        dateShow: false
      })
      // self.getData()
    },

    // 表单提交
    formSubmit () {
      const { attrData, dataArr, actionVal } = this.data
      let sendValue = []
      let cnum = 0
      dataArr.forEach(item => {
        if (!item.vdata && (item.vdata !== false)) return
        if (item.vdata && plugin.jsUtil.checkFloatDecimal(item.vdata) && item.dataTypee === TSLConfig.TSL_ATTR_DATA_TYPE_FLOAT) {
          sendValue.push({
            [item.code]: JSON.stringify(+item.vdata)
          })
          if (item.checkVal) {
            cnum++
          }
        } else if (item.vdata && plugin.jsUtil.checkDoubleDecimal(item.vdata) && item.dataType === TSLConfig.TSL_ATTR_DATA_TYPE_DOUBLE) {
          sendValue.push({
            [item.code]: JSON.stringify(+item.vdata)
          })
          if (item.checkVal) {
            cnum++
          }
        } else if (item.vdata && item.dataType === TSLConfig.TSL_ATTR_DATA_TYPE_INT) {
          sendValue.push({
            [item.code]: JSON.stringify(+item.vdata)
          })
          if (item.checkVal) {
            cnum++
          }
        } else {
          sendValue.push({
            [item.code]: item.dataType === TSLConfig.TSL_ATTR_DATA_TYPE_BOOL ? ('' + item.vdata) : item.vdata
          })
          if (item.checkVal) {
            cnum++
          }
        }
      })
      if (actionVal) {
        if (cnum == 0) {
          return plugin.jsUtil.tip(this.data.i18n['attrHolder'])
        }
      }
      let check = false
      if (sendValue.length > 0) {
        check = true
      }
      if (!check) {
        return plugin.jsUtil.tip(this.data.i18n['attrHolder'])
      }
      console.log(sendValue)
      let sendData = [{
        [attrData.code]: sendValue
      }]
      this.triggerEvent('submit', {
        code: attrData.code,
        value: sendValue,
        sendData
      })
    }
  }
})
