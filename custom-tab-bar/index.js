Component({
  data: {
    selected: null,
    color: "#646464",
    selectedColor: "#3C3C3C",
    borderStyle: "white",
    backgroundColor: "#ffffff",
    list: [
      {
        "pagePath": "/pages/home/home",
        "iconPath": "sdk-icon home",
        "selectedIconPath": "sdk-icon home2",
        "text": "首页"
      },
      {
        "pagePath": "/pages/mine/mine",
        "iconPath": "sdk-icon my",
        "selectedIconPath": "sdk-icon my2",
        "text": "我的"
      }
    ]
  },
  methods: {
    /**
     * tabbar切换
     */
    switchTab (e) {
      wx.nextTick(() => {
        this.pageRouter.switchTab({
          url: e.currentTarget.dataset.path
        })
      })

    }
  }
})
