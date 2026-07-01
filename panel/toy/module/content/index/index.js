import conConst from "../../../js/conConst.js";
const plugin = requirePlugin("quecPlugin");
import { getTslAttr, attrValAssign } from "../../../../common/tool.js";
import eventBus from "../../../../common/eventBus.js";

Page({
  /**
   * 页面的初始数据
   */
  data: {
    curDevice: {},

    conConst: conConst,
    childIcons: conConst.childMenu,
    musicIcons: conConst.musicMenu,
    cultureIcons: conConst.cultureMenu,
    parentIcons: conConst.parentMenu,
    sHei: 500,

    orgiData: [],

    childData: {
      name: "儿童",
      categories: [],
    },
    musicData: {
      name: "音乐",
      categories: [],
    },
    cultureData: {
      name: "文学",
      categories: [],
    },
    parentData: {
      name: "亲子教育",
      categories: [],
    },

    active: "child",
    constTsl: ["newVersionField"], // 需要监听的物模型CODE
    newVersionFieldTsl: {}, // 存放物模型数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let self = this;
    self.setData({
      sHei: wx.getWindowInfo().safeArea.bottom - 150,
    });

    if (options.item) {
      let device = JSON.parse(decodeURIComponent(options.item));
      self.setData({
        curDevice: device,
      });
      // 拿到设备信息后，主动获取一次物模型
      self.getTslInfo(device);
    }

    // 监听 WebSocket 主动上报的数据，保持物模型实时更新
    eventBus.on("updateAiWsReport", self.handleWsReport);
  },

  /**
   * 获取tsl数据
   */
  getTslInfo(curDevice) {
    let self = this;
    getTslAttr({
      pk: curDevice.productKey,
      dk: curDevice.deviceKey,
      success(res) {
        const { propData, custData } = res;
        let fmtData = attrValAssign(propData, custData);
        self.handleWsReport(fmtData);

        // 确保物模型获取完成后，再请求分类数据
        self.getCategory();
      },
      fail(fail) {
        // 获取物模型失败时，降级走老逻辑
        self.getCategory();
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
        console.log("tslData:", nv.code, nv);
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
      sHei: wx.getWindowInfo().safeArea.bottom - 150 - (detail ? 28 : 0),
    });
  },

  beforeTabChange(e) {
    const { callback, name } = e.detail;
    this.setData({
      active: name,
    });
    callback(true);
  },

  /**
   * 分类
   */
  getCategory() {
    let self = this;
    const { curDevice } = self.data;

    plugin.ai.onDemandCategory({
      productKey: curDevice.productKey,
      success(res) {
        if (res.data) {
          let rData = res.data;
          rData.forEach((r) => {
            if (r.name == "儿童") {
              self.setData({
                childData: r,
              });
            }
            if (r.name == "音乐") {
              self.setData({
                musicData: r,
              });
            }
            if (r.name == "文学") {
              self.setData({
                cultureData: r,
              });
            }
            if (r.name == "亲子教育") {
              self.setData({
                parentData: r,
              });
            }
          });
        }
      },
      fail(res) {},
      compete(res) {},
    });
  },

  goAlbumList(e) {
    console.log(e);
    this.pageRouter.navigateTo({
      url: `/panel/toy/module/content/album/list/index?item=${encodeURIComponent(JSON.stringify(e.detail))}&device=${encodeURIComponent(JSON.stringify(this.data.curDevice))}`,
    });
  },

  goBuySet() {
    this.pageRouter.navigateTo({
      url: `/panel/toy/module/content/buy/index`,
    });
  },

  onUnload() {
    eventBus.off("updateAiWsReport", this.handleWsReport);
  },
});
