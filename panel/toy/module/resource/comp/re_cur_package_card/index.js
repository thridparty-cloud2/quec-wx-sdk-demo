const STATUS_MAP = {
  using: { class: "status-using", text: "使用中" },
  not_used: { class: "status-pending", text: "待使用" },
  used_up: { class: "status-usedup", text: "已用完" },
  expired: { class: "status-expired", text: "已过期" },
}

Component({
  properties: {
    curPackageStatus: {
      type: Boolean,
      value: true,
    },
    currentPackage: {
      type: Object,
      value: {},
    },
    isMoreThan: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    statusMap: STATUS_MAP,
  },

  methods: {
    toResourcePackageList() {
      if (!this.data.isMoreThan) return
      this.triggerEvent("toResourcePackageList")
    },
  },
})
