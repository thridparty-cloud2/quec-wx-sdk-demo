const plugin = requirePlugin("quecPlugin")

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    iccId: {
      type: null, //任意类型,保留null值
    },
    curItem: {
      type: Object,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    isExpired: true, //是否已过期
    isTodayExpire: false, // 是否今日到期
    time: 0, //剩余天数
    expiryDateFmt: "", //到期日期（格式化）
    productKey: "",
    deviceKey: "",
    deviceName: "",
    isFinish: false,
    showWarning: true,
  },

  lifetimes: {
    ready () {
      this.setData({
        productKey: this.properties.curItem.productKey,
        deviceKey: this.properties.curItem.deviceKey,
        deviceName: this.properties.curItem.deviceName,
      })
    },
  },

  // 页面返回显示时，自动刷新剩余天数
  pageLifetimes: {
    show () {
      const { iccId } = this.properties
      if (iccId) {
        this.getFlowDetail(iccId)
      }
    },
  },

  observers: {
    iccId: function (iccId) {
      if (iccId) {
        this.getFlowDetail(iccId)
      }
    },
  },

  methods: {
    /**
     * 查询sim卡详情
     * @param {*} iccIdArg
     */
    getFlowDetail (iccIdArg) {
      const iccid = iccIdArg || this.properties.iccId
      const self = this
      plugin.sim.getSimCardDetail({
        iccid,
        productKey: self.properties.curItem.productKey,       
        deviceKey: self.properties.curItem.deviceKey,
        success (res) {
          console.log("sim卡充值详情", res.data)
          const expiryDate = res && res.data ? res.data.expiryDate : null
          if (expiryDate) {
            const expiryObj = new Date(String(expiryDate).replace(/-/g, "/"))
            const expiryEndOfDay = new Date(
              expiryObj.getFullYear(),
              expiryObj.getMonth(),
              expiryObj.getDate(),
              23,
              59,
              59,
            )
            const days = Math.ceil(
              (expiryEndOfDay.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
            )
            const isExpired = days <= 0
            const isTodayExpire = days === 1

            self.setData({
              isExpired: isExpired,
              isTodayExpire: isTodayExpire,
              time: days > 0 ? days - 1 : 0,
              expiryDateFmt:
                plugin.jsUtil.formatDate(expiryObj, "yyyy-MM-dd") || String(expiryDate),
              showWarning: true,
            })
          } else {
            self.setData({
              isExpired: false,
              isTodayExpire: false,
              time: 0,
              expiryDateFmt: "",
              showWarning: false,
            })
          }
        },
        fail (res) {
          self.setData({
            showWarning: false
          })
        },
        complete (res) {
          self.setData({
            isFinish: true,
          })
        },
      })
    },

    /**
     * 跳转到设备流量充值页
     */
    goFlow () {
      const { iccId } = this.properties
      const { productKey, deviceKey, deviceName } = this.data
      const item = {
        productKey,
        deviceKey,
        deviceName,
      }
      wx.navigateTo({
        url: `/panel/general/set/flow/index?iccId=${encodeURIComponent(
          iccId,
        )}&item=${encodeURIComponent(JSON.stringify(item))}`,
      })
    },
  },
})
