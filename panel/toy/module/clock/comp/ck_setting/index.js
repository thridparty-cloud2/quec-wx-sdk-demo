const ClockUtils = require("../../../../js/clock")

Component({
  properties: {
    editPropData: {
      type: Object,
      value: {},
    },
  },

  data: {
    clockName: "",
    // 重复设置
    selectedRepeat: "once",
    repeatText: "仅一次",
    repeatOptions: [
      { label: "周一", value: "1" },
      { label: "周二", value: "2" },
      { label: "周三", value: "3" },
      { label: "周四", value: "4" },
      { label: "周五", value: "5" },
      { label: "周六", value: "6" },
      { label: "周日", value: "7" },
    ],

    // 铃声设置
    selectedRingtone: "",
    ringtoneText: "",
    ringtoneOptions: [],

    // 通用弹窗
    showDialog: false,
    dialogTitle: "",
    dialogOptions: [],
    dialogSelectedValue: "",
    dialogSelectedValues: [],
    dialogMultiSelect: false,
    dialogType: "", // 弹窗类型：'repeat' 或 'ringtone'
  },

  ready() {
    const sp = this.properties.editPropData || {}
    const isEdit = !!sp.isEditMode
    const edit = sp.editData || {}
    const repeatTextSrc = edit.dayOfWeek || "仅一次"
    const clockTypeSrc = edit.clockType || ""
    const ringtoneList = sp.ringtoneList || []
    const ringtoneTextSrc = edit.ringtoneName || ""
    const taskNameSrc = edit.taskName || ""
    if (isEdit) {
      let selectedRepeatValue = "once"
      let repeatText = repeatTextSrc
      // day-repeat 类型或"每天"文本 → 全选状态
      if (clockTypeSrc === "day-repeat" || repeatTextSrc === "每天") {
        selectedRepeatValue = "day-repeat"
        repeatText = "每天"
      } else if (repeatTextSrc && repeatTextSrc !== "仅一次") {
        selectedRepeatValue = ClockUtils.parseRepeat(repeatTextSrc)
      }
      this.setData({
        repeatText,
        selectedRepeat: selectedRepeatValue,
        clockName: taskNameSrc,
        ringtoneText: ringtoneTextSrc,
      })
    } else {
      this.triggerEvent("repeatChange", {
        value: this.data.selectedRepeat,
        options: [],
      })
    }

    const options = (ringtoneList || []).map((item) => ({
      label: item.ringtoneName,
      value: item.audioUrl,
    }))
    let selectedRingtone = this.data.selectedRingtone
    let ringtoneText = this.data.ringtoneText
    let defaultOption = null
    if (isEdit && ringtoneTextSrc) {
      const matchedOption = options.find((opt) => opt.label === ringtoneTextSrc)
      if (matchedOption) {
        selectedRingtone = matchedOption.value
        ringtoneText = matchedOption.label
        defaultOption = matchedOption
      }
    } else {
      const found = options.find((opt) => opt.value === selectedRingtone)
      if (!found) {
        if (options.length > 0 && !selectedRingtone) {
          selectedRingtone = options[0].value
          ringtoneText = options[0].label
          defaultOption = options[0]
        } else if (selectedRingtone) {
          selectedRingtone = ""
          ringtoneText = ""
        }
      } else {
        defaultOption = found
      }
    }
    this.setData({ ringtoneOptions: options, selectedRingtone, ringtoneText })
    if (defaultOption) {
      this.triggerEvent("ringtoneChange", {
        value: selectedRingtone,
        option: defaultOption,
      })
    }
  },

  observers: {
    editPropData: function (sp) {
      const isEdit = !!(sp && sp.isEditMode)
      const edit = (sp && sp.editData) || {}
      const repeatTextRaw = edit.dayOfWeek || "仅一次"
      const clockTypeSrc = edit.clockType || ""

      let selectedRepeatValue = "once"
      let repeatText = repeatTextRaw
      if (clockTypeSrc === "day-repeat" || repeatTextRaw === "每天") {
        selectedRepeatValue = "day-repeat"
        repeatText = "每天"
      } else if (repeatTextRaw && repeatTextRaw !== "仅一次") {
        selectedRepeatValue = ClockUtils.parseRepeat(repeatTextRaw)
      }
      this.setData({ repeatText, selectedRepeat: selectedRepeatValue })

      const list = (sp && sp.ringtoneList) || []
      const options = list.map((item) => ({
        label: item.ringtoneName,
        value: item.audioUrl,
      }))
      let selectedRingtone = this.data.selectedRingtone
      let ringtoneText = this.data.ringtoneText
      let defaultOption = null
      const ringtoneTextSrc = edit.ringtoneName || ""
      if (isEdit && ringtoneTextSrc) {
        const matchedOption = options.find((opt) => opt.label === ringtoneTextSrc)
        if (matchedOption) {
          selectedRingtone = matchedOption.value
          ringtoneText = matchedOption.label
          defaultOption = matchedOption
        }
      } else {
        const found = options.find((opt) => opt.value === selectedRingtone)
        if (!found) {
          if (options.length > 0 && !selectedRingtone) {
            selectedRingtone = options[0].value
            ringtoneText = options[0].label
            defaultOption = options[0]
          } else if (selectedRingtone) {
            selectedRingtone = ""
            ringtoneText = ""
          }
        } else {
          defaultOption = found
        }
      }
      this.setData({ ringtoneOptions: options, selectedRingtone, ringtoneText })
      if (defaultOption) {
        this.triggerEvent("ringtoneChange", {
          value: selectedRingtone,
          option: defaultOption,
        })
      }
    },
  },

  methods: {
    onClockNameChange(e) {
      let clockName = e.detail.value || e.detail || ""
      clockName = clockName.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, "")
      this.setData({
        clockName: clockName,
      })
      this.triggerEvent("clockNameChange", {
        value: clockName,
      })
    },

    showPopup(e) {
      const { type } = e.currentTarget.dataset
      this.setData({
        dialogType: type,
      })

      if (type === "repeat") {
        const selected = this.data.selectedRepeat
        let selectedValues = []
        // day-repeat 表示每天，全选所有天
        if (selected === "day-repeat") {
          selectedValues = ["1", "2", "3", "4", "5", "6", "7"]
        } else if (selected && selected !== "once") {
          selectedValues = selected.split(",")
        } else if (
          (this.properties.editPropData || {}).isEditMode &&
          this.data.repeatText &&
          this.data.repeatText !== "仅一次"
        ) {
          if (this.data.repeatText === "每天") {
            selectedValues = ["1", "2", "3", "4", "5", "6", "7"]
          } else {
            const parsed = ClockUtils.parseRepeat(this.data.repeatText)
            selectedValues = parsed === "once" ? [] : parsed.split(",")
          }
        }

        this.setData({
          showDialog: true,
          dialogTitle: "重复",
          dialogOptions: this.data.repeatOptions,
          dialogSelectedValues: selectedValues,
          dialogMultiSelect: true,
        })
      } else if (type === "ringtone") {
        let selectedRingtoneValue = this.data.selectedRingtone
        if ((this.properties.editPropData || {}).isEditMode) {
          const ringtoneText = this.data.ringtoneText

          if (ringtoneText && ringtoneText !== "") {
            const matchedOption = this.data.ringtoneOptions.find(
              (option) => option.label === ringtoneText,
            )
            if (matchedOption) {
              selectedRingtoneValue = matchedOption.value
            }
          }
        }

        this.setData({
          showDialog: true,
          dialogTitle: "铃声",
          dialogOptions: this.data.ringtoneOptions,
          dialogSelectedValue: selectedRingtoneValue,
          dialogMultiSelect: false,
        })
      }
    },

    onDialogConfirm(e) {
      const { dialogType } = this.data

      if (dialogType === "repeat") {
        const { values, options } = e.detail
        let displayText = ""
        let selectedValue = ""

        if (values.length === 7) {
          displayText = "每天"
          selectedValue = "day-repeat"
        } else if (values.length > 0) {
          displayText = options.map((opt) => opt.label).join("、")
          selectedValue = values.join(",")
        } else {
          displayText = "仅一次"
          selectedValue = "once"
        }

        this.setData({
          selectedRepeat: selectedValue,
          repeatText: displayText,
          showDialog: false,
        })
        this.triggerEvent("repeatChange", { value: selectedValue, options })
      } else if (dialogType === "ringtone") {
        const { value, option } = e.detail
        this.setData({
          selectedRingtone: value,
          ringtoneText: option.label,
          showDialog: false,
        })
        this.triggerEvent("ringtoneChange", { value, option })
      }
    },

    onDialogCancel() {
      this.setData({
        showDialog: false,
        dialogType: "",
      })
    },
  },
})
