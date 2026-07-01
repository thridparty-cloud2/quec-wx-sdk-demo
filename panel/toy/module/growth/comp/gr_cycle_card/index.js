Component({
  properties: {
    startTimeStr: {
      type: String,
      value: "未设置",
    },
    endTimeStr: {
      type: String,
      value: "未设置",
    },
    editData: {
      type: Object,
      value: {},
    },
    repeatDays: {
      type: String,
      value: "",
    },
  },

  data: {
    notSetStr: "未设置",
    weeks: [
      { name: "周一", value: "1" },
      { name: "周二", value: "2" },
      { name: "周三", value: "3" },
      { name: "周四", value: "4" },
      { name: "周五", value: "5" },
      { name: "周六", value: "6" },
      { name: "周日", value: "7" },
    ],
    selectedWeeks: [],
    startDisplayStr: "",
    endDisplayStr: "",
  },

  observers: {
    repeatDays(val) {
      if (val) {
        const selectedWeeks = String(val || "")
          .split(",")
          .map((x) => String(x).trim())
          .filter((x) => x && ["1", "2", "3", "4", "5", "6", "7"].includes(x))
        this.setData({ selectedWeeks })
      }
    },
    editData(data) {
      if (!data || Object.keys(data).length === 0) return
      const weeksStr = String(data.repeatDays || "")
      const selectedWeeks = weeksStr
        .split(",")
        .map((x) => String(x).trim())
        .filter((x) => x && ["1", "2", "3", "4", "5", "6", "7"].includes(x))

      const startStr =
        data.startTime && Number(data.startTime) > 0
          ? this.formatDate(Number(data.startTime))
          : ""
      const endStr =
        data.endTime && Number(data.endTime) > 0
          ? this.formatDate(Number(data.endTime))
          : ""

      this.setData({ selectedWeeks, startDisplayStr: startStr, endDisplayStr: endStr })
      if (selectedWeeks.length > 0) {
        this.triggerEvent("weekChange", { value: selectedWeeks.slice() })
      }
    },
  },

  methods: {
    formatDate(ts) {
      const d = new Date(ts)
      const y = d.getFullYear()
      const m = d.getMonth() + 1
      const day = d.getDate()
      return `${y}年${m}月${day}日`
    },

    openDatePicker(e) {
      const { type } = e.currentTarget.dataset
      if (type === "end") {
        const startStr = this.data.startDisplayStr || this.properties.startTimeStr
        const notSet = this.data.notSetStr
        if (!startStr || startStr === notSet) {
          wx.showToast({ title: "请先选择开始时间", icon: "none" })
          return
        }
      }
      this.triggerEvent("openDatePicker", { type })
    },

    weekSelect(e) {
      const { value } = e.currentTarget.dataset
      const { selectedWeeks } = this.data
      const index = selectedWeeks.indexOf(value)
      if (index > -1) {
        selectedWeeks.splice(index, 1)
      } else {
        selectedWeeks.push(value)
      }
      this.setData({ selectedWeeks })
      this.triggerEvent("weekChange", { value: selectedWeeks })
    },
  },
})
