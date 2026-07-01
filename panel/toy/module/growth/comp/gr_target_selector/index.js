const plugin = requirePlugin("quecPlugin")

Component({
  properties: {
    targetList: {
      type: Array,
      value: [],
    },
    disabledIds: {
      type: Array,
      value: [],
    },
  },

  data: {
    checkIcon: plugin.main.getRootImg() + "ai/new/task/select_check.png",
    renderList: [],
    categoryMetaMap: {
      1: { name: "生活习惯", bgColor: "#FFF6E6" },
      2: { name: "学习探索", bgColor: "#ECF9FF" },
      3: { name: "社交礼仪", bgColor: "#FFF6FD" },
      4: { name: "安全防护", bgColor: "#F1FFF4" },
    },
  },

  lifetimes: {},

  observers: {
    targetList(list) {
      const metaMap = this.data.categoryMetaMap || {}
      const renderList = (list || []).map((cat) => {
        const meta = metaMap[cat.categoryType] || {}
        return {
          categoryType: cat.categoryType,
          categoryName: meta.name || "",
          bgColor: meta.bgColor || "#FFF6E6",
          tasks: (cat.growthTaskList || []).map((t) => ({
            id: t.id,
            name: t.taskName,
            iconUrl: t.taskIcon,
            selected: false,
            disabled: false,
          })),
          expanded: (cat.growthTaskList || []).length > 0,
        }
      })
      this.setData({ renderList }, () => {
        this.setDisabledTaskOption()
      })
    },
    disabledIds() {
      this.setDisabledTaskOption()
    },
  },

  methods: {
    onTabExpand(e) {
      const index = e.currentTarget.dataset.index
      const list = this.data.renderList.slice()
      list[index].expanded = !list[index].expanded
      this.setData({ renderList: list })
    },

    onTargetSelect(e) {
      const { cindex, index } = e.currentTarget.dataset
      const list = this.data.renderList.slice()
      const item = list[cindex].tasks[index]
      if (item.disabled) return
      list[cindex].tasks[index] = { ...item, selected: !item.selected }
      this.setData({ renderList: list })
      this.emitSelectedIds()
    },

    emitSelectedIds() {
      const list = this.data.renderList || []
      const ids = list.reduce((acc, cat) => {
        const selected = (cat.tasks || []).filter((t) => t.selected).map((t) => t.id)
        return acc.concat(selected)
      }, [])
      this.triggerEvent("selectChange", { selectedIds: ids })
    },

    setDisabledTaskOption() {
      const ids = new Set(this.properties.disabledIds || [])
      const list = (this.data.renderList || []).map((cat) => ({
        ...cat,
        tasks: (cat.tasks || []).map((t) => ({
          ...t,
          disabled: ids.has(t.id),
        })),
      }))
      this.setData({ renderList: list })
    },
  },
})
