import env from '../env.js'

// 获取不到token跳转到登录页
export function noLogin () {
  requirePlugin.async('quecPlugin').then(plugin => {
    if (!plugin.config.getToken()) {
      wx.reLaunch({
        url: `/user/index/index`,
      })
    }
  }).catch(({ mod, errMsg }) => {
    console.error(`path: ${mod}, ${errMsg}`)
  })
}

/**
 * 重新登录
 */
export function toLogin () {
  requirePlugin.async('quecPlugin').then(plugin => {
    plugin.config.setUserInfo('')
    wx.reLaunch({
      url: '/user/index/index'
    })
  }).catch(({ mod, errMsg }) => {
    console.error(`path: ${mod}, ${errMsg}`)
  })
}

/**
 * 不同的小程序配置
 */
export function getEnvConfig () {
  let appid = wx.getAccountInfoSync().miniProgram.appId
  return env[appid]
}

/**
 * 本地图片地址转base64
 * @param {*} imgUrl - 本地图片路径
 */
export function toBase64 (imgUrl) {
  let bimg = "data:image/png;base64," + wx.getFileSystemManager().readFileSync(imgUrl, "base64")
  return bimg
}

/**
 * 家居接口返回5041，跳转到首页刷新列表
 */
export function toHouseHome () {
  wx.reLaunch({
    url: '/pages/home/home'
  })
}

/**
 * 判断是否为空值
 */
export function isNull (value) {
  return ['', null, undefined].includes(value)
}