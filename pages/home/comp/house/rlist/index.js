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
  },

  /**
   * 组件的初始数据
   */
  data: {
    rooms: [],
    i18n: '',
    skin: '',
    noDataImg: '',
    newRoomShow: false,
    roomName: '',
    hasDataList: true,
    sHeight: 0,
    defaultHeight: 100,
    itemHeight: 50,
    page: {
      page: 1,
      pageSize: 10,
      total: 0
    },
    isFinish: false
  },

  lifetimes: {
    ready: function () {
      let win = wx.getWindowInfo()
      this.setData({
        i18n: plugin.main.getLang(),
        skin: plugin.main.getSkin(),
        noDataImg: plugin.main.getBaseImgUrl() + 'images/device/no_device_data_v2.png',
        defaultHeight: (win.safeArea.bottom * 0.9 - 90 - 110).toFixed(0)
      })
    },
    detached: function () { }
  },

  observers: {
    'fid': function (fid) {
      this.refreshList()
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 获取房间
     */
    getRooms () {
      plugin.jsUtil.load()
      const self = this
      plugin.smartHome.getFamilyRoomList({
        fid: self.properties.fid,
        page: self.data.page.page,
        pageSize: self.data.page.pageSize,
        success (res) {
          if (res.data.list) {
            let list = res.data.list
            for (let vm of list) {
              vm.vcheck = false
            }
            self.setData({
              rooms: self.data.rooms.concat(list),
              'page.total': res.data.total,
              hasDataList: res.data.total > 0
            })
            let sHeight = self.data.itemHeight * self.data.rooms.length + 8
            self.setData({
              sHeight
            })
          }
        },
        fail (res) {
          self.setData({
            rooms: [],
            hasDataList: false
          })
        },
        complete (res) {
          self.setData({
            isFinish: true,
            triggered: false
          })
        }
      })
    },
    /**
     * 选择房间
     */
    liChange (e) {
      const self = this
      let item = e.currentTarget.dataset.item
      let rooms = self.data.rooms
      for (let rm of rooms) {
        if (rm.frid == item.frid) {
          rm.vcheck = !rm.vcheck
        } else {
          rm.vcheck = false
        }
      }
      self.setData({
        rooms
      })
      self.getSelRoom()
    },
    /**
     * 获取选中的房间
     */
    getSelRoom () {
      const self = this
      let rooms = self.data.rooms
      let selRoom = rooms.filter(item => {
        return item.vcheck == true
      })
      self.triggerEvent('SelRoom', selRoom)
    },

    /**
     * 移动到新房间
     */
    addRoomShow () {
      this.setData({
        newRoomShow: true,
        roomName: ''
      })
    },
    /**
     * 修改房间名称
     */
    roomNameChange (e) {
      this.setData({
        roomName: e.detail
      })
    },
    /**
     * 添加房间
     */
    addRoom () {
      const self = this
      let fid = self.properties.fid
      let roomName = self.data.roomName
      if (roomName.length == 0) {
        return plugin.jsUtil.tip(self.data.i18n['roomNameTip'])
      }
      plugin.smartHome.addFamilyRoom({
        fid,
        roomName,
        success (res) {
          plugin.jsUtil.tip(self.data.i18n['addRoomTipSucc'])
          plugin.jsUtil.delayCb(() => {
            self.refreshList()
          })
        },
        fail (res) { }
      })
    },
    // 刷新列表
    refreshList () {
      let self = this
      let page = `page.page`
      self.setData({
        [page]: 1,
        rooms: [],
        isFinish: false
      })
      self.getRooms()
    },
    // 加载更多
    getMoreList () {
      let self = this
      if (self.data.rooms.length >= self.data.page.total) return
      let page = `page.page`
      self.setData({
        [page]: !self.data.hasDataList ? 1 : self.data.page.page + 1
      })
      self.getRooms()
    },
  }
})
