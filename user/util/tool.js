const plugin = requirePlugin('quecPlugin')

/**
 * // 发送前校验
 * @param {*} uname 
 * @param {*} cb_phone 
 * @param {*} cb_email 
 */
export function sendCode (uname, cb_phone, cb_email) {
  if (uname.indexOf('@') < 0) {
    // 校验手机号
    if (plugin.jsValid.validPhone(uname)) {
      return plugin.jsUtil.tip(plugin.main.getLang()['phonePlace'])
    }
    plugin.quecUser.isPhoneRegister({
      phone: uname,
      success (res) {
        if (cb_phone) {
          cb_phone(res)
        }
      },
      fail (res) { }
    })
  } else {
    // 校验邮箱
    if (plugin.jsValid.validEmail(uname)) {
      return plugin.jsUtil.tip(plugin.main.getLang()['emailPlace'])
    }
    plugin.quecUser.isEmailRegister({
      email: uname,
      success (res) {
        if (cb_email) {
          cb_email(res)
        }
      },
      fail (res) { }
    })
  }
}

/**
 * 发送手机验证码
 */
export function sendPhoneCode (phone, type, scb, fcb, comcb) {
  plugin.jsUtil.load()
  //短信类型（1-密码重置 2-登录 3-注册 4-注销 5-添加推送人）
  let codeType 
  if (type == 1) {//登录
    codeType=2 //2-登录
  }else if(type == 2){//忘记密码
    codeType=1 //1-密码重置
  }else if(type == 3){//注册
    codeType=3 //3-注册
  }else if(type == 4){//忘记密码
    codeType=1 //1-密码重置
  }else if(type == 7){//注销
    codeType=4 //4-注销
  }
  console.log('codeType:'+codeType)
  plugin.quecUser.sendPhoneSmsCodeV2({
    codeType,
    phone: phone,
    success (res) {
      plugin.jsUtil.tip(plugin.main.getLang()['sendSucc'])
      plugin.jsUtil.delayCb(() => {
        if (scb) {
          scb()
        }
      }, 1000)
    },
    fail (res) {
      plugin.jsUtil.tip(res.msg, 'error')
      validCb(fcb)
    }, complete () {
      if (comcb) {
        comcb()
      }
    }
  })
}

/**
 * 发送邮箱验证码-忘记密码
 */
export function sendForgetEmailCode (email, scb, fcb, comcb) {
  plugin.jsUtil.load(8000)
  plugin.quecUser.sendEmailV2({
    email,
    emailType:2,
    success (res) {
      plugin.jsUtil.tip(plugin.main.getLang()['sendSucc'])
      plugin.jsUtil.delayCb(() => {
        scb()
      }, 1000)
    },
    fail (res) {
      plugin.jsUtil.tip(res.msg, 'error')
      validCb(fcb)
    },
    complete () {
      comcb()
    }
  })
}

/**
 * 发送邮箱验证码-注册
 */
export function sendRegEmailCode (email, scb, fcb, comcb) {
  plugin.jsUtil.load(15000)
  plugin.quecUser.sendEmailV2({
    email,
    emailType:1,
    success (res) {
      plugin.jsUtil.tip(plugin.main.getLang()['sendSucc'])
      plugin.jsUtil.delayCb(() => {
        scb()
      }, 1000)
    },
    fail (res) {
      if (res.status == 500) {
        plugin.jsUtil.tip('验证码发送失败', 'error')
      } else {
        plugin.jsUtil.tip(res.msg ? res.msg : '验证码发送失败', 'error')
      }
      validCb(fcb)
    },
    complete () {
      comcb()
    }
  })
}

/**
 * 验证短信验证码
 */
export function validateSmsCode (uname, code, scb, fcb) {
  plugin.quecUser.validateSmsCode({
    phone: uname,
    smsCode: code,
    isDisabled: 2,
    success (res) {
      scb()
    }, fail (res) {
      plugin.jsUtil.tip('验证失败', 'error')
      validCb(fcb)
    }
  })
}

/**
 * 验证邮箱验证码
 */
export function validateEmailCode (uname, code, scb, fcb) {
  plugin.quecUser.validateEmailCode({
    code,
    email: uname,
    isDisabled: 2,
    success (res) {
      scb()
    }, fail (res) {
      plugin.jsUtil.tip('验证失败', 'error')
      validCb(fcb)
    }
  })
}

function validCb (fcb) {
  plugin.jsUtil.delayCb(() => {
    fcb()
  })
}

/**
 * // 注销发送前校验
 * @param {*} uname 
 * @param {*} cb_phone-手机号验证码发送成功回调 
 * @param {*} cb_email-邮箱验证码发送成功回调
 * @param {*} fcb-失败回调
 */
export function sendCodeWithNoPhoneValid (uname, type, cb_phone, cb_email, fcb) {
  if (uname.indexOf('@') < 0) {
    // 校验手机号
    if (plugin.jsValid.validPhone(uname)) {
      return plugin.jsUtil.tip(plugin.main.getLang()['phonePlace'])
    }
    sendPhoneCode(uname, type, cb_phone, fcb)
  } else {
    // 校验邮箱
    if (plugin.jsValid.validEmail(uname)) {
      return plugin.jsUtil.tip(plugin.main.getLang()['emailPlace'])
    }
    sendEmailCode(uname, cb_email, fcb)
  }
}

/**
 * 发送邮箱验证码-注销
 */
export function sendEmailCode (email, scb, fcb, comcb) {
  plugin.jsUtil.load(6000)
  plugin.quecUser.sendEmailV2({
    email,
    emailType:5,
    success (res) {
      if (scb) {
        scb()
      }
    },
    fail (res) {
      plugin.jsUtil.tip(res.msg, 'error')
      plugin.jsUtil.delayCb(() => {
        if (fcb) {
          fcb()
        }
      })
    },
    complete () {
      if (comcb) {
        comcb()
      }
    }
  })
}

