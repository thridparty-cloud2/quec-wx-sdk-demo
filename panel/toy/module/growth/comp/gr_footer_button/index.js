Component({
  externalClasses: ["custom-class"],
  properties: {
    text: {
      type: String,
      value: "确定",
    },
    disabled: {
      type: Boolean,
      value: false,
    },
  },
  methods: {
    handleTap() {
      if (this.data.disabled) return
      this.triggerEvent("click")
    },
  },
})
