const plugin = requirePlugin("quecPlugin")

Page({
  data: {
    startTs: null,
    endTs: null,
    babyInfo: {},
    deviceInfo: {},

    statNum: {},
    weekTaskList: [],
  },

  onLoad(options) {
    const info = options.info || "{}"
    const babyInfo = JSON.parse(decodeURIComponent(info))
    this.setData({ babyInfo })

    if (options.deviceInfo) {
      this.setData({
        deviceInfo: JSON.parse(decodeURIComponent(options.deviceInfo)),
      })
    }
  },

  onWeekChange(e) {
    const { startTs, endTs } = e.detail || {}
    this.setData({ startTs, endTs }, () => {
      this.getWeekStatistics()
    })
  },

  toTargetStat(e) {
    const weekTaskItem = e.detail || {}
    console.log(weekTaskItem)
    wx.navigateTo({
      url: `/panel/toy/module/growth/statistics/target/index?babyTask=${encodeURIComponent(
        JSON.stringify(weekTaskItem),
      )}`,
    })
  },

  getWeekStatistics() {
    const { startTs, endTs, babyInfo } = this.data
    if (!babyInfo.id) {
      return
    }

    plugin.ai.getBabyTaskWeekStatistics({
      startTime: startTs,
      endTime: endTs,
      babyId: babyInfo.id,
      success: (res) => {
        if (res.code === 200 && res.data) {
          const { finishNum, taskNum, weekTaskList } = res.data || {}
          console.log(res)

          this.setData({
            statNum: { finishNum, taskNum } || {},
            weekTaskList: weekTaskList || [],
          })
        }
      },
      fail: (error) => {
        console.log(error)
      },
    })
  },
})
