const plugin = requirePlugin('quecPlugin')
import eventBus from '../../../common/eventBus.js'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    tipVisible: false, //返回提示
    isUpgrading: 1, //1-发现可更新项 2-更新中 3-更新完成 4-更新失败 5-重试
    noticeVisible: false,//更新提示
    otaNoDataImg: plugin.assetBase.getRootImg() + 'example/images/ota_no_data.png',
    percent: 0, //升级进度
    pInfo: {}, //计划信息

    comType: {
      0: '模组',
      1: 'MCU'
    },

    resType: {
      0: '主联网模组',
      1: 'MCU模块'
    },

    otaTimer: null,

    isPlan: false,
    plan: {},
    curItem: {},
    deviceUpgradeInfo: {},
    deviceStatus: '',
    curType: 1,// 1-马上升级(确认随时升级), 5-(重试升级) 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    let self = this
    if (options.info) {
      let info = JSON.parse(decodeURIComponent(options.info))
      self.setData({
        curItem: info
      })
      self.getCloudOta()
      eventBus.on('wsDeviceStatus', (status) => {
        console.log('设备在线状态：' + status)
        self.setData({
          deviceStatus: status
        })
      })
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

  },

  /**
   * 获取设备升级计划
   */
  getCloudOta () {
    let self = this
    let { curItem } = self.data
    plugin.ota.getDeviceUpgradePlan({
      productKey: curItem.productKey,
      deviceKey: curItem.deviceKey,
      success (res) {
        if (res.data) {
          self.setData({
            isPlan: true,
            plan: res.data
          })
          if (res.data.deviceStatus == 1) {
            self.setData({
              isUpgrading: 2
            })
            self.planUpgradeDetail()
            self.data.otaTimer = setInterval(() => {
              if (plugin.config.getToken()) {
                self.planUpgradeDetail()
              } else {
                self.clearOtaTimer()
              }
            }, 3000)
          }
        } else {
          self.setData({
            isPlan: false
          })
          self.getDeviceBusinessAttributes()
        }
      }
    })
  },

  /**
   * 如果没有升级计划从获取物模型值deviceData中获取
   */
  getDeviceBusinessAttributes () {
    let self = this
    let { curItem } = self.data
    plugin.quecManage.getDeviceBusinessAttributes({
      pk: curItem.productKey,
      dk: curItem.deviceKey,
      success (res) {
        if (res.data.deviceData) {
          let deviceData = res.data.deviceData
          if (res.data.deviceData.mcuVersion) {
            let mcuVersion = JSON.parse(res.data.deviceData.mcuVersion)
            deviceData.mcuVersionFmt = JSON.stringify(mcuVersion[0]).slice(1, -1)
            deviceData.mcuVersionFmt = deviceData.mcuVersionFmt.replace(/"/g, '')
          } else {
            deviceData.mcuVersionFmt = ''
          }
          self.setData({
            deviceUpgradeInfo: deviceData
          })
        }
      },
      fail (res) { }
    })
  },

  /**
   * 返回提示
   */
  backTip () {
    let { isUpgrading, deviceStatus } = this.data
    if (isUpgrading == 2 && deviceStatus == 1) { //在线且升级中返回首页，其余返回上一级页面
      this.pageRouter.switchTab({
        url: '/pages/home/home'
      })
    } else {
      wx.navigateBack()
    }
  },

  /**
   * 开始更新-用户确认升级
   */
  noticeConfirm () {
    let self = this
    let { curItem, plan, curType } = self.data

    self.setData({
      isUpgrading: 2,
      percent: 0
    })

    let arr = [{
      productKey: curItem.productKey,
      deviceKey: curItem.deviceKey,
      operType: curType,//1-马上升级(确认随时升级), 5-(重试升级) 
      planId: plan.planId,
    }]

    plugin.ota.userBatchConfirmUpgrade({
      arr,
      success (res) {
        if (res.data.failList.length > 0) { //升级失败
          self.setData({
            isUpgrading: 4,
            percent: 100
          })
        } else {
          self.data.otaTimer = setInterval(() => {
            if (plugin.config.getToken()) {
              self.planUpgradeDetail()
            } else {
              self.clearOtaTimer()
            }
          }, 3000)
        }
      }
    })
  },

  planUpgradeDetail () {
    let self = this
    let { curItem, plan } = self.data
    let arr = [{
      productKey: curItem.productKey,
      deviceKey: curItem.deviceKey,
      planId: plan.planId,
    }]
    plugin.ota.getBatchUpgradeDetails({
      arr,
      success (res) {
        self.setData({
          percent: res.data[0].upgradeProgress * 100
        })
        if (res.data[0].deviceStatus == 2) {//deviceStatus 0-未升级, 1-升级中, 2-升级成功, 3-升级失败
          self.clearOtaTimer()
          self.setData({
            isUpgrading: 3,
            plan: res.data[0]
          })
        } else if (res.data[0].deviceStatus == 3 || res.data[0].deviceStatus == 0) {//deviceStatus 0-未升级, 1-升级中, 2-升级成功, 3-升级失败
          self.clearOtaTimer()
          self.setData({
            isUpgrading: 5
          })
        }
      }
    })
  },

  /**
   * 清除定时器
   */
  clearOtaTimer () {
    if (this.data.otaTimer) {
      clearInterval(this.data.otaTimer) // 清除js定时器
      this.setData({
        otaTimer: null
      })
    }
  },

  backTipConfirm () {
    this.pageRouter.switchTab({
      url: '/pages/home/home'
    })
  },

  updateTip (e) {
    this.setData({
      noticeVisible: true,
      curType: Number(e.currentTarget.dataset.type)
    })
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

  }
})