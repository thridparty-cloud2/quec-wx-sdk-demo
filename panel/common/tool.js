import wsConst from './wsConst.js'
const plugin = requirePlugin('quecPlugin')
import { getCodeTxt } from './wsCode.js'

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
          console.log('WebSocket 登录成功')
          // 登录完成后，进行设备订阅
          if (subscribeDeviceKey && subscribeProductKey) {
            let data = {
              pk: subscribeProductKey,
              dk: subscribeDeviceKey
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
          if (parm.data.code === 4007 || parm.data.code === 4008 || parm.data.code === 4009 || parm.data.code === 4010) {
            plugin.config.getToLoginFn()
          }
        }
      } else if (parm.cmd === wsConst.CMD_SUBSCRIBE_RESP) {
        // 订阅响应回调
        if (parm.data && parm.data.length > 0) {
          if (parm.data[0].code === '4011' || parm.data[0].code === wsConst.ERROR_CODE_UNBIND) {
            console.log('设备未绑定')
          }
        }
      } else if (parm.cmd === wsConst.CMD_UNSUBSCRIBE_RESP) {
        // 取消订阅响应回调
        //清除订阅信息
        subscribeDeviceKey = ''
        subscribeProductKey = ''
      } else if (parm.cmd === wsConst.CMD_SEND_ACK) {
        sendAck(parm)
      } else if (parm.cmd === wsConst.CMD_MESSAGE) {
        //更新广播
        if (parm.data.type === undefined) {
          try {
            parm.data = JSON.parse(parm.data)
          } catch (e) {
            console.log('=======处理订阅事件消息无法序列化======' + e)
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
          plugin.jsUtil.tip('设备已离线，请稍后再试')
        }
      }
    }
  })
}

//v2 连接websocket
export function connect (options) {
  let { chanel, userid, pk, dk, online, ask, report, output, readresp, info, warn, fault } = options
  plugin.socket.connect({
    chanel, userid, pk, dk,
    online (res) {
      if (res.data.value == 0) {
        plugin.jsUtil.tip('设备已离线，请稍后再试')
      }
      if (online) {
        online(res)
      }
    },
    ask (res) {
      if (res.status == 'succ') {
        plugin.jsUtil.tip('设置成功', 'success')
      } else if (res.status == 'fail') {
        plugin.jsUtil.tip('设置失败', 'error')
      }
      if (ask) {
        ask(res)
      }
    },
    mattr (res) {
      switch (res.subtype) {
        case 'REPORT'://设备主动上报属性信息
          if (report) {
            report(res)
          }
          break
        case 'OUTPUT'://设备服务调用响应信息
          if (output) {
            output(res)
          }
          break
        case 'READRESP'://设备读响应信息
          if (readresp) {
            readresp(res)
          }
          break
        case 'INFO'://信息
          if (info) {
            info(res)
          }
          break
        case 'WARN'://告警
          if (warn) {
            warn(res)
          }
          break
        case 'ERROR'://故障
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
          title: '设备已删除',
          icon: 'error'
        })
      } else if (val == 1) {
        wx.showToast({
          title: '添加设备',
          icon: 'error'
        })
      } else if (val == 2) {
        wx.showToast({
          title: '设备已失效',
          icon: 'error'
        })
      }
    },
    error (res) {
      let txt = getCodeTxt()
      if (txt.hasOwnProperty(res.code)) {
        plugin.jsUtil.tip(txt[res.code])
      }
    },
    fail (res) { }
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
              custData: result.data ? result.data : []
            }
            if (success) {
              success(rs)
            }
          },
          fail (res) { }
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
    }
  })
}

/**
 * 补零
 * @param {*} data 
 */
export function zero (data) {
  let str = ''
  if (data < 10) {
    str += '0' + data
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
          success(res.data.memberRole)  //memberRole 1-创建者 2-管理员 3-普通成员
        }
      }
    }, fail (res) {
      if (fail) {
        fail(rs)
      }
    }, complete (res) {
      if (complete) {
        complete(res)
      }
    }
  })

}
