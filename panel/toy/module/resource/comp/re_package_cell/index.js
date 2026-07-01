const STATUS_MAP = {
  using: { class: "status-using", text: "使用中" },
  not_used: { class: "status-pending", text: "待使用" },
  used_up: { class: "status-usedup", text: "已用完" },
  expired: { class: "status-expired", text: "已过期" },
}

Component({
  properties: {
    item: {
      type: Object,
      value: {},
    },
  },

  data: {
    statusClass: "",
    statusText: "",
    contentClass: "",
  },

  observers: {
    "item.status": function (status) {
      if (!status) return
      const config = STATUS_MAP[status] || STATUS_MAP.using
      this.setData({
        statusClass: config.class,
        statusText: config.text,
        contentClass: status === "used_up" ? "content-usedup" : "",
      })
    },
  },

  methods: {},
})
