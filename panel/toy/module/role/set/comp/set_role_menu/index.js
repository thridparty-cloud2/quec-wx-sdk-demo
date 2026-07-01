const plugin = requirePlugin("quecPlugin")

Component({
  properties: {
    currentRoleInfo: {
      type: Object,
      value: {},
    },
    rolesList: {
      type: Array,
      value: [],
    },
  },

  data: {
    voiceIcon: plugin.main.getRootImg() + "ai/new/voice_config.png",
  },

  methods: {
    toVoiceConfig() {
      if (this.properties.rolesList.length !== 0) {
        this.triggerEvent("toVoiceConfig", this.properties.currentRoleInfo)
      }
    },
  },
})
