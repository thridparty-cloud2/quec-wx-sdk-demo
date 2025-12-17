let app = getApp();

Component({
  data: {
    selected: null,
    color: "#646464",
    selectedColor: "#3C3C3C",
    borderStyle: "white",
    backgroundColor: "#ffffff",
    list: [
      {
        pagePath: "/pages/home/home",
        iconPath: "sdk-icon home",
        selectedIconPath: "sdk-icon home2",
        text: "首页",
      },
      {
        pagePath: "/pages/mine/mine",
        iconPath: "sdk-icon my",
        selectedIconPath: "sdk-icon my2",
        text: "我的",
      },
    ],
    env: app.globalData.envData,
  },

  lifetimes: {
    attached: function () {
      // 在组件实例进入页面节点树时执行
      let self = this;
      let { env } = this.data;
      let tab = [
        {
          pagePath: "/pages/home/home",
          iconPath: "sdk-icon home",
          selectedIconPath: "sdk-icon home2",
          text: "首页",
        },
        {
          pagePath: "/pages/mine/mine",
          iconPath: "sdk-icon my",
          selectedIconPath: "sdk-icon my2",
          text: "我的",
        },
      ];
    },
    detached: function () {},
  },

  methods: {
    /**
     * tabbar切换
     */
    switchTab(e) {
      wx.nextTick(() => {
        this.pageRouter.switchTab({
          url: e.currentTarget.dataset.path,
        });
      });
    },
  },
});
