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

    remainFlow: '', //剩余用量

    remainMb: '',//不足mb

    simCloseData: [],
    KEY: 'sim_close_data'
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
        this.warnConfig()
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
     * 获取预警
     */
    warnConfig () {
      let self = this
      let { remainFlow } = self.data
      plugin.sim.warnConfig({
        productKey: self.data.productKey,
        success (res) {
          console.log("sim预警", res)
          if (res.data) {
            if (res.data.mobilePushEnable && res.data.remainingCapacity) {
              let remainCapacity = res.data.remainingCapacity
              if (remainCapacity.thresholdType == 'FIXED') {
                if (remainCapacity.threshold0) {
                  if (remainCapacity.threshold1) {
                    if (remainCapacity.threshold2) {
                      if ((remainFlow > Number(remainCapacity.threshold2)) && (remainFlow <= Number(remainCapacity.threshold1))) {
                        self.setData({
                          remainMb: remainCapacity.threshold1
                        })
                      } else {
                        self.setData({
                          remainMb: remainCapacity.threshold2
                        })
                      }
                    } else {
                      if ((remainFlow > Number(remainCapacity.threshold1)) && (remainFlow <= Number(remainCapacity.threshold0))) {
                        self.setData({
                          remainMb: remainCapacity.threshold0
                        })
                      } else {
                        self.setData({
                          remainMb: remainCapacity.threshold1
                        })
                      }
                    }
                  } else {
                    self.setData({
                      remainMb: remainCapacity.threshold0
                    })
                  }
                }
              }
            }
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
          if (res.data.remainFlow !== null && res.data.remainFlow !== '') {
            console.log(res.data.remainFlow.indexOf('-'))
            self.setData({
              remainFlow: (res.data.remainFlow.indexOf('-') >= 0 || res.data.remainFlow == '0') ? 0 : Number(res.data.remainFlow)
            })
            console.log('----')
            console.log(self.data.remainFlow)
            if (self.data.remainFlow > 0) {
              self.warnConfig()
            }
          }

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
            let days = Math.ceil((expiryEndOfDay.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            self.setData({
              isExpired: days <= 0,
              isTodayExpire: days === 1,
              time: days > 0 ? days - 1 : 0,
              expiryDateFmt: plugin.jsUtil.formatDate(expiryObj, "yyyy-MM-dd") || String(expiryDate)
            })
            if (wx.getStorageSync(self.data.KEY)) {
              let closeData = JSON.parse(wx.getStorageSync(self.data.KEY))
              let fData = closeData.filter((m) => {
                return m.pk === self.data.productKey && m.dk === self.data.deviceKey
              })
              if (fData.length > 0) {
                if (self.data.remainFlow > Number(fData[0].remainMb)) {
                  self.setData({
                    showWarning: true
                  })
                } else {
                  self.setData({
                    showWarning: false
                  })
                }
              } else {
                self.setData({
                  showWarning: true
                })
              }
            } else {
              self.setData({
                showWarning: true
              })
            }
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

    close () {
      this.setData({
        showWarning: false
      })
      let { productKey, deviceKey, simCloseData, remainMb } = this.data
      simCloseData.push({
        // value: this.data.showWarning,
        pk: productKey,
        dk: deviceKey,
        remainMb,
      })
      wx.setStorageSync(this.data.KEY, JSON.stringify(simCloseData))
    },

    /**
     * 跳转到设备流量充值页
     */
    goFlow (e) {
      console.log(e)
      let type = e.currentTarget.dataset.type
      let { iccId } = this.properties
      let { productKey, deviceKey, deviceName } = this.data
      let item = {
        productKey,
        deviceKey,
        deviceName,
      }
      this.pageRouter.navigateTo({
        url: `/panel/general/set/recharge/index?iccId=${encodeURIComponent(iccId)}&item=${encodeURIComponent(JSON.stringify(item))}&type=${type}`
      })
    },
  },
})
