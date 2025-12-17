const plugin = requirePlugin('quecPlugin')

/**
 * 青蛙扫码定制选择设备型号
 */
export function getModelInfo (options) {
  const { success, fail, complete } = options
  plugin.quecUser.getUInfo({
    success (res) {
      if (res.data) {
        plugin.saas.queryInfoByImei({
          endUserId: res.data.uid,
          imei: options.imei,
          success (res) {
            if (success) {
              success(res)
            }
          }, fail (res) {
            if (fail) {
              fail(res)
            }
          }, complete (res) {
            if (complete) {
              complete(res)
            }
          }
        })
      }
    },
    fail (res) { },
    complete () { }
  })
}

export function dtuScan (obj) {
  /**青蛙DTU二维码规则：{IMEI};{SN};{进网许可号};{设备型号} */
  plugin.quecManage.scanDtuCode({
    success (scanrs) {
      if (scanrs.type == 'dtu') {
        getModelInfo({
          imei: scanrs.imei,
          success (res) {
            if (res.data && !res.data.canOptGroup) {
              if (res.data.pkDkInfo) {
                let rs = res.data.pkDkInfo
                rs.imei = scanrs.imei
                obj.pageRouter.navigateTo({
                  url: '/saas/qingwa/add/index?item=' + JSON.stringify(rs)
                })
              }
            } else {
              obj.pageRouter.navigateTo({
                url: '/saas/qingwa/model/index?info=' + JSON.stringify(scanrs)
              })
            }
          },
          fail (res) {
            if (res.code == 50162) {
              showTip()
            }
          }
        })
      }
    }, fail (res) {
      if (res.errMsg !== 'scanCode:fail cancel') {
        showTip()
      }
    }
  })
}

function showTip () {
  wx.showModal({
    content: '抱歉，未找到设备，请联系售后',
    cancelText: '退出',
    cancelColor: '#9CA1AB',
    confirmText: '好的',
    confirmColor: '#0091FF'
  })
}