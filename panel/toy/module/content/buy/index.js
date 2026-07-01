import eventBus from "../../../../common/eventBus.js"

const plugin = requirePlugin("quecPlugin")
let app = getApp()

const PACKAGE_TYPE = "AI_MUSIC"

Page({
  /**
   * 页面的初始数据
   */
  data: {
    sHei: 500,
    sets: [],
    cur: {},

    payInfoVisible: false,
    payCheck: false,
    agreeShow: false,

    metaData: app.globalData.envData["metaData"],
    curDevice: {},

    i18n: plugin.main.getLang(),
    skin: plugin.main.getSkin(),

    isFinish: false,

    chatReloadObj: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    let self = this
    let winH = wx.getWindowInfo().safeArea
    self.setData({
      sHei: winH.bottom - winH.top - 90 - 120,
    })

    if (options.item) {
      self.setData({
        curDevice: JSON.parse(decodeURIComponent(options.item)),
      })
      self.getPackList(1)
    }

    if (options.chatReloadObj) {
      self.setData({
        chatReloadObj: JSON.parse(decodeURIComponent(options.chatReloadObj)),
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady () { },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow () {
    let self = this
    if (app.globalData.appStatus == "front") {
      self.reconnectWsV2()
      wx.nextTick(() => {
        app.globalData.appStatus = ""
      })
    }
  },

  /**
   * 关闭ws
   */
  closeWsSocket () {
    eventBus.emit("tryCloseWsSocket")
  },

  /**
   * 重连
   */
  reconnectWsV2 () {
    eventBus.emit("reconnectWsV2")
  },

  /**
   * 立即支付协议弹窗
   */
  payNow () {
    let self = this
    if (self.data.payCheck) {
      self.setData({
        payInfoVisible: true,
      })
    } else {
      self.setData({
        agreeShow: true,
      })
    }
  },

  /**
   *同意并支付
   */
  agreeConfirm () {
    this.setData({
      payCheck: true,
      agreeShow: false,
      payInfoVisible: true,
    })
  },

  /**
   * 协议取消
   */
  agreeClose () {
    this.setData({
      agreeShow: false,
    })
  },

  /**
   * 选择协议
   */
  payCheckChange (e) {
    this.setData({
      payCheck: e.detail,
    })
  },

  /**
   * 获取套餐列表
   */
  getPackList (chance) {
    let self = this
    if (chance && chance == 1) {
      plugin.jsUtil.load()
    }
    let { curDevice } = self.data
    let metaData = self.data.metaData
    plugin.ai.findPackageListV2({
      merchantNo: metaData["merchantNo"].metadataValue,
      packageType: PACKAGE_TYPE,
      terminalCode: metaData["bssClientAppId"].metadataValue,
      productKey: curDevice.productKey,
      deviceKey: curDevice.deviceKey,
      success (res) {
        if (res.data && res.data.length > 0) {
          let rdata = res.data
          let { cur } = self.data
          rdata.forEach((rd) => {
            rd.packagePriceYuan = (rd.packagePrice / 100).toFixed(2)
          })
          if (JSON.stringify(self.data.cur) == "{}") {
            rdata[0].check = true
          } else {
            rdata.forEach((rd) => {
              if (self.data.cur.packageVersionId == rd.packageVersionId) {
                rd.check = true
              } else {
                rd.check = false
              }
            })
          }
          self.setData({
            cur: JSON.stringify(self.data.cur) !== "{}" ? cur : rdata[0],
            sets: rdata,
          })
        }
      },
      fail (res) { },
      complete (res) {
        self.setData({
          isFinish: true,
        })
      },
    })
  },

  /**
   * 切换套餐
   */
  changeSet (e) {
    let self = this
    let item = e.currentTarget.dataset.item
    let { sets } = self.data
    sets.forEach((s) => {
      if (s.packageVersionId == item.packageVersionId) {
        s.check = true
      } else {
        s.check = false
      }
    })
    self.setData({
      sets,
    })
    self.getCur()
  },

  getCur () {
    let self = this
    let { sets } = self.data
    let cur = sets.filter((sm) => {
      return sm.check
    })
    self.setData({
      cur: cur[0],
    })
  },

  /**
   * 关闭支付弹窗
   */
  closePay () {
    this.setData({
      payInfoVisible: false,
    })
    this.getPackList()
  },

  /**
   * 付款成功跳转到内容服务
   */
  successPay () {
    let self = this
    /**
     * 付款成功，设备重新进房
     */
    //self.sendReload();

    /**
     * 跳转到内容服务页面
     */
    plugin.jsUtil.delayCb(() => {
      self.pageRouter.redirectTo({
        url: `/panel/toy/module/content/index/index?item=${encodeURIComponent(
          JSON.stringify(this.data.curDevice)
        )}`,
      })
    }, 1500)
  },

  /**
   * 设备重新进房
   */
  // sendReload () {
  //   let { curDevice, chatReloadObj } = this.data
  //   eventBus.emit(
  //     "sendAttr",
  //     {
  //       productKey: curDevice.productKey,
  //       deviceKey: curDevice.deviceKey,
  //       code: chatReloadObj.code,
  //       value: true,
  //       sendData: [{ [chatReloadObj.code]: true }],
  //     },
  //     () => {
  //       console.log("成功")
  //     },
  //     () => {
  //       console.log("失败")
  //     }
  //   )
  // },

  /**
   * 继续付款
   */
  continuePay () {
    this.setData({
      payInfoVisible: true,
    })
  },

  /**
   * 服务协议
   */
  toProtocol () {
    // Demo: mode/payment 已移除
  },

  /**
   * 订单页面
   */
  goOrder () {
    this.pageRouter.navigateTo({
      url: "/panel/toy/module/order/list/index?packageType=" + PACKAGE_TYPE,
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide () { },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload () { },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh () { },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom () { },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage () { },
})
