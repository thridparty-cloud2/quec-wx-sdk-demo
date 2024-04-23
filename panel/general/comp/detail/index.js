import * as TSLConfig from '../../tsl/util/tslConfig.js'
import { getTslAttr } from '../../../common/tool.js'
import { connect } from '../../../common/tool.js'
const plugin = requirePlugin('quecPlugin')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    pk: {
      type: String,
      value: ''
    },
    dk: {
      type: String,
      value: ''
    },
    curItem: {
      type: Object,
      value: {}
    },
    textDetail: {
      type: Object
    },
    noDataImg: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    curItem: {},
    pk: '',
    dk: '',
    deviceData: {},
    attrData: [],
    TSLConfig: TSLConfig,
    noDataImg: '',
    deviceStatus: '',
    hasDataList: true,
    // 用户手动设置的当前值 
    curAttrName: '',
    curAttrValue: '',
    sHeight: 500,
    i18n: ''
  },
  lifetimes: {
    ready: function () {
      let self = this
      let win = wx.getWindowInfo()

      self.setData({
        noDataImg: plugin.assetBase.getBaseImgUrl() + 'images/device/ic_msg_empty_v2.png',
        sHeight: win.safeArea.bottom - 90,
        i18n: plugin.main.getLang(),
      })
      self.getDeviceStatus()
      self.getTslInfo()
      wx.nextTick(() => {
        self.initWs()
      })
    },
    detached: function () {
      plugin.socket.close()
    }
  },
  pageLifetimes: {
    show: function () {
      if (JSON.stringify(this.data.textDetail) !== '{}') {
        let detail = this.data.textDetail
        this.sendAttr({ detail })
      }
    },
    hide: function () { }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 获取tsl数据
    getTslInfo () {
      let self = this
      const { pk, dk } = self.data
      getTslAttr({
        pk,
        dk,
        success (res) {
          const { propData, custData } = res
          for (let alm of propData) {
            if (custData && custData.customizeTslInfo) {
              let valData = custData.customizeTslInfo
              for (let vlm of valData) {
                if (vlm.resourceCode === alm.code) {

                  alm.vdata = (vlm.resourceValce ? vlm.resourceValce : '')

                }
              }
            } else {
              alm.vdata = ''
            }
          }
          self.fmtAttrData(propData)
        },
        fail (fail) { }
      })
    },

    /**
     *格式化数据
     */
    fmtAttrData (data) {
      this.setData({
        attrData: data
      })
    },


    // 连接websocket
    initWs () {
      const self = this
      const { pk, dk } = self.data
      connect({
        userid: self.properties.curItem.uid,
        pk,
        dk,
        online (res) {
          console.log('online  在线状态 应答', res)
          if (res.data) {
            self.setData({
              deviceStatus: res.data.value
            })
          }
        },
        // 发送指令响应
        ask (res) {
          console.log('sendAck  发送指令响应 应答', res)
          if (res.status == 'succ') {
            // 前端知道用户操作curModeName
            const { curAttrName } = self.data
            self.setCurrentData(curAttrName)
          }
        },
        // 设备主动上报-接收更新
        report (res) {
          console.log('message  设备主动上报', res)
          if (res.data) {
            let reportData = res.data.kv
            let attrData = self.data.attrData
            for (const key in reportData) {
              attrData.forEach((item, index) => {
                if (item.code === key) {
                  let attrDataKey = `attrData[${index}].vdata`
                  if (item.dataType === TSLConfig.TSL_ATTR_DATA_TYPE_ARRAY) {
                    let arrayCon = []
                    for (const iterator of reportData[key]) {
                      arrayCon.push({
                        id: 0,
                        value: iterator
                      })
                    }
                    self.setData({
                      [attrDataKey]: JSON.stringify(arrayCon)
                    })
                  } else if (item.dataType === TSLConfig.TSL_ATTR_DATA_TYPE_STRUCT) {
                    if (item.specs && item.specs.length > 0) {
                      item.specs.forEach(s => {
                        for (const rkey in reportData[key]) {
                          if (s.code === rkey) {
                            s.vdata = reportData[key][rkey]
                          }
                        }
                      })
                      let sDataKey = `attrData[${index}]`
                      self.setData({
                        [sDataKey]: item
                      })
                    }
                  } else {
                    self.setData({
                      [attrDataKey]: reportData[key]
                    })
                  }
                }
              })
            }
          }
        },
      })
    },

    // 获取设备在离线状态
    getDeviceStatus () {
      if (this.data.curItem) {
        this.setData({
          deviceStatus: this.data.curItem.deviceStatus
        })
      }
    },

    // 属性下发
    sendAttr (e) {
      const { pk, dk, deviceStatus, i18n } = this.data
      if (deviceStatus === '离线' || deviceStatus === '0') {
        return plugin.jsUtil.tip(i18n['offLine'])
      }
      const { sendData, code, value } = e.detail
      // 记录当前用户点击的物模型
      this.data.curAttrName = code
      this.data.curAttrValue = value
      if (!sendData || sendData.length === 0) return plugin.jsUtil.tip(this.data.i18n['noAattr'])
      const type = TSLConfig.TSL_ATTR_DATA_WRITE_ATTR
      plugin.socket.send({
        pk, dk, type, sendData,
        success (res) { },
        fail (res) { }
      })
    },
    // 返回成功才设置对应数值
    setCurrentData (modeCode, modeValue) {
      const self = this
      const { attrData, curAttrValue } = self.data
      if (!modeValue) {
        modeValue = curAttrValue
      }
      attrData.forEach(item => {
        if (item.code === modeCode) {
          item.vdata = modeValue
        }
      })
      self.setData({ attrData })
    },

  }
})
