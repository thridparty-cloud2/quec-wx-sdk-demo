export function toBase64 (imgUrl) {
  let bimg = "data:image/png;base64," + wx.getFileSystemManager().readFileSync(imgUrl, "base64")
  return bimg
}

/**
 * 重新登录
 */
export function toLogin () {
  requirePlugin.async('quecPlugin').then(plugin => {
    plugin.config.setUserInfo('')
    wx.reLaunch({
      url: '/pages/index/index'
    })
  }).catch(({ mod, errMsg }) => {
    console.error(`path: ${mod}, ${errMsg}`)
  })
}