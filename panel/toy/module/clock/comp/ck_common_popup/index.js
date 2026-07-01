Component({
  properties: {
    // 弹窗显示隐藏
    show: {
      type: Boolean,
      value: false,
    },
    // 弹窗标题
    title: {
      type: String,
      value: "",
    },
    // 选项列表
    options: {
      type: Array,
      value: [],
    },
    // 当前选中的值（单选模式）
    selectedValue: {
      type: String,
      value: "",
    },
    // 当前选中的值数组（多选模式）
    selectedValues: {
      type: Array,
      value: [],
    },
    // 是否多选模式
    multiSelect: {
      type: Boolean,
      value: false,
    },
  },
  data: {
    tempSelectedValue: "",
    tempSelectedValues: [],
    displayedOptions: [],
  },
  observers: {
    "options, multiSelect, selectedValue, selectedValues": function () {
      this.updateTempSelected()
      this.updateDisplayedOptions()
    },
  },
  methods: {
    updateTempSelected() {
      if (this.properties.multiSelect) {
        this.setData({
          tempSelectedValues: this.properties.selectedValues || [],
        })
      } else {
        this.setData({
          tempSelectedValue: this.properties.selectedValue,
        })
      }
    },

    updateDisplayedOptions() {
      const opts = this.properties.options.map((item) => ({
        ...item,
        isSelected: this.properties.multiSelect
          ? this.data.tempSelectedValues.includes(item.value)
          : this.data.tempSelectedValue === item.value,
      }))
      this.setData({
        displayedOptions: opts,
      })
    },

    onSelectOption(e) {
      const { value } = e.currentTarget.dataset
      if (this.properties.multiSelect) {
        const tempValues = [...this.data.tempSelectedValues]
        const index = tempValues.indexOf(value)
        if (index > -1) {
          tempValues.splice(index, 1)
        } else {
          tempValues.push(value)
        }
        this.setData({
          tempSelectedValues: tempValues,
        })
        this.updateDisplayedOptions()
      } else {
        this.setData({
          tempSelectedValue: value,
        })
        this.updateDisplayedOptions()
      }
    },

    onCancel() {
      this.updateTempSelected()
      this.updateDisplayedOptions()
      this.triggerEvent("cancel")
    },

    onConfirm() {
      if (this.properties.multiSelect) {
        const selectedOptions = this.properties.options.filter((item) =>
          this.data.tempSelectedValues.includes(item.value),
        )
        this.triggerEvent("confirm", {
          values: this.data.tempSelectedValues,
          options: selectedOptions,
        })
      } else {
        const selectedOption = this.properties.options.find(
          (item) => item.value === this.data.tempSelectedValue,
        )
        this.triggerEvent("confirm", {
          value: this.data.tempSelectedValue,
          option: selectedOption,
        })
      }
    },

    onClose() {
      this.updateTempSelected()
      this.updateDisplayedOptions()
      this.triggerEvent("close")
    },
  },

  lifetimes: {
    attached() {
      this.updateTempSelected()
      this.updateDisplayedOptions()
    },
  },
})
