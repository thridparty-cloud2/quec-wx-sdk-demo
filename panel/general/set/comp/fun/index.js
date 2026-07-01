const plugin = requirePlugin("quecPlugin");
let app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    curItem: {
      type: Object,
    },
    argsItem: {
      type: Object,
    },
    role: {
      type: Number,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    baseImgUrl: plugin.main.getRootImg(),
    role: "",
    env: app.globalData.envData,
  },

  pageLifetimes: {
    show: function () {},
    hide: function () {},
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 更多
     */
    more(e) {
      this.pageRouter.navigateTo({
        url: `/panel/general/set/more/index?item=${encodeURIComponent(JSON.stringify(e.currentTarget.dataset.item))}`,
      });
    },

    /**
     * 去设备分享管理页面
     */
    goShare(e) {
      // Demo: mode/share 已移除
    },
  },
});
