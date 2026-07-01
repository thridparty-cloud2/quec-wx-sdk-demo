Component({
  properties: {
    // 当前选中的小时
    hour: {
      type: Number,
      value: 0,
    },
    // 当前选中的分钟
    minute: {
      type: Number,
      value: 0,
    },
    // 小时范围
    hourRange: {
      type: Array,
      value: [0, 23],
    },
    // 分钟范围
    minuteRange: {
      type: Array,
      value: [0, 59],
    },
    // 分钟步长
    minuteStep: {
      type: Number,
      value: 1,
    },
    // 编辑模式下的小时
    eHour: {
      type: Number,
      value: 0,
    },
    // 编辑模式下的分钟
    eMinute: {
      type: Number,
      value: 0,
    },
    // 是否为编辑模式
    isEditMode: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    hourList: [],
    minuteList: [],
    pickerValue: [0, 0],
  },

  lifetimes: {
    attached() {
      this.initData()
    },
    ready() {
      this.initData()
    },
  },

  observers: {
    "hour, minute": function (hour, minute) {
      if (!this.properties.isEditMode) {
        this.updatePickerValue(hour, minute)
      }
    },

    "eHour, eMinute": function (eHour, eMinute) {
      if (
        this.properties.isEditMode &&
        eHour !== undefined &&
        eHour !== null &&
        eMinute !== undefined &&
        eMinute !== null
      ) {
        this.updatePickerValue(eHour, eMinute)
        this.triggerChange(eHour, eMinute)
      }
    },

    isEditMode: function (isEditMode) {
      this.initData()
    },
  },

  methods: {
    // 初始化数据
    initData() {
      const { hourRange, minuteRange, minuteStep, eHour, eMinute, isEditMode } =
        this.properties
      let { hour, minute } = this.properties

      // 编辑模式下优先使用eHour和eMinute属性进行回显
      if (isEditMode) {
        if (
          eHour !== undefined &&
          eHour !== null &&
          eMinute !== undefined &&
          eMinute !== null
        ) {
          hour = eHour
          minute = eMinute
        }
      } else {
        if (hour === 0 && minute === 0) {
          const now = new Date()
          hour = now.getHours()
          minute = now.getMinutes()
        }
      }

      const hourList = []
      for (let i = hourRange[0]; i <= hourRange[1]; i++) {
        hourList.push(i.toString().padStart(2, "0"))
      }

      const minuteList = []
      for (let i = minuteRange[0]; i <= minuteRange[1]; i += minuteStep) {
        minuteList.push(i.toString().padStart(2, "0"))
      }

      const hourIndex = Math.max(0, hour - hourRange[0])
      const minuteIndex = Math.max(0, Math.floor(minute / minuteStep))

      this.setData({
        hourList,
        minuteList,
        pickerValue: [hourIndex, minuteIndex],
      })
      if (
        !isEditMode ||
        (isEditMode &&
          eHour !== undefined &&
          eHour !== null &&
          eMinute !== undefined &&
          eMinute !== null)
      ) {
        this.triggerChange(hour, minute)
      }
    },

    updatePickerValue(hour, minute) {
      const { hourRange, minuteStep } = this.properties
      const hourIndex = hour - hourRange[0]
      const minuteIndex = Math.floor(minute / minuteStep)

      this.setData({
        pickerValue: [hourIndex, minuteIndex],
      })
    },

    onPickerChange(e) {
      const value = e.detail.value
      const { hourRange, minuteRange, minuteStep } = this.properties

      const selectedHour = hourRange[0] + value[0]
      const selectedMinute = minuteRange[0] + value[1] * minuteStep

      this.setData({
        pickerValue: value,
      })

      this.triggerChange(selectedHour, selectedMinute)
    },

    triggerChange(hour, minute) {
      const hourStr = hour.toString().padStart(2, "0")
      const minuteStr = minute.toString().padStart(2, "0")

      this.triggerEvent("change", {
        hour: hour,
        minute: minute,
        time: `${hourStr}:${minuteStr}`,
      })
    },
  },
})
