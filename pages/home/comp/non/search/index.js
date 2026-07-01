const plugin = requirePlugin('quecPlugin')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isRefresh: {
      type: Boolean,
      value: false
    },
    model: {
      type: Object,
      value: {}
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    i18n: '',
    skin: '',
    deviceName: '',//搜索设备名称
    isRefresh: false,
    isEdit: false,
    selDevice: [],
    sTop: 0,
    sHeight: 550
  },

  lifetimes: {
    attached: function () {
      let win = wx.getWindowInfo()
      let scH = win.safeArea.bottom - win.safeArea.top - 80
      this.setData({
        i18n: plugin.main.getLang(),
        skin: plugin.main.getSkin(),
        isEdit: false,
        sHeight: scH,
        sTop: win.safeArea.top ? win.safeArea.top : 40
      })
    },
    detached: function () {
      this.setData({
        isEdit: false,
        isRefresh: false
      })
    }
  },

  observers: {
    "isRefresh": function (isRefresh) {
      if (isRefresh) {
        this.setData({
          isEdit: false
        })
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 确定搜索时
     */
    onSearch (e) {
      let self = this
      self.setData({
        isRefresh: true,
        deviceName: e.detail
      })
    },

    /**
    * 取消
    */
    clear () {
      let self = this
      self.setData({
        deviceName: '',
        isRefresh: true
      })
    },

    /**
     * 编辑模式
     */
    getEdit (e) {
      this.setData({
        isEdit: e.detail
      })
      if (this.data.isEdit) {
        let win = wx.getWindowInfo()
        let scH = win.safeArea.bottom - win.safeArea.top - 120
        this.setData({
          sHeight: scH
        })
      }
    },
    /**
     * 编辑模式下，关闭
     */
    getSelIsEdit (e) {
      this.setData({
        isEdit: e.detail,
        isRefresh: true
      })
      if (!this.data.isEdit) {
        let win = wx.getWindowInfo()
        let scH = win.safeArea.bottom - win.safeArea.top - 80
        this.setData({
          sHeight: scH
        })
      }
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
      this.triggerEvent('goDetail', e.detail)
    },

    /**
     * 添加设备成功 
     */
    scanSuccess (e) {
      this.triggerEvent('scanSuccess', e.detail)
    },

    /**
     * 重命名成功
     */
    renameSuccess (e) {
      this.setData({
        isRefresh: true,
      })
    },

    /**
    * 删除成功
    */
    unbindSuccess (e) {
      this.setData({
        isRefresh: true,
      })
    },

    /**
   * 搜索返回
   */
    back () {
      this.triggerEvent('Back', true)
    }
  }
})
