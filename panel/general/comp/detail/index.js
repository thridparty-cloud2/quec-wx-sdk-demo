import * as TSLConfig from "../../tsl/util/tslConfig.js";
import { getTslAttr } from "../../../common/tool.js";
import { connect } from "../../../common/tool.js";
const plugin = requirePlugin("quecPlugin");
import eventBus from "../../../common/eventBus.js";

let isWsConnecting = false;
let app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    pk: {
      type: String,
      value: "",
    },
    dk: {
      type: String,
      value: "",
    },
    curItem: {
      type: Object,
      value: {},
    },
    textDetail: {
      type: Object,
    },
    noDataImg: {
      type: String,
      value: "",
    },
    wsBack: {
      type: Boolean,
    },
    wsCon: {
      type: Boolean,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    curItem: {},
    pk: "",
    dk: "",
    deviceData: {},
    attrData: [],
    TSLConfig: TSLConfig,
    noDataImg: "",
    deviceStatus: "",
    hasDataList: true,
    // 用户手动设置的当前值
    curAttrName: "",
    curAttrValue: "",
    sHeight: 500,
    i18n: "",
    isWSV2Connected: false,
    timeoutTimer: null,
    netErrorShow: false,
    netErrorVis: false,
    sendTimer: null,
    isSendSucc: false,
  },
  lifetimes: {
    ready: function () {
      let self = this;
      let { curItem } = self.properties;
      console.log("curItem:");
      console.log(curItem);
      let win = wx.getWindowInfo();
      self.setData({
        noDataImg: plugin.assetBase.getBaseImgUrl() + "images/device/ic_msg_empty_v2.png",
        sHeight: win.safeArea.bottom - 90,
        i18n: plugin.main.getLang(),
      });
      self.getDeviceStatus();
      self.getTslInfo();
      wx.nextTick(() => {
        self.reconnectWsV2();
      });
    },
    detached: function () {
      this.closeWsV2Socket();
    },
  },

  pageLifetimes: {
    show: function () {
      let self = this;
      if (JSON.stringify(self.data.textDetail) !== "{}") {
        let detail = self.data.textDetail;
        self.sendAttr({ detail });
      }
      if (app.globalData.appStatus == "front") {
        if (this.data.netErrorShow) {
          return;
        } else {
          self.reconnectWsV2();
          wx.nextTick(() => {
            app.globalData.appStatus = "";
          });
        }
      }
    },
    hide: function () {},
  },
  observers: {
    wsBack: function (wsBack) {
      if (wsBack) {
        this.exitToHome();
      }
    },
    wsCon: function (wsCon) {
      if (wsCon) {
        this.reconnectPopup();
      }
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 获取tsl数据
    getTslInfo() {
      let self = this;
      plugin.jsUtil.load();
      const { pk, dk } = self.data;
      getTslAttr({
        pk,
        dk,
        success(res) {
          const { propData, custData } = res;
          for (let alm of propData) {
            if (custData && custData.customizeTslInfo) {
              let valData = custData.customizeTslInfo;
              for (let vlm of valData) {
                if (vlm.resourceCode === alm.code) {
                  if (alm.dataType == TSLConfig.TSL_ATTR_DATA_TYPE_STRUCT) {
                    if (alm.specs && vlm.resourceValce) {
                      self.structFmt(alm.specs, vlm.resourceValce);
                    } else {
                      alm.vdata = "";
                    }
                  } else {
                    alm.vdata = vlm.resourceValce ? vlm.resourceValce : "";
                  }
                }
              }
            } else {
              alm.vdata = "";
            }
          }
          self.fmtAttrData(propData);
        },
        fail(fail) {
          plugin.jsUtil.invalidCb(fail, self);
        },
      });
    },

    /**
     *格式化数据
     */
    fmtAttrData(data) {
      let self = this;
      let read = data.filter((elm) => {
        return elm.subType == "R";
      });
      let bools = data.filter((elm) => {
        return elm.subType !== "R" && elm.dataType == "BOOL";
      });
      let enums = data.filter((elm) => {
        return elm.subType !== "R" && elm.dataType == "ENUM";
      });

      let dates = data.filter((elm) => {
        return elm.subType !== "R" && elm.dataType == "DATE";
      });

      let ints = data.filter((elm) => {
        return elm.subType !== "R" && elm.dataType == "INT";
      });

      let floats = data.filter((elm) => {
        return elm.subType !== "R" && elm.dataType == "FLOAT";
      });

      let doubles = data.filter((elm) => {
        return elm.subType !== "R" && elm.dataType == "DOUBLE";
      });

      let arrays = data.filter((elm) => {
        return elm.subType !== "R" && elm.dataType == "ARRAY";
      });

      let structs = data.filter((elm) => {
        return elm.subType !== "R" && elm.dataType == "STRUCT";
      });

      let other = data.filter((elm) => {
        return (
          elm.subType !== "R" &&
          elm.dataType !== "BOOL" &&
          elm.dataType !== "DATE" &&
          elm.dataType !== "ENUM" &&
          elm.dataType !== "INT" &&
          elm.dataType !== "FLOAT" &&
          elm.dataType !== "DOUBLE" &&
          elm.dataType !== "ARRAY" &&
          elm.dataType !== "STRUCT"
        );
      });

      let all = read
        .concat(bools)
        .concat(enums)
        .concat(dates)
        .concat(ints)
        .concat(floats)
        .concat(doubles)
        .concat(other)
        .concat(arrays)
        .concat(structs);

      self.setData({
        attrData: all,
      });
    },

    /**
     * 格式化结构体Value值
     * @param {*} attrData
     * @param {*} valData
     */
    structFmt(attrData, valData) {
      let valueData = JSON.parse(valData);
      for (let attr of attrData) {
        for (let key in valueData) {
          if (attr.code === key) {
            attr.vdata = valueData[key];
          }
        }
      }
    },

    /**
     * 编辑数组
     * 编辑文本
     * 编辑结构体
     * @param {*} dataType
     */
    toDetail(e) {
      if (this.data.deviceStatus === "离线" || this.data.deviceStatus === 0) {
        return plugin.jsUtil.tip(this.data.i18n["offLine"]);
      }
      this.triggerEvent("editpage", e.detail);
    },

    // 连接websocket
    initWs() {
      const self = this;
      self.loop();
      plugin.jsUtil.load(20000);
      const { pk, dk } = self.data;
      connect({
        userid: self.properties.curItem.uid,
        pk,
        dk,
        online(res) {
          console.log("online  在线状态 应答", res);
          plugin.jsUtil.hideTip();
          self.setData({
            isWSV2Connected: true,
            wsBack: false,
            wsCon: false,
          });
          self.triggerEvent("wsResult", {
            wsBack: false,
            wsCon: false,
          });
          plugin.jsUtil.delayCb(() => {
            isWsConnecting = false;
          }, 10000);
          //plugin.jsUtil.tip('连接成功')
          if (res.data) {
            self.setData({
              deviceStatus: res.data.value,
            });
            eventBus.emit("wsDeviceStatus", res.data.value);
          }
        },
        // 发送指令响应
        ask(res) {
          console.log("sendAck  发送指令响应 应答", res);
          if (res.status == "succ") {
            // 前端知道用户操作curModeName
            const { curAttrName } = self.data;
            self.setCurrentData(curAttrName);
          }
        },
        // 设备主动上报-接收更新
        report(res) {
          console.log("message  设备主动上报", res);
          if (res.data) {
            let reportData = res.data.kv;
            let attrData = self.data.attrData;
            for (const key in reportData) {
              attrData.forEach((item, index) => {
                if (item.code === key) {
                  let attrDataKey = `attrData[${index}].vdata`;
                  if (item.dataType === TSLConfig.TSL_ATTR_DATA_TYPE_ARRAY) {
                    let arrayCon = [];
                    for (const iterator of reportData[key]) {
                      arrayCon.push({
                        id: 0,
                        value: iterator,
                      });
                    }
                    self.setData({
                      [attrDataKey]: JSON.stringify(arrayCon),
                    });
                  } else if (item.dataType === TSLConfig.TSL_ATTR_DATA_TYPE_STRUCT) {
                    if (item.specs && item.specs.length > 0) {
                      item.specs.forEach((s) => {
                        for (const rkey in reportData[key]) {
                          if (s.code === rkey) {
                            s.vdata = reportData[key][rkey];
                          }
                        }
                      });
                      let sDataKey = `attrData[${index}]`;
                      self.setData({
                        [sDataKey]: item,
                      });
                    }
                  } else {
                    self.setData({
                      [attrDataKey]: reportData[key],
                    });
                  }
                }
              });
            }
          }
        },
        exception(res) {
          self.setData({ isWSV2Connected: false });
        },
      });
    },

    loop() {
      let self = this;
      let n = 10;
      self.data.timeoutTimer = setInterval(() => {
        let { isWSV2Connected } = self.data;
        if (isWSV2Connected == true) {
          self.clearTimeoutTimer();
        }
        if (n > 1) {
          n--;
        } else {
          n = 0;
          self.clearTimeoutTimer();
          self.setData({
            timeoutTimer: null,
          });
          plugin.jsUtil.hideTip();
          if (isWSV2Connected == false) {
            self.closeWsV2Socket();
            isWsConnecting = false;
            self.setData({
              netErrorVis: true,
            });
            let pages = getCurrentPages();
            pages.forEach((r) => {
              if (
                r.route &&
                (r.route == "panel/general/txt/index" ||
                  r.route == "panel/general/arr/index" ||
                  r.route == "panel/general/struct/index" ||
                  r.route == "panel/general/struct_txt/index")
              ) {
                r.setData({
                  netErrorVis: self.data.netErrorVis,
                });
              }
            });
          }
        }
      }, 1000);
    },

    /**
     * 清除超时定时器
     */
    clearTimeoutTimer() {
      let { timeoutTimer } = this.data;
      if (timeoutTimer) {
        clearInterval(timeoutTimer); //清除js定时器
        timeoutTimer = null;
        this.setData({
          timeoutTimer,
        });
      }
    },

    sendLoop() {
      let self = this;
      let n = 6;
      self.data.sendTimer = setInterval(() => {
        let { isSendSucc } = self.data;
        if (isSendSucc == true) {
          self.clearSendTimer();
        }
        if (n > 1) {
          n--;
        } else {
          n = 0;
          self.exitToHome();
          self.clearSendTimer();
          if (isSendSucc == false) {
            self.setData({
              netErrorVis: true,
            });
          }
        }
      }, 1000);
    },

    /**
     * 清除超时定时器
     */
    clearSendTimer() {
      let { sendTimer } = this.data;
      if (sendTimer) {
        clearInterval(sendTimer); //清除js定时器
        sendTimer = null;
        this.setData({
          sendTimer,
        });
      }
    },

    // 获取设备在离线状态
    getDeviceStatus() {
      if (this.data.curItem) {
        this.setData({
          deviceStatus: this.data.curItem.deviceStatus,
        });
      }
    },

    // 属性下发
    sendAttr(e) {
      let self = this;
      const { pk, dk, deviceStatus, i18n } = self.data;
      if (deviceStatus === "离线" || deviceStatus === "0") {
        return plugin.jsUtil.tip(i18n["offLine"]);
      }
      const { sendData, code, value } = e.detail;
      // 记录当前用户点击的物模型
      self.data.curAttrName = code;
      self.data.curAttrValue = value;
      if (!sendData || sendData.length === 0)
        return plugin.jsUtil.tip(self.data.i18n["noAattr"]);
      const type = TSLConfig.TSL_ATTR_DATA_WRITE_ATTR;
      // plugin.jsUtil.tip(this.data.i18n['loading'], 'loading')

      plugin.jsUtil.load(5000);
      self.sendLoop();
      plugin.socket.send({
        pk,
        dk,
        type,
        sendData,
        success(res) {
          self.setData({
            isSendSucc: true,
          });
          self.clearSendTimer();
        },
        fail(res) {
          self.setData({
            isSendSucc: false,
          });
        },
      });
    },
    // 返回成功才设置对应数值
    setCurrentData(modeCode, modeValue) {
      const self = this;
      const { attrData, curAttrValue } = self.data;
      if (!modeValue) {
        modeValue = curAttrValue;
      }
      attrData.forEach((item) => {
        if (item.code === modeCode) {
          if (item.dataType == "STRUCT") {
            if (modeValue && modeValue.length > 0) {
              modeValue.forEach((value) => {
                self.structFmt(item.specs, JSON.stringify(value));
              });
            }
          } else {
            item.vdata = modeValue;
          }
        }
      });
      self.setData({ attrData });
    },

    /**
     * 退出设备
     */
    exitToHome() {
      this.closeWsV2Socket();
    },

    /**
     * 重新连接设备
     */
    reconnectPopup() {
      let self = this;
      self.reconnectWsV2();
    },

    /**
     * 重新连接
     */
    reconnectWsV2() {
      if (isWsConnecting) {
        console.log("isWsConnecting -----> true");
        return;
      }
      isWsConnecting = true;
      this.closeWsV2Socket();
      this.initWs();
    },

    /**
     * 手动连
     */
    networkManual() {
      this.closeWsV2Socket();
    },

    getNetErrShow(e) {
      console.log(e);
      this.setData({
        netErrorShow: e.detail,
      });
    },

    /**
     * 断开
     */
    closeWsV2Socket() {
      plugin.socket.close();
    },
  },
});
