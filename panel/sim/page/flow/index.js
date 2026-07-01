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
    planList: [], //套餐列表
    currentPlan: "", //当前选中的套餐
    agreeShow: false,
    agreeChecked: false,
    payInfoVisible: false,
    canPay: false,
    currencyUnitMap: {
      CNY: "￥",
      USD: "$",
    },
    iccId: "",
    expiredTime: "", //过期时间，格式 年-月-日
    deviceName: "",
    packageType:"EDU_SIM_RENEW", //SIM 卡类型
    noDataImg: plugin.main.getRootImg() + 'ai/sim_no_data.png',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    let self = this
    if (options.item) {
      const curDevice = JSON.parse(decodeURIComponent(options.item))
      self.setData({
        curDevice,
        deviceName: curDevice.deviceName || "",
      })
    }
    if (options.iccId) {
      self.setData({
        iccId: decodeURIComponent(options.iccId),
      })
    }
     // this.platformConfig()
     this.findPackage() //platformConfig 打开后注释

    this.getFlowDetail()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady () { },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow () { },

  /**
   * 获取平台配置
   */
  platformConfig(){
    let self = this
    plugin.sim.platformConfig({
      productKey: self.data.curDevice.productKey,
      deviceKey: self.data.curDevice.deviceKey,
      success (res) {
        if(res.data){
          let pdata=res.data
          if(pdata.cmpVersion == 'cmp2' && pdata.renewalType == 'retailPackage'){
            self.setData({
              packageType:'EDU_SIM_RETAIL'
            })
          }else{
            self.setData({
              packageType:'EDU_SIM_RENEW'
            })
          }
        }
      },
      fail (res) {
        self.setData({
          packageType:'EDU_SIM_RENEW'
        })
      },
      complete (res) { 
        self.findPackage()
      },
    })
  },

  /**
   * 查询套餐列表
   */
  findPackage () {
    let self = this
    plugin.jsUtil.load()
    let { curDevice, iccId, packageType } = self.data
    let metaData = self.data.metaData
    plugin.ai.findPackageListV2({
      merchantNo: metaData["merchantNo"].metadataValue,
      packageType,
      terminalCode: metaData["bssClientAppId"].metadataValue,
      productKey: curDevice.productKey,
      deviceKey: curDevice.deviceKey,
      iccids: iccId,
      success (res) {
        const list = res.data || []
        list.forEach((item) => {
          item.packagePriceYuan = (item.packagePrice / 100).toFixed(2)
        })
        self.setData({
          planList: list,
          currentPlan: list[0],
        })
        self.setData({
          canPay: true,
        })
        if (list.length === 0) {
          self.setData({
            canPay: false,
          })
        }
      },
      fail (res) {
        // console.error("获取套餐列表失败:", res)
      },
      complete (res) {
        plugin.jsUtil.hideTip()
      },
    })
  },

  //复选框选中状态
  onAgreeChange (e) {
    this.setData({
      agreeChecked: e.detail,
    })
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
   * 点击切换选中套餐
   */
  clickPlanItem (e) {
    const item = e.currentTarget.dataset.item
    if (this.data.currentPlan.packageCode === item.packageCode) {
      this.setData({
        packageDetailVisible: true,
      })
      return
    }
    this.setData({ currentPlan: item })
  },

  getFlowDetail () {
    let self = this
    let iccid = self.data.iccId
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
        self.setData({
          expiredTime: expiryDateStr,
          isExpired,
        })


        // if(res.data.status=='EXPIRED'){
        //   self.setData({
        //     canPay:false
        //   })
        // }
        console.log("sim卡充值详情", res.data)
      },
      fail (res) { },
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
  /**
   * 点击右上角订单图标，跳转到订单列表
   */
  goOrderList () {
    this.pageRouter.navigateTo({
      url: "/panel/toy/module/order/list/index?packageType=" + this.data.packageType,
    })
  },
})
