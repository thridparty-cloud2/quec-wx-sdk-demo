const plugin = requirePlugin("quecPlugin")

/**
 * @param {*} obj - 当前组件对象
 * @param {*} item - {pk,dk,shareCode}
 */
export function getCurPanel (obj, item) {
  let data = { item }
  plugin.quecManage.getTslList({
    pk: data.item.productKey,
    success (res) {
      if (res.data.properties) {
        getWxPanel(obj, item)
      } else {
        TslError(obj, data)
      }
    },
    fail (res) {
      if (res.code === 5193) {
        TslError(obj, data)
      }
    },
  })
}

function getWxPanel (obj, item) {
  let data = { item }
  plugin.quecManage.getWxPanel({
    pk: item.productKey,
    success (res) {
      if (res.code === 200) {
        if (res.data) {
          data.path = 'general'
          goDetail(obj, data)
        }
      }
    },
    fail (res) {
      data.path = 'general'
      goDetail(obj, data)
    },
  })
}

function goDetail (obj, data) {
  obj.pageRouter.navigateTo({
    url: `/panel/general/index/index?item=${encodeURIComponent(
      JSON.stringify(data.item)
    )}`
  })
}

function TslError (obj, data) {
  obj.pageRouter.navigateTo({
    url: `/panel/no_data/index?item=${encodeURIComponent(JSON.stringify(data.item))}`,
  })
}
