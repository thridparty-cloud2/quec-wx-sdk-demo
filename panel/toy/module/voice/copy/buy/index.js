import { currencyUnitMap } from "../../../../api/bss";
const plugin = requirePlugin("quecPlugin");
const app = getApp();

const PACKAGE_TYPE = "AI_VOICE_CLONE";

Page({
  /**
   * 页面的初始数据
   */
  data: {
    packageList: [], // 套餐列表
    selectedPackage: null, // 当前选中的套餐
    selectedPackageIndex: 0, // 选中套餐的索引
    quantities: {}, // 存储每个套餐的数量，键为index
    totalPrice: 0,
    agreeChecked: false,
    currencyUnitMap,
    env: app.globalData.envData, //环境变量
    curDevice: {},
    metaData: app.globalData.envData["metaData"],

    /**支付 */
    payInfoVisible: false,
    agreeShow: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.item) {
      this.setData({
        curDevice: JSON.parse(decodeURIComponent(options.item)),
        isRenew: options.isRenew === "true" || options.isRenew === true,
      });
    }
    // 直接初始化套餐数据
    this.getPackList();
  },

  async onShow() {},
  /**
   * 数量变化处理
   */
  onChange(e) {
    const index = e.currentTarget.dataset.index;
    const quantity = e.detail;
    // 更新quantities对象中对应index的值
    this.setData({
      [`quantities.${index}`]: quantity,
    });
    // 如果修改的是当前选中的套餐，重新计算总价
    if (index === this.data.selectedPackageIndex) {
      this.updateTotalPrice();
    }
  },

  /**
   * 初始化服务数据
   */
  getPackList() {
    // 这里可以根据传入的参数设置服务信息
    let self = this;
    let { curDevice } = self.data;
    let metaData = self.data.metaData;
    plugin.ai.findPackageListV2({
      merchantNo: metaData["merchantNo"].metadataValue,
      packageType: "AI_VOICE_CLONE",
      terminalCode: metaData["bssClientAppId"].metadataValue,
      productKey: curDevice.productKey,
      deviceKey: curDevice.deviceKey,
      success(res) {
        const packageData = res.data;
        // 初始化quantities对象，为每个套餐设置默认数量1
        const initialQuantities = {};
        packageData.forEach((item, index) => {
          initialQuantities[index] = 1;
          item.packagePriceYuan = (item.packagePrice / 100).toFixed(2);
        });
        self.setData({
          packageList: packageData,
          selectedPackage: packageData[0], // 默认选中第一个套餐
          selectedPackageIndex: 0,
          quantities: initialQuantities,
        });
        self.updateTotalPrice();
      },
      fail(res) {
        console.error("获取套餐列表失败:", res);
      },
      complete(res) {},
    });
  },

  /**
   * 选择套餐
   */
  selectPackage(e) {
    const index = e.currentTarget.dataset.index;
    const selectedPackage = this.data.packageList[index];
    this.setData({
      selectedPackage: selectedPackage,
      selectedPackageIndex: index,
    });
    this.updateTotalPrice();
  },

  /**
   * 更新总价
   */
  updateTotalPrice() {
    const { selectedPackage, selectedPackageIndex, quantities } = this.data;
    if (
      selectedPackage &&
      selectedPackage.packagePrice !== undefined &&
      selectedPackage.packagePrice !== null
    ) {
      // 如果套餐价格是0，在布尔值中会被视为false，需要加上非空判断
      const quantity = quantities[selectedPackageIndex] || 1;
      const totalPrice = (selectedPackage.packagePriceYuan * quantity).toFixed(2);
      this.setData({
        totalPrice: totalPrice,
      });
    }
  },

  /**
   * 协议同意状态变化
   */
  onAgreeChange(event) {
    this.setData({
      agreeChecked: event.detail,
    });
  },

  /**
   * 查看服务协议
   */
  viewServiceAgreement() {
    // Demo: mode/payment 已移除
  },

  /**
   * 触发支付弹窗
   */
  handlePayment() {
    let self = this;
    let { agreeChecked } = self.data;
    console.log(self.data.quantities);
    if (agreeChecked) {
      self.setData({
        payInfoVisible: true,
      });
    } else {
      self.setData({
        agreeShow: true,
      });
    }
  },

  onHide() {},

  /**
   *同意并支付
   */
  agreeConfirm() {
    this.setData({
      agreeChecked: true,
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
   * 关闭支付弹窗
   */
  closePay() {
    this.setData({
      payInfoVisible: false,
    });
    // this.getPackList()
  },

  /**
   * 付款成功跳转到内容服务
   */
  successPay() {
    this.pageRouter.navigateBack({
      delta: 1,
    });
    // this.pageRouter.redirectTo({
    //   url: `/panel/toy/module/content/index/index?item=${encodeURIComponent(JSON.stringify(this.data.curDevice))}&endUserId=${this.data.endUserId}`
    // })
  },

  /**
   * 继续付款
   */
  continuePay() {
    this.setData({
      payInfoVisible: true,
    });
  },

  toOrderPage() {
    this.pageRouter.navigateTo({
      url: "/panel/toy/module/order/list/index?packageType=" + PACKAGE_TYPE,
    });
  },
});
