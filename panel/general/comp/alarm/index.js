const plugin = requirePlugin('quecPlugin')
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    pk: {
      type: String,
      value: ''
    },
    dk: {
      type: String,
      value: ''
    },
    activeStepColor: {
      type: String,
      value: '#999999'
    },
    noDataImg: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    alarmData: [],
    page: {
      page: 1,
      pageSize: 10
    },
    pk: '',
    dk: '',
    total: 0,
    scrollHeight: 400,
    isFinish: false
  },

  ready () {
    let self = this
    self.setData({
      noDataImg: plugin.assetBase.getBaseImgUrl() + 'images/device/ic_msg_empty_v2.png',
    })

    wx.getSystemInfo({
      success: function (res) {
        let height = res.safeArea.bottom
        self.setData({
          scrollHeight: height - 90
        })
      }
    })
  },

  observers: {
    'pk,dk': function (pk, dk) {
      if (pk && dk) {
        this.getList()
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 获取消息列表数据
     */
    getList () {
      let self = this
      plugin.jsUtil.load()
      plugin.msg.getMsgList({
        dk: self.properties.dk,
        pk: self.properties.pk,
        msgType: 2,
        page: self.data.page.page,
        pageSize: self.data.page.pageSize,
        success (res) {
          if (res.data.list) {
            let listD = []
            res.data.list.forEach((elm, index) => {
              let item = {
                text: elm.title,
                desc: (elm.addTime ? plugin.jsUtil.formatDate(new Date(elm.addTime), 'yyyy年MM月dd日 hh:mm:ss') : '')
              }
              if (index === 0) {
                item.inactiveIcon = 'circle'
                item.activeIcon = 'circle'
              }
              listD.push(item)
            })
            self.setData({
              alarmData: self.data.alarmData.concat(listD),
              total: res.total
            })
          }

        },
        fail (res) { },
        complete (res) {
          plugin.jsUtil.hideTip()
          self.setData({
            isFinish: true
          })
        }
      })
    },
    // 刷新列表
    refreshList () {
      let page = `page.page`
      this.setData({
        [page]: 1,
        alarmData: [],
        isFinish: false
      })
      this.getList()
    },
    // 加载更多
    getMoreList () {
      if (this.data.alarmData.length >= this.data.total) return
      let page = `page.page`
      this.setData({
        [page]: ++this.data.page.page
      })
      this.getList()
    }
  }
})
