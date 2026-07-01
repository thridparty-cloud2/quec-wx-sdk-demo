const plugin = requirePlugin("quecPlugin");
let app = getApp();

const PACKAGE_TYPE = "AI_VOICE_PRINT";

Page({
  /**
   * 页面的初始数据
   */
  data: {
    sHei: 500,
    sets: [],
    cur: {},
    checked: false,

    // agreementPopupVisible: false,
    metaData: app.globalData.envData["metaData"],
    curDevice: {},
    isRenew: false, // 是否为续费

    env: app.globalData.envData, //环境变量
    i18n: plugin.main.getLang(),
    skin: plugin.main.getSkin(),

    payInfoVisible: false,
    payCheck: true,
    agreeShow: false,

    associatedIds: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let self = this;
    self.setData({
      sHei: wx.getWindowInfo().safeArea.bottom - 100 - 130,
    });

    if (options.item) {
      self.setData({
        curDevice: JSON.parse(decodeURIComponent(options.item)),
        isRenew: options.isRenew === "true" || options.isRenew === true,
      });
      self.getPackList();
    }

    if (options.associatedIds) {
      self.setData({
        associatedIds: options.associatedIds,
      });
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

  /**
   * 立即支付协议弹窗
   */
  payNow() {
    let self = this;
    if (self.data.payCheck) {
      self.setData({
        payInfoVisible: true,
      });
    } else {
      self.setData({
        agreeShow: true,
      });
    }
  },

  /**
   *同意并支付
   */
  agreeConfirm() {
    this.setData({
      payCheck: true,
      agreeShow: false,
      payInfoVisible: true,
    });
  },

  /**
   * 协议取消
   */
  agreeClose() {
    this.setData({
      agreeShow: false,
    });
  },

  /**
   * 选择协议
   */
  payCheckChange(e) {
    this.setData({
      payCheck: e.detail,
    });
  },

  /**
   * 获取套餐列表
   */
  getPackList(chance) {
    let self = this;
    if (chance && chance == 1) {
      plugin.jsUtil.load();
    }
    let { curDevice } = self.data;
    let metaData = self.data.metaData;
    plugin.ai.findPackageListV2({
      merchantNo: metaData["merchantNo"].metadataValue,
      packageType: self.data.isRenew ? "AI_VOICE_PRINT_RENEW" : "AI_VOICE_PRINT", //声纹两种类型，支付和续费
      terminalCode: metaData["bssClientAppId"].metadataValue,
      productKey: curDevice.productKey,
      deviceKey: curDevice.deviceKey,
      success(res) {
        if (res.data && res.data.length > 0) {
          let rdata = res.data;
          let { cur } = self.data;
          rdata.forEach((rd) => {
            rd.packagePriceYuan = (rd.packagePrice / 100).toFixed(2);
          });
          if (JSON.stringify(self.data.cur) == "{}") {
            rdata[0].check = true;
          } else {
            rdata.forEach((rd) => {
              if (self.data.cur.packageVersionId == rd.packageVersionId) {
                rd.check = true;
              } else {
                rd.check = false;
              }
            });
          }
          self.setData({
            cur: JSON.stringify(self.data.cur) !== "{}" ? cur : rdata[0],
            sets: rdata,
          });
        }
      },
      fail(res) {},
    });
  },

  /**
   * 切换套餐
   */
  changeSet(e) {
    let self = this;
    let item = e.currentTarget.dataset.item;
    let { sets } = self.data;
    sets.forEach((s) => {
      if (s.packageVersionId == item.packageVersionId) {
        s.check = true;
      } else {
        s.check = false;
      }
    });
    self.setData({
      sets,
    });
    self.getCur();
  },

  getCur() {
    let self = this;
    let { sets } = self.data;
    let cur = sets.filter((sm) => {
      return sm.check;
    });
    self.setData({
      cur: cur[0],
    });
  },

  /**
   * 关闭支付弹窗
   */
  closePay() {
    this.setData({
      payInfoVisible: false,
    });
    this.getPackList();
  },

  /**
   * 付款成功跳转到声纹识别页
   */
  successPay() {
    const { curDevice } = this.data;
    // 支付成功后主动查询声纹识别状态，拿到最新的 associatedIds（新设备购买场景）
    plugin.ai.getVoicePrintStatus({
      productKey: curDevice.productKey,
      success: (res) => {
        let associatedId = "";
        if (
          res &&
          res.data &&
          Array.isArray(res.data.associatedIds) &&
          res.data.associatedIds.length > 0
        ) {
          associatedId = res.data.associatedIds[0];
        }
        this.pageRouter.redirectTo({
          url: `/panel/toy/module/voice/print/list/index?item=${encodeURIComponent(
            JSON.stringify(curDevice)
          )}&associatedIds=${encodeURIComponent(associatedId)}&autoOpen=true`,
        });
      },
      fail: () => {
        this.pageRouter.redirectTo({
          url: `/panel/toy/module/voice/print/list/index?item=${encodeURIComponent(
            JSON.stringify(curDevice)
          )}&autoOpen=true`,
        });
      },
    });
  },

  /**
   * 继续付款
   */
  continuePay() {
    this.setData({
      payInfoVisible: true,
    });
  },

  /**
   * 服务协议
   */
  toProtocol() {
    // Demo: mode/payment 已移除
  },
  /**
   * 订单页面
   */
  goOrder() {
    this.pageRouter.navigateTo({
      url: "/panel/toy/module/order/list/index?packageType=" + PACKAGE_TYPE,
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
