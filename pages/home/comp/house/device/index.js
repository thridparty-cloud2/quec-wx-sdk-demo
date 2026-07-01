const plugin = requirePlugin('quecPlugin')
let app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    noDataImg: {
      type: String,
      value: plugin.main.getBaseImgUrl() + 'images/device/no_device_data_v2.png'
    },
    mode: {
      type: Boolean,
      value: undefined
    },
    auto: {
      type: Boolean,
      value: false
    },
    modeRefresh: {
      type: Boolean,
      value: false
    },
    model: {
      type: Object,
      value: {}
    },
    valaddTxt: {
      type: Object
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    active: 'common',
    isRefresh: false,
    roomShow: false,
    isEdit: false,
    selDevice: [],
    i18n: '',
    skin: '',
    tabRoom: [],
    isFinish: false,
    page: {
      page: 1,
      pageSize: 50,
      total: 0
    },
    itemHeight: 52,
    scrollHeight: 100,
    stop: 40,
    navRefresh: false,
    curFamly: {},
    isScanCancel: false,
    commonFinish: false,
    isSet: true,
    isValadd: false,
    roomTop: 40,
    valSwitch: true,
    env: app.globalData.envData,
  },

  lifetimes: {
    attached: function () {
      if (JSON.stringify(this.data.curFamly) !== '{}') {
        this.getRooms()
      }
      this.setData({
        i18n: plugin.main.getLang(),
        skin: plugin.main.getSkin(),
        stop: wx.getWindowInfo().safeArea.top ? wx.getWindowInfo().safeArea.top : 40,
        navRefresh: this.properties.modeRefresh
      })
    },
    detached: function () {
      this.setData({
        isRefresh: false
      })
      this.hideRoom()
    }
  },

  observers: {
    "isRefresh,modeRefresh": function (isRefresh, modeRefresh) {
      if (isRefresh || modeRefresh) {
        this.setData({
          isEdit: false,
          selDevice: [],
          isValadd: ((plugin.config.getStorageByKey('telSmSwitch') && !JSON.parse(plugin.config.getStorageByKey('telSmSwitch')).tswitch)) ? true : false
        })
        if (this.properties.isBanner) {
          this.setData({
            roomTop: this.data.stop + 40 + 44 + 130
          })
        } else {
          if ((this.data.env['isPushTel'] || this.data.env['isPushSms']) && this.data.valSwitch) {
            this.setData({
              roomTop: this.data.stop + 40 + 44 + 100
            })
          } else {
            this.setData({
              roomTop: this.data.stop + 40 + 44
            })
          }
        }
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 查询家庭中的房间列表
     */
    getRooms () {
      const self = this
      if (self.data.curFamly.fid) {
        plugin.smartHome.getFamilyRoomList({
          fid: self.data.curFamly.fid,
          page: self.data.page.page,
          pageSize: self.data.page.pageSize,
          success (res) {
            if (res.data.list) {
              let list = res.data.list
              self.setData({
                isFinish: true,
                tabRoom: list,
                'page.total': res.data.total,
                hasDataList: res.data.total > 0
              })

              let scrollHeight = (self.data.tabRoom.length + 1) * self.data.itemHeight + 10
              self.setData({
                scrollHeight
              })

              if (plugin.config.getStorageByKey('activefrid')) {
                let activefrid = plugin.config.getStorageByKey('activefrid')
                let troom = self.data.tabRoom
                let curRoom = troom.filter((m) => {
                  return m.frid == activefrid
                })
                if (curRoom.length > 0) {
                  self.setData({
                    active: activefrid
                  })
                }
              }
            }
          }, fail (res) {
            self.setData({
              tabRoom: [],
              hasDataList: false
            })
          }, complete (res) {
            self.setData({
              triggered: false
            })
          }
        })
      }

    },

    /**
     * tab切换
     */
    beforeChange (e) {
      const { callback, name } = e.detail
      if (!this.data.isEdit) {
        callback(true)
        this.setData({
          isRefresh: true,
          active: name
        })
        plugin.config.setStorage('activefrid', name)
      } else {
        callback(false)
      }
    },

    /**
     * 显示房间遮罩
     */
    showRoom () {
      this.setData({
        roomShow: true
      })
    },

    /**
     * 隐藏房间遮罩
     */
    hideRoom () {
      this.setData({
        roomShow: false
      })
    },

    /**
     * 房间管理
     */
    goRoomList (e) {
      let info = {
        fid: e.currentTarget.dataset.fid,
        frole: e.currentTarget.dataset.frole
      }
      this.hideRoom()
      this.triggerEvent('RoomList', info)
    },

    /**
     * 跳转到对应的tab
     */
    goRoomTab (e) {
      let tab = e.currentTarget.dataset.tab
      this.setData({
        active: tab,
        roomShow: false
      })
      plugin.config.setStorage('activefrid', tab)
    },

    /**
     * 编辑模式
     */
    getEdit (e) {
      const self = this
      self.setData({
        isEdit: e.detail
      })
    },

    /**
     * 编辑模式下，关闭
     */
    getSelIsEdit (e) {
      this.setData({
        isEdit: e.detail
      })
    },

    /**
     * 获取可编辑的设备
     */
    getselDevice (e) {
      this.setData({
        selDevice: e.detail
      })
    },
    /**
     * 分享
     */
    Share (e) {
      this.triggerEvent('toShare', e.detail)
    },

    /**
     * 设备详情
     */
    goDetail (e) {
      plugin.config.setStorage('activefrid', this.data.active)
      this.triggerEvent('goDetail', e.detail)
    },

    /**
     * 移动成功
     */
    moveSuccess (e) {
      if (e.detail == 'move') {
        this.getRooms()
      }
      this.setData({
        isEdit: false
      })
    },

    /**
   * 重命名成功
   */
    renameSuccess (e) {
      this.setData({
        isEdit: false
      })
    },

    /**
    * 删除成功
    */
    unbindSuccess (e) {
      this.setData({
        isEdit: false
      })
    },

    /**
     * 无效设备
     */
    invalidDevice () {
      this.setData({
        isEdit: false
      })
    },

    /**
     * 近场发现
     */
    toNetwork () {
      this.triggerEvent('toNetwork', true)
    },

    /**
     * 扫码安装
     */
    toScan (e) {
      this.triggerEvent('toScan', e.detail)
    },

    /**
     * 当前家庭
     */
    curFamly (e) {
      let self = this
      const prevFid = self.data.curFamly.fid
      const nextFid = e.detail.fid
      const isSameFamily = prevFid && nextFid && prevFid == nextFid
      self.setData({
        curFamly: e.detail
      })
      if (JSON.stringify(self.data.curFamly) !== '{}') {
        self.getRooms()
        self.setData({
          isRefresh: true,
          active: isSameFamily ? self.data.active : 'common'
        })
      }
    },

    /**
     * 家庭管理
     */
    familyList (e) {
      this.triggerEvent('familyList', true)
    },

    /**
     * 搜索
     */
    goSearch (e) {
      this.triggerEvent('Search', e.detail)
    },

    /**
      * 功能介绍
      */
    introduct () {
      this.triggerEvent("Introduct", true)
    },

    /**
     * 家居模式介绍
     */
    mode () {
      this.triggerEvent('Mode', true)
    },

    /**
     * 常用列表加载完成
     */
    CommonFinish (e) {
      this.setData({
        commonFinish: e.detail
      })
    },

    /**配网V1 */
    toNear () {
      this.triggerEvent('toNear')
    },

    /**
     * banner link
     */
    toLink (e) {
      this.triggerEvent('Link', e.detail)
    },

    /**青蛙oem小程序，跳转到指定添加页面 */
    noScanAndNear () {
      this.triggerEvent('noScanAndNear')
    },

    /**
  * 电话推送
  */
    goTel () {
      this.triggerEvent('Tel', true)
    },
    /**
     * 短信推送
     */
    goSms () {
      this.triggerEvent('Sms', true)
    },
    /**
    * 关闭电话短信服务
    */
    cloeVaddEnter () {
      this.setData({
        isValadd: true
      })
    },

    /**
     * 电话短信服务
     */
    changeValAdd (e) {
      let onoff = e.detail
      this.setData({
        valSwitch: onoff
      })
      if (this.data.env['isPushTel'] || this.data.env['isPushSms']) {
        if (onoff) {
          this.setData({
            roomTop: this.data.stop + 40 + 44 + 100
          })
        } else {
          this.setData({
            roomTop: this.data.stop + 40 + 48
          })
        }
      }
    }
  }
})
