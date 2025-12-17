import wsConst from "./wsConst.js"
const plugin = requirePlugin("quecPlugin")
import { getCodeTxt } from "./wsCode.js"
import { getDigits } from "./math.js"
import * as TSLConfig from "../general/tsl/util/tslConfig.js"

// v1 连接websocket
export function connectWs (options) {
  let { pk, dk, sendAck, message } = options
  // 设置接收消息回调
  plugin.webSocket.msgCallback((res) => {
    let subscribeDeviceKey = dk
    let subscribeProductKey = pk
    if (res) {
      let parm = JSON.parse(res)
      if (parm.cmd === wsConst.CMD_LOGIN_RESP) {
        // 登录回调
        if (parm.data.code === 1) {
          console.log("WebSocket 登录成功")
          // 登录完成后，进行设备订阅
          if (subscribeDeviceKey && subscribeProductKey) {
            let data = {
              pk: subscribeProductKey,
              dk: subscribeDeviceKey,
            }
            plugin.webSocket.subscribeDevice(data)
          }
        } else {
          /**
           * 4007-token为空
           * 4008-token验证失败
           * 4009-用户不能重复登录
           * 4010-用户未登录
           */
          if (
            parm.data.code === 4007 ||
            parm.data.code === 4008 ||
            parm.data.code === 4009 ||
            parm.data.code === 4010
          ) {
            plugin.config.getToLoginFn()
          }
        }
      } else if (parm.cmd === wsConst.CMD_SUBSCRIBE_RESP) {
        // 订阅响应回调
        if (parm.data && parm.data.length > 0) {
          if (
            parm.data[0].code === "4011" ||
            parm.data[0].code === wsConst.ERROR_CODE_UNBIND
          ) {
            console.log("设备未绑定")
          }
        }
      } else if (parm.cmd === wsConst.CMD_UNSUBSCRIBE_RESP) {
        // 取消订阅响应回调
        //清除订阅信息
        subscribeDeviceKey = ""
        subscribeProductKey = ""
      } else if (parm.cmd === wsConst.CMD_SEND_ACK) {
        sendAck(parm)
      } else if (parm.cmd === wsConst.CMD_MESSAGE) {
        //更新广播
        if (parm.data.type === undefined) {
          try {
            parm.data = JSON.parse(parm.data)
          } catch (e) {
            console.log("=======处理订阅事件消息无法序列化======" + e)
          }
        }
        message(parm)
      } else if (parm.cmd === wsConst.CMD_ERROR) {
        if (Number(parm.data.code) === 4001) {
          plugin.webSocket.closeSocket()
          plugin.jsUtil.delayCb(() => {
            plugin.webSocket.connectSocket()
          }, 1500)
        } else if (Number(parm.data.code) === 4030) {
          plugin.jsUtil.tip("设备已离线，请稍后再试")
        }
      }
    }
  })
}

//v2 连接websocket
export function connect (options) {
  let {
    chanel,
    userid,
    pk,
    dk,
    online,
    ask,
    askcust,
    report,
    output,
    readresp,
    info,
    warn,
    fault,
    exception,
  } = options
  plugin.socket.connect({
    chanel,
    userid,
    pk,
    dk,
    online (res) {
      if (res.data.value == 0) {
        plugin.jsUtil.tip("设备已离线，请稍后再试")
      }
      if (online) {
        online(res)
      }
    },
    ask (res) {
      if (askcust) {
        askcust(res)
      } else {
        if (res.status == "succ") {
          plugin.jsUtil.tip("设置成功", "success")
        } else if (res.status == "fail") {
          plugin.jsUtil.tip("设置失败", "error")
        }
        if (ask) {
          ask(res)
        }
      }
    },
    mattr (res) {
      switch (res.subtype) {
        case "REPORT": //设备主动上报属性信息
          if (report) {
            report(res)
          }
          break
        case "OUTPUT": //设备服务调用响应信息
          if (output) {
            output(res)
          }
          break
        case "READRESP": //设备读响应信息
          if (readresp) {
            readresp(res)
          }
          break
        case "INFO": //信息
          if (info) {
            info(res)
          }
          break
        case "WARN": //告警
          if (warn) {
            warn(res)
          }
          break
        case "ERROR": //故障
          if (fault) {
            fault(res)
          }
          break
      }
    },
    enduser (res) {
      let val = res.data.value
      if (val == 0) {
        wx.showToast({
          title: "设备已删除",
          icon: "error",
        })
      } else if (val == 1) {
        wx.showToast({
          title: "添加设备",
          icon: "error",
        })
      } else if (val == 2) {
        wx.showToast({
          title: "设备已失效",
          icon: "error",
        })
      }
    },
    error (res) {
      let txt = getCodeTxt()
      if (txt.hasOwnProperty(res.code)) {
        plugin.jsUtil.tip(txt[res.code])
      }
    },
    fail (res) {
      // console.log('connect fail:')
      // console.log(res)
      if (exception) {
        exception(res)
      }
    },
  })

  // let { chanel } = options
  // switch (chanel) {
  //   case 1:
  //     v1Cb(options)
  //     break
  //   case 2:
  //     v2Cb(options)
  //     break
  // }
}

