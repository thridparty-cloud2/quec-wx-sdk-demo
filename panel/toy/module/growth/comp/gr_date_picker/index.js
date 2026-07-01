Component({
  properties: {
    // 控制弹窗显示
    show: { type: Boolean, value: false },
    // 弹窗标题
    title: { type: String, value: "宝贝生日" },

    // 当前选中的年、月、日
    year: { type: Number, value: 0 },
    month: { type: Number, value: 0 },
    day: { type: Number, value: 0 },

    // 年范围
    yearRange: { type: Array, value: [1970, 2100] },
    // 月范围
    monthRange: { type: Array, value: [1, 12] },
    // 日范围的上限会根据年月动态计算，默认最小1
    dayMin: { type: Number, value: 1 },
    // 最小可选时间，时间戳
    minDate: { type: Number, value: 0 },
    // 最大可选时间，时间戳
    maxDate: { type: Number, value: 0 },
  },

  data: {
    yearList: [],
    monthList: [],
    dayList: [],
    pickerValue: [0, 0, 0],
    minYear: 1970,
    minMonth: 1,
    minDay: 1,
    maxYear: 2100,
    maxMonth: 12,
    maxDay: 31,
  },

  lifetimes: {
    attached() {},
    ready() {},
  },

  observers: {
    show: function (show) {
      if (show) {
        setTimeout(() => {
          this.initData()
          const { year, month, day } = this.properties
          this.syncFromProps(year, month, day)
        }, 0)
      }
    },
    "minDate, maxDate": function () {
      if (this.data.show) {
        this.initData()
        const { year, month, day } = this.properties
        this.syncFromProps(year, month, day)
      }
    },
    "year, month, day": function (year, month, day) {
      this.syncFromProps(year, month, day)
    },
  },

  methods: {
    // 初始化数据
    initData() {
      const { yearRange, monthRange } = this.properties
      let { year, month, day, minDate, maxDate } = this.properties

      let minYear = yearRange[0]
      let minMonth = monthRange[0]
      let minDay = 1

      if (minDate > 0) {
        const minDateObj = new Date(minDate)
        minYear = minDateObj.getFullYear()
        minMonth = minDateObj.getMonth() + 1
        minDay = minDateObj.getDate()
      }
      // 计算最大边界
      let maxYear = yearRange[1]
      let maxMonth = 12
      let maxDay = 31
      if (maxDate > 0) {
        const maxDateObj = new Date(maxDate)
        maxYear = maxDateObj.getFullYear()
        maxMonth = maxDateObj.getMonth() + 1
        maxDay = maxDateObj.getDate()
      }

      this.setData({ minYear, minMonth, minDay, maxYear, maxMonth, maxDay })

      if (year === 0 && month === 0 && day === 0) {
        if (minDate > 0) {
          const base = new Date(minDate)
          year = base.getFullYear()
          month = base.getMonth() + 1
          day = base.getDate()
        } else {
          const now = new Date()
          year = now.getFullYear()
          month = now.getMonth() + 1
          day = now.getDate()
        }
      }

      // 边界校正：若低于最小值或超过最大值，则重置到边界
      const currentDate = new Date(year, month - 1, day).getTime()
      if (minDate > 0 && currentDate < minDate) {
        year = minYear
        month = minMonth
        day = minDay
      }
      if (maxDate > 0 && currentDate > maxDate) {
        year = maxYear
        month = maxMonth
        day = maxDay
      }

      const yearList = []
      for (let y = minYear; y <= maxYear; y++) {
        yearList.push(`${y}年`)
      }

      const monthList = this.generateMonthList(year, minYear, minMonth, maxYear, maxMonth)
      const dayList = this.generateDayList(
        year,
        month,
        minYear,
        minMonth,
        minDay,
        maxYear,
        maxMonth,
        maxDay,
      )

      const yearIndex = Math.max(0, year - minYear)
      const monthIndex = Math.max(0, month - (year === minYear ? minMonth : 1))
      const dayIndex = Math.max(
        0,
        day - (year === minYear && month === minMonth ? minDay : 1),
      )

      this.setData({
        yearList,
        monthList,
        dayList,
        pickerValue: [yearIndex, monthIndex, dayIndex],
      })
    },

    generateMonthList(year, minYear, minMonth, maxYear, maxMonth) {
      const monthList = []
      const startMonth = year === minYear ? minMonth : 1
      const endMonth = year === maxYear ? maxMonth : 12
      for (let m = startMonth; m <= endMonth; m++) {
        monthList.push(`${m}月`)
      }
      return monthList
    },

    generateDayList(year, month, minYear, minMonth, minDay, maxYear, maxMonth, maxDay) {
      const dayList = []
      const startDay = year === minYear && month === minMonth ? minDay : 1
      const endDay =
        year === maxYear && month === maxMonth
          ? maxDay
          : this.calcDaysInMonth(year, month)
      for (let d = startDay; d <= endDay; d++) {
        dayList.push(`${d}日`)
      }
      return dayList
    },

    updatePickerValue(year, month, day) {
      const { minYear, minMonth, minDay } = this.data

      const yearIndex = year - minYear
      const monthIndex = month - (year === minYear ? minMonth : 1)
      const dayIndex = Math.max(
        0,
        day - (year === minYear && month === minMonth ? minDay : 1),
      )

      this.setData({
        pickerValue: [yearIndex, monthIndex, dayIndex],
      })
    },

    syncFromProps(year, month, day) {
      const { minYear, minMonth, minDay, maxYear, maxMonth, maxDay } = this.data
      if (!minYear) return
      if (!year || !month || !day) return

      const monthList = this.generateMonthList(year, minYear, minMonth, maxYear, maxMonth)
      const dayList = this.generateDayList(
        year,
        month,
        minYear,
        minMonth,
        minDay,
        maxYear,
        maxMonth,
        maxDay,
      )

      const yearIndex = Math.max(0, year - minYear)
      const monthIndex = Math.max(0, month - (year === minYear ? minMonth : 1))
      const dayIndex = Math.max(
        0,
        day - (year === minYear && month === minMonth ? minDay : 1),
      )

      this.setData({
        monthList,
        dayList,
        pickerValue: [yearIndex, monthIndex, dayIndex],
      })
    },

    // 根据年月更新天数列表，必要时修正 day 的选中索引
    updateDayList(year, month) {
      const { minYear, minMonth, minDay, maxYear, maxMonth, maxDay } = this.data
      const newDayList = this.generateDayList(
        year,
        month,
        minYear,
        minMonth,
        minDay,
        maxYear,
        maxMonth,
        maxDay,
      )

      // 若当前选中天超过最大天数，则回显选择最大天数的日期
      const curPicker = this.data.pickerValue || [0, 0, 0]
      let dayIndex = curPicker[2]
      const startDay = year === minYear && month === minMonth ? minDay : 1
      if (dayIndex < 0) dayIndex = 0
      if (dayIndex >= newDayList.length) {
        dayIndex = newDayList.length - 1
      }

      this.setData({
        dayList: newDayList,
        pickerValue: [curPicker[0], curPicker[1], dayIndex],
      })
    },

    onPickerChange(e) {
      const value = e.detail.value
      const { minYear, minMonth, minDay } = this.data

      const selectedYear = minYear + value[0]

      // 更新月份列表
      const { maxYear, maxMonth } = this.data
      const newMonthList = this.generateMonthList(
        selectedYear,
        minYear,
        minMonth,
        maxYear,
        maxMonth,
      )
      const startMonth = selectedYear === minYear ? minMonth : 1
      let monthIndex = value[1]
      if (monthIndex >= newMonthList.length) {
        monthIndex = newMonthList.length - 1
      }
      const selectedMonth = startMonth + monthIndex

      // 更新日期列表
      const newDayList = this.generateDayList(
        selectedYear,
        selectedMonth,
        minYear,
        minMonth,
        minDay,
        maxYear,
        maxMonth,
        this.data.maxDay,
      )
      let dayIndex = value[2]
      if (dayIndex >= newDayList.length) {
        dayIndex = newDayList.length - 1
      }

      this.setData({
        monthList: newMonthList,
        dayList: newDayList,
        pickerValue: [value[0], monthIndex, dayIndex],
      })
    },

    onCancel() {
      this.triggerEvent("cancel")
      this.updateShow(false)
    },

    onConfirm() {
      const { pickerValue, minYear, minMonth, minDay, maxYear, maxMonth, maxDay } =
        this.data
      const year = minYear + pickerValue[0]

      const startMonth = year === minYear ? minMonth : 1
      let month = startMonth + pickerValue[1]
      const endMonth = year === maxYear ? maxMonth : 12
      if (month > endMonth) month = endMonth

      const startDay = year === minYear && month === minMonth ? minDay : 1
      let day = startDay + pickerValue[2]

      const endDay =
        year === maxYear && month === maxMonth
          ? maxDay
          : this.calcDaysInMonth(year, month)
      if (day > endDay) day = endDay

      const pickedTs = new Date(year, month - 1, day).getTime()
      const limitTs = new Date(maxYear, maxMonth - 1, maxDay).getTime()
      const minTs = new Date(minYear, minMonth - 1, minDay).getTime()
      if (pickedTs > limitTs) {
        this.triggerChange(maxYear, maxMonth, maxDay)
        this.updateShow(false)
        return
      }
      if (pickedTs < minTs) {
        this.triggerChange(minYear, minMonth, minDay)
        this.updateShow(false)
        return
      }

      this.triggerChange(year, month, day)
      this.updateShow(false)
    },

    updateShow(val) {
      this.setData({ show: val })
    },

    triggerChange(year, month, day) {
      this.triggerEvent("dateChange", {
        year,
        month,
        day,
        date: `${year}年${month}月${day}日`,
      })
    },

    calcDaysInMonth(year, month) {
      if (!year || !month) return 31
      if (month === 2) {
        return this.isLeapYear(year) ? 29 : 28
      }
      if ([4, 6, 9, 11].indexOf(month) !== -1) return 30
      return 31
    },

    isLeapYear(year) {
      return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
    },
  },
})
