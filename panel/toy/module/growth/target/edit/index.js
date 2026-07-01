const plugin = requirePlugin("quecPlugin")

const TIME_TYPE = {
  START: "start",
  END: "end",
}

Page({
  data: {
    editData: {},

    deviceInfo: {},

    repeatDays: "",
    pickerShow: false,
    timeType: "",
    minDate: 0,
    startTime: 0,
    endTime: 0,
    startTimeStr: "",
    endTimeStr: "",
    pickerYear: 0,
    pickerMonth: 0,
    pickerDay: 0,
    showDialog: false,
  },

  onLoad(options) {
    const payload = options.editData
    if (payload) {
      const editData = JSON.parse(decodeURIComponent(payload)) || {}
      const startTime = Number(editData.startTime || 0)
      const endTime = Number(editData.endTime || 0)
      const startTimeStr = startTime > 0 ? this.formatDate(startTime) : ""
      const endTimeStr = endTime > 0 ? this.formatDate(endTime) : ""
      this.setData({
        editData,
        startTime,
        endTime,
        startTimeStr,
        endTimeStr,
      })
    }
    const deviceInfo = options.deviceInfo
    if (deviceInfo) {
      this.setData({
        deviceInfo: JSON.parse(decodeURIComponent(deviceInfo)),
      })
    }
  },

  onWeekChange(e) {
    const { value } = e.detail
    const sortedValue = value.sort((a, b) => a - b).join(",")
    this.setData({
      repeatDays: sortedValue,
    })
    console.log(this.data.repeatDays)
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
  },

  formatDate(ts) {
    const d = new Date(ts)
    const y = d.getFullYear()
    const m = d.getMonth() + 1
    const day = d.getDate()
    return `${y}年${m}月${day}日`
  },

  editTaskInfo() {
    const { editData, repeatDays, startTime, endTime } = this.data
    if (this.data.repeatDays.length === 0) {
      wx.showToast({ title: "请选择重复周期", icon: "none" })
      return
    }

    plugin.ai.updateBabyTask({
      babyTaskId: editData.growthTaskId,
      endTime: endTime || editData.endTime,
      repeatDays: repeatDays || editData.repeatDays,
      startTime: startTime || editData.startTime,
      success: (res) => {
        if (res.code === 200) {
          wx.showToast({ title: "保存成功", icon: "success", duration: 1500 })
          setTimeout(() => {
            const pages = getCurrentPages()
            const prev = pages[pages.length - 2]
            if (prev && typeof prev.getNormalTasksList === "function") {
              prev.getNormalTasksList()
            }
            wx.navigateBack({ delta: 1 })
          }, 500)
        }
      },
      fail: (error) => {
        console.log(error)
      },
    })
  },

  deleteTask() {
    const { editData } = this.data
    plugin.ai.deleteBabyTask({
      babyTaskId: editData.growthTaskId,
      success: (res) => {
        if (res.code === 200) {
          wx.showToast({ title: "删除成功", icon: "success", duration: 1500 })
          setTimeout(() => {
            const pages = getCurrentPages()
            const prev = pages[pages.length - 2]
            if (prev) {
              if (typeof prev.getNormalTasksList === "function") {
                prev.getNormalTasksList()
              }
              if (typeof prev.getDelBabyTaskList === "function") {
                prev.getDelBabyTaskList()
              }
            }
            wx.navigateBack({ delta: 1 })
          }, 500)
        }
      },
      fail: (error) => {
        console.log(error)
      },
    })
  },

  secondConfirmDelete() {
    this.setData({ showDialog: true })
  },

  onDialogConfirm() {
    this.setData({ showDialog: false })
    this.deleteTask()
  },

  onDialogCancel() {
    this.setData({ showDialog: false })
  },
})
