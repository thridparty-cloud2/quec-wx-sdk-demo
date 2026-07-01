Component({
  properties: {
    summaryConData: {
      type: Object,
      value: {},
    },
    // 初始日期
    initialDate: {
      type: String,
      value: "",
    },
    // 事件日期数组
    eventDates: {
      type: Array,
      value: [],
    },
    // 是否显示其他月份日期
    showOtherMonth: {
      type: Boolean,
      value: true,
    },
    // 最小日期
    minDate: {
      type: String,
      value: "",
    },
    // 最大日期
    maxDate: {
      type: String,
      value: "",
    },
    // 是否显示日历
    visible: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    currentYear: "",
    currentMonth: "",
    selectedDate: "",
    calendarData: [],
    weekDays: ["日", "一", "二", "三", "四", "五", "六"],
  },

  methods: {
    /**
     * 初始化日历
     */
    initCalendar() {
      const now = new Date()
      let year = now.getFullYear()
      let month = now.getMonth() + 1

      // 如果有初始日期，使用初始日期
      if (this.data.initialDate) {
        const initDate = new Date(this.data.initialDate)
        year = initDate.getFullYear()
        month = initDate.getMonth() + 1
      }

      this.setData({
        currentYear: year,
        currentMonth: month,
      })

      // 设置默认选中日期（前一天）
      this.setDisplayDate()

      this.generateCalendar(year, month)
    },

    /**
     * 设置显示的日期（前一天）
     */
    setDisplayDate() {
      const date = new Date()
      date.setDate(date.getDate() - 1)

      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")

      const displayDate = `${year}-${month}-${day}`

      this.setData({
        selectedDate: displayDate,
      })
    },

    /**
     * 生成日历数据
     */
    generateCalendar(year, month) {
      const firstDay = new Date(year, month - 1, 1)
      const lastDay = new Date(year, month, 0)
      const firstDayWeek = firstDay.getDay()
      const daysInMonth = lastDay.getDate()

      const calendarData = []
      let week = []

      for (let i = 0; i < firstDayWeek; i++) {
        week.push({
          date: "",
          fullDate: "",
          isCurrentMonth: false,
          isToday: false,
          isSelected: false,
          hasEvent: false,
          isEmpty: true,
        })
      }

      // 添加当前月的日期
      const today = new Date()
      const todayStr = `${today.getFullYear()}-${this.formatNumber(
        today.getMonth() + 1,
      )}-${this.formatNumber(today.getDate())}`

      for (let date = 1; date <= daysInMonth; date++) {
        const fullDate = `${year}-${this.formatNumber(month)}-${this.formatNumber(date)}`
        const isToday = fullDate === todayStr
        const isFutureDate = fullDate > todayStr
        const _eventDates = Array.isArray(this.data.eventDates)
          ? this.data.eventDates
          : []
        const hasEvent = _eventDates.includes(fullDate)

        week.push({
          date: date,
          fullDate: fullDate,
          isCurrentMonth: true,
          isToday: isToday,
          isFutureDate: isFutureDate,
          isSelected: fullDate === this.data.selectedDate,
          hasEvent: hasEvent,
          isEmpty: false,
        })

        // 每7天为一周
        if (week.length === 7) {
          calendarData.push(week)
          week = []
        }
      }

      if (week.length > 0) {
        while (week.length < 7) {
          week.push({
            date: "",
            fullDate: "",
            isCurrentMonth: false,
            isToday: false,
            isSelected: false,
            hasEvent: false,
            isEmpty: true,
          })
        }
        calendarData.push(week)
      }

      this.setData({
        calendarData: calendarData,
      })
    },

    /**
     * 上一个月
     */
    prevMonth() {
      let { currentYear, currentMonth } = this.data

      if (currentMonth === 1) {
        currentYear--
        currentMonth = 12
      } else {
        currentMonth--
      }

      this.setData({
        currentYear: currentYear,
        currentMonth: currentMonth,
      })

      this.generateCalendar(currentYear, currentMonth)

      this.triggerEvent("monthChange", {
        year: currentYear,
        month: currentMonth,
      })
    },

    /**
     * 下一个月
     */
    nextMonth() {
      let { currentYear, currentMonth } = this.data

      if (currentMonth === 12) {
        currentYear++
        currentMonth = 1
      } else {
        currentMonth++
      }

      this.setData({
        currentYear: currentYear,
        currentMonth: currentMonth,
      })

      this.generateCalendar(currentYear, currentMonth)

      this.triggerEvent("monthChange", {
        year: currentYear,
        month: currentMonth,
      })
    },

    /**
     * 选择日期
     */
    selectDate(e) {
      const { date, fullDate } = e.currentTarget.dataset

      // 如果是空白占位符，不处理
      if (!fullDate) {
        return
      }

      // 获取今天的日期字符串
      const today = new Date()
      const todayStr = `${today.getFullYear()}-${this.formatNumber(
        today.getMonth() + 1,
      )}-${this.formatNumber(today.getDate())}`

      // 不允许选择未来日期
      if (fullDate > todayStr) {
        return
      }

      if (this.data.minDate && fullDate < this.data.minDate) {
        return
      }
      if (this.data.maxDate && fullDate > this.data.maxDate) {
        return
      }

      this.setData({
        selectedDate: fullDate,
      })

      this.generateCalendar(this.data.currentYear, this.data.currentMonth)

      // 触发日期选择事件
      this.triggerEvent("dateSelect", {
        date: parseInt(date),
        fullDate: fullDate,
        year: this.data.currentYear,
        month: this.data.currentMonth,
      })
    },

    /**
     * 隐藏日历
     */
    hideCalendar() {
      this.triggerEvent("hideCalendar")
    },

    doNothing() {},

    /**
     * 格式化数字（补零）
     */
    formatNumber(num) {
      return num < 10 ? "0" + num : num.toString()
    },

    /**
     * 设置选中日期
     */
    setSelectedDate(date) {
      this.setData({
        selectedDate: date,
      })
      this.generateCalendar(this.data.currentYear, this.data.currentMonth)
    },

    /**
     * 跳转到指定月份
     */
    goToMonth(year, month) {
      this.setData({
        currentYear: year,
        currentMonth: month,
      })
      this.generateCalendar(year, month)
    },

    triggerDefaultDateSelect() {
      // 使用当前选中的日期（昨天）
      const selectedDate = this.data.selectedDate
      if (selectedDate) {
        const dateObj = new Date(selectedDate)
        const date = dateObj.getDate()
        const year = dateObj.getFullYear()
        const month = dateObj.getMonth() + 1

        // 触发日期选择事件
        this.triggerEvent("dateSelect", {
          date: date,
          fullDate: selectedDate,
          year: year,
          month: month,
        })
      }
    },
  },

  lifetimes: {
    attached() {
      this.initCalendar()
      this.triggerDefaultDateSelect()
    },
  },

  observers: {
    eventDates: function (eventDates) {
      this.generateCalendar(this.data.currentYear, this.data.currentMonth)
    },
  },
})
