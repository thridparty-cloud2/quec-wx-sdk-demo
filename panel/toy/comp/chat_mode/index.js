const plugin = requirePlugin("quecPlugin");

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    curItem: {
      type: Object,
    },
    visible: {
      type: Boolean,
    },
    chatModeObj: {
      type: Object,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    show: false,
    selectedValue: null,
  },
  pageLifetimes: {},
  observers: {
    chatModeObj(newChatModeObj) {
      // 当chatModeObj变化时，初始化selectedValue为当前值
      if (newChatModeObj && newChatModeObj.vdata !== undefined) {
        this.setData({
          selectedValue: newChatModeObj.vdata,
        });
      }
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 选择模式
     */
    selectMode(e) {
      const value = e.detail;
      this.setData({
        selectedValue: value,
      });
    },

    /**
     * 确认选择
     */
    onConfirm() {
      let self = this;
      let { curItem } = self.properties;
      const { selectedValue } = self.data;

      if (selectedValue === null || selectedValue === undefined) {
        wx.showToast({
          title: "请选择聊天模式",
          icon: "none",
        });
        return;
      }

      if (
        curItem?.productKey === undefined ||
        curItem?.deviceKey === undefined
      ) {
        return;
      }
      wx.nextTick(() => {
        let pk = curItem.productKey;
        let dk = curItem.deviceKey;
        let sendData = [
          {
            [self.properties.chatModeObj.code]: selectedValue,
          },
        ];
        let type = "WRITE-ATTR";
        plugin.jsUtil.load(10000);
        plugin.socket.send({
          pk,
          dk,
          type,
          sendData,
          success(res) {
            plugin.ai.agentParamConfig({
              deviceKey: dk,
              productKey: pk,
              configParams: [
                {
                  type: "chatModeSt", //wakeWord-唤醒词/chatModeSt-聊天模式,
                  data: selectedValue,
                },
              ],
              success(res) {
                // 配置成功后关闭弹窗
                self.triggerEvent("closeChatModeHandleVisible", {
                  reason: "confirm",
                });
              },
              fail(res) {
                self.triggerEvent("closeChatModeHandleVisible", {
                  reason: "fail",
                });
              },
              complete(res) {},
            });
          },
          fail(res) {},
        });
      });
    },

    onClose() {
      // 重置选中值到初始状态
      if (
        this.properties.chatModeObj &&
        this.properties.chatModeObj.vdata !== undefined
      ) {
        this.setData({
          selectedValue: this.properties.chatModeObj.vdata,
        });
      }
      this.triggerEvent("closeChatModeHandleVisible", { reason: "userClick" });
    },
  },
});
