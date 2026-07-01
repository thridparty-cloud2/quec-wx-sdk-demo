import conConst from "../../../../js/conConst.js";
const plugin = requirePlugin("quecPlugin");
import eventBus from "../../../../../common/eventBus.js";
import {
  playSend,
  covertImgUrl,
  getContentStorage,
  setContentStorage,
  buildContinuationOpts,
} from "../../../../js/content.js";

Page({
  /**
   * 页面的初始数据
   */
  data: {
    curDevice: {},
    conConst: conConst,
    sHei: 500,
    triggered: false,
    hasDataList: true,

    conHei: 300,

    page: {
      pageNum: 1,
      pageSize: 50,
      total: 0,
    },

    curItem: {},
    detailData: [],

    noDataImg:
      plugin.main.getBaseImgUrl() + "images/device/no_device_data_v2.png",

    curPlayObj: {}, // 当前播放的歌曲
    contentOnDemandTsl: {}, //点播内容物模型
    switchTsl: {}, //开关物模型
    newVersionFieldTsl: {}, //新版本字段物模型
    continuationListTsl: {}, //续播列表物模型
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let self = this;
    self.setData({
      sHei: wx.getWindowInfo().safeArea.bottom - 100 - 160,
      conHei: wx.getWindowInfo().safeArea.bottom - 100 - 160 - 60,
    });
    if (options.device) {
      self.setData({
        curDevice: JSON.parse(decodeURIComponent(options.device)),
      });
    }
    if (options.item) {
      self.setData({
        curItem: JSON.parse(decodeURIComponent(options.item)),
      });
      self.getData();
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  getPlayShow(e) {
    let detail = e.detail;
    this.setData({
      conHei:
        wx.getWindowInfo().safeArea.bottom - 100 - 160 - 60 - (detail ? 20 : 0),
    });
  },

  /**
   * 获取专辑歌曲列表
   */
  getData() {
    let self = this;
    let { curItem, page, curDevice } = self.data;
    plugin.ai.onDemandTracklist({
      albumId: curItem.album_id,
      pageNum: page.pageNum,
      pageSize: page.pageSize,
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
          self.setData({
            detailData: self.data.detailData.concat(nList),
            "page.total": res.data.total,
            hasDataList: res.data.total > 0,
          });
        }
      },
      fail(res) {
        self.setData({
          hasDataList: false,
        });
      },
      compete(res) {
        self.setData({
          triggered: false,
          isFinish: true,
        });
      },
    });
  },

  // 刷新列表
  refreshList() {
    let self = this;
    let page = `page.pageNum`;
    self.setData({
      [page]: 1,
      detailData: [],
    });
    wx.nextTick(() => {
      self.getData();
    });
  },

  // 加载更多
  getMoreList() {
    let self = this;
    if (self.data.page.pageSize !== self.data.page.total) return;
    let page = `page.pageNum`;
    self.setData({
      [page]: !self.data.hasDataList ? 1 : self.data.page.pageNum + 1,
    });
    self.getData();
  },

  //内容服务物模型
  getcontentOnDemandTsl(e) {
    this.setData({
      contentOnDemandTsl: e.detail,
    });
    console.log(e.detail);
    // 添加播放完，播放下一个
  },

  //开关物模型
  getswitchTsl(e) {
    this.setData({
      switchTsl: e.detail,
    });
    console.log(e.detail);
  },

  //新版本字段物模型
  getnewVersionFieldTsl(e) {
    this.setData({
      newVersionFieldTsl: e.detail,
    });
  },

  /**
   * 续播列表物模型（由 player 组件通过事件下发）
   */
  getcontinuationListTsl(e) {
    this.setData({
      continuationListTsl: e.detail,
    });
  },

  /**
   * 播放
   */
  play() {
    let self = this;
    let {
      detailData,
      curDevice,
      contentOnDemandTsl,
      switchTsl,
      newVersionFieldTsl,
      continuationListTsl,
    } = self.data;
    let curObj = detailData[0];
    // 构建续播列表：从第二首开始，最多10首
    const continuationOpts = buildContinuationOpts(
      continuationListTsl,
      newVersionFieldTsl,
      curObj,
      detailData,
    );
    playSend(
      curObj,
      0,
      contentOnDemandTsl,
      curDevice,
      switchTsl,
      newVersionFieldTsl,
      continuationOpts,
    ); //播放状态 (在这里0不是上一首，而是表示全新的一首歌)
    self.fmtSel(curObj);
    wx.nextTick(() => {
      eventBus.emit("playerChange", self.data.curPlayObj);
      setContentStorage(self.data.curPlayObj, curDevice);
    });
  },

  /**
   * 切换播放专辑
   */
  changeAlbum(e) {
    let self = this;
    let {
      detailData,
      curDevice,
      contentOnDemandTsl,
      switchTsl,
      newVersionFieldTsl,
      continuationListTsl,
    } = self.data;
    let item = e.currentTarget.dataset.item;
    // 构建续播列表：以当前点播的歌曲为基准，取其后续最多10首
    const continuationOpts = buildContinuationOpts(
      continuationListTsl,
      newVersionFieldTsl,
      item,
      detailData,
    );
    playSend(
      item,
      0,
      contentOnDemandTsl,
      curDevice,
      switchTsl,
      newVersionFieldTsl,
      continuationOpts,
    ); //播放状态 (在这里0不是上一首，而是表示全新的一首歌)
    self.fmtSel(item);
    wx.nextTick(() => {
      eventBus.emit("playerChange", self.data.curPlayObj);
      setContentStorage(self.data.curPlayObj, curDevice);
    });
  },

  /**
   * 播放器下一个/上一个
   */
  playChange(e) {
    let self = this;
    let obj = e.detail;
    let { detailData } = self.data;
    let targetIndex = detailData.findIndex(
      (item) => item.id === obj.id && item.album_id === obj.album_id,
    );

    if (targetIndex >= 0) {
      // 新歌在已加载列表中，正常高亮
      self.fmtSel(obj);
    } else {
      // 新歌不在已加载列表（如 50+ 专辑切到未加载的歌曲），
      // 清除所有旧高亮，避免上一首/下一首后残留之前的高亮
      detailData.forEach((d) => {
        d.check = false;
      });
      self.setData({
        detailData,
        curPlayObj: obj,
      });
    }
  },

  /**
   *
   * @param {*} actObj-当前操作的专辑
   */
  fmtSel(actObj) {
    let self = this;
    let { detailData } = self.data;

    detailData.forEach((d) => {
      if (d.id == actObj.id) {
        d.check = true;
      } else {
        d.check = false;
      }
    });
    self.setData({
      detailData,
      curPlayObj: actObj,
    });
  },
});
