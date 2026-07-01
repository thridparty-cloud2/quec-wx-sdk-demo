Component({
  properties: {
    show: {
      type: Boolean,
      value: false,
    },
    title: {
      type: String,
      value: "提示",
    },
    message: {
      type: String,
      value: "确认删除该任务？",
    },
    confirmText: {
      type: String,
      value: "确定",
    },
    cancelText: {
      type: String,
      value: "取消",
    },
    overlayStyle: {
      type: String,
      value: "background-color:rgba(0,0,0,.4);",
    },
    customClass: {
      type: String,
      value: "custom",
    },
    width: {
      type: String,
      value: "311px",
    },
    cancelButtonClass: {
      type: String,
      value: "cancel-btn",
    },
    confirmButtonClass: {
      type: String,
      value: "confirm-btn",
    },
    id: {
      type: String,
      value: "confirm-dialog",
    },
  },

  methods: {
    onConfirm() {
      this.triggerEvent("confirm")
    },
    onCancel() {
      this.triggerEvent("cancel")
    },
  },
})
