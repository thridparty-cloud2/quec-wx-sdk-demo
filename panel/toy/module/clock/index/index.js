const plugin = requirePlugin("quecPlugin")
const ClockUtils = require("../../../js/clock")

const CLOCK_PAGE_SIZE = 50

Page({
  data: {
    productKey: "",
    deviceKey: "",
    deviceInfo: {},

    clocks: [],

    totalPage: 0,
    currentPage: 1,
    hasMore: true,
    loading: false,
    noMoreDataToastShown: false,

    emptyImg: plugin.main.getRootImg() + "example/images/ic_empty.png",
  },

  onLoad(options) {
    if (options.item) {
      try {
        const deviceInfo = JSON.parse(decodeURIComponent(options.item))
        this.setData({
          productKey: deviceInfo.productKey,
          deviceKey: deviceInfo.deviceKey,
          deviceInfo: deviceInfo,
        })
      } catch (error) {}
    }
    this.getAllClocksList()
  },

  toAddClocks() {
    wx.navigateTo({
      url:
        "/panel/toy/module/clock/manage_clock/index?productKey=" +
        this.data.productKey +
        "&deviceKey=" +
        this.data.deviceKey +
        "&deviceInfo=" +
        encodeURIComponent(JSON.stringify(this.data.deviceInfo)),
    })
  },

  toEditClock(e) {
    const { id } = e.detail || {}
    const clockItem = (this.data.clocks || []).find((c) => c.id === id) || null
    const clockParam = clockItem ? encodeURIComponent(JSON.stringify(clockItem)) : ""
    wx.navigateTo({
      url:
        "/panel/toy/module/clock/manage_clock/index?type=edit&id=" +
        id +
        "&productKey=" +
        this.data.productKey +
        "&deviceKey=" +
        this.data.deviceKey +
        (clockParam ? "&clockItem=" + clockParam : "") +
        "&deviceInfo=" +
        encodeURIComponent(JSON.stringify(this.data.deviceInfo)),
    })
  },

  // 获取所有闹钟列表
  getAllClocksList(isLoadMore = false) {
    const { deviceKey, productKey, currentPage, loading } = this.data

    if (loading) return
    this.setData({ loading: true })
    if (isLoadMore) {
      wx.showToast({
        title: "加载中...",
        icon: "loading",
        duration: 2000,
      })
    }

    const page = isLoadMore ? currentPage : 1

    plugin.scheduledTask.getCronJobListV2({
      dk: deviceKey,
      pk: productKey,
      page: page,
      pageSize: CLOCK_PAGE_SIZE,
      success: (res) => {
        console.log("获取所有闹钟列表:", res)
        const totalPage = res?.data?.pages || 0
        const allClocks = res?.data?.list || []
        const fmtClocks = allClocks.map((item) => {
          const timer = item.timers?.[0] || {}
          return {
            id: item.ruleId,
            clockTime: ClockUtils.formatTime(timer.time || "--:--"),
            clockName: timer.taskName,
            clockRepeat: ClockUtils.formatRepeat(item.dayOfWeek, item.type),
            switchCheck: item.enabled,
            clockType: item.type,
            clockTimers: item.timers || [],
          }
        })

        const hasMore = page < totalPage

        this.setData({
          totalPage: totalPage,
          clocks: isLoadMore ? [...this.data.clocks, ...fmtClocks] : fmtClocks,
          currentPage: isLoadMore ? currentPage + 1 : 2,
          hasMore: hasMore,
          loading: false,
        })

        if (isLoadMore) {
          wx.hideToast()
        }

        console.log("全部闹钟列表:", this.data.clocks)
      },
      fail: (error) => {
        console.log(error)
        this.setData({ loading: false })
      },
    })
  },

  deleteClock(e) {
    const { id } = e.detail
    plugin.jsUtil.load(1000)
    plugin.scheduledTask.batchDeleteCronJob({
      ruleIdList: [id],
      success: (res) => {
        console.log(res)
        this.getAllClocksList()
      },
      fail: (error) => {
        console.log(error)
      },
      complete: () => {
        plugin.jsUtil.hideTip()
      },
    })
  },

  onReachBottomToLoad() {
    const { hasMore, loading, noMoreDataToastShown } = this.data
    if (hasMore && !loading) {
      this.getAllClocksList(true)
    } else if (!hasMore && !loading && !noMoreDataToastShown) {
      wx.showToast({
        title: "没有更多数据了",
        icon: "none",
        duration: 1000,
      })
      this.setData({
        noMoreDataToastShown: true,
      })
    }
  },

  switchClockCheck(e) {
    const { productKey, deviceKey } = this.data
    const { id, switchCheck, clockType, clockDayOfWeek, clockTimers } = e.detail || {}

    // once 和 day-repeat 类型不需要 dayOfWeek
    let dayOfWeek = null
    if (clockType === "custom-repeat") {
      dayOfWeek = ClockUtils.parseRepeat(clockDayOfWeek)
    }

    plugin.scheduledTask.setCronJobV2({
      ruleId: id,
      dk: deviceKey,
      enabled: switchCheck,
      pk: productKey,
      type: clockType,
      dayOfWeek: dayOfWeek,
      timers: clockTimers,
      success: (res) => {
        console.log(res)
        this.getAllClocksList()
      },
      fail: (error) => {
        console.log(error)
      },
      complete: () => {
        plugin.jsUtil.hideTip()
      },
    })
  },
})
