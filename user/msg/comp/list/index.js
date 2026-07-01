import resourceKeys from "../../../../utils/constant";

const plugin = requirePlugin("quecPlugin");

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    firstLabel: {
      type: Number,
      value: 3,
    },
    msgData: {
      type: Array,
      value: [],
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    msgData: [],
    i18n: "",
    skin: "",
    cFlag: true,
  },

  lifetimes: {
    ready: function () {
      let self = this;
      self.setData({
        i18n: plugin.main.getLang(),
        skin: plugin.main.getSkin(),
      });
    },
    detached: function () {},
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 去设备详情
     */
    goDeviceDetail(e) {
      let self = this;
      if (!self.data.cFlag) {
        return;
      }
      self.setData({
        cFlag: false,
      });
      let eItem = e.currentTarget.dataset.item;
      if (eItem.executeId) {
        self.readSingle(eItem.id);
        self.triggerEvent("LogDetail", eItem.executeId);
      } else if (eItem.logId) {
        self.readSingle(eItem.id);
        self.triggerEvent("AutoDetail", eItem.logId);
      } else if (
        eItem.contentLangs &&
        (eItem.contentLangs.includes("语音") ||
          eItem.contentLangs.includes(resourceKeys.VOICE))
      ) {
        self.readSingle(eItem.id);
        self.triggerEvent("OpenService", resourceKeys.VOICE);
      } else if (
        eItem.contentLangs &&
        (eItem.contentLangs.includes("短信") ||
          eItem.contentLangs.includes(resourceKeys.SMS))
      ) {
        self.readSingle(eItem.id);
        self.triggerEvent("OpenService", resourceKeys.SMS);
      } else {
        const pk = eItem.pk || eItem.productKey;
        const dk = eItem.dk || eItem.deviceKey;
        if (pk && dk) {
          eItem.pk = pk;
          eItem.dk = dk;
          self.getDeviceInfo(eItem);
        } else {
          self.readSingle(eItem.id);
        }
      }
      // 防止连续控制
      plugin.jsUtil.delayCb(() => {
        self.setData({ cFlag: true });
      }, 2 * 1000);
    },

    /**
     * 设备详情
     * @param {*} item
     */
    getDeviceInfo(item) {
      let self = this;
      plugin.quecManage.deviceInfo({
        pk: item.pk,
        dk: item.dk,
        success(res) {
          if (res.data && res.data.status !== 2) {
            let it = res.data;
            self.readSingle(item.id);
            wx.nextTick(() => {
              self.triggerEvent("goDetail", it);
            });
          } else {
            return plugin.jsUtil.tip(self.data.i18n["msgTip"]);
          }
        },
        fail(res) {
          self.readSingle(item.id);
        },
      });
      // plugin.quecManage.deviceInfo({
      //   pk: item.shareCode ? '' : item.pk,
      //   dk: item.shareCode ? '' : item.dk,
      //   shareCode: item.shareCode ? item.shareCode : '',
      //   success (res) {
      //     if (res.data && res.data.status !== 2) {
      //       let it = res.data
      //       self.readSingle(item.id)
      //       wx.nextTick(() => {
      //         self.triggerEvent('goDetail', it)
      //       })
      //     } else {
      //       return plugin.jsUtil.tip(self.data.i18n['msgTip'])
      //     }
      //   },
      //   fail (res) {
      //     self.readSingle(item.id)
      //   }
      // })
    },
    /**
     * 删除消息
     */
    delMsg(e) {
      let self = this;
      let item = e.currentTarget.dataset.item;
      plugin.msg.msgDelete({
        msgId: item.id,
        success(res) {
          if (res.code === 200) {
            plugin.jsUtil.tip(self.data.i18n["msgDelTip"], "success");
            plugin.jsUtil.delayCb(() => {
              self.triggerEvent("delSuccess", true);
              self.triggerEvent("noRead", self.properties.msgType);
            });
          }
        },
        fail(res) {},
      });
    },

    /**
     * 单个阅读
     */
    readSingle(ids) {
      let self = this;
      plugin.msg.readMsg({
        msgIdList: ids,
        firstLabelList: self.properties.firstLabel,
        success(res) {
          if (res.code === 200) {
            plugin.jsUtil.delayCb(() => {
              self.triggerEvent("readSuccess", true);
              self.triggerEvent("noRead", self.properties.msgType);
            });
          }
        },
        fail(res) {},
      });
    },
  },
});
