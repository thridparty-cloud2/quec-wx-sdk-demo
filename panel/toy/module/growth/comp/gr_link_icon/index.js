const plugin = requirePlugin("quecPlugin")

Component({
  properties: {
    babyInfo: {
      type: Object,
      value: {},
    },
  },

  data: {
    statIcon: plugin.main.getRootImg() + "ai/new/task/weekly_stat.png",
    girlIcon: plugin.main.getRootImg() + "ai/new/task/girl.png",
    boyIcon: plugin.main.getRootImg() + "ai/new/task/boy.png",
  },

  methods: {
    onTap(e) {
      const type = e.currentTarget.dataset.type
      this.triggerEvent("route", { type })
    },
  },
})
