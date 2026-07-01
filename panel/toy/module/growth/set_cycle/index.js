const plugin = requirePlugin("quecPlugin")

const TIME_TYPE = {
  START: "start",
  END: "end",
}

Page({
  data: {
    deviceInfo: {},

    pickerShow: false,
    timeType: "",
    startTimeStr: "",
    endTimeStr: "",
    minDate: 0,
    startTime: null,
    endTime: null,
    pickerYear: 0,
    pickerMonth: 0,
    pickerDay: 0,

    repeatDays: "1,2,3,4,5,6,7",
    selectedTargetIds: [], // 选中的成长目标id
    isSubmitting: false,
  },

  onLoad(options) {
    const { selectedTargetIds, info, deviceInfo } = options
    if (selectedTargetIds) {
      let ids = []
      try {
        ids = JSON.parse(decodeURIComponent(selectedTargetIds))
      } catch (e) {
        ids = String(selectedTargetIds)
          .split(",")
          .map((x) => Number(x))
          .filter((x) => !Number.isNaN(x))
      }
      this.setData({ selectedTargetIds: ids })
    }
    if (info) {
      let babyInfo = {}
      try {
        babyInfo = JSON.parse(decodeURIComponent(info))
      } catch (e) {}
      this.setData({ babyInfo })
    }
    if (deviceInfo) {
      this.setData({
        deviceInfo: JSON.parse(decodeURIComponent(deviceInfo)),
      })
    }
  },

  openDatePicker(e) {
    const { type } = e.detail
    let baseTs = 0
    if (type === TIME_TYPE.START) {
      baseTs = this.data.startTime > 0 ? this.data.startTime : Date.now()
    } else {
      baseTs =
        this.data.endTime > 0
          ? this.data.endTime
          : this.data.startTime > 0
            ? this.data.startTime
            : Date.now()
    }
    const base = new Date(baseTs)
    const pickerYear = base.getFullYear()
    const pickerMonth = base.getMonth() + 1
    const pickerDay = base.getDate()

    this.setData(
      {
        timeType: type,
        minDate: type === TIME_TYPE.END ? this.data.startTime : Date.now(),
        pickerYear,
        pickerMonth,
        pickerDay,
      },
      () => {
        this.setData({ pickerShow: true })
      },
    )
  },

  dateChange(e) {
    const { year, month, day, date } = e.detail
    const { timeType } = this.data
    const ts = new Date(year, month - 1, day).getTime()
    if (timeType === TIME_TYPE.START) {
      const fmtRequired = this.data.endTime > 0 && ts > this.data.endTime
      this.setData({
        startTime: ts,
        startTimeStr: date,
        endTime: fmtRequired ? ts : this.data.endTime,
        endTimeStr: fmtRequired ? date : this.data.endTimeStr,
        pickerYear: year,
        pickerMonth: month,
        pickerDay: day,
      })
    } else if (timeType === TIME_TYPE.END) {
      const fmtTs =
        this.data.startTime > 0 && ts < this.data.startTime ? this.data.startTime : ts
      const fmtTimeStr =
        this.data.startTime > 0 && ts < this.data.startTime
          ? this.data.startTimeStr
          : date
      this.setData({
        endTime: fmtTs,
        endTimeStr: fmtTimeStr,
        pickerYear: year,
        pickerMonth: month,
        pickerDay: day,
      })
    }
    console.log("开始时间", this.data.startTime, "结束时间", this.data.endTime)
  },

  weekChange(e) {
    const { value } = e.detail
    const sortedValue = value.sort((a, b) => a - b).join(",")
    this.setData({
      repeatDays: sortedValue,
    })
    console.log(this.data.repeatDays)
  },

  addTask() {
    const { repeatDays, selectedTargetIds, babyInfo, endTime, startTime, isSubmitting } = this.data
    if (isSubmitting || repeatDays.length === 0 || !endTime || !startTime) {
      return
    }

    this.setData({ isSubmitting: true })

    plugin.ai.addBabyTask({
      babyId: babyInfo.id,
      endTime: endTime,
      growthTaskIds: selectedTargetIds,
      repeatDays: repeatDays,
      startTime: startTime,
      success: (res) => {
        console.log(res)
        if (res?.code === 200) {
          wx.showToast({ title: "添加成功", icon: "success", duration: 1500 })
          setTimeout(() => {
            const delta = 2
            const pages = getCurrentPages()
            const targetIndex = pages.length - delta - 1
            const targetPage = pages[targetIndex]
            if (targetPage && typeof targetPage.getNormalTasksList === "function") {
              targetPage.getNormalTasksList()
            }
            wx.navigateBack({ delta })
          }, 500)
          return
        }

        this.setData({ isSubmitting: false })
      },
      fail: (error) => {
        console.log(error)
        this.setData({ isSubmitting: false })
      },
    })
  },
})