/**
 * getTslList-获取所有物模型属性
 * getDeviceBusinessAttributes-获取有值的物模型
 */
export function getTslAttr (options) {
  const { pk, dk, success, fail, complete } = options
  plugin.quecManage.getTslList({
    pk,
    success (res) {
      const { data } = res
      if (data.properties) {
        plugin.quecManage.getDeviceBusinessAttributes({
          pk: pk,
          dk: dk,
          success (result) {
            let rs = {
              propData: data.properties,
              custData: result.data ? result.data : [],
            }
            if (success) {
              success(rs)
            }
          },
          fail (res) { },
        })
      }
    },
    fail (res) {
      if (fail) {
        fail(rs)
      }
    },
    complete (res) {
      if (complete) {
        complete(res)
      }
    },
  })
}

/**
 * 补零
 * @param {*} data
 */
export function zero (data) {
  let str = ""
  if (data < 10) {
    str += "0" + data
  } else {
    str = data
  }
  return str
}

/**
 * 根据id排序
 */
export function sortById (a, b) {
  return a.id - b.id
}

/**
 * 热泵面板-根据planid排序
 */
export function sortByPlanId (a, b) {
  return a.planid - b.planid
}

/**
 * 家居模式下-根据fid 获取当前家庭权限
 * fid-家庭id
 */
export function getHouseAuth (options) {
  const { fid, success, fail, complete } = options
  plugin.quecHouse.getCurrentFamily({
    fid,
    success (res) {
      console.log(res)
      if (success) {
        if (res.data) {
          success(res.data.memberRole) //memberRole 1-创建者 2-管理员 3-普通成员
        }
      }
    },
    fail (res) {
      if (fail) {
        fail(rs)
      }
    },
    complete (res) {
      if (complete) {
        complete(res)
      }
    },
  })
}

/**
 * @description 判断是否为 INT 类型物模型
 */
export function isIntTsl (attr) {
  return attr && attr.dataType === TSLConfig.TSL_ATTR_DATA_TYPE_INT
}

/**
 * @description 判断是否为浮点型类型物模型
 */
export function isDecimalTsl (attr) {
  return (
    attr &&
    (attr.dataType === TSLConfig.TSL_ATTR_DATA_TYPE_FLOAT ||
      attr.dataType === TSLConfig.TSL_ATTR_DATA_TYPE_DOUBLE)
  )
}

/**
 * @description 判断是否为 数值 类型物模型
 */
export function isNumberTsl (attr) {
  return isIntTsl(attr) || isDecimalTsl(attr)
}

/**
 * @description 判断是否为 枚举 类型物模型
 */
export function isEnumTsl (attr) {
  return attr && attr.dataType === TSLConfig.TSL_ATTR_DATA_TYPE_ENUM
}

/**
 * @description 判断是否为 布尔 类型物模型
 */
export function isBooleanTsl (attr) {
  return attr && attr.dataType === TSLConfig.TSL_ATTR_DATA_TYPE_BOOL
}

/**
 * @description 判断是否为 文本 类型物模型
 */
