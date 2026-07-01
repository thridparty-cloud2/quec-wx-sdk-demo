Component({
  pageRouter: getApp().globalData.pageRouter,

  properties: {
    // 是否显示返回按钮
    showBack: {
      type: Boolean,
      value: true,
    },
    // 选中的日期
    selectedDate: {
      type: String,
      value: "",
    },
    // 来源页面标识
    from: {
      type: String,
      value: "",
    },
    // 返回URL
    backUrl: {
      type: String,
      value: "",
    },
    // 是否为Tab页面
    isTab: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    arrowDirection: "down", // 'up' 或 'down'
  },

  methods: {
    back() {
      let self = this;
      if (self.data.from == "ai" || self.data.from == "upgrade") {
        self.triggerEvent("BackTip");
      } else {
        if (self.data.backUrl) {
          if (self.data.isTab) {
            this.pageRouter.switchTab({
              url: self.data.backUrl,
            });
          } else {
            this.pageRouter.redirectTo({
              url: self.data.backUrl,
            });
          }
        } else {
          this.pageRouter.navigateBack({
            delta: 1,
          });
        }
      }
    },

    openCalendar() {
      const newDirection = this.data.arrowDirection === "down" ? "up" : "down";
      this.setData({
        arrowDirection: newDirection,
      });
      this.triggerEvent("showCalendar");
    },

    resetArrowDirection() {
      this.setData({
        arrowDirection: "down",
      });
    },
  },
});
