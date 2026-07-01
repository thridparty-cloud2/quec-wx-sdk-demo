const plugin = requirePlugin('quecPlugin')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    fid: {
      type: String,
      value: ''
    },
    role: {
      type: Number,
      value: 0
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
    sdeviceName: '',//搜索设备名称
    isRefresh: false,
    isEdit: false,
    selDevice: [],
    sHeight: 550,
    sTop: 40,
  },

  pageLifetimes: {
    show: function () {
      this.setData({
        isRefresh: true
      })
    },
    hide: function () { }
  },

  lifetimes: {
    ready: function () {
      let self = this
      let win = wx.getWindowInfo().safeArea
      let scH = win.bottom - win.top - 80
      self.setData({
        i18n: plugin.main.getLang(),
        skin: plugin.main.getSkin(),
        sHeight: scH,
        sTop: win.top ? win.top : 40
      })
    },
    detached: function () {
      this.setData({
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
        this.setData({
          sHeight: win.safeArea.bottom - win.safeArea.top - 60 - 60
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
        this.setData({
          sHeight: win.safeArea.bottom - win.safeArea.top - 80
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
     * 重命名成功
     */
    renameSuccess (e) {
      this.setData({
        isRefresh: true
      })
    },

    /**
    * 删除成功
    */
    unbindSuccess (e) {
      this.setData({
        isRefresh: true
      })
    },
    /**
     * 移动成功
     */
    moveSuccess (e) {
      this.setData({
        isEdit: false,
        isRefresh: true
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
