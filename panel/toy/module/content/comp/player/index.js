import conConst from "../../../../js/conConst.js";
import eventBus from "../../../../../common/eventBus.js";
const plugin = requirePlugin("quecPlugin");
import { getTslAttr, attrValAssign } from "../../../../../common/tool.js";
import {
  playSend,
  covertImgUrl,
  getContentStorage,
  setContentStorage,
  buildContinuationOpts,
} from "../../../../js/content.js";

let app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    from: {
      //来源哪个页面
      type: String,
      value: "",
    },
    curDevice: {
      type: Object,
      value: {},
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    playShow: false,

    conConst: conConst,
    playObj: {},
    albumData: [],

    curIndex: "",
    isFirst: false,
    isLast: false,

    isPlay: false,

    constTsl: [
      "contentOnDemand",
      "switch",
      "continuationList",
      "newVersionField",
    ], //点播内容CODE
    contentOnDemandTsl: {}, //点播内容物模型
    switchTsl: {}, //开关物模型
    continuationListTsl: {}, //续播列表物模型
    newVersionFieldTsl: {}, //新版本字段物模型
  },

  lifetimes: {
    ready() {
      let self = this;
      if (JSON.stringify(self.properties.curDevice) !== "{}") {
        self.getTslInfo();
      }

      // 监听当前播放对象变化（保存引用，便于 detached 时精确注销）
      self._onPlayerChange = (playObj) => {
        //console.log('监听当前播放qi对象变化：', playObj)
        self.setData({
          playObj,
        });
        if (JSON.stringify(self.data.playObj) !== "{}") {
          self.getData();
        }
      };
      eventBus.on("playerChange", self._onPlayerChange);

      // AI 处理上报数据，实时更新页面显示
      self._onWsReport = (wsReport) => {
        // 仅当前激活页面（栈顶可见）的 player 才处理上报，避免栈中多个 player 实例
        // 同时响应同一条上报，导致重复下发指令给设备
        if (self._isPageActive === false) {
          return;
        }
        console.log("%c[WS] 播放器监听到设备主动上报", "color:green", wsReport);
        self.handleWsReport(wsReport);
      };
      eventBus.on("updateAiWsReport", self._onWsReport);
    },
    detached() {
      // 精确注销当前实例注册的回调，避免监听器累积导致重复下发
      if (this._onPlayerChange) {
        eventBus.off("playerChange", this._onPlayerChange);
        this._onPlayerChange = null;
      }
      if (this._onWsReport) {
        eventBus.off("updateAiWsReport", this._onWsReport);
        this._onWsReport = null;
      }
    },
  },

  pageLifetimes: {
    show: function () {
      let self = this;
      self._isPageActive = true;
      self.initObj();

      if (app.globalData.appStatus == "front") {
        self.reconnectWsV2();
        wx.nextTick(() => {
          app.globalData.appStatus = "";
        });
      }
    },
    hide: function () {
      this._isPageActive = false;
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getStorage() {
      let self = this;
      let obj = getContentStorage();
      let { curDevice } = self.properties;
      if (
        obj.productKey == curDevice.productKey &&
        obj.deviceKey == curDevice.deviceKey
      ) {
        self.setData({
          playObj: obj,
        });
      }
    },

    initObj() {
      let self = this;
      self.getStorage();
      if (JSON.stringify(self.data.playObj) !== "{}") {
        // console.log('dddd')
        self.getData();
      }
    },

    // 获取tsl数据
    getTslInfo() {
      let self = this;
      let { curDevice } = self.properties;
      getTslAttr({
        pk: curDevice.productKey,
        dk: curDevice.deviceKey,
        success(res) {
          const { propData, custData } = res;
          let fmtData = attrValAssign(propData, custData);
          console.log("tsl data fmt", fmtData);
          self.handleWsReport(fmtData, "init");
        },
        fail(fail) {},
      });
    },

    /**
     * 渲染WS上报数据
     * @param {*} wsReport
     * @param {*} from - "init" 表示初始化物模型，不触发 getDetailByEpisode
     */
    handleWsReport(wsReport, from) {
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
      let {
        contentOnDemandTsl,
        switchTsl,
        continuationListTsl,
        newVersionFieldTsl,
      } = self.data;
      if (self.properties.from == "album_detail") {
        self.triggerEvent("contentOnDemandTsl", contentOnDemandTsl);
        self.triggerEvent("switchTsl", switchTsl);
        // 将续播列表物模型下发至专辑详情页，以便页面点播时一并下发续播列表
        self.triggerEvent("continuationListTsl", continuationListTsl);
        // 将新版本字段物模型下发至专辑详情页，以便点播时正确判断是否为二期设备并下发 episode
        self.triggerEvent("newVersionFieldTsl", newVersionFieldTsl);
      }

      let specs = contentOnDemandTsl.specs;
      let play = {};
      specs.forEach((sp) => {
        if (sp.code == "albumId") {
          play["album_id"] = sp.vdata;
        }
        if (sp.code == "songId") {
          play["id"] = sp.vdata;
        }
        if (sp.code == "appOnDemandUrl") {
          play["play_link_url"] = sp.vdata;
        }
        if (sp.code == "playStatus") {
          play["playStatus"] = sp.vdata;
        }
        if (sp.code == "songTitle") {
          play["name"] = sp.vdata;
        }
        // 二期新增：设备上报的当前集数
        if (sp.code == "episode") {
          play["episode"] = Number(sp.vdata);
        }
      });
      if (
        play["album_id"] == "" ||
        play["album_id"] == undefined ||
        play["play_link_url"] == "" ||
        play["play_link_url"] == undefined
      ) {
        self.setData({
          playShow: false,
        });
        self.triggerEvent("playShow", self.data.playShow);
      }

      if (JSON.stringify(play) !== "{}" && play["album_id"]) {
        if (self.checkIsNewVersion() && play["episode"] !== undefined) {
          // 新版本逻辑：设备切歌上报，直接调详情接口拉取单首歌数据更新 UI
          // 初始化物模型时（from=="init"）不触发，避免 playObj 为空导致 albumId 缺失
          if (from !== "init") {
            self.getDetailByEpisode(
              "report",
              play["episode"],
              play["album_id"],
            );
          }

          self.setData({
            playShow: true,
            isPlay: Number(play["playStatus"]) == 3 ? true : false,
          });
          self.triggerEvent("playShow", self.data.playShow);
        } else {
          // 老版本逻辑：调列表接口去匹配
          self.getData(play, "report");

          plugin.jsUtil.delayCb(() => {
            let { albumData } = self.data;
            let idx = albumData.findIndex(
              (item) => item.album_id === play["album_id"],
            );

            if (idx !== -1 && play["play_link_url"]) {
              self.setData({
                playShow: true,
                isPlay: Number(play["playStatus"]) == 3 ? true : false,
              });
              self.triggerEvent("playShow", self.data.playShow);

              // 设备播完上报 playStatus=1(下一首) 时，面板主动下发下一首歌曲给设备
              // 续播列表模式下设备自己管理续播，面板无需主动下发
              if (
                Number(play["playStatus"]) === 1 &&
                !self.hasContinuationListMode()
              ) {
                self.next();
              }
            }
          }, 1000);
        }
      }
    },

    /**
     * 根据正在播放的专辑id查专辑列表
     */
    getData(play, from) {
      let self = this;
      let { playObj } = self.data;
      let { curDevice } = self.properties;
      plugin.ai.onDemandTracklist({
        albumId: from == "report" ? play["album_id"] : playObj.album_id,
        pageNum: 1,
        pageSize: 50,
        success(res) {
          console.log("Tracklist", res);
          if (res.data && res.data.list) {
            let list = res.data.list;
            let sobj = getContentStorage();
            list.forEach((l) => {
              if (
                JSON.stringify(sobj) !== "{}" &&
                sobj.productKey == curDevice.productKey &&
                sobj.deviceKey == curDevice.deviceKey &&
                sobj.id == l.id
              ) {
                l.check = true;
              } else {
                l.check = false;
              }
            });
            let nList = covertImgUrl(list);
            if (from == "report") {
              nList.forEach((n) => {
                if (n.album_id == play["album_id"] && n.id == play["id"]) {
                  setContentStorage(n, curDevice);
                  self.getStorage();
                }
              });
            }
            self.setData({
              albumData: nList,
            });
            self.findIndex();
          }
        },
        fail(res) {},
        compete(res) {},
      });
    },

    /**
     * 查询当前专辑的索引
     */
    findIndex() {
      let self = this;
      let { playObj, albumData } = self.data;
      let targetIndex = albumData.findIndex((item) => item.id === playObj.id);
      self.setData({
        curIndex: targetIndex,
      });
      if (targetIndex == 0) {
        self.setData({
          isFirst: true,
          isLast: false,
        });
      } else if (targetIndex == albumData.length - 1) {
        self.setData({
          isFirst: false,
          isLast: true,
        });
      } else {
        self.setData({
          isFirst: false,
          isLast: false,
        });
      }
    },

    /**
     * 判断当前设备是否处于续播列表模式
     * 条件：continuationListTsl 存在 且 非二期新版本设备
     */
    hasContinuationListMode() {
      const { continuationListTsl } = this.data;
      return (
        continuationListTsl &&
        Object.keys(continuationListTsl).length > 0 &&
        !this.checkIsNewVersion()
      );
    },

    /**
     * 判断是否为二期新设备
     */
    checkIsNewVersion() {
      const { newVersionFieldTsl } = this.data;
      return !!(
        newVersionFieldTsl &&
        Object.keys(newVersionFieldTsl).length > 0 &&
        newVersionFieldTsl.vdata &&
        newVersionFieldTsl.vdata === "1.0.0"
      );
    },

    /**
     * 根据 episode 调新接口获取详情
     * @param {*} act - "prev" | "next" | "report"
     * @param {*} targetEpisode - 目标集数
     * @param {*} albumIdOverride - 可选，优先使用此 albumId（WS 上报场景下 playObj 可能还未赋值）
     */
    getDetailByEpisode(act, targetEpisode, albumIdOverride) {
      const self = this;
      const { curDevice } = self.properties;
      const { playObj, contentOnDemandTsl, switchTsl } = self.data;
      const albumId = albumIdOverride || playObj.album_id;

      plugin.ai.onDemandContentDetail({
        productKey: curDevice.productKey,
        albumId: albumId,
        episode: targetEpisode,
        success(res) {
          if (res.data) {
            const nList = covertImgUrl([res.data]);
            const newObj = nList[0];

            if (act == "prev") {
              self.prevSet(newObj, contentOnDemandTsl, curDevice, switchTsl);
            } else if (act == "next") {
              self.nextSet(newObj, contentOnDemandTsl, curDevice, switchTsl);
            } else if (act == "report") {
              self.setData({ playObj: newObj });
              setContentStorage(newObj, curDevice);
              self.getStorage();
              // 设备自主切歌上报时，通知专辑详情页更新列表高亮
              if (self.properties.from == "album_detail") {
                self.triggerEvent("Next", newObj);
              }
            }
          } else {
            plugin.jsUtil.tip("获取内容失败");
          }
        },
        fail(err) {
          plugin.jsUtil.tip("获取内容失败");
        },
      });
    },

    /**
     * 下一首
     */
    next() {
      let self = this;
      let { playObj } = self.data;

      if (self.checkIsNewVersion()) {
        // 新版本设备逻辑：直接算下一集，调用详情接口
        let targetEpisode = playObj.episode + 1;
        if (playObj.track_num && targetEpisode > playObj.track_num) {
          targetEpisode = 1; // 列表循环，回到第一首
        }
        self.getDetailByEpisode("next", targetEpisode);
      } else {
        // 老设备逻辑
        if (playObj.episode >= 50) {
          self.getDataByEpisode("next");
        } else {
          self.nextLess();
        }
      }
    },

    /**
     * 小于50 下一首
     */
    nextLess() {
      let self = this;
      let { curIndex, isLast, albumData, contentOnDemandTsl, switchTsl } =
        self.data;
      let { curDevice } = self.properties;
      let nextObj = {};
      if (!isLast) {
        nextObj = albumData[curIndex + 1];
      } else {
        nextObj = albumData[0];
      }
      self.nextSet(nextObj, contentOnDemandTsl, curDevice, switchTsl);
    },

    /**
     *
     * @param {*} obj -当前操作对象
     * @param {*} contentOnDemandTsl
     * @param {*} curDevice
     * @param {*} switchTsl
     */
    nextSet(obj, contentOnDemandTsl, curDevice, switchTsl) {
      // 在 initObj 前捕获 albumData，避免异步刷新导致数据丢失
      const { albumData, newVersionFieldTsl, continuationListTsl } = this.data;
      // 构建续播列表：以当前点播的歌曲为基准，取其后续最多10首
      const continuationOpts = buildContinuationOpts(
        continuationListTsl,
        newVersionFieldTsl,
        obj,
        albumData,
      );
      setContentStorage(obj, curDevice);
      this.initObj();
      if (this.properties.from == "album_detail") {
        this.triggerEvent("Next", obj);
      }
      playSend(
        obj,
        1,
        contentOnDemandTsl,
        curDevice,
        switchTsl,
        this.data.newVersionFieldTsl,
        continuationOpts,
      );
    },

    /**
     * 上一首
     */
    prev() {
      let self = this;
      let { playObj } = self.data;

      if (self.checkIsNewVersion()) {
        // 新版本设备逻辑：直接算上一集，调用详情接口
        let targetEpisode = playObj.episode - 1;
        if (targetEpisode < 1) {
          // 如果已经是第一首了，循环到最后一首
          targetEpisode = playObj.track_num ? playObj.track_num : 1;
        }
        self.getDetailByEpisode("prev", targetEpisode);
      } else {
        // 老设备逻辑
        if (playObj.episode >= 50) {
          self.getDataByEpisode("prev");
        } else {
          self.prevLess();
        }
      }
    },

    /**
     * 小于50 上一首
     */
    prevLess() {
      let self = this;
      let { curIndex, isFirst, albumData, contentOnDemandTsl, switchTsl } =
        self.data;
      let { curDevice } = self.properties;
      let lastObj = {};
      if (!isFirst) {
        lastObj = albumData[curIndex - 1];
      } else {
        lastObj = albumData[albumData.length - 1];
      }
      self.prevSet(lastObj, contentOnDemandTsl, curDevice, switchTsl);
    },

    /**
     *
     * @param {*} obj -当前操作对象
     * @param {*} contentOnDemandTsl
     * @param {*} curDevice
     * @param {*} switchTsl
     */
    prevSet(obj, contentOnDemandTsl, curDevice, switchTsl) {
      // 在 initObj 前捕获 albumData，避免异步刷新导致数据丢失
      const { albumData, newVersionFieldTsl, continuationListTsl } = this.data;
      // 构建续播列表：以当前点播的歌曲为基准，取其后续最多10首
      const continuationOpts = buildContinuationOpts(
        continuationListTsl,
        newVersionFieldTsl,
        obj,
        albumData,
      );
      setContentStorage(obj, curDevice);
      this.initObj();
      if (this.properties.from == "album_detail") {
        this.triggerEvent("Last", obj);
      }
      playSend(
        obj,
        0,
        contentOnDemandTsl,
        curDevice,
        switchTsl,
        this.data.newVersionFieldTsl,
        continuationOpts,
      );
    },

    /**
     * 当前歌曲大于50
     * 根据当前数据查上一首下一首数据
     */
    getDataByEpisode(act) {
      let self = this;
      let { curDevice } = self.properties;
      let { playObj, contentOnDemandTsl, switchTsl } = self.data;
      let pageN = 1;
      if (act == "prev") {
        pageN = playObj.episode > 1 ? playObj.episode - 1 : 1;
      } else if (act == "next") {
        pageN = playObj.episode + 1;
      }
      plugin.ai.onDemandTracklist({
        albumId: playObj.album_id,
        pageNum: pageN,
        pageSize: 1,
        success(res) {
          console.log("Tracklist", res);
          if (
            res.data &&
            (res.data.list == undefined || res.data.list.length == 0)
          ) {
            if (act == "next") {
              self.setData({
                isLast: true,
              });
              self.nextLess();
            } else if (act == "prev") {
              self.setData({
                isFirst: true,
              });
              self.prevLess();
            }
          } else {
            let obj = res.data.list;
            let nList = covertImgUrl(obj);
            console.log(nList);
            if (act == "prev") {
              self.prevSet(nList[0], contentOnDemandTsl, curDevice, switchTsl);
            } else if (act == "next") {
              self.nextSet(nList[0], contentOnDemandTsl, curDevice, switchTsl);
            }
          }
        },
        fail(res) {},
        compete(res) {},
      });
    },

    /**
     * 播放/暂停
     */
    bo(from) {
      console.log("bo");
      console.log(from);
      let {
        playObj,
        contentOnDemandTsl,
        isPlay,
        switchTsl,
        newVersionFieldTsl,
      } = this.data;
      let { curDevice } = this.properties;
      if (from !== "report") {
        playSend(
          playObj,
          isPlay ? 2 : 3,
          contentOnDemandTsl,
          curDevice,
          switchTsl,
          newVersionFieldTsl,
        );
      }
      this.setData({
        isPlay: !this.data.isPlay,
      });
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
  },
});
