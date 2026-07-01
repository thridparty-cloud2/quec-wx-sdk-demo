const plugin = requirePlugin("quecPlugin")

const panelId = {
  1: "general", //生产环境通用面板
  //1: "toy", //生产环境通用面板
  423: "zhianbao-v3", //生产环境 智安宝断路器
  638: "zhianbao-v3", //uat环境 智安宝断路器
  94: "heater", //生产环境取暖器面板
  98: "heater", //生产环境取暖器面板
  161: "heater", //uat环境取暖器面板
  99: "pump", //生产环境热水泵面板
  140: "pump", //fat环境热水泵面板
  191: "zhianbao", //生产环境智安宝面板
  177: "taihe", // uat环境智能漏气保护器
  192: "taihe", // 生产环境智能漏气保护器
  327: "zhianbao", //fat环境智安宝面板
  178: "zhianbao", //uat环境智安宝面板
  239: "frog", // 生产环境青蛙水泵面板
  262: "frog", // uat环境青蛙水泵面板
  389: "toy", //AI玩具面板生产
  441: "toy", //AI玩具-趣味风生产-线上
  433: "toy", //AI玩具-趣味风生产-测试专用
  510: "toy", //AI玩具面板uat
  674: "toy", //AI玩具面板uat
  640: "toy", //AI玩具面板uat
  396: "zhianbao-v2", // 生产环境 智安宝增氧机
  535: "zhianbao-v2", // uat 环境 智安宝增氧机
  449: "xinyuan", //生产环境鑫源DTU面板
  690: "xinyuan", //UAT环境鑫源DTU面板
  457: "zhamusi", //生产环境南京查姆斯水泵
  487:"shangfang",// 生产环境尚方温控器面板
  713:"shangfang",// uat环境尚方温控器面板
}

export default panelId

/**
 * @param {*} obj - 当前组件对象
 * @param {*} item - {pk,dk,shareCode}
 */
export function getCurPanel (obj, item) {
  let data = { item }
  if (item.onlineStatus == 1 && item.isOta) {
    obj.pageRouter.navigateTo({
      url: `/panel/ota/cloud/upgrade/index?info=${encodeURIComponent(
        JSON.stringify(item),
      )}`,
    })
  } else {
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
}

function getWxPanel (obj, item) {
  let data = { item }
  plugin.quecManage.getWxPanel({
    pk: item.productKey,
    success (res) {
      if (res.code === 200) {
        if (res.data && res.data.uid) {
          data.path = panelId[res.data.uid] ? panelId[res.data.uid] : panelId[1]
          goDetail(obj, data)
        } else {
          data.path = panelId[1]
          goDetail(obj, data)
        }
      }
    },
    fail (res) {
      data.path = panelId[1]
      goDetail(obj, data)
    },
  })
}

function goDetail (obj, data) {
  if (
    data.path == "heater" ||
    data.path == "pump" ||
    data.path == "taihe" ||
    data.path == "frog" ||
    data.path == "xinyuan" ||
    data.path == 'zhamusi' ||
    data.path == "zhianbao-v2" ||
    data.path == "zhianbao" ||
    data.path == "zhianbao-v3" ||
    data.path == "shangfang"
  ) {
    // Demo: 品牌定制面板已移除，统一使用通用面板
    data.path = "general"
  }
  obj.pageRouter.navigateTo({
    url: `/panel/${data.path}/index/index?item=${encodeURIComponent(
      JSON.stringify(data.item),
    )}&from=deviceList`,
  })
}

function TslError (obj, data) {
  obj.pageRouter.navigateTo({
    url: `/panel/no_data/index?item=${encodeURIComponent(JSON.stringify(data.item))}`,
  })
}
