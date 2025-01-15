const plugin = requirePlugin('quecPlugin')

const panelId = {
  1: 'general', //生产环境通用面板
}

export default panelId

/**
 *
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
    }, fail (res) {
      if (res.code === 5193) {
        TslError(obj, data)
      }
    }
  })
}

function getWxPanel (obj, item) {
  let data = { item }
  plugin.quecManage.getWxPanel({
    pk: item.productKey,
    success (res) {
      if (res.code === 200) {
        if (res.data && res.data.uid) {
          data.path = (panelId[res.data.uid] ? panelId[res.data.uid] : panelId[1])
          goDetail(obj, data)
        } else {
          data.path = panelId[1]
          goDetail(obj, data)
        }
      }
    }, fail (res) {
      data.path = panelId[1]
      goDetail(obj, data)
    },
  })
}

function goDetail (obj, data) {
  obj.pageRouter.navigateTo({
    url: `/panel/${data.path}/index/index?item=${encodeURIComponent(JSON.stringify(data.item))}`
  })
}

function TslError (obj, data) {
  obj.pageRouter.navigateTo({
    url: `/panel/no_data/index?item=${encodeURIComponent(JSON.stringify(data.item))}`,
  })
}
