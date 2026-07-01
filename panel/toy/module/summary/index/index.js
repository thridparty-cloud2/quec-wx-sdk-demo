const plugin = requirePlugin("quecPlugin")
const { getAllRolesList } = require("../../../api/roles")

Page({
  data: {
    gradientHeight: 20,

    rolesList: [], // 角色列表（过滤后，仅含当天有数据的角色）
    allRolesList: [], // 全量角色列表（用于过滤基准）
    selectedRole: "", // 选中的角色名称
    selectedRoleId: "", // 选中的角色ID
    curRoleId: null, // 当前角色ID
    showSuggestion: true, // 是否显示建议

    calendarVisible: false, // 日历显隐状态
    selectedDate: "", // 选中的日期
    navSelDate: "",
    sYear: 0, // 选中的年份（yy）
    sMonth: 0, // 选中的月份（mm）
    dateChanged: false, // 日期变化
    eventDates: [], // 含数据日期

    summaryConData: [], // 互动总结content数据
    duration: "", // 互动时长

    productKey: "",
    deviceKey: "",
    eUid: "",
    deviceInfo: {},
  },

  onLoad(options) {
    this.setData({
      gradientHeight: (150 / wx.getWindowInfo().windowHeight).toFixed(2) * 100,
    })

    if (options.item) {
      const deviceInfo = JSON.parse(decodeURIComponent(options.item))
      this.setData({
        productKey: deviceInfo.productKey,
        deviceKey: deviceInfo.deviceKey,
        eUid: deviceInfo.uid,
        deviceInfo,
      })
    }
    if (options.role) {
      const role = JSON.parse(decodeURIComponent(options.role))
      this.setData({
        curRoleId: role.roleId,
      })
    }
    this.getSummaryExistDates()
    this.getSuggestionShowStatus()
  },

  onShow() {
    this.getAllRoles()
  },

  // 切换日历显隐状态
  showCalendar() {
    this.setData({
      calendarVisible: !this.data.calendarVisible,
    })
  },

  // 隐藏日历
  hideCalendar() {
    this.setData({
      calendarVisible: false,
    })
    const navComponent = this.selectComponent("#summaryNav")
    if (navComponent) {
      navComponent.resetArrowDirection()
    }
  },

  // 日期选择事件
  onDateSelect(e) {
    const { fullDate } = e.detail // yy-mm-dd
    const parts = typeof fullDate === "string" ? fullDate.split("-") : []
    const [yy = "", mm = ""] = parts

    if (!this.data.navSelDate) {
      this.setData({
        navSelDate: fullDate,
      })
    }

    this.setData({
      selectedDate: fullDate,
      sYear: parseInt(yy),
      sMonth: parseInt(mm),
      dateChanged: true,
    })

    if (this.data.productKey && this.data.deviceKey && this.data.eUid) {
      this.getSummaryExistDates()
    }
    if (this.data.selectedDate) {
      this.getSummaryByRole()
    }
  },

  // 月份切换事件
  onMonthChange(e) {
    const { year, month } = e.detail || {}
    const yy = year || 0
    const mm = month || 0
    this.setData({
      sYear: yy,
      sMonth: mm,
    })

    if (this.data.productKey && this.data.deviceKey && this.data.eUid) {
      this.getSummaryExistDates()
    }
  },

  // 角色选择事件
  onRoleSelect(e) {
    const { selectedName, roleId } = e.detail

    // 角色未变化时不重复请求
    if (roleId === this.data.selectedRoleId) return

    this.setData({
      selectedRole: selectedName,
      selectedRoleId: roleId,
      dateChanged: false,
    })
    if (this.data.selectedDate && this.data.selectedRoleId) {
      this.getSummaryByRole()
    }
  },

  getAllRoles() {
    const { deviceKey, productKey } = this.data
    getAllRolesList(deviceKey, productKey)
      .then((rolesList) => {
        this.setData({
          allRolesList: rolesList,
        })
        // 如果已有总结数据，立即执行过滤
        if (this.data.selectedDate) {
          this.getSummaryByRole()
        }
      })
      .catch((error) => {
        console.error(error)
      })
  },

  getSummaryByRole() {
    const { deviceKey, productKey, eUid, selectedDate } = this.data
    const fmtDate = selectedDate.trim().replace(/-/g, "")
    plugin.ai.summaryCommon({
      deviceKey: deviceKey,
      productKey: productKey,
      endUserId: eUid,
      day: fmtDate,
      success: (res) => {
        let filteredData = []
        let duration = ""
        let allSummaryData = []
        if (res?.data && Object.keys(res.data).length > 0) {
          duration = res.data.chatDuration || ""
          allSummaryData = JSON.parse(res.data.summaryContent || "[]")
          filteredData = this.data.selectedRoleId
            ? allSummaryData.filter((item) => item.roleId === this.data.selectedRoleId)
            : allSummaryData
        }

        // 根据当天总结数据中实际存在的roleId过滤角色列表
        this.filterRolesListByData(allSummaryData)

        if (filteredData.length > 0) {
          this.setData({
            summaryConData: filteredData,
            duration: duration,
            navSelDate: this.data.selectedDate,
          })
        } else {
          this.setData({
            duration: "",
          })
          if (this.data.dateChanged) {
            wx.showToast({
              title: "无数据",
              icon: "none",
              duration: 1500,
            })
            this.setData({ dateChanged: false })
          } else {
            this.setData({
              summaryConData: [],
            })
          }
        }
        console.log("对应roleID的summaryConData:", this.data.summaryConData)
      },
      fail: (error) => {
        console.error(error)
      },
    })
  },

  /**
   * 根据当天总结数据过滤角色列表，仅展示有互动总结数据的角色
   */
  filterRolesListByData(allSummaryData) {
    if (!allSummaryData || allSummaryData.length === 0) {
      this.setData({ rolesList: [] })
      return
    }
    const existRoleIds = allSummaryData.map((item) => item.roleId)
    const { allRolesList } = this.data
    if (!allRolesList || allRolesList.length === 0) return
    const filteredRoles = allRolesList.filter((role) =>
      existRoleIds.includes(role.roleId),
    )
    this.setData({ rolesList: filteredRoles })
  },

  fmtToTimestamp(y, m) {
    const yNum = y || 0
    const mNum = m || 0
    if (!yNum || !mNum) {
      return { startTime: 0, endTime: 0 }
    }
    let year = parseInt(yNum, 10)
    const month = parseInt(mNum, 10)
    if (Number.isNaN(year) || Number.isNaN(month) || month < 1 || month > 12) {
      return { startTime: 0, endTime: 0 }
    }
    const startTime = new Date(year, month - 1, 1, 0, 0, 0, 0).getTime()
    const daysInMonth = new Date(year, month, 0).getDate()
    const endTime = new Date(year, month - 1, daysInMonth, 0, 0, 0, 0).getTime()
    return { startTime, endTime }
  },

  getSummaryExistDates() {
    const { deviceKey, productKey, eUid, sYear, sMonth } = this.data
    const { startTime, endTime } = this.fmtToTimestamp(sYear, sMonth)
    plugin.ai.querySummaryGenerate({
      startTime: startTime,
      endTime: endTime,
      productKey: productKey,
      endUserId: eUid,
      deviceKey: deviceKey,
      success: (res) => {
        if (res?.data) {
          const eventDates = res.data
            .filter(
              (item) => item && (item.generate === true || item.generate === "true"),
            )
            .map((item) => {
              const ds = String(item.datetime || "")
              if (ds.length === 8) {
                return `${ds.slice(0, 4)}-${ds.slice(4, 6)}-${ds.slice(6, 8)}`
              }
              return ""
            })
            .filter(Boolean)
          this.setData({ eventDates: eventDates || [] })
          console.log(eventDates)
        }
      },
      fail: (error) => {
        console.error(error)
      },
    })
  },

  getSuggestionShowStatus() {
    const { productKey } = this.data

    plugin.ai.isShowSummaryAndTask({
      productKey: productKey,
      type: "GROWTH_ADVICE",
      success: (res) => {
        const d = res?.data
        const showSuggestion = d !== false && d !== "false"
        this.setData({ showSuggestion })
      },
      fail: (error) => {
        console.error(error)
      },
    })
  },
})
