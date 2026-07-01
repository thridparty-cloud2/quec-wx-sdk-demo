const plugin = requirePlugin("quecPlugin")
import eventBus from "../../../common/eventBus.js"

Component({
  properties: {
    sliderShow: {
      type: Boolean,
      value: false,
    },
    device: {
      type: Object,
      value: {},
    },
    volTsl: {
      type: Object,
      value: {},
    },
  },

  data: {
    volumePercent: 0,
    isDragging: false,
    trackRect: null,
    lastSentValue: null, // 上次下发音量值
    startTouchY: null, // 初始触摸Y坐标
    hasDragged: false, // 是否真正发生了拖动
    isOnline: false,
    isSettling: false,
    settleTimer: null,
  },

  methods: {
    fmtSpecs() {
      const specs = (this.properties.volTsl && this.properties.volTsl.specs) || {}

      let min = Number(specs.min)
      let max = Number(specs.max)
      let step = Number(specs.step)
      if (!isFinite(min)) min = 0
      if (!isFinite(max)) max = 10
      if (!isFinite(step) || step <= 0) step = 1
      if (max < min) max = min
      const range = Math.max(0, max - min)
      return { min, max, step, range }
    },

    getQuantizeValue(val, min, max, step) {
      let q = Math.round((val - min) / step) * step + min
      if (q < min) q = min
      if (q > max) q = max
      return Math.round(q)
    },

    fmtOnlineStatus(onlineStatus) {
      if (typeof onlineStatus === "undefined" || onlineStatus === null)
        return this.data.isOnline
      if (typeof onlineStatus === "string") {
        const s = onlineStatus.trim()
        const sl = s.toLowerCase()
        return s === "在线" || sl === "online" || sl === "true" || s === "1"
      }
      if (typeof onlineStatus === "number") return onlineStatus === 1
      return !!onlineStatus
    },

    mapVolToTslVal(volumePercent) {
      const { min, max, step } = this.fmtSpecs()
      const pct = Math.max(0, Math.min(100, volumePercent))
      const raw = (pct / 100) * max
      return this.getQuantizeValue(raw, min, max, step)
    },

    mapTslValToVol(cloudValue) {
      const { min, max, step } = this.fmtSpecs()
      const clamped = Math.max(min, Math.min(max, Math.floor(Number(cloudValue))))
      const q = this.getQuantizeValue(clamped, min, max, step)
      return max === 0 ? 0 : (q / max) * 100
    },

    onClickHide() {
      this.triggerEvent("clickHide")
    },

    stopPropagation() {},

    onTouchStart(e) {
      if (!this.data.isOnline) {
        wx.showToast({
          title: "设备已离线，请稍后再试",
          icon: "none",
          duration: 2000,
        })
        return
      }

      const query = wx.createSelectorQuery().in(this)
      query
        .select(".vol-track")
        .boundingClientRect((rect) => {
          if (rect) {
            this.setData({
              isDragging: false,
              trackRect: rect,
              startTouchY: e.touches[0].clientY,
              hasDragged: false,
            })
          }
        })
        .exec()
    },

    onTouchMove(e) {
      if (!this.data.isOnline) {
        return
      }

      if (!this.data.trackRect) return

      const touchY = e.touches[0].clientY
      const startTouchY = this.data.startTouchY

      if (!this.data.isDragging && Math.abs(touchY - startTouchY) > 5) {
        this.setData({
          isDragging: true,
          hasDragged: true,
        })
      }

      if (!this.data.isDragging) return

      const trackTop = this.data.trackRect.top
      const trackHeight = this.data.trackRect.height

      const relativeY = trackTop + trackHeight - touchY
      let newVolume = (relativeY / trackHeight) * 100
      newVolume = Math.max(0, Math.min(100, newVolume))

      const { min, max } = this.fmtSpecs()
      const rawCloud = Math.max(min, Math.min(max, (newVolume / 100) * max))
      const visualPercent = max === 0 ? 0 : (rawCloud / max) * 100
      this.setData({
        volumePercent: visualPercent,
      })
    },

    onTouchEnd(e) {
      if (!this.data.isOnline) {
        return
      }

      this.setData({
        isDragging: false,
        startTouchY: null,
      })

      if (!this.data.hasDragged) {
        this.setData({
          hasDragged: false,
        })
        return
      }

      const { device, volTsl } = this.properties
      const sendValue = this.mapVolToTslVal(this.data.volumePercent)
      const targetPercent = this.mapTslValToVol(sendValue)
      if (this.data.settleTimer) {
        clearTimeout(this.data.settleTimer)
      }
      const timer = setTimeout(() => {
        this.setData({ isSettling: false, settleTimer: null })
      }, 250)
      this.setData({
        volumePercent: targetPercent,
        isSettling: true,
        settleTimer: timer,
      })
      if (sendValue === this.data.lastSentValue) {
        this.setData({
          hasDragged: false,
        })
        return
      }
      const sendData = [
        {
          [volTsl.code]: sendValue,
        },
      ]
      eventBus.emit("sendAttr", {
        productKey: device.productKey,
        deviceKey: device.deviceKey,
        code: volTsl.code,
        value: sendValue,
        sendData,
      })
      this.setData({
        lastSentValue: sendValue,
        hasDragged: false, // 重置拖动标记
      })
    },
  },

  lifetimes: {
    ready() {
      let self = this
      const d = self.properties.device || {}
      const initialOnline =
        d.deviceStatus === "在线" || self.fmtOnlineStatus(d.onlineStatus)
      self.setData({ isOnline: !!initialOnline })
      eventBus.on("updateAiWsReport", (wsReport) => {
        if (wsReport && Array.isArray(wsReport)) {
          const volumeData = wsReport.find((item) => item.code === "volume")
          if (volumeData && volumeData.vdata !== undefined) {
            const cloudValue = parseInt(volumeData.vdata)
            const specs = (self.properties.volTsl && self.properties.volTsl.specs) || {}
            let min = Number(specs.min)
            let max = Number(specs.max)
            if (!isFinite(min)) min = 0
            if (!isFinite(max)) max = 10
            if (max < min) max = min
            if (!isNaN(cloudValue) && cloudValue >= min && cloudValue <= max) {
              if (self.data.isDragging || self.data.isSettling) {
                self.setData({ lastSentValue: cloudValue })
                return
              }
              const newVolumePercent = self.mapTslValToVol(cloudValue)
              self.setData({
                volumePercent: newVolumePercent,
                lastSentValue: cloudValue,
              })
            }
          }
        }
      })
      eventBus.on("wsAiDstatus", (status) => {
        const online = self.fmtOnlineStatus(status)
        console.log("wsAiDstatus", online)

        self.setData({ isOnline: !!online })
      })
    },
    detached() {
      eventBus.off("updateAiWsReport")
      eventBus.off("wsAiDstatus")
    },
  },
})
