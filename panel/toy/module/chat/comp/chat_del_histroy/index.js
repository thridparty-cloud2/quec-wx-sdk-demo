const plugin = requirePlugin("quecPlugin")

Component({
  properties: {
    rolesList: {
      type: Array,
      value: [],
    },
  },

  data: {
    markerIcon: plugin.main.getRootImg() + "ai/new/corner_marker.png",
    showDialog: false,
    selectedOption: "current",
  },

  methods: {
    openDelDialog() {
      this.setData({
        showDialog: true,
        selectedOption: "current",
      })
    },

    closeDialog() {
      this.setData({
        showDialog: false,
      })
    },

    selectOption(e) {
      const option = e.currentTarget.dataset.option
      this.setData({
        selectedOption: option,
      })
    },

    confirmDelete() {
      const { selectedOption } = this.data
      this.triggerEvent("deleteConfirm", {
        type: selectedOption,
      })

      this.closeDialog()
    },
  },
})
