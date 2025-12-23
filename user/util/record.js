const plugin = requirePlugin('quecPlugin')

/**
 * 添加用户勾选协议记录
 */
export function addRecord (mode, type, obj) {
  let record = {
    mode,
    type,//登录
    version: {
      privacy: obj.properties.privacyVersion,
      protocol: obj.properties.protocolVersion
    }
  }
  addConsentRecord(record)
}

/**
 * data:{
 *   mode:number,注册、登录方式(1:手机密码，2：手机号验证码，3：微信授权，4：qq 授权，5：公众号授权，6：支付宝授权，7：邮箱授权，8：Facebook授权，9：twitter授权，10：Apple授权，11：手机号一键)
 *   type:number (类型（1：注册2：登录）)
 *   version:{
 *     privacy:'xx',
 *     protocol:'xx'
 *   }
 * }
 * 
 * protocolType:number(协议类型（1：隐私条款 2：服务协议）)
 * @param {*} data 
 */
function addConsentRecord (data) {
  let privcay = {
    mode: data.mode,
    privacyVersion: data.version.privacy,
    protocolType: 1, //1：隐私条款
    type: data.type
  }
  addRecordApi(privcay)

  let protocol = {
    mode: data.mode,
    privacyVersion: data.version.protocol,
    protocolType: 2,//2：服务协议
    type: data.type
  }
  addRecordApi(protocol)
}


function addRecordApi (data) {
  plugin.quecUser.addConsentRecord({
    mode: data.mode,
    privacyVersion: data.privacyVersion,
    protocolType: data.protocolType,
    status: data.status ? data.status : 1,
    type: data.type,
    success (res) { },
    fail (res) { }
  })
}
