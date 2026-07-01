const plugin = requirePlugin("quecPlugin")
const ClockUtils = require("../../../js/clock")

Page({
  data: {
    productKey: "",
    deviceKey: "",
    deviceInfo: {},

    selectedTime: "00:00",

    selectedRepeat: "",
    selectedRingtone: "",
    ringtoneOption: null,
    clockName: "",

    pageTitle: "添加闹钟",
    clockId: "",

    clocks: [],

    isEdit: false,
    eDayOfWeek: "",
    eClockType: "",
    enabled: true,
    eRingtoneName: "",
    eTaskName: "",
    eTime: "00:00",
    eHour: 0,
    eMinute: 0,

    ringtoneList: [
      {
        ringtoneName: "铃声一",
        audioUrl: "https://iot-oss.quectelcn.com/wxsdk_img/ai/new/clock/clock1.mp3",
      },
      {
        ringtoneName: "铃声二",
        audioUrl: "https://iot-oss.quectelcn.com/wxsdk_img/ai/new/clock/clock2.mp3",
      },
      {
        ringtoneName: "铃声三",
        audioUrl: "https://iot-oss.quectelcn.com/wxsdk_img/ai/new/clock/clock3.mp3",
      },
      {
        ringtoneName: "铃声四",
        audioUrl: "https://iot-oss.quectelcn.com/wxsdk_img/ai/new/clock/clock4.mp3",
      },
      {
        ringtoneName: "铃声五",
        audioUrl: "https://iot-oss.quectelcn.com/wxsdk_img/ai/new/clock/clock5.mp3",
      },
    ],

    editPropData: {},
  },

  onLoad(options) {
    const { productKey, deviceKey, type, id, clockItem, deviceInfo } = options || {}
    const update = {}
    if (productKey && deviceKey) {
      update.productKey = productKey
      update.deviceKey = deviceKey
    }
    if (type === "edit") {
      update.pageTitle = "修改闹钟"
      update.clockId = id
      update.isEdit = true
    } else {
      update.pageTitle = "添加闹钟"
      update.isEdit = false
    }
    if (deviceInfo) {
      this.setData({
        deviceInfo: JSON.parse(decodeURIComponent(deviceInfo)),
      })
    }
    this.setData(update)
    if (type === "edit" && clockItem) {
      try {
        const item = JSON.parse(decodeURIComponent(clockItem))
        const timer = (item.clockTimers && item.clockTimers[0]) || {}
        const timeStr = ClockUtils.formatTime(timer.time || item.clockTime)
        const [hourStr, minuteStr] = (timeStr || "00:00").split(":")
        const eHour = parseInt(hourStr, 10) || 0
        const eMinute = parseInt(minuteStr, 10) || 0
        const eRingtoneName = ClockUtils.parseRingtoneName(timer.action || "")
        const eClockType = item.clockType || ""
        // day-repeat 类型回显为"每天"
        const eDayOfWeek =
          eClockType === "day-repeat" ? "每天" : item.clockRepeat || "once"
        this.setData({
          eDayOfWeek,
          eClockType,
          enabled: !!item.switchCheck,
          eRingtoneName,
          eTaskName: timer.taskName || item.clockName || "闹钟",
          eTime: timeStr,
          eHour,
          eMinute,
        })
        this.setData({
          editPropData: {
            ringtoneList: this.data.ringtoneList,
            isEditMode: true,
            editData: {
              dayOfWeek: this.data.eDayOfWeek,
              clockType: eClockType,
              ringtoneName: this.data.eRingtoneName,
              taskName: this.data.eTaskName,
            },
          },
        })
      } catch (err) {}
    } else {
      this.setData({
        editPropData: {
          ringtoneList: this.data.ringtoneList,
          isEditMode: false,
          editData: {},
        },
      })
    }
  },

  onTimeChange(e) {
    const { time } = e.detail
    let fmtTime = time + ":00"

    console.log("获取到的时间数据:", fmtTime)
    this.setData({
      selectedTime: fmtTime,
    })
  },

  onRepeatChange(e) {
    const { value } = e.detail

    let fmtValue = value
    // day-repeat 标识直接存储，不做数字解析
    if (fmtValue === "day-repeat") {
      console.log("重复模式选项数据:", fmtValue)
      this.setData({ selectedRepeat: fmtValue })
      return
    }
    if (value.includes("、")) {
      fmtValue = value.replace(/、/g, ",")
    }
    if (fmtValue !== "once") {
      const num = fmtValue
        .split(",")
        .map((n) => parseInt(n.trim(), 10))
        .filter((n) => !isNaN(n) && n >= 1 && n <= 7)
        .sort((a, b) => a - b)
      // 全选7天统一为 day-repeat
      if (num.length === 7) {
        fmtValue = "day-repeat"
      } else {
        fmtValue = num.join(",")
      }
    }
    console.log("重复模式选项数据:", fmtValue)

    this.setData({
      selectedRepeat: fmtValue,
    })
  },

  onRingtoneChange(e) {
    const { value, option } = e.detail
    console.log("选择的铃声选项数据:", { value, option })
    this.setData({
      selectedRingtone: value,
      ringtoneOption: option,
    })
  },

  onClockNameChange(e) {
    const { value } = e.detail
    console.log("闹钟名称:", value)
    this.setData({
      clockName: value,
    })
  },

  buildGenClockParams() {
    const {
      isEdit,
      clockId,
      productKey,
      deviceKey,
      selectedRepeat,
      selectedTime,
      clockName,
      selectedRingtone,
      enabled,
      eDayOfWeek,
      eClockType,
      eTime,
      eTaskName,
      eRingtoneName,
    } = this.data

    /**
     * 根据重复值推断 type 和 dayOfWeek
     * - "once"       → type: "once",          dayOfWeek: ""
     * - "day-repeat" → type: "day-repeat",    dayOfWeek: ""
     * - "1,2,3"      → type: "custom-repeat", dayOfWeek: "1,2,3"
     */
    const resolveRepeatParams = (repeatValue) => {
      if (repeatValue === "once") {
        return { type: "once", dayOfWeek: "once" }
      }
      if (repeatValue === "day-repeat") {
        return { type: "day-repeat", dayOfWeek: "day-repeat" }
      }
      return { type: "custom-repeat", dayOfWeek: repeatValue }
    }

    if (isEdit) {
      // 用户未修改重复选项时，使用原始值
      let finalRepeat = selectedRepeat
      if (!finalRepeat) {
        // 原始类型为 day-repeat 时保持
        if (eClockType === "day-repeat" || eDayOfWeek === "每天") {
          finalRepeat = "day-repeat"
        } else {
          finalRepeat = ClockUtils.parseRepeat(eDayOfWeek)
        }
      }
      const finalTime = selectedTime !== "00:00" ? selectedTime : eTime
      const finalClockName = clockName || eTaskName
      let finalRingtone = selectedRingtone || eRingtoneName
      if (finalRingtone !== selectedRingtone) {
        finalRingtone = ClockUtils.formatRingtoneUrl(eRingtoneName)
      }
      const actionContent = `[{"modelCode":"alarmClock","modelName":"闹钟铃声","modelType":"PROPERTY","dataType":"TEXT","value":"${finalRingtone}"}]`
      const { type, dayOfWeek } = resolveRepeatParams(finalRepeat)
      console.log("dayOfWeek selected", dayOfWeek)
      return {
        ruleId: clockId,
        pk: productKey,
        dk: deviceKey,
        enabled,
        type,
        dayOfWeek,
        timers: [
          {
            time: finalTime,
            taskName: finalClockName || "闹钟",
            action: actionContent,
          },
        ],
      }
    } else {
      const actionContent = `[{"modelCode":"alarmClock","modelName":"闹钟铃声","modelType":"PROPERTY","dataType":"TEXT","value":"${selectedRingtone}"}]`
      const { type, dayOfWeek } = resolveRepeatParams(selectedRepeat || "once")
      return {
        pk: productKey,
        dk: deviceKey,
        enabled: true,
        type,
        dayOfWeek,
        timers: [
          {
            time: selectedTime,
            taskName: clockName || "闹钟",
            action: actionContent,
          },
        ],
      }
    }
  },

  saveClock() {
    const params = this.buildGenClockParams()
    plugin.jsUtil.load(0)
    plugin.scheduledTask.addCornJobV2({
      pk: params.pk,
      dk: params.dk,
      enabled: params.enabled,
      dayOfWeek: params.dayOfWeek,
      timers: params.timers,
      type: params.type,
      success: (res) => {
        console.log("闹钟添加结果:", res)
      },
      fail: (error) => {
        console.error(error)
      },
      complete: () => {
        wx.showToast({ title: "添加成功", icon: "success", duration: 1500 })
        setTimeout(() => {
          const pages = getCurrentPages()
          const prevPage = pages[pages.length - 2]
          if (prevPage && prevPage.getAllClocksList) {
            prevPage.getAllClocksList()
          }
          wx.navigateBack({
            delta: 1,
          })
        }, 400)
      },
    })
  },

  editClock() {
    const params = this.buildGenClockParams()

    plugin.jsUtil.load(0)
    plugin.scheduledTask.setCronJobV2({
      ruleId: params.ruleId,
      dk: params.dk,
      enabled: params.enabled,
      pk: params.pk,
      type: params.type,
      dayOfWeek: params.dayOfWeek,
      timers: params.timers,
      success: (res) => {
        console.log(res)
      },
      fail: (error) => {
        console.error(error)
      },
      complete: () => {
        plugin.jsUtil.hideTip()
        wx.showToast({ title: "修改成功", icon: "success", duration: 1500 })
        setTimeout(() => {
          const pages = getCurrentPages()
          const prevPage = pages[pages.length - 2]
          if (prevPage && prevPage.getAllClocksList) {
            prevPage.getAllClocksList()
          }
          wx.navigateBack({
            delta: 1,
          })
        }, 400)
      },
    })
  },

  generalSaveAciton() {
    if (this.data.isEdit) {
      this.editClock()
    } else {
      this.saveClock()
    }
  },
})
