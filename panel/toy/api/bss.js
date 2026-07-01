const plugin = requirePlugin("quecPlugin")
const app = getApp()
const metaData = app.globalData.envData["metaData"]

// 时间单位映射
export const periodUnitMap = {
  DAY: "天",
  MONTH: "月",
  YEAR: "年",
}

// 支付单位映射
export const currencyUnitMap = {
  'CNY': '￥',
  'USD': '$'
}

/**
 * 请求取消订单
 */
export function reqCancelOrder (orderNo) {
  const params = {
    orderNo,
    merchantNo: metaData["merchantNo"].metadataValue,
  }
  return new Promise((resolve) => {
    plugin.dcn.cancelOrder({
      ...params,
      success () {
        resolve(true)
      },
      fail () {
        resolve(false)
      },
    })
  })
}

/**
 * 请求删除订单
 */
export function reqDelOrder (orderNo) {
  const params = {
    orderNo,
    merchantNo: metaData["merchantNo"].metadataValue,
  }
  return new Promise((resolve) => {
    plugin.dcn.fakeDeleteOrder({
      ...params,
      success () {
        resolve(true)
      },
      fail () {
        resolve(false)
      },
    })
  })
}

/**
 * 请求订单列表
 */
export function reqOrderList (params) {
  const nextParams = {
    ...params,
    merchantNo: metaData["merchantNo"].metadataValue,
  }
  return new Promise((resolve) => {
    plugin.dcn.queryBizOrderPage({
      ...nextParams,
      success (res) {
        if (res && res.data) {
          resolve(res.data)
        } else {
          resolve({
            list: [],
          })
        }
      },
      fail () {
        resolve({
          list: [],
        })
      },
    })
  })
}

/**
 * 请求订单详情
 */
export function reqOrderInfo (orderNo) {
  const params = {
    orderNo,
    merchantNo: metaData["merchantNo"].metadataValue,
  }
  return new Promise((resolve) => {
    plugin.dcn.queryBizOrderDetail({
      ...params,
      success (res) {
        if (res && res.data) {
          resolve(res.data)
        } else {
          resolve(undefined)
        }
      },
      fail () {
        resolve(undefined)
      },
    })
  })
}
