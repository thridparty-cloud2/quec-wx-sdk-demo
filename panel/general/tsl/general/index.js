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
    TSLConfig: TSLConfig,
    height: 26,
    open: true,
    numLines: 0,
    newLine: 0,
    attrData: {},
    i18n: '',
    skin: '',
    isReadTxt: false
  },

  observers: {
    'tslData': function (val) {
      if (val == null) return
      this.getTslVal()
    }
  },
  pageLifetimes: {
    show: function () {
      this.setData({
        open: true,
        newLine: 2,
        isReadTxt: false
      })
    },
    hide: function () {

    }
  },
  lifetimes: {
    ready: function () {
      this.setData({
        i18n: plugin.main.getLang(),
        skin: plugin.theme.getSkin()
      })

    },
    detached: function () { }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 获取物模型数据
     */
    getTslVal () {
      let value = this.getContent()
      let attrD = this.data.tslData
      attrD.vdata = value
      this.setData({
        attrData: attrD
      })
    },

    /**
     * 物模型值
     */
    getContent () {
      let self = this
      const { tslData } = this.data
      switch (tslData.dataType) {
        case TSLConfig.TSL_ATTR_DATA_TYPE_TEXT:
          return plugin.jsUtil.getTextValue(tslData)
        case TSLConfig.TSL_ATTR_DATA_TYPE_ARRAY:
          return plugin.jsUtil.getArrayValue(tslData)
        case TSLConfig.TSL_ATTR_DATA_TYPE_STRUCT:
          let str = plugin.jsUtil.getStructValue(tslData)
          let arr = []
          if (str.indexOf('\n') > 0) {
            arr = str.split('\n')
          }
          if (arr.length > 0) {
            self.setData({
              numLines: arr.length,
            })
            if (arr.length > 2) {
              self.setData({
                newLine: 2
              })
            }
          }
          return str
        default:
          return ''
      }
    },

    /**
     * 详情
     */
    goDetail (e) {
      let item = e.currentTarget.dataset.item
      this.triggerEvent('toDetail', item)
    },

    /**
     * 查看更多
     */
    more () {
      this.setData({
        open: !this.data.open,
      })
      if (this.data.open && this.data.numLines > 2) {
        this.setData({
          newLine: 2,
        })
      } else {
        this.setData({
          newLine: this.data.numLines,
        })
      }
    },

    /**
     * 只读文本
     */
    textmore () {
      this.setData({
        open: !this.data.open,
        isReadTxt: !this.data.isReadTxt
      })
    }
  }
})
