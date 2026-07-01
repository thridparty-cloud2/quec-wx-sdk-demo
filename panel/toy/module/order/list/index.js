import {
  reqCancelOrder,
  reqOrderList,
  currencyUnitMap,
  periodUnitMap,
} from "../../../api/bss"

const plugin = requirePlugin("quecPlugin")

Page({
  /**
   * 页面的初始数据
   */
  data: {
    noDataImg: plugin.main.getRootImg() + "example/images/ic_empty.png",
    // 套餐类型图片映射
    packageTypeImgMap: {
      AI_VOICE_CLONE: plugin.main.getRootImg() + "example/images/voiceClone.png",
      AI_VOICE_CLONE_RENEW: plugin.main.getRootImg() + "example/images/voiceClone.png",
      SMS: plugin.main.getRootImg() + "valadd/order_sms.png",
      VOICE: plugin.main.getRootImg() + "valadd/order_tel.png",
      setmeal: plugin.main.getRootImg() + "ai/new/order/setmeal.png",
      AI_VOICE_PRINT: plugin.main.getRootImg() + "example/images/voicePrint.png",
      AI_VOICE_PRINT_RENEW: plugin.main.getRootImg() + "example/images/voicePrint.png",
      AI_CHAT: plugin.main.getRootImg() + "ai/new/order/AI_CHAT.png",
      AI_CHAT_RESOURCE_PACKAGE: plugin.main.getRootImg() + "ai/new/order/ai_res.png",
      AI_MUSIC: plugin.main.getRootImg() + "ai/new/order/AI_MUSIC.png",
    },
    // 默认图片
    defaultPackageImg: plugin.main.getRootImg() + "example/images/voicePrint.png",

    cancelShow: false,
    currentPlan: {},
    i18n: plugin.main.getLang(),
    skin: plugin.main.getSkin(),
    loading: false,
    page: 1,
    pageSize: 5,
    orderList: [],
    periodUnitMap: periodUnitMap,
    currencyUnitMap: currencyUnitMap,

    payInfoVisible: false,
    curDevice: {},

    shouldRefresh: false,

    packageType: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let self = this
    if (options.item) {
      self.setData({
        curDevice: JSON.parse(decodeURIComponent(options.item)),
      })
    }
    if (options.packageType) {
      self.setData({
        packageType: options.packageType,
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    if (this.data.orderList.length === 0 || this.data.shouldRefresh) {
      this.setData({
        shouldRefresh: false,
      })
      this.getOrderList(true)
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 下拉刷新
   */
  async handleRefresh() {
    this.setData({
      loading: true,
    })
    await this.getOrderList(true)
    this.setData({
      loading: false,
    })
  },

  /**
   * 下拉刷新终止
   */
  handleRefresherAbort() {
    this.setData({
      loading: false,
    })
  },

  /**
   * 滑动至底部
   */
  handleScrollToLower() {
    this.getOrderList()
  },

  toDetail(e) {
    const item = e.currentTarget.dataset.item
    this.pageRouter.navigateTo({
      url: `/panel/toy/module/order/detail/index?orderNo=${
        item.orderNo
      }&item=${encodeURIComponent(JSON.stringify(this.data.curDevice))}`,
    })
  },

  /**
   * 获取订单列表
   */
  async getOrderList(isRefresh = false) {
    let { orderList, page, pageSize, hasNextPage: has, packageType } = this.data
    if (!has && !isRefresh) {
      return
    }
    const nextPage = isRefresh ? 1 : page
    plugin.jsUtil.load(10 * 1000)
    let { list } = await reqOrderList({ pageNum: nextPage, pageSize, packageType })

    list.forEach((l) => {
      l.packagePriceYuan = l.salePackage.packagePrice
    })
    console.log(list)
    plugin.jsUtil.hideTip()
    this.setData({
      orderList: isRefresh ? list : [...orderList, ...list],
      hasNextPage: isRefresh ? true : !(list.length < pageSize),
      page: nextPage + 1,
    })
  },

  /**
   * 开启取消弹窗
   */
  openCancelDialog(e) {
    this.setData({
      cancelShow: true,
      currentOrder: e.currentTarget.dataset.item,
    })
  },

  /**
   * 取消订单
   */
  async cancelOrder() {
    plugin.jsUtil.load(10 * 1000)
    const res = await reqCancelOrder(this.data.currentOrder.orderNo)
    plugin.jsUtil.hideTip()
    if (res) {
      await this.getOrderList(true)
      plugin.jsUtil.tip("取消成功")
    }
  },

  /**
   * 处理支付
   */
  handlePay(e) {
    const item = e.currentTarget.dataset.item
    this.setData({
      currentPlan: { ...item, ...item.salePackage },
      payInfoVisible: true,
    })
  },

  /**
   * 关闭支付弹窗
   */
  closePay() {
    this.setData({
      payInfoVisible: false,
    })
    this.getOrderList(true)
  },

  /**
   * 付款成功跳转到内容服务
   */
  successPay() {
    this.closePay()
  },

  /**
   * 继续付款
   */
  continuePay() {
    this.setData({
      payInfoVisible: true,
    })
  },

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
})
