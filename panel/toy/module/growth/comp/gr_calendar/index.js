const plugin = requirePlugin("quecPlugin")

Component({
  properties: {
    // 展示的年月（默认为今天所在年月）
    year: { type: Number, value: 0 },
    month: { type: Number, value: 0 },
    // 灰色标记日期数组（YYYY-MM-DD）
    grayMarks: {
      type: Array,
      value: ["2025-11-07", "2025-10-31", "2025-11-13"], // 测试数据
    },
    // check标记日期数组（YYYY-MM-DD）
    checkedMarks: { type: Array, value: ["2025-11-10", "2025-11-11", "2025-11-12"] }, // 测试数据
    // 未完成标记日期数组（YYYY-MM-DD）
    unfinishedMarks: { type: Array, value: [] },
  },

  data: {
    weekNames: ["日", "一", "二", "三", "四", "五", "六"],
    days: [],
    checkDayIcon: plugin.main.getRootImg() + "ai/new/task/had_done.png",
    unfinishedIcon: plugin.main.getRootImg() + "ai/new/task/unfinished.png",
  },

  lifetimes: {
    attached() {
      this.initToday()
      this.buildMonthGrid()
    },
    ready() {
      this.buildMonthGrid()
    },
  },

  observers: {
    "year, month, grayMarks, checkedMarks, unfinishedMarks": function () {
      this.buildMonthGrid()
    },
  },

  methods: {
    initToday() {
      let { year, month } = this.properties
      if (!year || !month) {
        const now = new Date()
        this.setData({ year: now.getFullYear(), month: now.getMonth() + 1 })
        this.emitYearMonth()
      }
    },

    buildMonthGrid() {
      const { year, month, grayMarks, checkedMarks, unfinishedMarks } = this.properties
      if (!year || !month) return
      const graySet = new Set(grayMarks || [])
      const checkedSet = new Set(checkedMarks || [])
      const unfinishedSet = new Set(unfinishedMarks || [])

      const firstDay = new Date(year, month - 1, 1)
      const startWeek = firstDay.getDay() // 0-6
      const daysInMonth = this.daysInMonth(year, month)
      const prevMonthDays = this.daysInMonth(year, month - 1)

      const cells = []
      for (let i = 0; i < startWeek; i++) {
        const d = prevMonthDays - startWeek + 1 + i
        const date = this.formatDate(year, month - 1, d)
        const hasChecked = checkedSet.has(date)
        const hasUnfinished = !hasChecked && unfinishedSet.has(date)
        const hasGray = !hasChecked && !hasUnfinished && graySet.has(date)
        cells.push({
          dateNum: d,
          inMonth: false,
          isToday: false,
          hasGray,
          hasChecked,
          hasUnfinished,
        })
      }
      for (let d = 1; d <= daysInMonth; d++) {
        const date = this.formatDate(year, month, d)
        const isToday = this.isToday(date)
        const hasChecked = checkedSet.has(date)
        const hasUnfinished = !hasChecked && unfinishedSet.has(date)
        const hasGray = !hasChecked && !hasUnfinished && graySet.has(date)
        cells.push({
          dateNum: d,
          inMonth: true,
          isToday,
          hasGray,
          hasChecked,
          hasUnfinished,
        })
      }
      const remain = 42 - cells.length
      for (let i = 1; i <= remain; i++) {
        const date = this.formatDate(year, month + 1, i)
        const hasChecked = checkedSet.has(date)
        const hasUnfinished = !hasChecked && unfinishedSet.has(date)
        const hasGray = !hasChecked && !hasUnfinished && graySet.has(date)
        cells.push({
          dateNum: i,
          inMonth: false,
          isToday: false,
          hasGray,
          hasChecked,
          hasUnfinished,
        })
      }

      this.setData({ days: cells })
    },

    prevMonth() {
      let { year, month } = this.properties
      month -= 1
      if (month <= 0) {
        month = 12
        year -= 1
      }
      this.setData({ year, month })
      this.emitYearMonth()
    },

    nextMonth() {
      let { year, month } = this.properties
      month += 1
      if (month > 12) {
        month = 1
        year += 1
      }
      this.setData({ year, month })
      this.emitYearMonth()
    },

    daysInMonth(y, m) {
      if (m === 0) {
        y -= 1
        m = 12
      }
      if (m === 13) {
        y += 1
        m = 1
      }
      return new Date(y, m, 0).getDate()
    },

    isToday(dateStr) {
      const now = new Date()
      const yyyy = now.getFullYear()
      const mm = now.getMonth() + 1
      const dd = now.getDate()
      return dateStr === this.formatDate(yyyy, mm, dd)
    },

    inSet(dateStr, arr) {
      if (!arr || arr.length === 0) return false
      return arr.indexOf(dateStr) !== -1
    },

    formatDate(y, m, d) {
      if (m <= 0) {
        y -= 1
        m += 12
      }
      if (m > 12) {
        y += 1
        m -= 12
      }
      const mm = m.toString().padStart(2, "0")
      const dd = d.toString().padStart(2, "0")
      return `${y}-${mm}-${dd}`
    },

    emitYearMonth() {
      const { year, month } = this.properties
      this.triggerEvent("yearMonthChange", { year, month })
    },
  },
})
