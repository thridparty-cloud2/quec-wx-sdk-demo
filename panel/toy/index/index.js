import tConst from "../js/homeConst.js"
import wsConst from "../../common/wsConst.js"
import { connect, getTslAttr, attrValAssign } from "../../common/tool.js"
import eventBus from "../../common/eventBus.js"

let app = getApp()
const plugin = requirePlugin("quecPlugin")

Page({
  /**
   * 页面的初始数据
   */
  data: {
    curDevice: {},
    tConst: tConst,

    iccId: "",
    isKmt: false,

    roleObj: {},
    /**
     * 升级计划弹窗
     */
    cloudOtaVisible: false,
    cloudPlan: {},

    /**物模型 充电状态、电量、音量*/
    constTsl: [
      "chargeStatusSt",
      "batteryPercentSt",
      "volume",
      "chatReload",
      "function",
      "alarmClock",
      "sos",
    ], //充电状态、电量、音量、开关
    chargeStatusStTsl: {}, //充电状态物模型
    batteryPercentStTsl: {}, //电量百分比物模型
    volumeTsl: {}, //音量物模型
    chatReloadTsl: {}, //重新进房物模型
    functionTsl: {}, //功能展示物模型
    alarmClockTsl: {}, // 闹钟物模型
    sosTsl: {}, // 星云sos物模型

    tslProps: [], //所有物模型（带值）

    curActAttr: {
      //当前操作的物模型
      code: "",
      value: "",
      isReport: false,
      isSuccByReport: false, //是否根据上报来标识成功
    },

    // 音量滑动调节弹窗
    sliderShow: false,

    isWSV2Connected: false, //WS是否连接成功
    isWsConnecting: false, //WS是否正在连接

    netErrorShow: false, //网络异常弹框

    sendTimer: null,

    riskItem: {}, //风险预警未处理数据
    riskShow: false, // 风险预警弹框显示状态

    env: app.globalData.envData,

    isSimFlow: false, //设备流量开关

    sosShow: false, // 星云sos弹窗
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let self = this
    self._isPageAlive = true
    self._shouldCheckRisk = options.from === "deviceList"

    if (options.item) {
      let dItem = JSON.parse(decodeURIComponent(options.item))
      self.setData({
        curDevice: dItem,
      })
    }
    self.getTslInfo()
    plugin.jsUtil.delayCb(() => {
      if (!self._isPageAlive) return
      self.reconnectWsV2()
      /**
       * OTA升级弹框:在线，非分享设备、非普通成员
       */
      let { curDevice } = self.data
      console.log("curDevice", curDevice)

      if (
        !curDevice.shareCode &&
        curDevice.onlineStatus == 1 &&
        curDevice.memberRole !== 3
      ) {
        self.getCloudOta()
      }
    }, 1000)

    eventBus.off("sendAttr")
    eventBus.on("sendAttr", (data, scb, fcb) => {
      //下发统一方法
      self.sendAttr(data, scb, fcb)
    })

    eventBus.off("reconnectWsV2")
    eventBus.on("reconnectWsV2", (data) => {
      //切换设备连接ws统一处理方法
      self.reconnectWsV2(data)
    })

    eventBus.off("tryCloseWsSocket")
    eventBus.on("tryCloseWsSocket", () => {
      //切换设备关闭ws统一处理方法
      self.tryCloseWsSocket()
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    let self = this
    console.log("tsl", self.data.volumeTsl)

    if (JSON.stringify(self.data.curDevice) !== "{}") {
      self.initRoleAndVoice()
      wx.nextTick(() => {
        self.aiProductConfig()
      })
      if (app.globalData.appStatus == "front") {
        self.reconnectWsV2()
        wx.nextTick(() => {
          app.globalData.appStatus = ""
        })
      }
    }
  },

  /**
   * 是否显示设备流量
   * types: 
   *  EDU_SIM_FLOW_PACKAGE：设备流量
   *  CHAT_WARN:风险预警
   */
  aiProductConfig() {
    let self = this
    let { curDevice } = self.data
    plugin.ai.aiProductConfig({
      productKey: curDevice.productKey,
      types: "EDU_SIM_FLOW_PACKAGE,CHAT_WARN",
      success(res) {
        console.log("aiProductConfig")
        console.log(res)
        if (res.data && res.data.length > 0) {
          const configMap = {}
          res.data.forEach((item) => {
            if (item && typeof item === "object") {
              Object.keys(item).forEach((key) => {
                configMap[key] = item[key]
              })
            }
          })

          self.setData({
            isSimFlow: !!configMap.EDU_SIM_FLOW_PACKAGE,
          })

          console.log("设备流量开关", self.data.isSimFlow)

          if (self._shouldCheckRisk && !!configMap.CHAT_WARN) {
            self._shouldCheckRisk = false
            self.getRiskData() //风险预警弹框
          }
          
        }
      },
      fail(res) {},
    })
  },

  // 获取tsl数据
  getTslInfo() {
    let self = this
    let { curDevice } = self.data
    getTslAttr({
      pk: curDevice.productKey,
      dk: curDevice.deviceKey,
      success(res) {
        const { propData, custData } = res
        self.setData({
          tslProps: attrValAssign(propData, custData),
          //898604041025C0160751,898608681025D0373007
          iccId: custData.deviceData.iccId ? custData.deviceData.iccId : "",
        })

        eventBus.emit("updateAiWsReport", self.data.tslProps)
        self.fmtAttrVal(self.data.tslProps)
      },
      fail(fail) {},
      complete(res) {},
    })
  },

  /**
   * 获取风险预警未处理数据
   */
  getRiskData() {
    let self = this
    let { curDevice } = self.data
    plugin.ai.chatWarnList({
      productKey: curDevice.productKey,
      deviceKey: curDevice.deviceKey,
      endUserId: curDevice.shareCode ? curDevice.ownerUid : curDevice.uid,
      pageNum: 1,
      pageSize: 20,
      success(res) {
        if (res.rows && res.rows.length > 0) {
          let rows = res.rows
          let latestUnprocessedRisk = rows.find((item) => item.status === false)
          if (latestUnprocessedRisk) {
            self.setData({
              riskItem: latestUnprocessedRisk,
              riskShow: true,
            })
          } else {
            self.setData({
              riskShow: false,
            })
          }
        }
      },
      fail(res) {},
    })
  },

  /**
   * 风险预警-关闭
   */
  riskClose() {
    this.setData({
      riskShow: false,
    })
  },

  /**
   * 格式化上报值，并赋值
   */
  fmtAttrVal(reportData) {
    let self = this
    let constTsl = self.data.constTsl
    let newVal = reportData
    console.log("newVal", constTsl)
    for (let nv of newVal) {
      if (constTsl.indexOf(nv.code) >= 0) {
        self.setData({
          [`${nv.code}Tsl`]: nv,
        })
      }
    }
  },

  /**
   * OTA升级计划
   */
  getCloudOta() {
    let self = this
    let { curDevice } = self.data
    plugin.ota.getDeviceUpgradePlan({
      productKey: curDevice.productKey,
      deviceKey: curDevice.deviceKey,
      success(res) {
        if (res.data) {
          self.setData({
            cloudPlan: res.data,
          })
          if (Number(res.data.userConfirmStatus) == 0) {
            let cloudData = []
            if (wx.getStorageSync("cloud_ota_plan")) {
              cloudData = JSON.parse(wx.getStorageSync("cloud_ota_plan"))
              let flag = cloudData.some((cd) => cd.planId === res.data.planId)
              if (flag) {
                self.setData({
                  cloudOtaVisible: false,
                })
              } else {
                self.cloudPop(res, cloudData)
              }
            } else {
              self.cloudPop(res, cloudData)
            }
          }
        }
      },
      fail(res) {},
    })
  },

  /**
   * OTA 升级弹框
   * @param {*} res
   * @param {*} cloudData
   */
  cloudPop(res, cloudData) {
    let { curDevice } = this.data
    if (curDevice.onlineStatus == 1) {
      this.setData({
        cloudOtaVisible: true,
      })
      cloudData.push({
        planId: res.data.planId,
        pk: res.data.productKey,
        dk: res.data.deviceKey,
      })
      wx.setStorageSync("cloud_ota_plan", JSON.stringify(cloudData))
    }
  },

  /**
   * OTA 升级弹框关闭
   */
  cloudOtaClose() {
    this.setData({
      cloudOtaVisible: false,
    })
  },

  /**
   * 获取设备的当前角色与音色
   */
  initRoleAndVoice() {
    let self = this
    let { curDevice } = self.data
    plugin.ai.findDeviceRoleVoiceRelV2({
      productKey: curDevice.productKey,
      deviceKey: curDevice.deviceKey,
      endUserId: curDevice.shareCode ? curDevice.ownerUid : curDevice.uid,
      success(res) {
        console.log('获取设备的当前角色与音色')
        console.log(res)
        const data = res.data
        if (data === null) {
          self.getRoleList()
        } else {
          self.setData({
            roleObj: res.data,
          })
        }
      },
      fail(res) {},
      complete(res) {},
    })
  },

  /**
   * 获取可选角色页
   */
  getRoleList() {
    let self = this
    let { curDevice } = self.data
    plugin.ai.roleFindPage({
      pageNum: 1,
      pageSize: 2,
      deviceKey: curDevice.deviceKey,
      productKey: curDevice.productKey,
      success(res) {
        if (res.rows) {
          let rows = res.rows
          self.setData({
            roleObj: rows[0],
          })
        }
      },
      fail(res) {},
      complete(res) {},
    })
  },

  /**
   * 重新连接
   */
  reconnectWsV2() {
    let self = this
    if (self.data.isWsConnecting) {
      console.log("isWsConnecting -----> true")
      return
    }
    self.setData({
      isWsConnecting: true,
    })
    self.tryCloseWsSocket()
    self.initWs()
  },

  /**
   * 关闭WS
   */
  async tryCloseWsSocket() {
    this.setData({
      // isWsConnecting: false,
      //isWSV2Connected: false
    })
    try {
      await plugin.socket.close()
    } catch (err) {}
  },

  // 连接websocket
  initWs() {
    let self = this
    let { curDevice } = self.data
    plugin.jsUtil.delayCb(() => {
      if (!self._isPageAlive) return
      connect({
        userid: curDevice.uid,
        pk: curDevice.productKey,
        dk: curDevice.deviceKey,
        online(res) {
          if (!self._isPageAlive) return
          console.log("online  在线状态 应答", res)
          if (res.data && res.data.value == 0) {
            plugin.jsUtil.tip("设备已离线，请稍后再试")
          }
          plugin.jsUtil.delayCb(() => {
            if (!self._isPageAlive) return
            self.setData({
              isWsConnecting: false,
            })
          }, 10000)
          self.setData({ isWSV2Connected: true })
          // plugin.jsUtil.tip('连接成功')
          // plugin.jsUtil.hideTip()
          if (res.data) {
            eventBus.emit("wsAiDstatus", res.data.value)
            curDevice.onlineStatus = res.data.value
            self.setData({
              curDevice,
            })
          }
        },
        // 发送指令响应
        askcust(res) {
          console.log("sendAck  发送指令响应 应答", res)
          let { curActAttr } = self.data
          if (res.status == "succ" && !curActAttr.isSuccByReport) {
            plugin.jsUtil.tip("设置成功")
          }
        },
        // 设备主动上报-接收更新
        report(res) {
          if (res.data) {
            self.handleMattr(res.data.kv, self.data.tslProps)
          }
        },
        output(res) {
          //设备服务调用响应信息
          console.log("设备服务调用响应信息:")
          console.log(res)
        },
        readresp(res) {
          console.log("设备读响应信息:")
          console.log(res)
        },
        info(res) {
          //信息
          console.log("信息")
          console.log(res)
        },
        warn(res) {
          //告警
          console.log("告警")
          console.log(res)
        },
        fault(res) {
          //故障
          console.log("故障:")
          console.log(res)
        },
        exception(res) {
          // console.log(res)
          self.setData({
            isWSV2Connected: false,
            //isWsConnecting: false
          })
        },
      })
    }, 400)
  },

  /**
   * 属性下发
   * {
   *  code:'',
   * value:'',
   * sendData:[]
   * }
   */
  sendAttr(res, scb, fcb) {
    console.log("sendAttr:")
    console.log(res)
    let self = this
    let { sendData } = res
    let { curDevice } = self.data
    if (Number(curDevice.onlineStatus) !== 1) {
      return plugin.jsUtil.tip("设备已离线，请稍后再试")
    }

    if (res.productKey && res.deviceKey) {
      let type = wsConst.SEND_CMD_TYPE_WRITE_ATTR
      plugin.jsUtil.load(tConst.SEND_OTHER_TIMEOUT_TIME)
      plugin.jsUtil.delayCb(() => {
        let { curActAttr } = self.data
        curActAttr.code = res.code
        curActAttr.value = res.value
        curActAttr.isReport = false
        curActAttr.isSuccByReport = res.isSuccByReport ? true : false
        self.setData({
          curActAttr,
        })

        if (res.isSuccByReport) {
          self.isSucByReport()
        }
        plugin.socket.send({
          pk: res.productKey,
          dk: res.deviceKey,
          type,
          sendData,
          success(res) {
            console.log("sendAttr下发成功")
            if (scb) {
              scb()
            }
          },
          fail(res) {
            console.log("sendAttr下发失败")
            if (fcb) {
              fcb()
            }
          },
        })
      }, 300)
    }
  },

  /**
   * 未上报提示
   */
  isSucByReport() {
    let self = this
    wx.showToast({
      title: "",
      icon: "loading",
      mask: true,
      duration: tConst.SEND_OTHER_TIMEOUT_TIME,
      success: () => {
        self.clearSendTimer()
        self.data.sendTimer = setTimeout(() => {
          //首页下发超时提示
          if (self.data.curActAttr.isReport == false) {
            console.log("执行这里")
            self.clearSendTimer()
            self.setData({
              curActAttr: {},
            })
            return plugin.jsUtil.tip("设置失败")
          }
        }, tConst.SEND_OTHER_TIMEOUT_TIME)
      },
    })
  },

  /**
   * 清除发送定时器
   */
  clearSendTimer() {
    if (this.data.sendTimer) {
      clearInterval(this.data.sendTimer) //清除发送定时器
      this.setData({
        sendTimer: null,
      })
    }
  },

  /**
   * 设备主动上报数据处理
   */
  handleMattr(msg) {
    let self = this
    let reportData = msg
    console.log("%c[WS] 设备主动上报", "color:green", reportData)
    let tslProps = self.data.tslProps
    for (const key in reportData) {
      tslProps.forEach((item, index) => {
        if (item.code === key) {
          let attrDataKey = `tslProps[${index}].vdata`
          if (item.dataType === wsConst.TSL_ATTR_DATA_TYPE_ARRAY) {
            let arrayCon = []
            for (const iterator of reportData[key]) {
              arrayCon.push({
                id: 0,
                value: iterator,
              })
            }
            self.setData({
              [attrDataKey]: JSON.stringify(arrayCon),
            })
          } else if (item.dataType === wsConst.TSL_ATTR_DATA_TYPE_STRUCT) {
            if (item.specs && item.specs.length > 0) {
              item.specs.forEach((s) => {
                for (const rkey in reportData[key]) {
                  if (s.code === rkey) {
                    s.vdata = reportData[key][rkey]
                  }
                }
              })
              let sDataKey = `tslProps[${index}]`
              self.setData({
                [sDataKey]: item,
              })
            }
          } else if (item.dataType === wsConst.TSL_ATTR_DATA_TYPE_BOOL) {
            self.setData({
              [attrDataKey]: reportData[key].toString(),
            })
          } else {
            self.setData({
              [attrDataKey]: reportData[key],
            })
          }

          let { curActAttr } = self.data
          if (key == curActAttr.code) {
            curActAttr.isReport = true
            self.setData({
              curActAttr,
            })
            if (curActAttr.isSuccByReport) {
              plugin.jsUtil.tip("设置成功")
              self.setData({
                curActAttr: {},
              })
            } else {
              // plugin.jsUtil.tip("设置失败")
            }
          }
        }
      })
    }
    self.setData({
      tslProps,
    })

    // 直接将全量的数据或增量的数据（经过合并后的 tslProps）派发给组件
    eventBus.emit("updateAiWsReport", self.data.tslProps, msg)
  },

  /**
   *  点返回事件
   */
  backTip() {
    this.tryCloseWsSocket()
    wx.navigateBack()
  },

  /**
   * 进入设置页面
   */
  onSettingClick(e) {
    const { curDevice } = this.data
    this.pageRouter.navigateTo({
      url: `/panel/general/set/list/index?item=${encodeURIComponent(
        JSON.stringify(curDevice),
      )}&from=ai`,
    })
  },

  // 展示音量调节滑块
  showVolumeSlider() {
    this.setData({
      sliderShow: true,
    })
  },

  // 隐藏音量调节滑块
  onSliderHide() {
    this.setData({
      sliderShow: false,
    })
  },

  /**
   * 重新连接设备
   */
  reconnectPopup() {
    this.reconnectWsV2()
  },

  getNetErrShow(e) {
    // console.log(e)
    // this.setData({
    //   netErrorShow: e.detail,
    // })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    this._isPageAlive = false
    this.tryCloseWsSocket()
    eventBus.off("updateAiWsReport")
    eventBus.off("wsAiDstatus")
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},
})
