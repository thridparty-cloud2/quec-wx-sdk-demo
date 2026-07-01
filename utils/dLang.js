import { getEnvConfig } from './tool.js'
let envData = getEnvConfig()

let difLang = {
  wx8b0625890b89be58: { //新版移块上云
    valadd: {//
      serTit: '精选服务',
      telTit: '电话推送',
      setTel: '电话推送服务',
      smsTit: '短信推送',
      setSms: '短信推送服务',
      more: '了解更多',
      set: '设置',
      serTelDetail1: '您可通过小程序推送设置-告警管理为您的设备告警添加电话推送。当设备发生告警后会通过电话通知您，避免消息错过。',
      serTelDetail2: '',
      serTelDetail3: '',
      serSmsDetail: '您可通过小程序推送设置-告警管理为您的设备告警添加短信推送。当设备发生告警后会通过短信通知您，避免消息错过。',
      personListTit: '接收人管理',
      addPer: '添加接收人',
      personDetailTit: '接收人',
      personLabel: '接收人',
      removePer: '移除接收人'
    }
  },
  wx2756715949a88fdc: {//智安宝OEM小程序
    valadd: {
      serTit: '电话报警',
      telTit: '报警套餐',
      setTel: '报警套餐',
      smsTit: '短信推送',
      setSms: '短信推送服务',
      more: '了解更多',
      set: '报警设置',
      serTelDetail1: '1: 购买套餐之后,您可通过小程序(报警设置--推送设置--电话推送--选择对应的设备)添加报警推送。',
      serTelDetail2: '2: 当设备发生告警后会通过一个座机电话通知您,请及时接听。',
      serTelDetail3: '3: 当您购买的电话告警推送额度用完或日期到达时,套餐服务结束。',
      serSmsDetail: '您可通过小程序报警设置--告警管理为您的设备告警添加短信推送。当设备发生告警后会通过短信通知您,避免消息错过。当您购买的短信告警推送额度用完或到期日到达时,套餐服务结束。',
      personListTit: '接警人管理',
      addPer: '添加接警人',
      personDetailTit: '接警人',
      personLabel: '接警人',
      removePer: '移除接警人'
    }
  },
}

export function getDifLang () {
  let wxAppid = envData['appid']
  if (Object.hasOwn(difLang, wxAppid)) {
    return difLang[wxAppid]
  } else {
    return difLang['wx8b0625890b89be58']
  }
}

