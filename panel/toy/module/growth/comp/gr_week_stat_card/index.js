const plugin = requirePlugin("quecPlugin")

Component({
  properties: {
    statNum: {
      type: Object,
      value: {},
    },
  },

  data: {
    checkDayIcon: plugin.main.getRootImg() + "ai/new/task/accu_compl.png",
    taskConutIcon: plugin.main.getRootImg() + "ai/new/task/conti_compl.png",
  },
})
