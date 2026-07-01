const plugin = requirePlugin("quecPlugin")

let OPEN_INDEX = null

Component({
  properties: {
    // 闹钟数据
    clocks: {
      type: Object,
      value: {},
    },
    // 右侧宽度
    rightWidth: {
      type: Number,
      value: 65,
    },
    // 删除按钮颜色
    delColor: {
      type: String,
      value: "#ff4219",
    },
    // 删除按钮文案
    delWord: {
      type: String,
      value: "",
    },
  },

  data: {
    translateX: 0,
    transition: "none",
    startX: 0,
    startY: 0,
    isMoving: false,
    contentStyle: "",
    animatedTr: "transform 0.4s cubic-bezier(0.18, 0.89, 0.32, 1)",
    switchCheck: false,
    switchOpacity: 1,
    switchDisabled: false,
    clockRepeat: "",
    clockTime: "",
    clockName: "",
  },

  methods: {
    getTransformStyle(translateX, transition) {
      return `transform: translateX(${translateX}px); -webkit-transform: translateX(${translateX}px); transition: ${transition}; -webkit-transition: ${transition};`
    },

    updateContentStyle(
      translateX = this.data.translateX,
      transition = this.data.transition,
    ) {
      const contentStyle = this.getTransformStyle(translateX, transition)
      const rightWidth = this.getRightWidth()
      const fadeStartDistance = 30
      const opacity =
        translateX >= -fadeStartDistance
          ? 1
          : Math.max(
              0,
              1 + (translateX + fadeStartDistance) / (rightWidth - fadeStartDistance),
            )
      const switchDisabled = translateX < 0

      this.setData({ contentStyle, switchOpacity: opacity, switchDisabled })
    },

    getRightWidth() {
      return this.properties.rightWidth || 65
    },

    /**
     * 触摸开始
     */
    onTouchStart(e) {
      const touch = e.touches[0]
      if (OPEN_INDEX && OPEN_INDEX !== this) {
        OPEN_INDEX.resetSwipe()
      }
      this.setData({
        startX: touch.clientX,
        startY: touch.clientY,
        transition: "none",
        isMoving: false,
      })
    },

    /**
     * 触摸移动
     */
    onTouchMove(e) {
      const touch = e.touches[0]
      const deltaX = touch.clientX - this.data.startX
      const deltaY = touch.clientY - this.data.startY
      const absDeltaX = Math.abs(deltaX)
      const absDeltaY = Math.abs(deltaY)
      if (!this.data.isMoving) {
        if (absDeltaX > absDeltaY && absDeltaX > 10) {
          this.setData({ isMoving: true })
        } else if (absDeltaY > 10) {
          return
        }
      }
      if (this.data.isMoving) {
        const rightWidth = this.getRightWidth()
        const translateX = Math.max(Math.min(deltaX, 0), -rightWidth)
        const transition = this.data.animatedTr
        const switchDisabled = translateX < 0
        this.setData({ translateX, transition, switchDisabled })
      }
    },

    /**
     * 触摸结束
     */
    onTouchEnd(e) {
      if (!this.data.isMoving) return
      const rightWidth = this.getRightWidth()
      const threshold = rightWidth / 2
      const shouldOpen = Math.abs(this.data.translateX) > threshold
      const translateX = shouldOpen ? -rightWidth : 0

      if (shouldOpen) {
        OPEN_INDEX = this
      } else {
        if (OPEN_INDEX === this) {
          OPEN_INDEX = null
        }
      }

      this.setData({ translateX, isMoving: false })
    },

    /**
     * 重置滑动状态
     */
    resetSwipe() {
      const transition = this.data.animatedTr
      if (OPEN_INDEX === this) {
        OPEN_INDEX = null
      }
      this.setData({
        translateX: 0,
        transition,
        switchOpacity: 1,
        switchDisabled: false,
      })
    },

    onDelete() {
      this.triggerEvent("delete", {
        id: this.properties.clocks.id,
      })
    },

    switchChange(e) {
      if (this.data.switchDisabled) {
        return
      }
      const checked = e.detail
      this.setData({ switchCheck: checked })

      this.triggerEvent("switch", {
        id: this.properties.clocks.id,
        clockType: this.properties.clocks.clockType,
        clockDayOfWeek: this.properties.clocks.clockRepeat,
        clockTimers: this.properties.clocks.clockTimers,
        switchCheck: checked,
      })
    },

    toEditClock() {
      this.triggerEvent("edit", {
        id: this.properties.clocks.id,
      })
    },

    preventBubble() {},
  },

  observers: {
    "translateX, transition": function (translateX, transition) {
      this.updateContentStyle(translateX, transition)
    },
    clocks: function (newClocks) {
      if (newClocks && Object.keys(newClocks).length !== 0) {
        this.setData({
          switchCheck: newClocks.switchCheck || false,
          clockRepeat: newClocks.clockRepeat || "",
          clockTime: newClocks.clockTime || "",
          clockName: newClocks.clockName || "",
        })
      } else {
        this.setData({
          switchCheck: false,
          clockRepeat: "",
          clockTime: "",
          clockName: "",
        })
      }
    },
  },

  lifetimes: {
    attached() {
      this.updateContentStyle()
    },
  },
})
