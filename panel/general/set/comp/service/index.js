const plugin = requirePlugin("quecPlugin");
let app = getApp();

let env = app.globalData.envData;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    from: {
      type: String,
    },
    curItem: {
      type: Object,
    },
    argsItem: {
      type: Object,
    },
    role: {
      type: Number,
    },
    functionTsl: {
      type: Object,
    },
    curIccId: {
      type: String,
      value: "",
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    baseImgUrl: plugin.main.getRootImg(),
    isShowService: true,
    apiShowStatus: {
      content: true,
      print: true,
    },
    funcSwitchStatus: {
      content: false,
      print: false,
    },
    meta: env["metaData"],
    serviceData: [
      {
        title: env["appid"] == "wx803cf0e39e2c0d88" ? "流量充值" : "设备流量",
        img: plugin.main.getRootImg() + "ai/new/set/service1.png",
        event: "flow",
        isShow: false,
        isLock: false,
        from: "",
        data: "",
      },
      {
        title: "电话推送",
        img: plugin.main.getRootImg() + "ai/new/set/service2.png",
        event: "tel",
        isShow: env["isPushTel"],
        isLock: false,
        from: "",
        data: "",
      },
      {
        title: "短信推送",
        img: plugin.main.getRootImg() + "ai/new/set/service3.png",
        event: "sms",
        isShow: env["isPushSms"],
        isLock: false,
        from: "",
        data: "",
      },
      {
        title: "内容服务",
        img: plugin.main.getRootImg() + "ai/new/set/service4.png",
        event: "content",
        isShow: true,
        isLock: false,
        from: "ai",
        data: "",
      },
      // {
      //   title: "AI资源包",
      //   img: plugin.main.getRootImg() + 'ai/new/set/service5.png',
      //   event: 'usage',
      //   isShow: true,
      //   isLock: false,
      //   from: 'ai',
      //   data: ''
      // },
      {
        title: "声纹识别",
        img: plugin.main.getRootImg() + "ai/new/set/service6.png",
        event: "print",
        isShow: true,
        isLock: false,
        from: "ai",
        data: "",
      },
      {
        title: "声音克隆",
        img: plugin.main.getRootImg() + "ai/new/set/service7.png",
        event: "repeat",
        isShow: true,
        isLock: false,
        from: "ai",
        data: "",
      },
    ],
    isSimFlow: false, // 默认false，saas后台开通true进入充值界面，false 进入原来续费界面
  },

  lifetimes: {
    ready: function () {
      let self = this;

      if (JSON.stringify(this.properties.argsItem) !== "{}") {
        self.isShowOnDemand();
        self.getVoicePrintStatus();
        self.getVoiceCopyStatus();
      }

      if (self.properties.role || JSON.stringify(self.properties.argsItem) !== "{}") {
        let role = self.properties.role;
        console.log(role);
        console.log(typeof role);
        let argsItem = self.properties.argsItem;

        self.changeLock(
          "tel",
          role == 3 || argsItem.shareCode ? false : env["isPushTel"],
          false,
          "",
        );
        self.changeLock(
          "sms",
          role == 3 || argsItem.shareCode ? false : env["isPushSms"],
          false,
          "",
        );
      }
    },
  },

  observers: {
    functionTsl: function (newVal) {
      this.getFuncShowStatus();
    },

    curIccId: function (newVal) {
      if (newVal && typeof newVal === "string" && !this.properties.curItem.shareCode) {
        this.updateSimCardFlowShowStatus(true);
      } else {
        this.updateSimCardFlowShowStatus(false);
      }
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 解析functionTsl物模型获取开关状态
     */
    getFuncShowStatus() {
      const self = this;
      const { functionTsl } = self.properties;
      let contentTslShow = false;
      let printTslShow = false;

      if (functionTsl && Array.isArray(functionTsl.specs)) {
        const isTslValShow = (vdata) =>
          vdata !== undefined && vdata !== null && String(vdata) === "true";
        functionTsl.specs.forEach((item) => {
          if (item.code === "contentService") {
            contentTslShow = isTslValShow(item.vdata);
          } else if (item.code === "voiceprint") {
            printTslShow = isTslValShow(item.vdata);
          }
        });
      }
      self.setData({
        "funcSwitchStatus.content": contentTslShow,
        "funcSwitchStatus.print": printTslShow,
      });
      self.updateFinalShowStatus("content");
      self.updateFinalShowStatus("print");
    },

    updateFinalShowStatus(type) {
      const { apiShowStatus, funcSwitchStatus } = this.data;
      const isShow = apiShowStatus[type] && funcSwitchStatus[type];
      this.updateShowStatus(type, isShow);
    },

    updateSimCardFlowShowStatus(show) {
      this.updateShowStatus("flow", show);
    },

    updateShowStatus(type, isShow) {
      const { serviceData } = this.data;
      let needUpdate = false;
      serviceData.forEach((f) => {
        if (f.event === type && f.isShow !== isShow) {
          f.isShow = isShow;
          needUpdate = true;
        }
      });
      if (needUpdate) {
        this.setData({ serviceData });
        this.refreshIsShowService();
      }
    },

    /**
     * 刷新 isShowService 状态
     */
    refreshIsShowService() {
      let self = this;
      let sData = self.data.serviceData.filter((m) => {
        return m.isShow == true;
      });

      self.setData({
        isShowService: sData.length > 0 ? true : false,
      });
    },

    /**
     * 是否展示 内容服务
     */
    isShowOnDemand() {
      let self = this;
      let { argsItem } = self.properties;
      plugin.ai.isShowOnDemand({
        productKey: argsItem.productKey,
        deviceKey: argsItem.deviceKey,
        success(res) {
          /**isShow- 是否在产品里开启内容服务 true开启，false未开启
           * isEnable - true 可直接使用APP点播,
           * isEnable - false 需要购买
           */
          if (res.data) {
            let rData = res.data;
            self.setData({
              "apiShowStatus.content": rData.isShow,
            });

            const finalShow = rData.isShow && self.data.funcSwitchStatus.content;

            if (rData.isShow && rData.isEnable) {
              self.changeLock("content", finalShow, false, "");
            } else {
              self.changeLock("content", finalShow, true, "");
            }
          }
        },
        fail(res) {},
      });
    },

    /**
     * 是否展示 声纹识别
     */
    getVoicePrintStatus() {
      let self = this;
      let { argsItem } = self.properties;
      plugin.ai.getVoicePrintStatus({
        productKey: argsItem.productKey,
        success(res) {
          /**
           * configContent - 配置内容: true-开 false-关
           * associatedIds-当前用户购买的声纹信息ID列表
           * - 当前字段有值时，打开声纹配置页
           * - 当前字段无值时，打开购买页
           */
          if (res.data) {
            let rData = res.data;
            self.setData({
              "apiShowStatus.print": rData.configContent,
            });
            const finalShow = rData.configContent && self.data.funcSwitchStatus.print;

            if (rData.configContent && rData.associatedIds && rData.associatedIds.length > 0) {
              self.changeLock("print", finalShow, false, rData.associatedIds[0]);
            } else {
              self.changeLock("print", finalShow, true, rData.associatedIds[0]);
            }
          }
        },
      });
    },

    /**
     * 声音复刻
     */
    getVoiceCopyStatus() {
      let self = this;
      let { argsItem } = self.properties;
      plugin.ai.getAiVoiceCopyStatus({
        productKey: argsItem.productKey,
        success(res) {
          if (res.data) {
            let rData = res.data;
            let enabled =
              rData.configContent == true || rData.configContent == "true" ? true : false;
            self.changeLock("repeat", enabled, enabled ? false : true, "");
          }
        },
        fail(res) {},
      });
    },

    /**
     * 是否解锁
     * @param {*} ev - 事件
     * @param {*} show-是否显示
     * @param {*} lock-是否解锁
     * @param {*} data-返回数据
     */
    changeLock(ev, show, lock, data) {
      let self = this;
      let { serviceData } = self.data;
      serviceData.forEach((f) => {
        if (f.event == ev) {
          f.isShow = show;
          f.isLock = lock;
          f.data = data;
        }
      });
      self.setData({
        serviceData,
      });

      let sData = self.data.serviceData.filter((m) => {
        return m.isShow == true;
      });

      self.setData({
        isShowService: sData.length > 0 ? true : false,
      });
    },

    /**
     * 去对应的功能页面
     * @param {*} e
     */
    goItem(e) {
      let self = this;
      let { argsItem } = self.properties;
      let item = e.currentTarget.dataset.item;
      let obj = {
        productKey: argsItem.productKey,
        deviceKey: argsItem.deviceKey,
        uid: argsItem.uid,
        deviceName: self.data.curItem.deviceName,
      };
      switch (item.event) {
        case "tel": //电话推送
          // Demo: valadd 已移除
          break;
        case "sms": //短信推送
          // Demo: valadd 已移除
          break;
        case "content": //内容服务
          if (item.isLock) {
            self.pageRouter.navigateTo({
              url: `/panel/toy/module/content/buy/index?item=${encodeURIComponent(
                JSON.stringify(obj),
              )}`,
            });
          } else {
            self.pageRouter.navigateTo({
              url: `/panel/toy/module/content/index/index?item=${encodeURIComponent(
                JSON.stringify(obj),
              )}`,
            });
          }
          break;
        case "print": //声纹识别
          if (item.isLock) {
            self.pageRouter.navigateTo({
              url: `/panel/toy/module/voice/print/buy/index?item=${encodeURIComponent(
                JSON.stringify(obj),
              )}&associatedIds=${encodeURIComponent(item.data)}`,
            });
          } else {
            self.pageRouter.navigateTo({
              url: `/panel/toy/module/voice/print/list/index?item=${encodeURIComponent(
                JSON.stringify(obj),
              )}&associatedIds=${encodeURIComponent(item.data)}`,
            });
          }
          break;
        case "repeat": //声音克隆
          self.pageRouter.navigateTo({
            url: `/panel/toy/module/voice/copy/list/index?item=${encodeURIComponent(
              JSON.stringify(obj),
            )}`,
          });
          break;
        case "flow": //设备流量
          if (self.data.isSimFlow) {
            self.pageRouter.navigateTo({
              url: `/panel/sim/page/recharge/index?item=${encodeURIComponent(
                JSON.stringify(obj),
              )}&iccId=${encodeURIComponent(this.properties.curItem.iccId)}&type=recharge`,
            });
          } else {
            self.pageRouter.navigateTo({
              url: `/panel/sim/page/flow/index?item=${encodeURIComponent(
                JSON.stringify(obj),
              )}&iccId=${encodeURIComponent(this.properties.curItem.iccId)}`,
            });
          }
          break;
      }
    },
  },
});
