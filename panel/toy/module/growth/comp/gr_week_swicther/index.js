Component({
  properties: {},

  data: {
    weekRange: "",
    startTs: null,
    endTs: null,
    year: null,
    _monday: null,
  },

  lifetimes: {
    attached() {
      this.initCurrentWeek()
    },
  },

  methods: {
    initCurrentWeek() {
      const today = new Date()
      const { monday, sunday } = this.getWeekBounds(today)
      const { year, range, startTs, endTs } = this.buildWeekDisplay(monday, sunday)
      this.setData({ weekRange: range, year, startTs, endTs, _monday: monday.getTime() })
      this.onWeekChange()
    },

    // 计算给定日期所在周的周一与周日边界（本地时区）
    getWeekBounds(date) {
      const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const day = d.getDay()
      const diffToMonday = day === 0 ? -6 : 1 - day
      const monday = new Date(d)
      monday.setDate(d.getDate() + diffToMonday)
      monday.setHours(0, 0, 0, 0)
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      sunday.setHours(23, 59, 59, 999)
      return { monday, sunday }
    },

    buildWeekDisplay(monday, sunday) {
      const year = monday.getFullYear()
      const range = `${monday.getMonth() + 1}.${monday.getDate()}-${
        sunday.getMonth() + 1
      }.${sunday.getDate()}`
      const startTs = monday.getTime()
      const endTs = sunday.getTime()
      return { year, range, startTs, endTs }
    },

    onWeekChange() {
      const { startTs, endTs } = this.data
      this.triggerEvent("weekChange", { startTs, endTs })
    },

    onPrev() {
      this.switchWeekRange(-1)
    },

    // 若当前为今天所在周则不允许向后切换
    onNext() {
      // const { monday } = this.getWeekBounds(new Date());
      // if (this.data._monday === monday.getTime()) {
      //   wx.showToast({
      //     title: "切换超出当周",
      //     icon: "none",
      //   });
      //   return;
      // }
      this.switchWeekRange(1)
    },

    // 按周步长切换
    switchWeekRange(n) {
      const baseMs = this.data._monday || this.data.startTs
      const monday = new Date(baseMs)
      monday.setDate(monday.getDate() + n * 7)
      monday.setHours(0, 0, 0, 0)
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      sunday.setHours(23, 59, 59, 999)
      const { year, range, startTs, endTs } = this.buildWeekDisplay(monday, sunday)
      this.setData({ weekRange: range, year, startTs, endTs, _monday: monday.getTime() })
      this.onWeekChange()
    },
  },
})
