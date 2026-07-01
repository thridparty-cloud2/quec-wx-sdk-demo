import {
  reqCancelOrder,
  reqDelOrder,
  reqOrderInfo,
  currencyUnitMap,
  periodUnitMap,
} from "../../../api/bss"
const plugin = requirePlugin("quecPlugin")

Page({
  /**
   * 页面的初始数据
   */
  // 简化数据结构
  data: {
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
    orderInfo: undefined,
    orderNo: "",
    closeTime: 0,
    currentOrder: undefined,
    // paySuccessShow: false,
    // payPopupShow: false,
    // hasNavigateToPay: false,
    // 弹窗状态
    cancelShow: false,
    delShow: false,
    // 工具函数
    currencyUnitMap,
    periodUnitMap,
    i18n: plugin.main.getLang(),
    skin: "",
    cancelColor: "#ff4219",

    payInfoVisible: false,
    curDevice: {},
    hasAutoCancel: false, // 防止倒计时到0时重复调用取消接口
  },

  // 简化支付处理
  // handlePay () {
  //   const orderInfo = this.data.orderInfo
  //   if (orderInfo && orderInfo.orderStatus === "WAIT_PAY") {
  //     this.setData({
  //       currentOrder: orderInfo.orderNo,
  //       payPopupShow: true,
  //     })
  //   }
  // },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      i18n: plugin.main.getLang(),
      skin: plugin.main.getSkin(),
      orderNo: options.orderNo,
    })
    if (options.item) {
      this.setData({
        curDevice: JSON.parse(decodeURIComponent(options.item)),
      })
    }
    // 页面加载时获取详情
    this.getOrderInfo(options.orderNo)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.setData({
      hasAutoCancel: false,
    })
    this.startCountdownTimer()
  },

  /**
   * 启动倒计时定时器
   */
  startCountdownTimer() {
    this.clearCountdownTimer()
    this.countdownTimer = setInterval(() => {
      this.updateCountdown()
    }, 60000) // 每分钟更新一次
  },

  /**
   * 清除倒计时定时器
   */
  clearCountdownTimer() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer)
      this.countdownTimer = null
    }
  },

  /**
   * 更新倒计时
   */
  updateCountdown() {
    if (this.data.orderInfo && this.data.orderInfo.bizTimeExpire) {
      const currentTime = new Date().getTime()
      const expireTime = this.data.orderInfo.bizTimeExpire
      const remainingMs = expireTime - currentTime
      const closeTime = Math.max(0, Math.floor(remainingMs / 1000 / 60))

      this.setData({
        closeTime,
      })

      // 如果倒计时结束，清除定时器并自动取消订单
      if (closeTime <= 0) {
        this.clearCountdownTimer()
        this.autoExpireCancel()
      }
    }
  },

  /**
   * 倒计时结束自动取消订单
   */
  async autoExpireCancel() {
    // 防止重复调用
    if (this.data.hasAutoCancel) {
      return
    }

    const orderInfo = this.data.orderInfo
    // 只有订单还是待支付状态才需要取消
    if (!orderInfo || (orderInfo.orderStatus !== 'INIT' && orderInfo.orderStatus !== 'UNPAID')) {
      return
    }

    // 标记已经进行过自动取消
    this.setData({
      hasAutoCancel: true,
    })

    // 调用取消订单接口
    const res = await reqCancelOrder(this.data.orderNo)
    await new Promise((resolve) => setTimeout(resolve, 300))
    // 取消结果返回后都重新获取订单信息，避免页面状态停留在旧数据
    await this.getOrderInfo(this.data.orderNo)
    this.notifyPrevPageRefresh()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    this.clearCountdownTimer()
    this.notifyPrevPageRefresh()
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    this.clearCountdownTimer()
    this.notifyPrevPageRefresh()
  },

  onCopy(e) {
    let text = e.currentTarget.dataset.text
    wx.setClipboardData({
      data: text,
      success: function () {
        wx.showToast({
          title: "复制成功",
        })
      },
    })
  },

  /**
   * 开启删除弹窗
   */
  openDeleteDialog() {
    this.setData({
      delShow: true,
    })
  },

  /**
   * 开启取消弹窗
   */
  openCancelDialog() {
    this.setData({
      cancelShow: true,
    })
  },

  /**
   * 获取订单详情
   */
  async getOrderInfo(orderNo) {
    const orderInfo = await reqOrderInfo(orderNo)
    orderInfo.packagePriceYuan = orderInfo.salePackage.packagePrice

    // 使用bizTimeExpire计算准确的剩余时间
    let closeTime = 0
    if (orderInfo.bizTimeExpire) {
      const currentTime = new Date().getTime()
      const expireTime = orderInfo.bizTimeExpire
      const remainingMs = expireTime - currentTime
      closeTime = Math.max(0, Math.floor(remainingMs / 1000 / 60))
    }

    this.setData({
      orderInfo,
      closeTime,
    })

    if (
      !this.data.hasAutoCancel &&
      closeTime === 0 &&
      (orderInfo.orderStatus === 'INIT' || orderInfo.orderStatus === 'UNPAID')
    ) {
      await this.autoExpireCancel()
    }

    return orderInfo
  },

  /**
   * 处理支付
   */
  handlePay() {
    const item = this.data.orderInfo
    handlePay(item.orderNo, item.salePackage.packageName)
  },

  /**
   * 删除订单
   */
  async handleDeleteOrder() {
    plugin.jsUtil.load(10 * 1000)
    const res = await reqDelOrder(this.data.orderNo)
    plugin.jsUtil.hideTip()
    if (res) {
      plugin.jsUtil.tip("删除成功")
      this.notifyPrevPageRefresh()
      setTimeout(() => {
        wx.navigateBack()
      }, 500)
    }
  },

  /**
   * 取消订单
   */
  async handleCancelOrder() {
    plugin.jsUtil.load(10 * 1000)
    const res = await reqCancelOrder(this.data.orderNo)
    plugin.jsUtil.hideTip()
    if (res) {
      plugin.jsUtil.tip("取消成功")
      this.notifyPrevPageRefresh()
      setTimeout(() => {
        wx.navigateBack()
      }, 500)
    }
  },

  /**
   * 处理支付弹窗
   */
  handlePay(e) {
    const item = this.data.orderInfo
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
    this.getOrderInfo(this.data.orderNo)
  },

  /**
   * 付款成功跳转到内容服务
   */
  successPay() {
    this.closePay()
    this.notifyPrevPageRefresh()
    this.getOrderInfo(this.data.orderNo)
  },

  /**
   * 通知上一页（列表页）刷新
   */
  notifyPrevPageRefresh() {
    const pages = getCurrentPages()
    if (pages.length > 1) {
      const prevPage = pages[pages.length - 2]
      if (prevPage && prevPage.data && prevPage.data.shouldRefresh !== undefined) {
        prevPage.setData({
          shouldRefresh: true,
        })
      }
    }
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
