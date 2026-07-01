import tConst from "../../js/homeConst.js"
const plugin = requirePlugin("quecPlugin")

let app = getApp()
let env = app.globalData.envData

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    device: {
      tyep: Object,
    },
    role: {
      type: Object,
      value: {},
    },
    chatReload: {
      type: Object,
    },
    showFunc: {
      type: Object,
      value: {},
    },
    showClock: {
      type: Object,
      value: {},
    },
    iccId: {
      type: String,
    },
    isSimFlow: {
      type: Boolean,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    followerAnimation: null, // 跟随 View 的动画
    boxTop: 0,
    startY: 0,
    initialTop: 0,

    featureData: [
      {
        title: env["appid"] == "wx803cf0e39e2c0d88" ? "流量充值" : "设备流量",
        img: tConst.flow,
        event: "flow",
        cls: "flow",
        isShow: true,
        isLock: false,
        data: "",
      },
      {
        title: "成长任务",
        img: tConst.ftask,
        event: "task",
        cls: "task",
        isShow: true,
        isLock: false,
        data: "",
      },
      {
        title: "我的闹钟",
        img: tConst.fclock,
        event: "clock",
        cls: "clock",
        isShow: env["ai"]["isClock"],
        isLock: false,
        data: "",
      },
      {
        title: "互动总结",
        img: tConst.fsummary,
        event: "summary",
        cls: "summary",
        isShow: true,
        isLock: false,
        data: "",
      },
      {
        title: "内容服务",
        img: tConst.fcontent,
        event: "content",
        cls: "content",
        isShow: true,
        isLock: true,
        data: "",
      },
      {
        title: "AI资源包",
        img: tConst.fuseage,
        event: "usage",
        cls: "usage",
        isShow: true,
        isLock: false,
        data: "",
      },
      {
        title: "声纹识别",
        img: tConst.fshibie,
        event: "print",
        cls: "shibie",
        isShow: true,
        isLock: true,
        data: "",
      },
      {
        title: "声音克隆",
        img: tConst.frepeat,
        event: "repeat",
        cls: "repeat",
        isShow: true,
        isLock: false,
        data: "",
      },
      {
        title: "风险预警",
        img: tConst.frisk,
        event: "risk",
        cls: "risk",
        isShow: true,
        isLock: false,
        data: "",
      },
      {
        title: "我的订单",
        img: tConst.forder,
        event: "order",
        cls: "order",
        isShow: env["ai"]["isOrder"],
        isLock: false,
        data: "",
      },
    ],
    tConst: tConst,
    moveTop: 0,

    apiShowStatus: {
      content: false,
      print: false,
    },
    funcSwitchStatus: {
      content: false,
      print: false,
    },
    displayFeatureData: [],
  },

  lifetimes: {
    ready: function () {
      this.animation = wx.createAnimation({
        duration: 1000,
        timingFunction: "ease-out",
        transformOrigin: "50% 50% 0",
      })
      this.updateDisplayFeatureData()
    },
  },
  observers: {
    "featureData.**": function () {
      this.updateDisplayFeatureData()
    },
    role: function (role) {
      let self = this
      if (JSON.stringify(role) !== "{}") {
        self.initLock()
      }
    },
    iccId: function (iccId) {
      this.changeLock(
        "flow",
        iccId && !this.properties.device.shareCode ? true : false,
        false,
        "",
      )
    },
    showFunc: function (newVal) {
      this.getFuncShowStatus()
    },
    showClock: function (newVal) {
      this.getClockShowStatus()
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 开始拖动
     */
    touchStart(e) {
      // 记录触摸起始位置和元素初始位置
      this.setData({
        startY: e.touches[0].clientY,
        initialTop: this.data.boxTop,
      })
    },

    // 拖动中
    touchMove(e) {
      let self = this
      const moveY = e.touches[0].clientY - self.data.startY
      let moveTop = 0
      let top = self.data.initialTop + moveY
      if (top < self.data.initialTop) {
        top = -50
        moveTop = -250
      } else {
        top = 0
        moveTop = 0
      }
      // 更新元素位置
      this.setData({
        boxTop: top,
        moveTop,
      })
    },

    /**
     * 拖动结束
     */
    touchEnd(e) {
      this.animation.translateY(this.data.moveTop).step({ duration: 300 })
      this.setData({
        followerAnimation: this.animation.export(),
      })
    },

    /**
     * 是否开通锁标记
     */
    initLock() {
      let self = this
      self.aiProductConfig()
      self.isShowOnDemand() //内容服务
      self.getVoicePrintStatus() //声纹识别
      self.getVoiceCopyStatus() //声音克隆
      self.getBabyBindingStatus() // 宝贝信息绑定状态
    },

    /**
     * 是否显示配置项：
     * 互动总结（SUMMARY）
     * 成长任务（BABY_TASK）
     * 风险预警（CHAT_WARN）
     * AI资源包（AI_CHAT_RESOURCE_PACKAGE）
     * 设备流量（EDU_SIM_FLOW_PACKAGE）
     */
    aiProductConfig() {
      let self = this
      let { device } = self.properties
      plugin.ai.aiProductConfig({
        productKey: device.productKey,
        types: "SUMMARY,BABY_TASK,CHAT_WARN,AI_CHAT_RESOURCE_PACKAGE",
        success(res) {
          if (res.data !== null) {
            let rData = res.data
            rData.forEach((rd) => {
              Object.keys(rd).forEach((key) => {
                let evname
                if (key == "SUMMARY") {
                  evname = "summary"
                } else if (key == "BABY_TASK") {
                  evname = "task"
                } else if (key == "CHAT_WARN") {
                  evname = "risk"
                } else if (key == "AI_CHAT_RESOURCE_PACKAGE") {
                  evname = "usage"
                }

                let isShow = rd[key]
                if (key == "AI_CHAT_RESOURCE_PACKAGE") {
                  if (self.properties.device.shareCode) {
                    isShow = false
                  }
                }

                self.changeLock(evname, isShow, false, "")
              })
            })
          }
        },
        fail(res) {},
      })
    },

    /**
     * 内容服务
     */
    isShowOnDemand() {
      let self = this
      let { device } = self.properties
      plugin.ai.isShowOnDemand({
        productKey: device.productKey,
        deviceKey: device.deviceKey,
        success(res) {
          /**isShow- 是否在产品里开启内容服务 true开启，false未开启
           * isEnable - true 可直接使用APP点播,
           * isEnable - false 需要购买
           */
          if (res.data) {
            let rData = res.data
            self.setData({
              "apiShowStatus.content": rData.isShow,
            })
            const finalShow = rData.isShow && self.data.funcSwitchStatus.content

            if (rData.isShow && rData.isEnable) {
              self.changeLock("content", finalShow, false, "")
            } else {
              self.changeLock("content", finalShow, true, "")
            }
          }
        },
        fail(res) {},
      })
    },

    /**
     * 声纹识别
     */
    getVoicePrintStatus() {
      let self = this
      let { device } = self.properties
      plugin.ai.getVoicePrintStatus({
        productKey: device.productKey,
        success(res) {
          /**
           * configContent - 配置内容: true-开 false-关
           * associatedIds-当前用户购买的声纹信息ID列表
           * - 当前字段有值时，打开声纹配置页
           * - 当前字段无值时，打开购买页
           */
          if (res.data) {
            let rData = res.data
            self.setData({
              "apiShowStatus.print": rData.configContent,
            })
            const finalShow = rData.configContent && self.data.funcSwitchStatus.print
            if (
              rData.configContent &&
              rData.associatedIds &&
              rData.associatedIds.length > 0
            ) {
              self.changeLock("print", finalShow, false, rData.associatedIds[0])
            } else {
              self.changeLock("print", finalShow, true, rData.associatedIds[0])
              // self.changeLock("print", rData.configContent, true, rData.associatedIds[0]); // Duplicate line removed
            }
          }
        },
      })
    },

    /**
     * 成长任务
     */
    getBabyBindingStatus() {
      const self = this
      const { device } = self.properties
      plugin.ai.getBabyInfo({
        deviceKey: device.deviceKey,
        endUserId: device.shareCode ? device.ownerUid : device.uid,
        productKey: device.productKey,
        success(res) {
          if (res?.data?.id) {
            self.setData({
              hasBind: true,
            })
          } else {
            self.setData({
              hasBind: false,
            })
          }
        },
        fail(error) {
          console.log(error)
        },
      })
    },

    /**
     * 声音复刻
     */
    getVoiceCopyStatus() {
      let self = this
      let { device } = self.properties
      plugin.ai.getAiVoiceCopyStatus({
        productKey: device.productKey,
        success(res) {
          if (res.data) {
            let rData = res.data
            let enabled =
              rData.configContent == true || rData.configContent == "true" ? true : false
            self.changeLock("repeat", enabled, enabled ? false : true, "")
            if (enabled) {
              self.getEduVoiceCopyAudio((res) => {
                let flag = res.data.length == 0 ? true : false
                self.changeLock("repeat", enabled, flag, "")
              })
            }
          }
        },
        fail(res) {},
      })
    },

    /**
     * 查询是否有自定义声音,没有展示锁，有不展示锁
     */
    getEduVoiceCopyAudio(cb) {
      let self = this
      let { device, role } = self.properties
      plugin.ai.getEduVoiceCopyAudio({
        productKey: device.productKey,
        deviceKey: device.deviceKey,
        botRoleId: role.roleId,
        success(res) {
          if (cb) {
            cb(res)
          }
        },
        fail(res) {},
      })
    },

    /**
     * 声音复刻
     */
    getVoiceCopyStatus() {
      let self = this
      let { device } = self.properties
      plugin.ai.getAiVoiceCopyStatus({
        productKey: device.productKey,
        success(res) {
          if (res.data) {
            let rData = res.data
            let enabled =
              rData.configContent == true || rData.configContent == "true" ? true : false
            self.changeLock("repeat", enabled, enabled ? false : true, "")
            if (enabled) {
              self.getEduVoiceCopyAudio((res) => {
                let flag = res.data.length == 0 ? true : false
                self.changeLock("repeat", enabled, flag, "")
              })
            }
          }
        },
        fail(res) {},
      })
    },

    /**
     * 查询是否有自定义声音,没有展示锁，有不展示锁
     */
    getEduVoiceCopyAudio(cb) {
      let self = this
      let { device, role } = self.properties
      plugin.ai.getEduVoiceCopyAudio({
        productKey: device.productKey,
        deviceKey: device.deviceKey,
        botRoleId: role.roleId,
        success(res) {
          if (cb) {
            cb(res)
          }
        },
        fail(res) {},
      })
    },

    /**
     * 解析 showFunc物模型获取开关状态
     */
    getFuncShowStatus() {
      const self = this
      const { showFunc } = self.properties

      let contentTslShow = false
      let printTslShow = false

      if (showFunc && Array.isArray(showFunc.specs)) {
        const isTslValShow = (vdata) =>
          vdata !== undefined && vdata !== null && String(vdata) === "true"
        showFunc.specs.forEach((item) => {
          if (item.code === "contentService") {
            contentTslShow = isTslValShow(item.vdata)
          } else if (item.code === "voiceprint") {
            printTslShow = isTslValShow(item.vdata)
          }
        })
      }
      self.setData({
        "funcSwitchStatus.content": contentTslShow,
        "funcSwitchStatus.print": printTslShow,
      })
      self.updateFinalShowStatus("content")
      self.updateFinalShowStatus("print")
    },

    /**
     * 更新最终显示状态 （内容服务、声纹识别）
     * @param {string} type - 类型 content、print
     */
    updateFinalShowStatus(type) {
      const self = this
      const { apiShowStatus, funcSwitchStatus, featureData } = self.data
      const isShow = apiShowStatus[type] && funcSwitchStatus[type]
      const targetFeature = featureData.find((f) => f.event === type)
      if (!targetFeature) return

      let needUpdate = false
      featureData.forEach((f) => {
        if (f.event === type && f.isShow !== isShow) {
          f.isShow = isShow
          needUpdate = true
        }
      })
      if (needUpdate) {
        self.setData({ featureData })
      }
    },

    /**
     * 解析 showClock物模型获取开关状态
     */
    getClockShowStatus() {
      const self = this
      const { showClock } = self.properties
      const { featureData } = self.data
      const type = "clock"
      const isShow = !!showClock && Object.keys(showClock).length > 0

      let needUpdate = false
      featureData.forEach((f) => {
        if (f.event === type && f.isShow !== isShow) {
          f.isShow = isShow
          needUpdate = true
        }
      })
      if (needUpdate) {
        self.setData({
          featureData,
        })
      }
    },

    /**
     * 特色功能
     */
    goItem(e) {
      console.log(e)
      plugin.jsUtil.load(1500)
      let self = this
      let { device, chatReload, role } = self.properties
      let item = e.currentTarget.dataset.item
      const isShareUser = !!device.shareCode
      let obj = {
        productKey: device.productKey,
        deviceKey: device.deviceKey,
        uid: device.uid,
        shareCode: device.shareCode,
        ownerUid: device.ownerUid,
        deviceName: device.deviceName,
        onlineStatus: device.onlineStatus,
      }
      switch (item.event) {
        case "task": // 成长任务
          if (isShareUser && !self.data.hasBind) {
            wx.showToast({ title: "无权限", icon: "none" })
            return
          }
          const taskUrl = self.data.hasBind
            ? "/panel/toy/module/growth/index/index"
            : "/panel/toy/module/growth/info/index"
          self.pageRouter.navigateTo({
            url: `${taskUrl}?item=${encodeURIComponent(JSON.stringify(obj))}`,
          })
          break
        case "content": //内容服务
          if (item.isLock) {
            self.pageRouter.navigateTo({
              url: `/panel/toy/module/content/buy/index?item=${encodeURIComponent(
                JSON.stringify(obj),
              )}&chatReloadObj=${encodeURIComponent(JSON.stringify(chatReload))}`,
            })
          } else {
            self.pageRouter.navigateTo({
              url: `/panel/toy/module/content/index/index?item=${encodeURIComponent(
                JSON.stringify(obj),
              )}`,
            })
          }
          break
        case "summary": //互动总结
          self.pageRouter.navigateTo({
            url: `/panel/toy/module/summary/index/index?item=${encodeURIComponent(
              JSON.stringify(obj),
            )}&role=${encodeURIComponent(JSON.stringify(role))}`,
          })
          break
        case "clock": //我的闹钟
          self.pageRouter.navigateTo({
            url: `/panel/toy/module/clock/index/index?item=${encodeURIComponent(
              JSON.stringify(obj),
            )}`,
          })
          break
        case "print": //声纹识别
          if (item.isLock) {
            self.pageRouter.navigateTo({
              url: `/panel/toy/module/voice/print/buy/index?item=${encodeURIComponent(
                JSON.stringify(obj),
              )}&associatedIds=${encodeURIComponent(item.data)}`,
            })
          } else {
            self.pageRouter.navigateTo({
              url: `/panel/toy/module/voice/print/list/index?item=${encodeURIComponent(
                JSON.stringify(obj),
              )}&associatedIds=${encodeURIComponent(item.data)}`,
            })
          }
          break
        case "repeat": //声音克隆
          self.pageRouter.navigateTo({
            url: `/panel/toy/module/voice/copy/list/index?item=${encodeURIComponent(
              JSON.stringify(obj),
            )}&chatReloadObj=${encodeURIComponent(
              JSON.stringify(chatReload),
            )}&from=feature`,
          })
          break
        case "risk": //风险预警
          self.pageRouter.navigateTo({
            url: `/panel/toy/module/risk/list/index?item=${encodeURIComponent(
              JSON.stringify(obj),
            )}&role=${encodeURIComponent(
              JSON.stringify(role),
            )}&allDeviceInfo=${encodeURIComponent(JSON.stringify(device))}`,
          })
          break
        case "order": //我的订单
          self.pageRouter.navigateTo({
            url: `/panel/toy/module/order/list/index?item=${encodeURIComponent(
              JSON.stringify(obj),
            )}`,
          })
          break
        case "usage": //AI资源包
          self.pageRouter.navigateTo({
            url: `/panel/toy/module/resource/index/index?item=${encodeURIComponent(
              JSON.stringify(obj),
            )}`,
          })
          break
        case "flow": //设备流量
          if (self.properties.isSimFlow) {
            self.pageRouter.navigateTo({
              url: `/panel/sim/page/recharge/index?item=${encodeURIComponent(
                JSON.stringify(obj),
              )}&iccId=${encodeURIComponent(self.properties.iccId)}&type=recharge`,
            })
          } else {
            self.pageRouter.navigateTo({
              url: `/panel/sim/page/flow/index?item=${encodeURIComponent(
                JSON.stringify(obj),
              )}&iccId=${encodeURIComponent(self.properties.iccId)}`,
            })
          }
          break
      }
    },

    /**
     * 是否解锁
     * @param {*} ev - 事件
     * @param {*} show-是否显示
     * @param {*} lock-是否解锁
     * @param {*} data-返回数据
     */
    changeLock(ev, show, lock, data) {
      let self = this
      let { featureData } = self.data
      featureData.forEach((f) => {
        if (f.event == ev) {
          f.isShow = show
          f.isLock = lock
          f.data = data
        }
      })
      self.setData({
        featureData,
      })
    },

    updateDisplayFeatureData() {
      const { featureData } = this.data
      const displayData = featureData.filter((item) => item.isShow)
      const clsColorMap = {
        flow: "#F5FFF6",
        task: "#F0F9FF",
        clock: "#FFFBFD",
        summary: "#FFFBE9",
        content: "#F5FFF6",
        usage: "#FFFBFD",
        shibie: "#F0F9FF",
        repeat: "#FFFBE9",
        risk: "#FFFBFD",
        order: "#F0F9FF",
      }
      const fallbackColors = ["#F0F9FF", "#FFFBE9", "#FFFBFD", "#F5FFF6"]

      let isAllSameColor = false
      if (displayData.length > 0) {
        const firstColor = clsColorMap[displayData[0].cls] || "#FFF"
        isAllSameColor = displayData.every(
          (item) => (clsColorMap[item.cls] || "#FFF") === firstColor,
        )
      }

      displayData.forEach((item, index) => {
        item.dynamicBg = clsColorMap[item.cls] || "#FFF"
        if (isAllSameColor) return

        if (index >= 2) {
          const topItem = displayData[index - 2]
          if (item.dynamicBg === topItem.dynamicBg) {
            const leftItemColor =
              index % 2 !== 0 ? displayData[index - 1].dynamicBg : null
            let availableColors = fallbackColors.filter(
              (c) => c !== topItem.dynamicBg && c !== leftItemColor,
            )
            if (availableColors.length === 0) {
              availableColors = fallbackColors.filter((c) => c !== topItem.dynamicBg)
            }
            if (availableColors.length > 0) {
              item.dynamicBg = availableColors[0]
            }
          }
        }
      })

      this.setData({
        displayFeatureData: displayData,
      })
    },
  },
})
