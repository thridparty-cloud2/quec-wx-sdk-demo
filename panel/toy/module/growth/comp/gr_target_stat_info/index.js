const plugin = requirePlugin("quecPlugin")

const STATUS_MAP = {
  pending: "未开始",
  in_progress: "进行中",
  complete: "已结束",
  deleted: "已删除",
}

Component({
  properties: {
    status: { type: String, value: "" },
    finishNum: { type: Number, value: 0 },
    continueNum: { type: Number, value: 0 },
    babyTask: { type: Object, value: {} },
  },

  data: {
    checkDayIcon: plugin.main.getRootImg() + "ai/new/task/accu_compl.png",
    taskConutIcon: plugin.main.getRootImg() + "ai/new/task/conti_compl.png",
    statusText: STATUS_MAP.pending,
    statusClass: "",
    showStatus: true,
  },

  lifetimes: {},

  observers: {
    status(s) {
      const txt = STATUS_MAP[s] || STATUS_MAP.pending
      let show = true
      let cls = ""
      if (s === "in_progress") {
        show = false
      } else if (s === "complete" || s === "deleted") {
        cls = "status-danger"
      }
      this.setData({ statusText: txt, statusClass: cls, showStatus: show })
    },
  },

  methods: {},
})
