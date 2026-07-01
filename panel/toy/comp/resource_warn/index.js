const plugin = requirePlugin("quecPlugin")
const WARN_CLOSE_DATE_KEY_PREFIX = "resource_warn_close_date_"

const WARN_TEXT_MAP = {
  all_exhausted: "您的AI资源套餐已用完，请尽快充值",
  has_expired: "您的AI资源套餐已过期，请尽快续费",
  expired_soon: "您的AI资源套餐距离过期仅剩{{timeDesc}}，请尽快使用",
}

Component({
  properties: {
    curDevice: {
      type: Object,
      value: {},
    },
  },

  data: {
    warnShowStatus: false,
    warnText: "",
    warnStatus: "",

    isSaaSAiResSwitchOn: false,
    isExhausted: false,
    showAddTab: false,
    showRenewTab: false,

    resourceWarnVisible: true,
  },

  pageLifetimes: {
    show() {
      if (this.properties.curDevice) {
        this.getResourceWarnShowStatus()
        this.getResourceWarnShowStatusBySaaS()
      }
    },
  },

  methods: {
    checkResourceWarnVisible(status) {
      if (status === "all_exhausted") {
        this.setData({ resourceWarnVisible: true })
        return
      }

      const now = new Date()
      const today = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`

      const key = WARN_CLOSE_DATE_KEY_PREFIX + status
      const lastCloseDate = wx.getStorageSync(key)

      if (lastCloseDate === today) {
        this.setData({ resourceWarnVisible: false })
      } else {
        this.setData({ resourceWarnVisible: true })
      }
    },

    formatDuration(duration) {
      const oneDay = 1000 * 60 * 60 * 24
      const oneHour = 1000 * 60 * 60
      if (duration < oneHour) {
        return "不到 1 小时"
      } else if (duration < oneDay) {
        const hours = Math.floor(duration / oneHour)
        return hours + "小时"
      } else {
        const days = Math.floor(duration / oneDay)
        return days + "天"
      }
    },

    getResourceWarnShowStatus() {
      const { productKey, deviceKey, uid } = this.properties.curDevice
      const endUserId = uid

      plugin.ai.aiChatWarnStatus({
        productKey,
        deviceKey,
        endUserId,
        success: (res) => {
          console.log("getResourceWarnShowStatus", res)
          const { status, duration } = res?.data || {}
          const isExhausted = Boolean(status === "all_exhausted")
          let warnShowStatus = false
          let warnText = ""
          let warnTipText = ""
          if (status && status !== "normal" && WARN_TEXT_MAP[status]) {
            warnShowStatus = true
            warnText = WARN_TEXT_MAP[status]
            if (status === "expired_soon") {
              if (duration) {
                const timeDesc = this.formatDuration(duration)
                warnText = warnText.replace("{{timeDesc}}", timeDesc)
              }
            }
          }
          this.checkResourceWarnVisible(status)

          this.setData({
            warnShowStatus,
            warnText,
            warnStatus: status,
            warnTipText,
            isExhausted,
          })
        },
        fail: (error) => {
          console.log(error)
        },
      })
    },

    closeResourceWarn() {
      const { productKey, deviceKey, uid } = this.properties.curDevice
      const endUserId = uid
      const warnType = this.data.warnStatus

      if (warnType === "all_exhausted" || warnType === "has_expired") return

      plugin.ai.aiChatWarnDisable({
        productKey,
        deviceKey,
        endUserId,
        warnType,
        success: (res) => {
          console.log("close resource warn", res)
          const now = new Date()
          const today = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
          const key = WARN_CLOSE_DATE_KEY_PREFIX + warnType
          wx.setStorageSync(key, today)
          this.setData({ resourceWarnVisible: false })
        },
        fail: (error) => {
          console.log(error)
        },
      })
    },

    toAiPackageRecharge() {
      const { showAddTab, showRenewTab } = this.data
      wx.navigateTo({
        url:
          "/panel/toy/module/resource/index/index?item=" +
          encodeURIComponent(JSON.stringify(this.properties.curDevice)) +
          "&showAddTab=" +
          showAddTab +
          "&showRenewTab=" +
          showRenewTab +
          "&defaultTab=add",
      })
    },

    toAiPackageRenew() {
      const { showAddTab, showRenewTab } = this.data
      wx.navigateTo({
        url:
          "/panel/toy/module/resource/index/index?item=" +
          encodeURIComponent(JSON.stringify(this.properties.curDevice)) +
          "&showAddTab=" +
          showAddTab +
          "&showRenewTab=" +
          showRenewTab +
          "&defaultTab=renew",
      })
    },

    getResourceWarnShowStatusBySaaS() {
      const { productKey } = this.properties.curDevice
      plugin.ai.aiProductConfig({
        productKey,
        types: "AI_CHAT_RESOURCE_PACKAGE,AI_CHAT",
        success: (res) => {
          let showAdd = false
          let showRenew = false
          res.data?.forEach((rd) => {
            if (rd.AI_CHAT_RESOURCE_PACKAGE !== undefined)
              showAdd = rd.AI_CHAT_RESOURCE_PACKAGE
            if (rd.AI_CHAT !== undefined) showRenew = rd.AI_CHAT
          })
          const isSaaSAiResSwitchOn = showAdd || showRenew
          console.log("getResourceWarnShowStatusBySaaS", isSaaSAiResSwitchOn)
          this.setData({
            isSaaSAiResSwitchOn,
            showAddTab: showAdd,
            showRenewTab: showRenew,
          })
        },
        fail: (error) => {
          console.log(error)
        },
      })
    },
  },
})
