import riskConst from "../../js/riskConst.js";
const plugin = requirePlugin("quecPlugin");

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    device: {
      type: Object,
    },
    riskItem: {
      type: Object,
    },
    visible: {
      type: Boolean,
    },
    role: {
      type: Object,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    visible: false,
    riskConst: riskConst,
    skin: plugin.main.getSkin(),
    riskItem: {},
  },

  lifetimes: {
    ready: function () {
      // this.getList()
      // console.log(this.properties.riskItem)
      // this.setData({
      //   curItem: this.properties.riskItem
      // })
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     *关闭弹框
     */
    guideClose() {
      this.triggerEvent("Close", false);
      console.log("关闭弹框", riskConst);
    },

    /**
     * 一键引导
     */
    guideEv() {
      let self = this;
      let { device, role } = self.properties;
      self.guideClose();
      self.pageRouter.navigateTo({
        url: `/panel/toy/module/risk/detail/index?item=${encodeURIComponent(
          JSON.stringify(device)
        )}&role=${encodeURIComponent(JSON.stringify(role))}&riskId=${
          self.data.riskItem.id
        }&backToList=1`,
      });
    },
  },
});
