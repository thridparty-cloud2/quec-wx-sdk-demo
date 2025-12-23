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
  },

  /**
   * 组件的初始数据
   */
  data: {
    tab: [],
    tabData: [
      {
        name: plugin.main.getLang()['toolShare'],
        icon: 'sdk-icon share',
        event: 'share',
        disabled: false
      },
      {
        name: plugin.main.getLang()['toolDel'],
        icon: 'sdk-icon delete',
        event: 'delete',
        disabled: false
      },
      {
        name: plugin.main.getLang()['toolRename'],
        icon: 'sdk-icon rename',
        event: 'rename',
        disabled: false
      }
    ],
    renameVisible: false,//修改名称弹框
    delVisible: false,//删除弹框
    deviceName: '',//重命名设备名称
    currentItem: {},//当前操作的对象
    i18n: '',
    skin: '',

    multDelShow: false, //多设备删除弹框
    env: app.globalData.envData
  },

  observers: {
    'selDevice': function (data) {
      if (data.length > 0) {
        this.initAct(data)
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
    initAct (data) {
      let self = this
      let isBatchDel = self.data.env['isBatchDel']
      let tabData = self.data.tabData
      let tdata = tabData
      if (data.length == 1) {
        tabData.forEach((t) => {
          let shareData = data.filter((elm) => {
            return elm.shareCode !== null
          })
          if ((t.event == 'share' && shareData.length > 0)) {
            t.disabled = true
          } else if (t.event == 'delete' && (data[0].planId && data[0].upgradeStatus == 1)) {
            t.disabled = true
          } else {
            t.disabled = false
          }
        })
        self.setData({
          currentItem: data[0]
        })
      } else {
        tabData.forEach((t) => {
          if (isBatchDel) { //支持批量删除
            let otaData = data.filter((elm) => {
              return elm.planId && elm.upgradeStatus == 1
            })
            let shareData = data.filter((elm) => {
              return elm.shareCode !== null
            })
            if (shareData.length > 0 || otaData.length > 0) {
              t.disabled = true
            } else {
              if (data.length > 20) {
                t.disabled = true
              } else {
                t.disabled = (t.event == 'delete' ? false : true)
              }
            }
          } else {
            t.disabled = true
          }
        })
      }
      self.setData({
        tab: tdata
      })
    },

    /**
     * 操作
     */
    goEvent (e) {
      let self = this
      let { selDevice } = self.properties
      let event = e.currentTarget.dataset.item.event
      switch (event) {
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
        return plugin.jsUtil.tip(self.data.i18n['dnameValid'])
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
     * 单设备删除
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
     * 多设备删除
     */
    unbindSuccess () {
      this.triggerEvent('unbindSuccess', true)
    }

  }
})
