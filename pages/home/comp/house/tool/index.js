const plugin = requirePlugin('quecPlugin')
let app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    selDevice: {//选中的数据
      type: Array,
      value: []
    },
    isCommon: {//是否常用
      type: Boolean,
      value: false
    },
    fid: {//家庭id
      type: String,
      value: ''
    },
    role: {//当前家庭角色
      type: Number,
      value: 0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    tab: [],

    tabData: [{
      name: plugin.main.getLang()['toolRemove'],
      icon: 'sdk-icon common',
      event: 'remove'
    },
    {
      name: plugin.main.getLang()['toolAdd'],
      icon: 'sdk-icon add_common',
      event: 'add'
    },
    {
      name: plugin.main.getLang()['toolMove'],
      icon: 'sdk-icon move',
      event: 'move'
    },
    {
      name: plugin.main.getLang()['toolShare'],
      icon: 'sdk-icon share',
      event: 'share'
    },
    {
      name: plugin.main.getLang()['toolDel'],
      icon: 'sdk-icon delete',
      event: 'delete'
    },
    {
      name: plugin.main.getLang()['toolRename'],
      icon: 'sdk-icon rename',
      event: 'rename'
    }],
    renameVisible: false,//修改名称弹框
    delVisible: false,//删除弹框
    beforeClose: {},
    deviceName: '',//重命名设备名称
    currentItem: {},//当前操作的对象
    i18n: '',
    skin: '',
    moveShow: false,
    active: '',
    roomName: '',
    pager: {
      page: 1,
      pageSize: 200,
      total: 0
    },
    fmList: [],//移动时家庭列表
    selRoom: [],//移动时选中的房间
    moveFailShow: false, //移动失败弹框
    moveFailureList: [], //移动失败列表

    multDelShow: false, //多设备删除弹框
    delFailShow: false, //删除失败列表
    batchFailList: [], //批量删除失败列表
    env: app.globalData.envData
  },

  observers: {
    'selDevice,isCommon,role': function (data, isCommon, role) {
      if (data.length > 0) {
        this.initAct(data, role)
      }
    }
  },

  lifetimes: {
    ready: function () {
      this.setData({
        i18n: plugin.main.getLang(),
        skin: plugin.main.getSkin()
      })
    },
    detached: function () { }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * @param {*} data -选中数据
     * @param {*} role - 角色
     */
    initAct (data, role) {
      let self = this
      let tabData = self.data.tabData
      let tdata = tabData
      if (data.length == 1) {
        self.setData({
          currentItem: data[0]
        })
        tdata = self.shareFmt(data, tdata)
        if (role === 3) {//普通成员
          tdata = self.filterAct(tdata, role, data)
        }
      } else if (data.length > 1) {
        tdata = self.filterAct(tabData, role, data)
      }

      let cTab = self.commonFmt(data, tdata)
      let mTab = self.moveFmt(data, cTab)
      self.setData({
        tab: mTab
      })
    },
    /**
     * 普通成员或选中设备为多个时,禁用分享、删除、重命名
     * */
    filterAct (tabData, role, data) {
      let isBatchDel = this.data.env['isBatchDel']
      let tdata = []
      if (role && role === 3) {
        if (data && data.length == 1 && data[0].bindMode == 1) {//多绑设备
          tdata = tabData.filter((elm) => {
            return elm.event !== 'move'
          })
        } else {
          tdata = tabData.filter((elm) => {
            return elm.event !== 'share' && elm.event !== 'delete' && elm.event !== 'rename' && elm.event !== 'move'
          })
        }
      } else {
        tdata = tabData.filter((elm) => {
          if (isBatchDel) {
            let otaData = data.filter((elm) => {
              return elm.planId && elm.upgradeStatus == 1
            })

            let shareData = data.filter((elm) => {
              return elm.shareCode !== null
            })
            if (shareData.length > 0 || otaData.length > 0) {
              return elm.event !== 'share' && elm.event !== 'rename' && elm.event !== 'delete'
            } else {
              if (data.length > 20) {
                return elm.event !== 'share' && elm.event !== 'rename' && elm.event !== 'delete'
              } else {
                return elm.event !== 'share' && elm.event !== 'rename'
              }
            }
          } else {
            return elm.event !== 'share' && elm.event !== 'delete' && elm.event !== 'rename'
          }
        })
      }
      return tdata
    },
    /**
     * 判断是否为分享设备
     */
    shareFmt (data, tab) {
      let tabs = []
      let shareData = data.filter((elm) => {
        return elm.shareCode !== null
      })
      if (shareData.length > 0) {
        tabs = tab.filter((elm) => {
          return elm.event !== 'share' && elm.event !== 'move'
        })
      } else if (data[0].planId && data[0].upgradeStatus == 1) {
        tabs = tab.filter((elm) => {
          return elm.event !== 'delete'
        })
      } else {
        tabs = tab
      }
      return tabs
    },
    /**
     * data-选中数据
     * tab-数据
     */
    commonFmt (data, tab) {
      let tabs = []
      let commonData = data.filter((elm) => {
        return elm.commonUsed == true
      })
      let noCommonData = data.filter((elm) => {
        return elm.commonUsed == false
      })
      if (commonData.length == data.length) {
        tabs = tab.filter((elm) => {
          return elm.event !== 'add'
        })
      }
      if (noCommonData.length > 0) {
        tabs = tab.filter((elm) => {
          return elm.event !== 'remove'
        })
      }
      return tabs
    },
    /**
     * 判断是否为单绑设备bindMode==2/3，显示移动
     */
    moveFmt (data, tab) {
      let bindData = data.filter((m) => {
        return (m.bindMode == 2 || m.bindMode == 3) && m.shareCode == null
      })
      let mTab = []
      if (bindData.length !== data.length) {
        mTab = tab.filter((n) => {
          return n.event !== 'move'
        })
      } else {
        mTab = tab
      }

      return mTab
    },


    /**
     * 操作
     */
    goEvent (e) {
      let self = this
      let { selDevice } = self.properties
      let event = e.currentTarget.dataset.item.event

      switch (event) {
        case 'remove':
          self.remove()
          break
        case 'add':
          self.add()
          break
        case 'move':
          self.move()
          break
        case 'share':
          self.share()
          break
        case 'delete':
          if (selDevice.length > 0) {
            if (selDevice.length == 1) {
              self.delTip()
            } else {
              self.setData({
                multDelShow: true
              })
            }
          }
          break
        case 'rename':
          self.rename()
          break
      }
    },

    /**
     * 移除常用
     */
    remove () {
      const self = this
      const { fid } = self.properties
      let deviceList = self.commonParam()
      plugin.smartHome.deleteCommonUsedDevice({
        deviceList,
        fid,
        success (res) {
          if (res.data.failureList.length > 0) {
            self.setData({
              moveFailureList: res.data.failureList
            })
            self.openFail()
          } else {
            plugin.jsUtil.tip(self.data.i18n['moveTipSucc1'])
            self.setData({
              moveShow: false
            })
            plugin.jsUtil.delayCb(() => {
              self.triggerEvent('moveSuccess', 'remove')
            })
          }
        }
      })
    },

    /**添加常用 */
    add () {
      const self = this
      const { fid } = self.properties
      let deviceList = self.commonParam()
      plugin.smartHome.addCommonUsedDevice({
        deviceList,
        fid,
        success (res) {
          if (res.data.failureList.length > 0) {
            self.setData({
              moveFailureList: res.data.failureList
            })
            self.openFail()
          } else {
            plugin.jsUtil.tip(self.data.i18n['addRoomTipSucc'])
            self.setData({
              moveShow: false
            })
            plugin.jsUtil.delayCb(() => {
              self.triggerEvent('moveSuccess', 'add')
            })
          }
        }
      })
    },
    /**添加/ */
    commonParam () {
      const { selDevice, fid } = this.properties
      let deviceList = []
      let type = 0
      //type 设备类型 1-家庭中的设备、2-分享设备、3-用户自己绑定的设备
      selDevice.forEach(elm => {
        if (elm.shareCode) {
          type = 2
        } else {
          if (elm.fid) {
            type = 1
          } else {
            type = 3
          }
        }
        let item = {
          pk: elm.productKey,
          dk: elm.deviceKey,
          type
        }
        deviceList.push(item)
      })
      return deviceList
    },

    /**
     * 移动
     */
    move () {
      this.setData({
        moveShow: true
      })
      this.getFamily()
    },

    /**
     * 移动弹窗关闭
     */
    moveClose () {
      let self = this
      self.setData({
        moveShow: false
      })
      plugin.jsUtil.delayCb(() => {
        self.triggerEvent('moveSuccess', 'move')
      })
    },

    /**
     * 确定移动
     */
    finish () {
      const self = this
      if (self.data.selRoom.length == 0) {
        return plugin.jsUtil.tip(self.data.i18n['selRoomTip'])
      }
      let arr = []
      let selDevice = self.data.selDevice
      for (const m of selDevice) {
        if (m.frid == self.data.selRoom[0].frid) {
          return plugin.jsUtil.tip(self.data.i18n['moveValidTip'])
        }
        let item = {
          dk: m.deviceKey,
          newFrid: self.data.selRoom[0].frid,
          oldFrid: m.frid,
          pk: m.productKey
        }
        arr.push(item)
      }
      plugin.smartHome.addDeviceInFamilyRoom({
        arr,
        success (res) {
          if (res.data.failureList.length > 0) {
            self.setData({
              moveFailureList: res.data.failureList
            })
            self.openFail()
          } else {
            plugin.jsUtil.tip(self.data.i18n['moveTipSucc2'])
            self.setData({
              moveShow: false
            })
            plugin.jsUtil.delayCb(() => {
              self.triggerEvent('moveSuccess', 'move')
            })
          }
        },
        fail (res) {

        }
      })
    },

    /**
     * 打开失败的弹框
     */
    openFail () {
      this.setData({
        moveFailShow: true
      })
    },

    /**
     * 关闭失败的弹框
     */
    moveFailYes () {
      this.setData({
        moveFailShow: false
      })
    },

    /**
     * 移动tab
     */
    tabChange (e) {
      this.setData({
        active: e.detail.name
      })
    },

    /**
     * 修改名称弹框
     */
    rename () {
      this.setData({
        renameVisible: true,
        deviceName: this.properties.selDevice[0].deviceName
      })
    },

    /**
     * 重命名-确定
     */
    confirmRename (e) {
      let self = this
      if (self.properties.selDevice[0].deviceName == self.data.deviceName) {
        plugin.jsUtil.tip('请先修改')
        return
      }

      if (self.data.deviceName === '') {
        plugin.jsUtil.tip(self.data.i18n['dnameValid'])
        return
      }
      wx.nextTick(() => {
        if (self.data.currentItem.shareCode) {
          self.shareRename()
        } else {
          self.dmpRename()
        }
      })
    },

    /**
     * 分享设备重命名
     */
    shareRename () {
      let self = this
      plugin.quecShare.shareRename({
        shareCode: self.data.currentItem.shareCode,
        deviceName: self.data.deviceName,
        success (res) {
          plugin.jsUtil.tip(self.data.i18n['renameTip'], 'success')
          plugin.jsUtil.delayCb(() => {
            self.triggerEvent('renameSuccess', true)
          })
        },
        fail (res) {
          plugin.jsUtil.invalidCb(res, self, true)
        }
      })
    },

    /**
     * 设备重命名
     */
    dmpRename () {
      let self = this
      plugin.quecManage.rename({
        dk: self.data.currentItem.deviceKey,
        pk: self.data.currentItem.productKey,
        deviceName: self.data.deviceName,
        success (res) {
          if (res.code === 200) {
            plugin.jsUtil.tip(self.data.i18n['renameTip'], 'success')
            plugin.jsUtil.delayCb(() => {
              self.triggerEvent('renameSuccess', true)
            })
          }
        },
        fail (res) {
          plugin.jsUtil.invalidCb(res, self, true)
        }
      })
    },

    /**
     * 重命名-取消
     */
    renameCancel () {
      let self = this
      self.setData({
        deviceName: ''
      })
    },

    /**
     * 关闭重命名弹框
     */
    onClose () {
      this.setData({
        renameVisible: false
      })
    },

    /**
     * 设备名称change
     */
    dnameChange (e) {
      let self = this
      let dname = plugin.jsValid.trimField(e.detail)
      dname = plugin.jsValid.noEmo(dname)
      self.setData({
        deviceName: dname
      })
    },

    /**
     * 弹出删除确认框
     */
    delTip () {
      let self = this
      self.setData({
        delVisible: true,
      })
    },

    /**
     * 确认删除
     */
    delConfirm () {
      let self = this
      if (self.data.currentItem.shareCode) {
        self.shareDelete()
      } else {
        self.dmpDelete()
      }
    },

    /**
     * 分享设备删除
     */
    shareDelete () {
      let self = this
      plugin.quecShare.beSharedRemove({
        shareCode: self.data.currentItem.shareCode,
        success (res) {
          if (res.code === 200) {
            plugin.jsUtil.tip(self.data.i18n['delSuccTip'], 'success')
            plugin.jsUtil.delayCb(() => {
              self.triggerEvent('unbindSuccess', true)
            })
          }
        },
        fail (res) {
          plugin.jsUtil.invalidCb(res, self, true)
        }
      })
    },

    /**
     * 设备删除
     */
    dmpDelete () {
      let self = this
      plugin.quecManage.unbind({
        dk: self.data.currentItem.deviceKey,
        pk: self.data.currentItem.productKey,
        success (res) {
          if (res.code === 200) {
            plugin.jsUtil.tip(self.data.i18n['delSuccTip'], 'success')
            plugin.jsUtil.delayCb(() => {
              self.triggerEvent('unbindSuccess', true)
            })
          }
        },
        fail (res) {
          plugin.jsUtil.invalidCb(res, self, true)
        }
      })
    },

    /**
     * 分享
     */
    share () {
      this.triggerEvent('Share', this.data.currentItem)
    },

    /**
     * 获取家庭列表
     */
    getFamily () {
      const self = this
      plugin.smartHome.getFamilyList({
        page: self.data.pager.page,
        pageSize: self.data.pager.pageSize,
        role: '1,2',
        success (res) {
          let list = res.data.list
          if (list.length > 0) {
            self.setData({
              fmList: list,
              active: list[0].fid
            })
          }
        },
        fail (res) { }
      })
    },

    /**
     * 获取选中的房间
     */
    getSelRoom (e) {
      this.setData({
        selRoom: e.detail
      })
    },


    /**
     * 多设备删除
     */
    unbindSuccess () {
      this.triggerEvent('unbindSuccess', true)
    },

  }
})
