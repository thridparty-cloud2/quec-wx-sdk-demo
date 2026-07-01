const plugin = requirePlugin("quecPlugin");
import { home } from "../../../../utils/jump.js";
import { getTslAttr, attrValAssign } from "../../../common/tool.js";
import eventBus from "../../../common/eventBus.js";

let app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    i18n: "",
    skin: "",
    curIccId: "",
    curItem: {},
    renameVisible: false,
    modeHandleVisible: false,
    chatModeHandleVisible: false,
    wakeWordHandleVisible: false,
    argsItem: {},
    baseImgUrl: plugin.main.getRootImg(),
    defaultImg:
      plugin.main.getBaseImgUrl() + "images/device/device_default.png",
    role: "",
    instructUrl: "",
    from: "",
    wsReport: "",
    setHei: 400,

    constTsl: [
      "wakeWord",
      "chargeStatusSt",
      "chatModeSt",
      "deviceModeSt",
      "batteryPercentSt",
      "function",
    ], //唤醒词、充电状态、聊天模式、设备模式、电量

    wakeWordTsl: undefined, //唤醒词物模型
    chargeStatusStTsl: undefined, //充电状态物模型
    chatModeStTsl: undefined, //聊天模式物模型
    deviceModeStTsl: undefined, //设备模式物模型
    batteryPercentStTsl: undefined, //电量物模型
    functionTsl: undefined, //功能展示物模型

    env: app.globalData.envData,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let self = this;
    self.setData({
      i18n: plugin.main.getLang(),
      skin: plugin.main.getSkin(),
      setHei: wx.getWindowInfo().safeArea.bottom - 50 - 100,
    });

    if (options.item) {
      self.setData({
        argsItem: JSON.parse(decodeURIComponent(options.item)),
      });
    }

    if (options.from) {
      self.setData({
        from: options.from,
      });
    }

    // AI 处理上报数据，实时更新页面显示
    eventBus.on("updateAiWsReport", (wsReport) => {
      console.log("%c[WS] 监听到设备主动上报", "color:green", wsReport);
      self.handleWsReport(wsReport);
    });

    // AI 处理上报数据，实时更新页面显示
    eventBus.on("wsAiDstatus", (status) => {
      console.log("%c[WS] 设备状态", "color:green", status);
      let { curItem } = self.data;
      curItem.onlineStatus = status;
      self.setData({
        curItem,
      });
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    let self = this;
    if (JSON.stringify(self.data.argsItem) !== "{}") {
      self.initRole();
      self.getDeviceInfo();
      self.getInstructUrl();

      if (app.globalData.appStatus == "front") {
        self.reconnectWsV2();
        wx.nextTick(() => {
          app.globalData.appStatus = "";
        });
      }
    }
  },

  /**
   * 关闭ws
   */
  closeWsSocket() {
    eventBus.emit("tryCloseWsSocket");
  },

  /**
   * 重连
   */
  reconnectWsV2() {
    eventBus.emit("reconnectWsV2");
  },

  /**
   * 初始化权限
   */
  initRole() {
    let self = this;
    plugin.core.getMode({
      success(res) {
        if (res.data.enabledFamilyMode) {
          plugin.core.getFid({
            success(res) {
              self.setData({
                role: Number(res.memberRole),
              });
            },
          });
        } else {
          self.setData({
            role: "",
          });
        }
      },
      fail(res) {},
      complete(res) {},
    });
  },

  /**
   * 获取设备信息
   */
  getDeviceInfo() {
    let self = this;
    let { argsItem } = self.data;
    plugin.quecManage.deviceInfo({
      pk: argsItem.productKey,
      dk: argsItem.deviceKey,
      success(res) {
        if (res.data) {
          self.setData({
            curItem: res.data,
          });
          self.getTslInfo(res.data);
        }
      },
    });
  },

  /**
   * 解绑设备 / 重命名成功
   * 注：wxml 中 dname 组件的 bindrenameSuccess 也指向此处理函数
   */
  unbindSuccess() {
    this.setData({
      renameVisible: false,
    });
    wx.nextTick(() => {
      home(this);
    });
  },

  /**
   * 重命名
   */
  rename() {
    this.setData({
      renameVisible: true,
    });
  },
  /**
   * 渲染WS上报数据
   * @param {*} wsReport
   */
  handleWsReport(wsReport) {
    // console.log('handleWsReport:')
    // console.log(wsReport)
    let self = this;
    let constTsl = self.data.constTsl;
    let newVal = wsReport;
    for (let nv of newVal) {
      if (constTsl.indexOf(nv.code) >= 0) {
        self.setData({
          [`${nv.code}Tsl`]: nv,
        });
      }
    }
  },
  /**
   * ai-展示设备模式
   */
  openModeHandleVisible() {
    let { curItem } = this.data;
    // 检查设备是否离线
    if (curItem.onlineStatus !== 1) {
      return plugin.jsUtil.tip("设备已离线，请稍后再试");
    }
    this.setData({
      modeHandleVisible: true,
    });
  },
  closeModeHandleVisible() {
    this.setData({
      modeHandleVisible: false,
    });
  },
  /**
   * ai-展示聊天模式弹框
   */
  openChatModeHandleVisible() {
    // 检查设备是否离线
    let { curItem } = this.data;
    if (curItem.onlineStatus !== 1) {
      return plugin.jsUtil.tip("设备已离线，请稍后再试");
    }
    this.setData({
      chatModeHandleVisible: true,
    });
  },
  closeChatModeHandleVisible() {
    this.setData({
      chatModeHandleVisible: false,
    });
  },
  /**
   * ai-展示唤醒词弹框
   */
  openWakeWordHandleVisible() {
    let { curItem } = this.data;
    // 检查设备是否离线
    if (curItem.onlineStatus !== 1) {
      return plugin.jsUtil.tip("设备已离线，请稍后再试");
    }
    this.setData({
      wakeWordHandleVisible: true,
    });
  },
  closeWakeWordHandleVisible() {
    this.setData({
      wakeWordHandleVisible: false,
    });
  },

  /**
   * 去设备告警页面
   */
  goAlarm(e) {
    this.pageRouter.navigateTo({
      url: `/panel/general/alarm/index?item=${encodeURIComponent(
        JSON.stringify(e.currentTarget.dataset.item),
      )}`,
    });
  },

  /**
   * 产品说明书 url
   */
  getInstructUrl() {
    let self = this;
    let { argsItem } = self.data;
    plugin.quecManage.getProductManual({
      pk: argsItem.productKey,
      success(res) {
        if (res.data && res.data.url) {
          self.setData({
            instructUrl: res.data.url,
          });
        }
      },
    });
  },

  // 获取tsl数据
  getTslInfo(newCurItem) {
    let self = this;
    if (
      newCurItem?.productKey === undefined ||
      newCurItem?.deviceKey === undefined
    ) {
      return;
    }
    getTslAttr({
      pk: newCurItem.productKey,
      dk: newCurItem.deviceKey,
      success(res) {
        const { propData, custData } = res;
        let fmtData = attrValAssign(propData, custData);
        //898608681025D0373007
        self.setData({
          "curItem.iccId": custData.deviceData.iccId
            ? custData.deviceData.iccId
            : "",
          curIccId: custData.deviceData.iccId ? custData.deviceData.iccId : "",
        });
        self.handleWsReport(fmtData);
      },
      fail(fail) {},
    });
  },

  /**
   * Ai-我的订单
   */
  goOrder() {
    this.pageRouter.navigateTo({
      url: "/panel/toy/module/order/list/index",
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},
});
