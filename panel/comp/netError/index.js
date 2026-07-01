const plugin = requirePlugin("quecPlugin");

let isNetConnected = true;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isBackBtn: {
      type: Boolean,
      value: true,
    },
    isConBtn: {
      type: Boolean,
      value: true,
    },
    conColor: {
      type: String,
      value: "#0091ff",
    },
    isWSV2Connected: {
      type: Boolean,
    },
    netErrorVis: {
      type: Boolean,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    baseImgUrl: plugin.main.getRootImg(),
    netErrorShow: false,
    timeoutTimer: null,
    isConnected: false,
  },

  lifetimes: {
    attached: function () {
      let self = this;

      // wx.onNetworkWeakChange(function (res) {
      //   console.log('弱网：')
      //   console.log(res.weakNet)
      //   console.log(res.networkType)
      // })

      wx.onNetworkStatusChange(function (res) {
        isNetConnected = res.isConnected;
        console.log("网络状态改变", res);
        let { netErrorShow } = self.data;
        try {
          if (isNetConnected) {
            if (!netErrorShow) {
              self.triggerEvent("Reconnect");
            }
          } else {
            if (!netErrorShow) {
              self.setData({
                netErrorShow: true,
              });
              self.triggerEvent("Manual");
            }
          }
        } catch (error) {
          console.error("数据获取失败", error);
        }
      });
    },
  },

  pageLifetimes: {
    show: function () {
      let self = this;
      let { isWSV2Connected } = self.properties;
      if (isWSV2Connected) {
        self.setData({
          netErrorShow: false,
        });
      }
    },
    hide: function () {},
  },

  observers: {
    netErrorVis: function (netErrorVis) {
      this.setData({
        netErrorShow: netErrorVis,
      });
    },
    netErrorShow: function (netErrorShow) {
      this.triggerEvent("NetErrShow", netErrorShow);
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 退出设备
     */
    exitToHome() {
      this.pageRouter.switchTab({
        url: "/pages/home/home",
      });
      this.setData({
        netErrorShow: false,
      });
      this.triggerEvent("Exit");
    },

    /**
     * 重新连接设备
     */
    reconnectPopup() {
      if (!isNetConnected) {
        return plugin.jsUtil.tip("请检查网络是否开启");
      }
      this.setData({
        netErrorShow: false,
      });
      plugin.jsUtil.load();
      this.triggerEvent("Reconnect", { isNetConnected });
    },
  },
});