export function isTextTsl (attr) {
  return attr && attr.dataType === TSLConfig.TSL_ATTR_DATA_TYPE_TEXT
}

/**
 * @description 判断是否为 只读 物模型
 */
export function isReadOnlyTsl (attr) {
  return attr && attr.subType === TSLConfig.TSL_SUBTYPE_R
}

/**
 * @description 判断是否为 读写 物模型
 */
export function isReadAndWriteTsl (attr) {
  return attr && attr.subType === TSLConfig.TSL_SUBTYPE_RW
}

/**
 * @description 判断是否为 只写 物模型
 */
export function isWriteOnlyTsl (attr) {
  return attr && attr.subType === TSLConfig.TSL_SUBTYPE_W
}

/**
 * @description 获取枚举值在 specs 中的下标
 */
export function findEnumValueIndex (enumTsl) {
  if (enumTsl.dataType !== TSLConfig.TSL_ATTR_DATA_TYPE_ENUM) return

  const value = enumTsl.vdata
  const specs = enumTsl.specs || []

  return specs.findIndex((s) => s.value == value)
}

/**
 * @description 回显布尔、枚举的值
 */
export function getEnumName (attr, value) {
  if (value == null) return ""
  var text = value
  if (
    attr.dataType === TSLConfig.TSL_ATTR_DATA_TYPE_ENUM ||
    attr.dataType === TSLConfig.TSL_ATTR_DATA_TYPE_BOOL
  ) {
    if (!attr.specs || attr.specs.length <= 0) {
      return ""
    }
    attr.specs.forEach(function (el) {
      if (el.value.toString() === value.toString()) {
        text = el.name
      }
    })
  }
  return text
}

/**
 * @description 获取浮点型物模型的精度
 */
export function getAccuracyOfFloatTsl (floatTsl) {
  if (!isIntTsl(floatTsl) && floatTsl.specs && floatTsl.specs.step) {
    return getDigits(floatTsl.specs.step)
  }
  return 0
}

/**
 * @description 两个对象是否相等
 */
export function isObjectEqual (obj1, obj2) {
  if (obj1 === obj2) return true

  if (
    typeof obj1 !== "object" ||
    typeof obj2 !== "object" ||
    obj1 === null ||
    obj2 === null
  ) {
    return false
  }

  const obj1Keys = Object.keys(obj1)
  const obj2Keys = Object.keys(obj2)

  if (obj1Keys.length !== obj2Keys.length) {
    return false
  }

  for (let key of obj1Keys) {
    const val1 = obj1[key]
    const val2 = obj2[key]

    const areObjects =
      typeof val1 === "object" &&
      val1 !== null &&
      typeof val2 === "object" &&
      val2 !== null
    if (areObjects && !isObjectEqual(val1, val2)) {
      return false
    }
    if (!areObjects && val1 !== val2) {
      return false
    }
  }

  return true
}

export function isEmptyObj (obj) {
  if (JSON.stringify(obj) === "{}") return true
  return false
}


/**
* 格式化设备影子数据,并赋值
* propData 物模型数据
*/
export function attrValAssign (propData, custData) {
  let tslProps = propData
  for (let alm of tslProps) {
    if (custData && custData.customizeTslInfo) {
      let valData = custData.customizeTslInfo
      for (let vlm of valData) {
        if (vlm.resourceCode === alm.code) {
          if (alm.dataType == TSLConfig.TSL_ATTR_DATA_TYPE_STRUCT) {
            if (alm.specs && vlm.resourceValce) {
              structFmt(alm.specs, vlm.resourceValce)
            } else {
              alm.vdata = ''
            }
          } else {
            alm.vdata = (vlm.resourceValce ? vlm.resourceValce : '')
          }
        }
      }
    } else {
      alm.vdata = ''
    }
  }
  return tslProps
}

/**
* 格式化结构体Value值
* @param {*} attrData 
* @param {*} valData 
*/
export function structFmt (attrData, valData) {
  let valueData = JSON.parse(valData)
  for (let attr of attrData) {
    for (let key in valueData) {
      if (attr.code === key) {
        attr.vdata = valueData[key]
      }
    }
  }
}

