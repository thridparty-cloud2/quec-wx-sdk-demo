const plugin = requirePlugin("quecPlugin")

Component({
  properties: {
    weekTaskList: {
      type: Array,
      value: [],
    },
  },

  data: {
    doneIcon: plugin.main.getRootImg() + "ai/new/task/had_done.png",
    delOrEndIcon: plugin.main.getRootImg() + "ai/new/task/del_or_end.png",
    unfinishedIcon: plugin.main.getRootImg() + "ai/new/task/unfinished.png",
    emptyImg: plugin.main.getRootImg() + "example/images/ic_empty.png",

    isEmpty: false,
  },

  observers: {
    weekTaskList: function (list) {
      if (!list) return
      this.setData({
        isEmpty: list.length === 0,
      })
      console.log("weekTaskList", list)
    },
  },

  methods: {
    toTargetStat(e) {
      const taskItem = e.currentTarget.dataset.task
      this.triggerEvent("toTargetStat", taskItem)
    },
  },
})
