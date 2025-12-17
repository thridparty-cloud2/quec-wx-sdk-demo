const plugin = requirePlugin('quecPlugin')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item: {
      type: Object,
      value: {}
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    onlineStatus: plugin.jsConst.onlineStatus, //在线状态文案
    onlineStatusColor: plugin.jsConst.onlineStatusColor, //在线状态颜色
    deviceStatus: plugin.jsConst.deviceStatus,//设备状态 
    deviceStatusColor: plugin.jsConst.deviceStatusColor,//设备状态颜色
    deviceImg: plugin.main.getBaseImgUrl() + 'images/device/device_default.png',
  },

  lifetimes: {
    attached: function () {
      this.setData({
        i18n: plugin.main.getLang(),
        skin: plugin.main.getSkin(),
      })
    },
    detached: function () { }
  },


  /**
   * 组件的方法列表
   */
  methods: {

  }
})
