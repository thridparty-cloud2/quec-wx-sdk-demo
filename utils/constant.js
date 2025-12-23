const metadataKeys = {
  isShowSmsPush: "isShowSmsPush",
  isShowPhonePush: "isShowPhonePush",
  merchantNo: "merchantNo",
  merchantSecret: "merchantSecret",
  bssClientAppId: "bssClientAppId",
  // wxAppId: "wxAppId",
  // addValuesPushPanel: "addValuesPushPanel",
  // universalLink: "universalLink"
}
const resourceType = {
  VOICE: 'VOICE',
  SMS: 'SMS'
}

const resourceKeys = {
  ...metadataKeys,
  ...resourceType
}

export {
  resourceKeys
}

export default resourceKeys