const plugin = requirePlugin("quecPlugin")

Page({
  data: {
    babyInfo: {},
    targetList: [],
    deviceInfo: {},
    selectedTargetIds: [], // 选中的成长目标id
    disabledTargetIds: [], // 禁用的成长目标id
  },

  onLoad(options) {
    const { info, occupiedIds, deviceInfo } = options
    if (info) {
      const babyInfo = JSON.parse(decodeURIComponent(info))
      this.setData({
        babyInfo,
      })
    }
    if (occupiedIds) {
      const ids = decodeURIComponent(occupiedIds)
        .split(",")
        .map((x) => Number(x))
        .filter((x) => !Number.isNaN(x))
      this.setData({ disabledTargetIds: ids })
    }
    if (deviceInfo) {
      this.setData({
        deviceInfo: JSON.parse(decodeURIComponent(deviceInfo)),
      })
    }
    if (this.data.babyInfo?.birthdayTime) {
      this.getTaskList()
    }
  },

  onSelectedChange(e) {
    const { selectedIds } = e.detail || {}
    this.setData({ selectedTargetIds: selectedIds })
    console.log("selectedTargetIds", this.data.selectedTargetIds)
  },

  calcAge(ts) {
    if (typeof ts !== "number") return 0
    const birth = new Date(ts)
    if (Number.isNaN(birth.getTime())) return 0
    const now = new Date()
    let age = now.getFullYear() - birth.getFullYear()
    const mDiff = now.getMonth() - birth.getMonth()
    if (mDiff < 0 || (mDiff === 0 && now.getDate() < birth.getDate())) {
      age -= 1
    }
    if (age < 1) return 1
    return age
  },

  getTaskList() {
    const { birthdayTime } = this.data.babyInfo
    const age = this.calcAge(birthdayTime)

    plugin.ai.taskListByAge({
      age: age,
      success: (res) => {
        if (res?.data) {
          this.setData({ targetList: res.data || [] })
        }
      },
      fail: (error) => {
        console.log(error)
      },
    })
  },

  nextStep() {
    const { selectedTargetIds, babyInfo } = this.data
    const l = selectedTargetIds.length
    if (l === 0 || l > 10) {
      if (l > 10) {
        wx.showToast({ title: "最多选择10个目标", icon: "none" })
      }
      return
    }

    wx.navigateTo({
      url:
        "/panel/toy/module/growth/set_cycle/index?selectedTargetIds=" +
        encodeURIComponent(JSON.stringify(selectedTargetIds)) +
        "&info=" +
        encodeURIComponent(JSON.stringify(babyInfo)) +
        "&deviceInfo=" +
        encodeURIComponent(JSON.stringify(this.data.deviceInfo || {})),
    })
  },
})
