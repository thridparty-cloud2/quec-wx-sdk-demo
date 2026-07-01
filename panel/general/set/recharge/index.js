const plugin = requirePlugin("quecPlugin")
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    env: app.globalData.envData,
    metaData: app.globalData.envData["metaData"],
    curDevice: {},
    currencyUnitMap: {
      CNY: "￥",
      USD: "$",
    },
    iccId: "",
    packageType: 'EDU_SIM_FLOW_PACKAGE',
    tabActive: '',

    agreeShow: false,
    agreeChecked: false,
    payInfoVisible: false,

    currentPlan: {}, //当前选中的套餐

    // 充值套餐数据
    rechargeData: [],
    // 续费套餐数据
    renewData: [],
    curSet: {}, //当前选中的套餐
    conHei: 500,
    canPay: true,

    monthName: '', //月套餐名称
    monthRemain: '', //本月剩余
    noDataImg: plugin.main.getRootImg() + 'ai/sim_no_data.png',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    let self = this
    self.setData({
      conHei: wx.getWindowInfo().safeArea.bottom - 100 - 100
    })
    if (options.item) {
      const curDevice = JSON.parse(decodeURIComponent(options.item))
      self.setData({
        curDevice
      })
    }
    if (options.iccId) {
      self.setData({
        iccId: decodeURIComponent(options.iccId),
      })
    }
    if (options.type) {
      self.setData({
        tabActive: options.type
      })
      self.findPackage()
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow () {
    let self = this
    wx.nextTick(() => {
      self.getFlowDetail()
    })
  },

  /**
   * tab 切换
   */
  tabChange (e) {
    let self = this
    console.log(e)
    let name = e.detail.name
    self.setData({
      tabActive: name
    })
    switch (name) {
      case 'recharge': //充值
        self.setData({
          packageType: 'EDU_SIM_FLOW_PACKAGE'
        })
        plugin.jsUtil.load()
        self.findPackage()
        break
      case 'renewal'://续费
        self.setData({
          packageType: 'EDU_SIM_RENEW'
        })
        plugin.jsUtil.load()
        self.findPackage()
        break
    }
  },

  /**
 * 查询套餐列表
 */
  findPackage () {
    let self = this
    let { curDevice, iccId, packageType, tabActive } = self.data
    let metaData = self.data.metaData
    if(iccId=='null'){
      return 
    }
    plugin.ai.findPackageListV2({
      merchantNo: metaData["merchantNo"].metadataValue,
      packageType: packageType,
      terminalCode: metaData["bssClientAppId"].metadataValue,
      productKey: curDevice.productKey,
      deviceKey: curDevice.deviceKey,
      iccids: iccId,
      success (res) {
        const list = res.data || []
        list.forEach((item) => {
          item.packagePriceYuan = (item.packagePrice / 100).toFixed(2)
          item.check = false
        })
        if (tabActive == 'recharge') {
          self.setData({
            rechargeData: list,
          })
        } else if (tabActive == 'renewal') {
          self.setData({
            renewData: list,
          })
        }
        self.setData({
          canPay: false,
        })
        if (list.length === 0) {
          self.setData({
            canPay: false,
          })
        }
      },
      fail (res) {
        console.error("获取套餐列表失败:", res)
        if (tabActive == 'recharge') {
          self.setData({
            rechargeData: [],
            currentPlan: {}
          })
        } else if (tabActive == 'renewal') {
          self.setData({
            renewData: [],
            currentPlan: {}
          })
        }
        self.setData({
          canPay: false,
        })
      },
      complete (res) {
        plugin.jsUtil.hideTip()
      },
    })
  },
  /**
   *查卡详情
   */
  getFlowDetail () {
    const self = this
    const iccid = self.data.iccId
    if(iccid=='null'){
      return
    }
    plugin.sim.getSimCardDetail({
      iccid,
      productKey: self.data.curDevice.productKey,
      deviceKey: self.data.curDevice.deviceKey,
      success (res) {
        const expiryDateStr = res.data.expiryDate || "--"
        let isExpired = false
        if (expiryDateStr) {
          const expiry = new Date(String(expiryDateStr).replace(/-/g, "/"))
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          if (!isNaN(expiry.getTime())) {
            isExpired = expiry.getTime() < today.getTime()
          }
        }
        let monthName = ''
        if (res.data.supplyCode == 'cmp1') {
          monthName = ((res.data.cmp1SimCardDetail && res.data.cmp1SimCardDetail.setMeal) ? res.data.cmp1SimCardDetail.setMeal : '')//月套餐名称
        } else if (res.data.supplyCode == 'cmp2') {
          monthName = ((res.data.cmp2SimCardDetail && res.data.cmp2SimCardDetail.setMeal) ? res.data.cmp2SimCardDetail.setMeal : '')//月套餐名称
        }
        self.setData({
          expiredTime: expiryDateStr,
          isExpired,
          monthName: monthName, //月套餐名称
          monthRemain: res.data.remainFlow ? Number(res.data.remainFlow) : ''//本月剩余
        })
      },
      fail (res) { },
    })
  },

  /**
   * tab 切换
   * @param {*} e 
   */
  changeSet (e) {
    console.log(e)
    let self = this
    let { rechargeData, renewData, isExpired } = self.data
    let { item, type } = e.currentTarget.dataset
    if (type == 'recharge') {
      if (isExpired) { //如果过期 弹出
        return plugin.jsUtil.tip('套餐已到期，请先续费')
      }
      rechargeData.forEach((rcg) => {
        if (rcg.packageVersionId === item.packageVersionId) {
          rcg.check = true
          self.setData({
            currentPlan: rcg,
            canPay: true
          })
        } else {
          rcg.check = false
        }
      })
      self.setData({
        rechargeData
      })
    } else if (type == 'renewal') {
      renewData.forEach((rd) => {
        if (rd.packageVersionId === item.packageVersionId) {
          rd.check = true
          self.setData({
            currentPlan: rd,
            canPay: true
          })
        } else {
          rd.check = false
        }
      })
      self.setData({
        renewData
      })
    }
  },

  //复选框选中状态
  onAgreeChange (e) {
    console.log(e)
    let self = this
    let type = e.currentTarget.dataset.type
    if (type === 'checkbox') {
      self.setData({
        agreeChecked: e.detail,
      })
    } else {
      self.setData({
        agreeChecked: !self.data.agreeChecked,
      })
    }
  },

  // 发起支付
  handlePayment () {
    let self = this
    if (!self.data.agreeChecked && self.data.canPay) {
      self.setData({
        agreeShow: true,
      })
    } else if (self.data.canPay) {
      self.setData({
        payInfoVisible: true,
      })
    }
  },

  // 同意并支付
  agreeConfirm () {
    this.setData({
      agreeChecked: true,
      agreeShow: false,
      payInfoVisible: true,
    })
  },

  // 协议取消
  agreeClose () {
    this.setData({
      agreeShow: false,
    })
  },

  // 关闭支付弹窗
  closePay () {
    this.setData({
      payInfoVisible: false,
    })
  },

  // 付款成功
  successPay () {
    this.setData({
      payInfoVisible: false,
    })
    this.getFlowDetail()
  },

  // 继续付款
  continuePay () {
    this.setData({
      payInfoVisible: true,
    })
  },

  // 查看服务协议
  viewServiceAgreement () {
    // Demo: mode/payment 已移除
  },

  //MB转换为GB
  mbToGb (mb, decimals) {
    const gb = mb / 1024
    return decimals !== undefined ? gb.toFixed(decimals) : gb
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage () {

  },


  // 复制ICCID
  onCopy (e) {
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
   * 点击右上角订单图标，跳转到订单列表
   */
  goOrderList () {
    this.pageRouter.navigateTo({
      // url: "/panel/toy/module/order/list/index?packageType=" + this.data.packageType,
      url: "/panel/toy/module/order/list/index"
    })
  }


})