const plugin = requirePlugin('quecPlugin')

/**
 * 批量删除设备-验证
 */
export function validShare (item, selDevice, cb) {
  if (selDevice.length > 0 && item.shareCode && !item.check) {
    return plugin.jsUtil.tip('共享设备暂不支持批量操作')
  }

  if (selDevice.length > 19 && !item.check) {
    return plugin.jsUtil.tip('一次最多可批量操作20个设备')
  }

  if (cb) {
    cb()
  }
}