Component({
  properties: {
    currentRoleInfo: {
      type: Object,
      value: {},
    },
    defaultRoleInfo: {
      type: Object,
      value: {},
    },
    deviceRolePrompt: {
      type: String,
      value: "",
    },
    roleDetailLoading: {
      type: Boolean,
      value: false,
    },
  },

  methods: {
    toEditRole() {
      this.triggerEvent("toEditRole", this.properties.currentRoleInfo)
    },
  },
})
