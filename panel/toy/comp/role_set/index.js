import tConst from "../../js/homeConst.js";

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    device: {
      tyep: Object,
    },
    role: {
      type: Object,
    },
    chatReload: {
      type: Object,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    tConst: tConst,
    showMemory: false,
  },

  observers: {
    device: function (device) {
      if (!device) return;
      this.setData({
        showMemory: !device.shareCode,
      });
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 角色记忆
     */
    toRoleMemory() {
      let { device,role } = this.properties;
      console.log('角色记忆')
      console.log(role)
      let obj = {
        productKey: device.productKey,
        deviceKey: device.deviceKey,
      };
      this.pageRouter.navigateTo({
        url: `/panel/toy/module/role/memory/index?eUid=${encodeURIComponent(
          JSON.stringify(device.uid),
        )}&item=${encodeURIComponent(JSON.stringify(obj))}&role=${encodeURIComponent(JSON.stringify(role))}`,
      });
    },

    /**
     * 聊天记录
     */
    toChatHistroy() {
      let { device, role } = this.properties;

      this.pageRouter.navigateTo({
        url: `/panel/toy/module/chat/index/index?&item=${encodeURIComponent(JSON.stringify(device))}&role=${encodeURIComponent(
          JSON.stringify(role),
        )}`,
      });
    },

    /**
     * 角色设置
     */
    toRoleSet() {
      let { device, chatReload, role } = this.properties;
      console.log("role");
      console.log(role);
      let obj = {
        productKey: device.productKey,
        deviceKey: device.deviceKey,
        eUid: device.shareCode ? device.ownerUid : device.uid,
        isShareDevice: !!device.shareCode,
      };

      this.pageRouter.navigateTo({
        url: `/panel/toy/module/role/set/index/index?item=${encodeURIComponent(
          JSON.stringify(obj),
        )}&chatReloadObj=${encodeURIComponent(
          JSON.stringify(chatReload),
        )}&role=${encodeURIComponent(JSON.stringify(role))}`,
      });
    },
  },
});
