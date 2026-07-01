Component({
  properties: {
    lightSpots: {
      type: Array,
      value: [],
      observer: "updateCircles",
    },
  },

  data: {
    circles: [],
    dots: [{ class: "dot1" }, { class: "dot2" }, { class: "dot3" }],
  },

  methods: {
    updateCircles(newVal) {
      const totalCircles = 6
      const circles = []

      if (newVal && newVal.length > 0) {
        for (let i = 0; i < Math.min(newVal.length, totalCircles); i++) {
          const item = newVal[i]
          const name = typeof item?.name === "string" ? item.name : ""
          const isChinese = /[\u4e00-\u9fa5]/.test(name)
          const textVal = name
            ? isChinese && name.length > 3
              ? name.slice(0, 2) + "\n" + name.slice(2)
              : name
            : `${i + 1}\n号`
          circles.push({
            class: `c${i + 1}`,
            text: textVal,
            sort: item.sort || i + 1,
          })
        }
      }

      for (let i = circles.length; i < totalCircles; i++) {
        circles.push({
          class: `c${i + 1}`,
          text: "",
          sort: i + 1,
        })
      }

      this.setData({ circles })
    },
  },

  lifetimes: {
    attached() {
      this.updateCircles(this.data.lightSpots)
    },
  },
})
