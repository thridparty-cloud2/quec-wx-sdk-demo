const plugin = requirePlugin("quecPlugin");
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isSet: {
      type: Boolean,
      value: false,
    },
    sHeight: {
      type: Number,
      value: 400,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    msgData: [],
    apiData: [],
    page: {
      page: 1,
      pageSize: 10,
    },
    active: 0,
    actName: "device",
    msgType: 1, //默认值通知
    i18n: "",
    total: 0,
    firstLabel: 3,
    deviceNoRead: 0,
    smartNoRead: 0,
    systemNoRead: 0,

    hasDataList: true,
    triggered: false,
    skin: "",
    isFinish: false,
    saveTop: wx.getWindowInfo().safeArea.top,
    noDataImg: plugin.main.getBaseImgUrl() + "images/device/ic_msg_empty_v2.png",
    env: app.globalData.envData,
  },

  lifetimes: {
    ready: function () {
      let self = this;
      self.setData({
        i18n: plugin.main.getLang(),
        skin: plugin.main.getSkin(),
        saveTop: wx.getWindowInfo().safeArea.top ? wx.getWindowInfo().safeArea.top : 40,
      });
      self.initShow();
    },
    detached: function () {
      this.setData({
        msgData: [],
        active: 0,
        msgType: 1,
      });
    },
  },

  observers: {
    isSet: function (isSet) {
      if (isSet) {
        this.refreshList();
      }
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    initShow() {
      this.data.msgData = [];
      this.data.active = 0;
      this.data.actName = "device";
      this.data.firstLabel = 3;
      this.getList();
      this.getNoMsg();
    },

    getNoMsg() {
      let self = this;
      plugin.msg.getMsgStatsV2({
        success(res) {
          let data = res.data;
          console.log("未读", data);

          self.setData({
            deviceNoRead: data.device.unRead,
            smartNoRead: data.smart.unRead,
            systemNoRead: data.system.unRead,
          });
        },
        fail(res) {},
      });
    },

    /**
     * tab切换
     */
    tabChange(event) {
      console.log(event);
      let self = this;
      let tab = event.detail;
      let page = `page.page`;
      self.setData({
        active: Number(tab.index),
        actName: tab.name,
        [page]: 1,
        msgData: [],
        apiData: [],
        hasDataList: false,
        isFinish: false,
      });
      self.changeTabIndex();
      self.getList();
    },

    /**
     * 修改tab active值
     */
    changeTabIndex() {
      let self = this;
      switch (self.data.actName) {
        case "device": //设备
          self.setData({
            firstLabel: 3,
          });
          break;
        case "smart": //智能
          self.setData({
            firstLabel: 2,
          });
          break;
        case "system": //系统
          self.setData({
            firstLabel: 1,
          });
          break;
      }
    },
    /**
     * 删除成功
     */
    delSuccess() {
      this.triggerEvent("delSuccess", true);
    },

    /**
     * 已读成功
     */
    readSuccess() {
      this.triggerEvent("readSuccess", true);
    },

    /**
     * 获取消息列表数据
     */
    getList() {
      let self = this;
      plugin.jsUtil.load(300);
      plugin.msg.getMsgList({
        page: self.data.page.page,
        pageSize: self.data.page.pageSize,
        firstLabelList: self.data.firstLabel,
        success(res) {
          if (res.data.list) {
            let newArr = [];
            let listD = res.data.list;
            listD.forEach((elm, i) => {
              elm.fmtHourTime = elm.addTime
                ? plugin.jsUtil.formatDate(new Date(elm.addTime), "hh:mm")
                : "";
              elm.dateTime = elm.addTime
                ? plugin.jsUtil.formatDate(new Date(elm.addTime), "yyyy年MM月dd日")
                : "";
              let index = -1;
              let isExists = newArr.some((item, j) => {
                if (elm.dateTime == item.dateTime) {
                  index = j;
                  return true;
                }
              });
              if (!isExists) {
                newArr.push({
                  dateTime: elm.dateTime,
                  list: [elm],
                });
              } else {
                newArr[index].list.push(elm);
              }
            });
            self.setData({
              msgData: self.data.msgData.concat(newArr),
              apiData: self.data.apiData.concat(listD),
            });
          }
          self.setData({
            total: res.data.total,
            hasDataList: res.data.total > 0,
          });
        },
        fail(res) {
          self.setData({
            hasDataList: false,
          });
        },
        complete(res) {
          plugin.jsUtil.hideTip();
          self.setData({
            triggered: false,
            isFinish: true,
          });
        },
      });
    },

    // 刷新列表
    refreshList() {
      let page = `page.page`;
      this.setData({
        [page]: 1,
        msgData: [],
        apiData: [],
        isFinish: false,
      });
      this.getList();
      //  this.getNoMsg()
    },

    // 加载更多
    getMoreList() {
      let self = this;
      if (self.data.apiData.length >= self.data.total) return;
      let page = `page.page`;
      self.setData({
        [page]: !self.data.hasDataList ? 1 : self.data.page.page + 1,
      });
      self.getList();
    },

    /**
     * 去设备详情
     * @param {*}
     */
    goDetail(e) {
      this.triggerEvent("goDetail", e.detail);
    },

    /**
     * 标记已读
     */
    readAll() {
      let self = this;
      plugin.msg.readMsg({
        firstLabelList: self.data.firstLabel,
        success(res) {
          if (res.code === 200) {
            plugin.jsUtil.delayCb(() => {
              self.triggerEvent("readSuccess", true);
              self.getNoMsg();
            });
          }
        },
        fail(res) {},
      });
    },

    /**
     * 返回
     */
    back() {
      this.triggerEvent("Back");
    },

    /**
     * 场景详情
     */
    LogDetail(e) {
      this.triggerEvent("LogDetail", e.detail);
    },

    /**
     * 自动化详情
     */
    AutoDetail(e) {
      this.triggerEvent("AutoDetail", e.detail);
    },
    OpenService(e) {
      this.triggerEvent("OpenService", e.detail);
    },
  },
});
