import riskConst from "../../js/riskConst.js"
import eventBus from "../../../common/eventBus.js"

const app = getApp()
const plugin = requirePlugin("quecPlugin")

Component({
  properties: {
    device: {
      type: Object,
      value: {},
    },
  },

  data: {
    riskConst: riskConst,
    skin: plugin.main.getSkin(),
    sosShow: false,
    _isFirstReportHandled: false, // 新增：标记是否已经处理过首次（历史）数据

    address: "",
    roleName: "",
    deviceName:""
  },

  lifetimes: {
    attached() {
      this.globalCloseFn = () => {
        this.setData({ sosShow: false })
      }
      this.wsReportFn = (wsReport, msg) => {
        this.handleWsReport(wsReport, msg)
      }

      eventBus.on("GLOBAL_SOS_CLOSED", this.globalCloseFn)
      eventBus.on("updateAiWsReport", this.wsReportFn)
    },
    detached() {
      if (this.globalCloseFn) eventBus.off("GLOBAL_SOS_CLOSED", this.globalCloseFn)
      if (this.wsReportFn) eventBus.off("updateAiWsReport", this.wsReportFn)
    },
  },

  observers: {
    "device.productKey, device.deviceKey, device.uid,device.deviceName": function (
      productKey,
      deviceKey,
      uid,
      deviceName
    ) {
      console.log('deviceName:')
      console.log(deviceName)
      this.setData({
        deviceName
      })
      if (!productKey || !deviceKey) return
      const locKey = `${productKey}_${deviceKey}`
      if (this._lastLocKey !== locKey) {
        this._lastLocKey = locKey
        this.getLocationAddress()
      }
      if (uid) {
        const roleKey = `${productKey}_${deviceKey}_${uid}`
        if (this._lastRoleKey !== roleKey) {
          this._lastRoleKey = roleKey
          this.getCurrentRole()
        }
      }
    },
  },

  methods: {
    handleWsReport(wsReport, msg) {
      const device = this.properties.device
      const envData = app.globalData.envData

      if (!device || !device.productKey || !envData.ai.isSos) return

      const { productKey, deviceKey, uid } = device
      const GLOBAL_STORAGE_KEY = "sos_close_records"
      const deviceId = `${uid}_${productKey}_${deviceKey}`

      if (msg) {
        // 增量上报判定：仅当本次上报包含 sos 且值为 "0" 时，才触发
        const isSosReported = msg.hasOwnProperty("sos") && String(msg.sos) === "0"
        if (isSosReported) {
          const records = wx.getStorageSync(GLOBAL_STORAGE_KEY) || {}
          if (records[deviceId]) {
            delete records[deviceId]
            wx.setStorageSync(GLOBAL_STORAGE_KEY, records)
          }
          this.setData({ sosShow: true })
        }
      } else {
        // 首次全量数据：检查历史状态
        if (!this.data._isFirstReportHandled) {
          this.data._isFirstReportHandled = true
          const hasSosWarning = wsReport.some(
            (item) => item.code === "sos" && String(item.vdata) === "0",
          )
          if (hasSosWarning) {
            const records = wx.getStorageSync(GLOBAL_STORAGE_KEY) || {}
            const isClosed = records[deviceId]
            if (!isClosed) {
              this.setData({ sosShow: true })
            }
          }
        }
      }
    },

    close() {
      const device = this.properties.device
      if (device && device.productKey) {
        const { productKey, deviceKey, uid } = device
        const GLOBAL_STORAGE_KEY = "sos_close_records"
        const deviceId = `${uid}_${productKey}_${deviceKey}`

        const records = wx.getStorageSync(GLOBAL_STORAGE_KEY) || {}
        records[deviceId] = true
        wx.setStorageSync(GLOBAL_STORAGE_KEY, records)
      }
      this.setData({ sosShow: false })

      eventBus.emit("GLOBAL_SOS_CLOSED")
    },

    getLocationAddress() {
      const { productKey, deviceKey } = this.properties.device

      plugin.saas.detailLocation({
        productKey,
        deviceKey,
        success: (res) => {
          console.log("getLocationAddress", res)
          const address = res?.data?.address ?? ""
          this.setData({ address })
        },
        fail: (err) => {
          console.log("getLocationAddress fail", err)
        },
      })
    },

    getCurrentRole() {
      const { productKey, deviceKey, uid: endUserId } = this.properties.device
      plugin.ai.findDeviceRoleVoiceRelV2({
        productKey,
        deviceKey,
        endUserId,
        success: (res) => {
          console.log("getCurrentRole", res)
          const roleName = res?.data?.roleName ?? ""
          this.setData({ roleName })
        },
        fail: (err) => {
          console.log("getCurrentRole fail", err)
        },
      })
    },
  },
})
