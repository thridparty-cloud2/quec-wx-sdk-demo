
const plugin = requirePlugin('quecPlugin')
let app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item: {
      type: Object,
      value: {}
    },
    isEdit: {//是否编辑
      type: Boolean,
      value: false
    },
    /**
     * 是否修改布局
     */
    isLayout: {
      type: Boolean,
      value: false
    },
    /**
     * 显示几栏
     */
    // layout: {
    //   type: Number,
    //   value: 2
    // },
    /**
     * 是否disabled
     */
    isDis: {
      type: Boolean,
      value: false
    },
    /**
    * 是否显示房间
    */
    isShare: {
      type: Boolean,
      value: false
    },
    /**是否家居模式 */
    mode: {
      type: Boolean
    }
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
    i18n: '',
    skin: '',
    item: {},
    env: app.globalData.envData
  },

  lifetimes: {
    attached: function () {
      let self = this
      self.setData({
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
