const plugin = requirePlugin("quecPlugin")

const TASK_CATEGORY_TYPE = {
  1: "生活习惯",
  2: "学习探索",
  3: "社交礼仪",
  4: "安全防护",
}

Component({
  properties: {
    editData: {
      type: Object,
      value: {},
    },
  },

  data: {
    categoryTypeText: "",
    fieldDisabled: true,
  },

  lifetimes: {},

  observers: {
    editData(data) {
      const label = TASK_CATEGORY_TYPE[Number(data?.categoryType)] || ""
      this.setData({ categoryTypeText: label })
    },
  },

  methods: {},
})
