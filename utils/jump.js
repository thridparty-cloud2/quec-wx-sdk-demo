/**
* 去分享页面
*/
export function goShare (obj, e) {
  obj.pageRouter.navigateTo({
    url: `/mode/share/device/index?item=${encodeURIComponent(JSON.stringify(e.detail))}`,
  })
}

/**
 * 没有token跳转到登录页
 */
export function jump (obj, fromObj = {}) {
  if (JSON.stringify(fromObj) !== '{}') {
    obj.pageRouter.navigateTo({
      url: '/user/index/index?from=' + JSON.stringify(fromObj)
    })
  } else {
    obj.pageRouter.navigateTo({
      url: '/user/index/index'
    })
  }
}

/**
 * 跳转到首页
 */
export function home (obj, flag, from) {
  if (flag) {
    obj.pageRouter.switchTab({
      url: '/pages/home/home'
    })
  } else {
    if (from) {
      obj.pageRouter.navigateTo({
        url: '/mode/share/accept/index?from=' + from
      })
    } else {
      obj.pageRouter.reLaunch({
        url: '/pages/home/home'
      })
    }
  }
}

/**
 * 失效
 */
export function invalid (obj) {
  let timer = null
  timer = setTimeout(() => {
    obj.pageRouter.switchTab({
      url: '/pages/home/home'
    })
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }, 2000)
}
