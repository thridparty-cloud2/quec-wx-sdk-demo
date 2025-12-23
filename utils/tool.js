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
 * 判断是否为空值
 */
export function isNull (value) {
  return ['', null, undefined].includes(value)
}


/**
 * 自动化切24小时制后，不展示上/下午
 */
export function replacAmPm (name) {
  let fmtName = ''
  let str = ''
  if (name.indexOf('午 ') > 0) {
    fmtName = name.replace('午 ', '午')
  } else {
    fmtName = name
  }
  if (fmtName.indexOf('上午') > 0) {
    fmtName = fmtName.replace('上午', '')
  } else if (fmtName.indexOf('下午') > 0) {
    let idx = fmtName.indexOf('午') + 1
    str = fmtName.substr(idx, 5)
    let hstr = fmtName.substr(idx, 2)
    let ct = converTime(str)
    let hour = ''
    if (Number(ct.hour) < 12) {
      hour = (Number(ct.hour) + 12).toString().padStart(2, '0')
    } else {
      hour = Number(ct.hour).toString().padStart(2, '0')
    }
    fmtName = fmtName.replace(hstr, hour)
    fmtName = fmtName.replace('下午', '')
  }

  return fmtName
}

function converTime (time) {
  let reg = /(\d+):(\d+)/
  let match = time.match(reg)
  if (match) {
    // 提取小时和分钟
    let hour = match[1].toString().padStart(2, '0')
    let min = match[2].toString().padStart(2, '0')
    return { hour, min }

  } else {
    return time
  }
}

