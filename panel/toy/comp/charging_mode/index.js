import { findEnumValueIndex } from "../../../common/tool.js";

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    chargingModeObj: {
      type: Object,
    },
    curItem: {
      type: Object,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    show: false,
    valueString: "",
  },
  pageLifetimes: {},
  observers: {
    chargingModeObj: function (chargingModeObj) {
      if (chargingModeObj?.specs) {
        const valueString =
          chargingModeObj.specs[findEnumValueIndex(chargingModeObj)]?.name ||
          "";
        this.setData({
          valueString: valueString,
        });
      } else {
        this.setData({
          valueString: "",
        });
      }
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 获取tsl数据
  },
});
