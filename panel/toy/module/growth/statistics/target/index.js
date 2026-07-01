const plugin = requirePlugin("quecPlugin")

Page({
  data: {
    babyTask: {},

    deviceInfo: {},

    year: 0,
    month: 0,
    startTime: 0,
    endTime: 0,
    daysTs: [],

    status: "",
    finishNum: 0,
    continueNum: 0,
    grayMarks: [],
    checkedMarks: [],

    unfinishedMarks: [],
    repeatDaysArr: [],
    taskStartTime: 0,
    taskEndTime: 0,
    finishDateMap: {},
  },

  onLoad(options) {
    if (options.babyTask) {
      const babyTask = JSON.parse(decodeURIComponent(options.babyTask))
      this.setData({ babyTask })

      if (babyTask.babyTaskDayList && Array.isArray(babyTask.babyTaskDayList)) {
        const unfinishedMarks = babyTask.babyTaskDayList
          .filter((day) => day.status === "unfinish")
          .map((day) => day.date)
        this.setData({ unfinishedMarks })
      }
    }
    if (options.deviceInfo) {
      this.setData({
        deviceInfo: JSON.parse(decodeURIComponent(options.deviceInfo)),
      })
    }
  },

  getTargetStatistics() {
    const { babyTask, startTime, endTime } = this.data

    plugin.ai.getBabyTaskFinishStatistics({
      babyTaskId: babyTask.id ? babyTask.id : babyTask.babyTaskId,
      endTime,
      startTime,
      success: (res) => {
        console.log("目标统计", res)

        const d = (res && res.data) || {}
        const status = d.status || ""
        const finishNum = Number(d.finishNum || 0)
        const taskStartTime = Number(d.startTime || 0)
        const taskEndTime = Number(d.endTime || 0)
        const repeatDaysArr = String(d.repeatDays || "")
          .split(",")
          .map((x) => parseInt(x))
          .filter((x) => x >= 1 && x <= 7)
        const finishTimeList = Array.isArray(d.finishTimeList) ? d.finishTimeList : []

        const dayTsSet = new Set()
        const finishDateMap = {}
        for (let i = 0; i < finishTimeList.length; i++) {
          const ts = Number(finishTimeList[i])
          if (!ts) continue
          const dateStr = this.fmtDateByTs(ts)
          const dObj = new Date(ts)
          const dayTs = new Date(
            dObj.getFullYear(),
            dObj.getMonth(),
            dObj.getDate(),
          ).getTime()
          dayTsSet.add(dayTs)
          const key = dateStr.slice(0, 7)
          if (!finishDateMap[key]) finishDateMap[key] = new Set()
          finishDateMap[key].add(dateStr)
        }
        const continueNum = this.calcMaxStreakFromDayTs(dayTsSet)

        this.setData(
          {
            status,
            finishNum,
            continueNum,
            taskStartTime,
            taskEndTime,
            repeatDaysArr,
            finishDateMap,
          },
          () => {
            if (this.data.year && this.data.month) {
              this.buildMonthMarks(this.data.year, this.data.month)
            }
          },
        )
      },
      fail: (error) => {
        console.log(error)
      },
    })
  },

  getUnfinishedStatistics() {
    const { babyTask, startTime, endTime } = this.data
    const babyId = babyTask.babyId
    if (!babyId) return

    plugin.ai.getBabyTaskWeekStatistics({
      startTime,
      endTime,
      babyId,
      success: (res) => {
        if (res?.data?.weekTaskList) {
          const weekTaskList = res.data.weekTaskList
          const targetTask = weekTaskList.find(
            (t) => t.babyTaskId === (babyTask.id || babyTask.babyTaskId),
          )
          if (targetTask && targetTask.babyTaskDayList) {
            const unfinishedMarks = targetTask.babyTaskDayList
              .filter((day) => day.status === "unfinish")
              .map((day) => day.date)
            this.setData({ unfinishedMarks }, () => {
              if (this.data.year && this.data.month) {
                this.buildMonthMarks(this.data.year, this.data.month)
              }
            })
          }
        }
      },
      fail: (error) => {
        console.log(error)
      },
    })
  },

  onYearMonthChange(e) {
    const { year, month } = e.detail || {}
    const rangeTs = this.fmtToTimestamp(year, month)
    this.setData(
      {
        year,
        month,
        startTime: rangeTs.startTs,
        endTime: rangeTs.endTs,
      },
      () => {
        this.buildMonthMarks(year, month)
        if (this.data.babyTask?.id || this.data.babyTask?.babyTaskId) {
          this.getTargetStatistics()
          this.getUnfinishedStatistics()
        }
      },
    )
  },

  fmtToTimestamp(year, month) {
    const daysInMonth = new Date(year, month, 0).getDate()
    const startTs = new Date(year, month - 1, 1, 0, 0, 0, 0).getTime()
    const endTs = new Date(year, month - 1, daysInMonth, 0, 0, 0, 0).getTime()
    return { startTs, endTs }
  },

  fmtDate(y, m, d) {
    const mm = m.toString().padStart(2, "0")
    const dd = d.toString().padStart(2, "0")
    return `${y}-${mm}-${dd}`
  },

  fmtDateByTs(ts) {
    const d = new Date(ts)
    const y = d.getFullYear()
    const m = d.getMonth() + 1
    const day = d.getDate()
    return this.fmtDate(y, m, day)
  },

  calcMaxStreakFromDayTs(dayTsSet) {
    const arr = Array.from(dayTsSet)
    if (arr.length === 0) return 0
    arr.sort((a, b) => a - b)
    let maxStreak = 1
    let cur = 1
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] - arr[i - 1] === 86400000) {
        cur += 1
      } else if (arr[i] !== arr[i - 1]) {
        if (cur > maxStreak) maxStreak = cur
        cur = 1
      }
    }
    if (cur > maxStreak) maxStreak = cur
    return maxStreak >= 2 ? maxStreak : 1
  },

  buildMonthMarks(year, month) {
    const repeatSet = new Set(this.data.repeatDaysArr || [])
    const { taskStartTime, taskEndTime } = this.data
    const pad2 = (x) => String(x).padStart(2, "0")
    const inRange = (ts) =>
      (!taskStartTime || ts >= taskStartTime) && (!taskEndTime || ts <= taskEndTime)
    const weekdayOf = (y, m, d) => {
      const w = new Date(y, m - 1, d).getDay()
      return w === 0 ? 7 : w
    }
    const pushChecked = (set, dateStr, out) => {
      if (set && set.has(dateStr)) out.push(dateStr)
    }
    const tryPushGray = (y, m, d, out) => {
      if (repeatSet.size === 0) return
      const ts = new Date(y, m - 1, d, 0, 0, 0, 0).getTime()
      if (!inRange(ts)) return
      if (repeatSet.has(weekdayOf(y, m, d))) out.push(`${y}-${pad2(m)}-${pad2(d)}`)
    }

    const daysInMonth = new Date(year, month, 0).getDate()
    const firstDow = new Date(year, month - 1, 1).getDay()
    const leadCount = firstDow
    const remainCount = 42 - (leadCount + daysInMonth)

    const gray = []
    const checked = []

    const curKey = `${year}-${pad2(month)}`
    const prevYear = month === 1 ? year - 1 : year
    const prevMonth = month === 1 ? 12 : month - 1
    const nextYear = month === 12 ? year + 1 : year
    const nextMonth = month === 12 ? 1 : month + 1
    const prevKey = `${prevYear}-${pad2(prevMonth)}`
    const nextKey = `${nextYear}-${pad2(nextMonth)}`
    const curCheckedSet = this.data.finishDateMap[curKey] || new Set()
    const prevCheckedSet = this.data.finishDateMap[prevKey] || new Set()
    const nextCheckedSet = this.data.finishDateMap[nextKey] || new Set()

    const prevMonthDays = new Date(prevYear, prevMonth, 0).getDate()
    const total = leadCount + daysInMonth + remainCount
    for (let i = 0; i < total; i++) {
      let y, m, d, set
      if (i < leadCount) {
        d = prevMonthDays - leadCount + 1 + i
        y = prevYear
        m = prevMonth
        set = prevCheckedSet
      } else if (i < leadCount + daysInMonth) {
        d = i - leadCount + 1
        y = year
        m = month
        set = curCheckedSet
      } else {
        d = i - leadCount - daysInMonth + 1
        y = nextYear
        m = nextMonth
        set = nextCheckedSet
      }
      const dateStr = `${y}-${pad2(m)}-${pad2(d)}`
      pushChecked(set, dateStr, checked)
      tryPushGray(y, m, d, gray)
    }

    const uniq = (arr) => Array.from(new Set(arr))
    this.setData({ grayMarks: uniq(gray), checkedMarks: uniq(checked) })
  },
})
