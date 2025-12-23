const plugin = requirePlugin('quecPlugin')

let dlist = {
  /**
   * 
   * @param {*} deviceData-设备列表 
   * @param {*} cur -当前设备
   * @param {*} cb -回调
   */
  fmtData (deviceData, cur, cb) {
    let arr = []
    deviceData.forEach(elm => {
      if (elm.deviceKey === cur.deviceKey && elm.productKey === cur.productKey && elm.shareCode == cur.shareCode) {
        elm.check = !elm.check
      }
      if (elm.check) {
        arr.push(elm)
      }
    })

    if (cb) {
      cb({
        deviceData,
        arr
      })
    }
  },

  /**
  * 初始化选中状态
  */
  fmtCheck (deviceData, cb) {
    deviceData.forEach(elm => {
      elm.check = false
    })
    if (cb) {
      cb(deviceData)
    }
  },

  /**
    * 添加设备
    */
  scanFn (obj, e) {
    obj.triggerEvent('scanSuccess', JSON.stringify(e.detail))
  },

  /**
   * 去设备详情页面
   */
  goDeviceDetail (obj, item) {
    plugin.jsUtil.load()
    obj.triggerEvent('goDetail', item)
  },

  /**
     * 功能介绍
     */
  introduct (obj) {
    obj.triggerEvent("Introduct", true)
  },

  /**
   * 家居模式介绍
   */
  mode (obj) {
    obj.triggerEvent('Mode', true)
  },

  /**
   * 近场发现V2
   */
  toNetwork (obj) {
    obj.triggerEvent('toNetwork', true)
  },

  /**
  * 近场发现V1
  */
  toNear (obj) {
    obj.triggerEvent('toNear', true)
  },


}


module.exports = dlist