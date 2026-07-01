// 获取唤醒词显示名称（弹窗页）
export function getWakeWordName (wakeWordObj) {
  if (!wakeWordObj || !wakeWordObj.vdata) {
    return ""
  }
  // 情况1：接口获取的字符串类型
  if (typeof wakeWordObj.vdata === "string") {
    var vdata = JSON.parse(wakeWordObj.vdata)
    if (
      vdata &&
      vdata.length > 0 &&
      vdata[0].value &&
      vdata[0].value.length > 0
    ) {
      // 查找type为"text"的第一个项目
      for (var i = 0; i < vdata[0].value.length; i++) {
        var item = vdata[0].value[i]
        if (item.type === "text" && item.value) {
          return item.value
        }
      }
    }
  }

  // 情况2：对象数组或“字符串包裹对象数组”格式，统一解析出 displayText
  if (wakeWordObj.vdata) {
    var arr = null
    if (typeof wakeWordObj.vdata === "string") {
      try { arr = JSON.parse(wakeWordObj.vdata) } catch (e) { }
    } else if (Array.isArray(wakeWordObj.vdata)) {
      arr = wakeWordObj.vdata
    }
    if (arr && Array.isArray(arr) && arr.length > 0) {
      var first = arr[0]
      var val = first.value !== undefined ? first.value : first
      if (typeof val === "string") {
        try { val = JSON.parse(val) } catch (e) { }
      }
      if (val && val.displayText !== undefined) {
        return val.displayText
      }
    }
  }
  return ""
}
