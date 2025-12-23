import { getEnvConfig } from "./tool.js"
let envData = getEnvConfig()

let difLang = {
  wx2c08f5cd67a21a7b: {
    valadd: {
      //
      serTit: "精选服务",
      telTit: "电话推送",
      setTel: "电话推送服务",
      smsTit: "短信推送",
      setSms: "短信推送服务",
      more: "了解更多",
      set: "设置",
      serTelDetail1:
        "您可通过小程序推送设置-告警管理为您的设备告警添加电话推送。当设备发生告警后会通过电话通知您，避免消息错过。",
      serTelDetail2: "",
      serTelDetail3: "",
      serSmsDetail:
        "您可通过小程序推送设置-告警管理为您的设备告警添加短信推送。当设备发生告警后会通过短信通知您，避免消息错过。",
      personListTit: "接收人管理",
      addPer: "添加接收人",
      personDetailTit: "接收人",
      personLabel: "接收人",
      removePer: "移除接收人",
    },
  }
}

export function getDifLang () {
  let wxAppid = envData["appid"]
  if (Object.hasOwn(difLang, wxAppid)) {
    return difLang[wxAppid]
  } else {
    return difLang["wx2c08f5cd67a21a7b"]
  }
}
