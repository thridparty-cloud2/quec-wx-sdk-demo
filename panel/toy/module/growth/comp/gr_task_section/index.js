const plugin = requirePlugin("quecPlugin")

Component({
  properties: {
    item: { type: Object, value: {} },
    si: { type: Number, value: 0 },
    isShareUser: { type: Boolean, value: false },
  },

  methods: {
    onExpand() {
      this.triggerEvent("expand", { index: this.properties.si })
    },

    onEdit(e) {
      const detail = e.detail || {}
      const status = (this.properties.item && this.properties.item.status) || undefined
      this.triggerEvent("edit", { type: "editTask", status, ...detail })
    },

    onDelete(e) {
      const detail = e.detail || {}
      const status = (this.properties.item && this.properties.item.status) || undefined
      this.triggerEvent("delete", { ...detail, status })
    },

    onStat(e) {
      const task = e.currentTarget.dataset.task
      this.triggerEvent("stat", { type: "targetStat", task })
    },
  },
})
