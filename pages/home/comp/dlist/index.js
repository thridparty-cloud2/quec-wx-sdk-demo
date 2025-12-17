import dlist from '../util/dlist.js'
import { validShare } from '../util/tool.js'
const plugin = requirePlugin('quecPlugin')
let app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    mode: {
      type: Boolean
    },
    isRefresh: {//是否刷新
      type: Boolean,
      value: false
    },
    isCommon: {//是否常用
      type: Boolean,
      value: false
    },
    fid: { //家庭id
      type: String,
      value: ''
    },
    frid: {//房间id
      type: String,
      value: ''
    },
    isEdit: {//是否编辑
      type: Boolean,
      value: false
    },
    from: {//那个页面 home-首页 search-搜索页面
      type: String,
      value: ''
    },
    searchName: {//搜索页面按设备名称
      type: String,
      value: ''
    },
    frole: {//家庭权限
      type: Number,
    },
    sHeight: {
      type: Number
    },
    isValadd: {
      type: Boolean
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    /**
     * 设备列表数据
     */
    deviceData: [],
    i18n: '',
    skin: '',
    page: {
      page: 1,
      pageSize: 12,
      total: 0
    },
    deviceName: '',//搜索页面设备名称
    currentItem: {},//当前操作的对象
    triggered: false,
    hasDataList: true,
    noSearchImg: plugin.main.getBaseImgUrl() + 'images/device/ic_empty_v2.png',
    noDataImg: plugin.main.getBaseImgUrl() + 'images/device/no_device_data_v2.png',//无数据图片
    isEdit: false,
    selDevice: [],
    frole: '',
    isFinish: false,
    sceneRefresh: false,
    isCommon: '',
    sHei: 300,
    sceDataLen: 0,
    isToken: undefined,
    cFlag: true,
    env: app.globalData.envData
  },
  pageLifetimes: {
    show: function () {
      this.setK()
    },
    hide: function () { }
  },
  lifetimes: {
    attached: function () {
      this.setData({
        i18n: plugin.main.getLang(),
        skin: plugin.main.getSkin()
      })
      this.setK()
    },
    detached: function () { }
  },

  observers: {
    'isRefresh': function (isRefresh) {
      if (isRefresh) {
        this.refreshList()
      }
    },
    'isValadd': function (isValadd) {
      let sHei = this.data.sHei
      this.setData({
        sHei: (isValadd ? (sHei + 88) : (sHei - 88))
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
    * 获取token
    */
    setK () {
      this.setData({
        deviceData: [],
        isFinish: false,
        isToken: plugin.jsUtil.isToken()
      })
    },

    renderData () {
      let { from, isCommon, fid } = this.properties
      if (fid) {
        switch (from) {
          case 'home':
            if (isCommon) {
              this.getCommonUsedList()
            } else {
              this.getRoomDevice()
            }
            break
          case 'search':
            this.getSearchList()
            break
        }
      } else {
        this.getNonList()
      }
    },

    /**
     * 非家居设备列表
     */
    getNonList () {
      let self = this
      let sname = self.properties.searchName
      plugin.jsUtil.load(3000)
      plugin.quecManage.getDeviceList({
        page: self.data.page.page,
        deviceName: sname,
        pageSize: self.data.page.pageSize,
        success (res) {
          if (res.code === 200) {
            self.setData({
              "page.total": res.data.total
            })
            if (res.data.list) {
              self.fmtListData(res)
            }
          }
        }, fail (res) {
          self.setData({
            hasDataList: false
          })
        }, complete (res) {
          plugin.jsUtil.hideTip()
          // 防止连续控制
          plugin.jsUtil.delayCb(() => {
            self.setData({ cFlag: true })
          }, 1 * 300)
          self.setData({
            triggered: false,
            isFinish: true
          })
        }
      })
    },

    /**
     * 搜索页面获取设备列表
     */
    getSearchList () {
      const self = this
      plugin.jsUtil.load()
      let fid = self.properties.fid
      let sname = self.properties.searchName
      if (fid) {
        plugin.quecHouse.getFamilyDeviceList({
          fid,
          isAddOwnerDevice: true,
          deviceName: sname,
          page: self.data.page.page,
          pageSize: self.data.page.pageSize,
          success (res) {
            self.fmtListData(res)
          },
          fail (res) {
            self.setData({
              hasDataList: false
            })
          }, complete (res) {
            plugin.jsUtil.hideTip()
            // 防止连续控制
            plugin.jsUtil.delayCb(() => {
              self.setData({ cFlag: true })
            }, 1 * 300)
            self.setData({
              triggered: false,
              isFinish: true
            })
          }
        })
      }
    },

    /**
     * 获取房间
     */
    getRoomDevice () {
      let self = this
      plugin.jsUtil.load()
      let frid = self.properties.frid
      if (frid) {
        plugin.quecHouse.getFamilyRoomDeviceList({
          frid,
          page: self.data.page.page,
          pageSize: self.data.page.pageSize,
          success (res) {
            self.fmtListData(res)
          },
          fail (res) {
            self.setData({
              hasDataList: false
            })
          },
          complete (res) {
            plugin.jsUtil.hideTip()
            // 防止连续控制
            plugin.jsUtil.delayCb(() => {
              self.setData({ cFlag: true })
            }, 1 * 300)
            self.setData({
              triggered: false,
              isFinish: true
            })
          }
        })
      }
    },

    /**
     * 常用设备
     */
    getCommonUsedList () {
      let self = this
      plugin.jsUtil.load(3000)
      let fid = self.properties.fid
      if (fid) {
        plugin.quecHouse.getCommonUsedDeviceList({
          fid,
          page: self.data.page.page,
          pageSize: self.data.page.pageSize,
          success (res) {
            self.fmtListData(res)
          },
          fail (res) {
            self.setData({
              hasDataList: false
            })
          }, complete (res) {
            plugin.jsUtil.hideTip()
            // 防止连续控制
            plugin.jsUtil.delayCb(() => {
              self.setData({ cFlag: true })
            }, 1 * 300)
            self.setData({
              triggered: false,
              isFinish: true
            })
            self.triggerEvent('CommonFinish', self.data.isFinish)
          }
        })
      }
    },

    /**
     * 列表数据格式化
     */
    fmtListData (res) {
      let self = this
      self.setData({
        "page.total": res.data.total
      })
      if (res.data.list) {
        let list = res.data.list
        list.forEach(elm => {
          elm.isOta = false
          elm.otaTimer = null
          elm.check = (elm.check ? elm.check : false)
          if (elm.onlineStatus == null) {
            elm.onlineStatus = 0
            elm.deviceStatus = '离线'
          }
          if (elm.roomName) {
            if (elm.deviceType == 2) {//共享设备
              elm.tag = self.data.i18n['deviceType1']
            } else {
              elm.tag = elm.roomName
            }
          } else {
            if (elm.deviceType == 2) {//共享设备
              elm.tag = self.data.i18n['deviceType1']
            } else {
              if (elm.bindMode === 1) {//多绑定设备
                elm.tag = self.data.i18n['deviceType2']
              } else {//未加入房间
                elm.tag = self.data.i18n['deviceType3']
              }
            }
          }
        })
        self.setData({
          deviceData: self.data.deviceData.concat(list),
          hasDataList: res.data.total > 0,
          sHei: wx.getWindowInfo().safeArea.bottom - 70 - 80 - (self.data.env['showAllTxt'] ? 44 : 0) - (self.data.env['isBanner'] ? 170 : 20) - (((self.data.env['isPushTel'] || self.data.env['isPushSms']) || self.properties.isValadd) ? 88 : 0)
        })


        let shei = self.data.sHei
        self.setData({
          sHei: self.properties.isValadd ? (shei + 88) : shei
        })
        let dData = self.data.deviceData
        dData.forEach((d) => {
          if (d.onlineStatus == 1 && d.planId && d.upgradeStatus == 1) {//存在计划id并且upgradeStatus=1 升级中
            d.isOta = true
            self.planUpgradeDetail(d)
            d.otaTimer = setInterval(() => {
              if (plugin.config.getToken()) {
                self.planUpgradeDetail(d)
              } else {
                clearInterval(d.otaTimer) // 清除js定时器 
                d.otaTimer = null
              }
            }, 3000)
          }
        })

        self.setData({
          deviceData: dData
        })

      } else { }
    },

    /**
   * cloud ota
   * @param {*} item 
   */
    planUpgradeDetail (item) {
      let self = this
      let arr = [{
        productKey: item.productKey,
        deviceKey: item.deviceKey,
        planId: item.planId,
      }]
      plugin.ota.getBatchUpgradeDetails({
        arr,
        success (res) {
          console.log('planUpgradeDetail:')
          console.log(res)
          if (res.data[0].deviceStatus == 2 || res.data[0].deviceStatus == 3) {//deviceStatus 0-未升级, 1-升级中, 2-升级成功, 3-升级失败
            let dData = self.data.deviceData
            dData.forEach((d) => {
              if (d.productKey == item.productKey && d.deviceKey == item.deviceKey) {
                item.isOta = false
                if (item.otaTimer) {
                  clearInterval(item.otaTimer) // 清除js定时器
                  item.otaTimer = null
                }
              }
            })
            self.setData({
              deviceData: dData
            })
          }
        }
      })
    },

    // 刷新列表
    refreshList () {
      let self = this
      let page = `page.page`
      self.setData({
        [page]: 1,
        deviceData: [],
        isFinish: false,
        sceneRefresh: true,
        selDevice: []
      })
      wx.nextTick(() => {
        self.renderData()
        self.triggerEvent('selDevice', [])
      })
    },

    // 加载更多
    getMoreList () {
      let self = this
      if (!self.data.cFlag) {
        return
      }
      self.setData({
        cFlag: false
      })
      let totalPage = Math.ceil(self.data.page.total / self.data.page.pageSize)
      if (self.data.deviceData.length >= self.data.page.total || self.data.page.page >= totalPage) return
      let page = `page.page`
      self.setData({
        [page]: !self.data.hasDataList ? 1 : self.data.page.page + 1
      })
      self.renderData()
    },

    /**
     * 添加设备
     */
    scanFn (e) {
      dlist.scanFn(this, e)
    },

    /**
     * 去设备详情页面
     */
    goDeviceDetail (item) {
      dlist.goDeviceDetail(this, item)
    },

    /**
    * 长按编辑模式
    */
    longpress (e) {
      let self = this
      let item = e.currentTarget.dataset.item
      self.fmtCheck()

      wx.vibrateShort({
        type: 'light',
        success () { }
      })
      wx.nextTick(() => {
        self.setData({
          isEdit: true
        })
        if (self.data.isEdit) {
          if (self.data.env['isBatchDel']) {
            validShare(item, self.data.selDevice, () => {
              self.fmtData(item)
            })
          } else {
            self.fmtData(item)
          }

        }
        self.triggerEvent('edit', true)
      })
    },

    /**
     * 单击
     */
    tap (e) {
      let self = this
      let item = e.currentTarget.dataset.item
      let frole = e.currentTarget.dataset.frole
      item.memberRole = frole
      if (self.data.isEdit) {
        if (self.data.env['isBatchDel']) {
          validShare(item, self.data.selDevice, () => {
            self.fmtData(item)
          })
        } else {
          self.fmtData(item)
        }

      } else {
        self.goDeviceDetail(item)
      }
    },

    /**
     * 选中数据
     */
    fmtData (data) {
      let self = this
      let deviceData = this.data.deviceData
      dlist.fmtData(deviceData, data, (res) => {
        self.setData({
          deviceData: res.deviceData,
          selDevice: res.arr
        })
        self.triggerEvent('selDevice', self.data.selDevice)
      })
    },

    /**
     * 初始化选中状态
     */
    fmtCheck () {
      let self = this
      let deviceData = this.data.deviceData
      dlist.fmtCheck(deviceData, (res) => {
        self.setData({
          deviceData: res,
          selDevice: []
        })
      })

    },

    /**
     * 功能介绍
     */
    introduct () {
      dlist.introduct(this)
    },

    /**
     * 家居模式介绍
     */
    mode () {
      dlist.mode(this)
    },

    /**
     * 近场发现V2
     */
    toNetwork () {
      dlist.toNetwork(this)
    },

    /**
    * 近场发现V1
    */
    toNear () {
      dlist.toNear(this)
    },

    /**
     * 无token点击跳转到登录
     */
    jump () {
      this.triggerEvent('Jump')
    },

    /**青蛙oem小程序，跳转到指定添加页面 */
    noScanAndNear () {
      this.triggerEvent('noScanAndNear')
    },

  }
})
