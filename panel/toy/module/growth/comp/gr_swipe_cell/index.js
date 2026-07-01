let OPEN_INDEX = null

Component({
  properties: {
    // 是否显示编辑/删除按钮
    showEdit: { type: Boolean, value: true },
    showDelete: { type: Boolean, value: true },

    // 操作区按钮宽度(px)
    editWidth: { type: Number, value: 60 },
    delWidth: { type: Number, value: 60 },

    // 按钮颜色与文案
    editColor: { type: String, value: "#FFB444" },
    delColor: { type: String, value: "#FF5555" },
    editText: { type: String, value: "编辑" },
    delText: { type: String, value: "删除" },

    task: { type: Object, value: null },

    // 是否禁用编辑/删除
    disableEdit: { type: Boolean, value: false },
    disableDelete: { type: Boolean, value: false },
  },

  data: {
    translateX: 0,
    transition: "none",
    startX: 0,
    startY: 0,
    isMoving: false,
    contentStyle: "",
    animatedTr: "transform 0.4s cubic-bezier(0.18, 0.89, 0.32, 1)",
    actions: [],
  },

  lifetimes: {
    attached() {
      this.updateContentStyle()
      this.updateActions()
    },
  },

  observers: {
    "showEdit, showDelete, disableEdit, disableDelete": function () {
      this.updateActions()
    },
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
      this.setData({ contentStyle })
    },

    updateActions() {
      const {
        showEdit,
        showDelete,
        disableEdit,
        disableDelete,
        editWidth,
        delWidth,
        editColor,
        delColor,
        editText,
        delText,
      } = this.properties
      const actions = [
        {
          type: "edit",
          show: showEdit,
          disabled: disableEdit,
          width: editWidth,
          color: editColor,
          text: editText,
          icon: "writing",
        },
        {
          type: "delete",
          show: showDelete,
          disabled: disableDelete,
          width: delWidth,
          color: delColor,
          text: delText,
          icon: "shanchu1",
        },
      ]
      this.setData({ actions })
    },

    getRightWidth() {
      return this.data.actions.reduce((width, action) => {
        return action.show ? width + action.width : width
      }, 0)
    },

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
        this.setData({ translateX, transition })
      }
    },

    onTouchEnd() {
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

    resetSwipe() {
      const transition = this.data.animatedTr
      if (OPEN_INDEX === this) {
        OPEN_INDEX = null
      }
      this.setData({
        translateX: 0,
        transition,
      })
    },

    buildActData() {
      const t = this.properties.task || {}
      return {
        taskName: t.taskName,
        taskIcon: t.taskIcon,
        categoryType: t.categoryType,
        growthTaskId: t.id,
        startTime: t.startTime,
        endTime: t.endTime,
        repeatDays: t.repeatDays,
      }
    },

    onEdit() {
      const detail = this.buildActData()
      this.resetSwipe()
      this.triggerEvent("edit", detail)
    },

    onDelete() {
      const detail = this.buildActData()
      this.resetSwipe()
      this.triggerEvent("delete", detail)
    },

    onActionTap(e) {
      const { type } = e.currentTarget.dataset
      const action = this.data.actions.find((a) => a.type === type)

      if (action && action.disabled) {
        return
      }

      const actionMap = {
        edit: this.onEdit,
        delete: this.onDelete,
      }
      const fnCall = actionMap[type]
      if (fnCall) {
        fnCall.call(this)
      }
    },

    onContentTap() {
      this.resetSwipe()
    },
  },

  observers: {
    "translateX, transition": function (translateX, transition) {
      this.updateContentStyle(translateX, transition)
    },
    "showEdit, showDelete, editWidth, delWidth, editColor, delColor, editText, delText":
      function () {
        this.updateActions()
      },
  },
})
