import conConst from "../../../../js/conConst.js";
const plugin = requirePlugin("quecPlugin");
import { covertImgUrl } from "../../../../js/content.js";
import { getTslAttr, attrValAssign } from "../../../../../common/tool.js";
import eventBus from "../../../../../common/eventBus.js";

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
    page: {
      pageNum: 1,
      pageSize: 10,
      total: 0,
    },
    curItem: {},
    albumData: [],
    noDataImg:
      plugin.main.getBaseImgUrl() + "images/device/no_device_data_v2.png",

    constTsl: ["newVersionField"], // 需要监听的物模型CODE
    newVersionFieldTsl: {}, //新版本字段物模型
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let self = this;
    self.setData({
      sHei: wx.getWindowInfo().safeArea.bottom - 100,
    });

    if (options.device) {
      let device = JSON.parse(decodeURIComponent(options.device));
      self.setData({
        curDevice: device,
      });
      // 拿到设备信息后，主动获取一次物模型
      self.getTslInfo(device, options.item);
    } else if (options.item) {
      // 容错：如果没有传入设备，直接走老逻辑
      self.setData({
        curItem: JSON.parse(decodeURIComponent(options.item)),
      });
      self.getData();
    }

    eventBus.on("updateAiWsReport", self.handleWsReport);
  },

  /**
   * 获取tsl数据
   */
  getTslInfo(curDevice, itemStr) {
    let self = this;
    getTslAttr({
      pk: curDevice.productKey,
      dk: curDevice.deviceKey,
      success(res) {
        const { propData, custData } = res;
        let fmtData = attrValAssign(propData, custData);
        self.handleWsReport(fmtData);

        // 确保物模型获取完成后，再请求列表数据
        if (itemStr) {
          self.setData({
            curItem: JSON.parse(decodeURIComponent(itemStr)),
          });
          self.getData();
        }
      },
      fail(fail) {
        // 获取物模型失败时，降级走老逻辑
        if (itemStr) {
          self.setData({
            curItem: JSON.parse(decodeURIComponent(itemStr)),
          });
          self.getData();
        }
      },
    });
  },

  /**
   * 渲染WS上报数据
   */
  handleWsReport(wsReport) {
    let self = this;
    let constTsl = self.data.constTsl;
    for (let nv of wsReport) {
      if (constTsl.indexOf(nv.code) >= 0) {
        self.setData({
          [`${nv.code}Tsl`]: nv,
        });
      }
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
      sHei: wx.getWindowInfo().safeArea.bottom - 100 - (detail ? 70 : 0),
    });
  },

  getData() {
    let self = this;
    const { curItem, page, curDevice } = self.data;

    plugin.ai.onDemandSearchalbum({
      productKey: curDevice.productKey,
      type: curItem.type,
      name: curItem.name,
      pageNum: page.pageNum,
      pageSize: page.pageSize,
      success(res) {
        if (res.data && res.data.list) {
          let list = res.data.list;
          let nList = covertImgUrl(list);
          self.setData({
            albumData: self.data.albumData.concat(nList),
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

  goDetail(e) {
    this.pageRouter.navigateTo({
      url: `/panel/toy/module/content/album/detail/index?item=${encodeURIComponent(JSON.stringify(e.currentTarget.dataset.item))}&device=${encodeURIComponent(JSON.stringify(this.data.curDevice))}`,
    });
  },

  // 刷新列表
  refreshList() {
    let self = this;
    let page = `page.pageNum`;
    self.setData({
      [page]: 1,
      albumData: [],
    });
    wx.nextTick(() => {
      self.getData();
    });
  },

  // 加载更多
  getMoreList() {
    let self = this;
    // let totalPage = Math.ceil(self.data.page.total / self.data.page.pageSize)
    // if (self.data.albumData.length >= self.data.page.total || self.data.page.pageNum >= totalPage) return

    if (self.data.page.pageSize !== self.data.page.total) return;
    let page = `page.pageNum`;
    self.setData({
      [page]: !self.data.hasDataList ? 1 : self.data.page.pageNum + 1,
    });

    // self.setData({
    //   [page]: self.data.page.pageNum + 1
    // })
    self.getData();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    eventBus.off("updateAiWsReport", this.handleWsReport);
  },
});
