import riskConst from "../../../js/riskConst.js"
const plugin = requirePlugin("quecPlugin")
import eventBus from "../../../../common/eventBus.js"

Page({
  /**
   * 页面的初始数据
   */
  data: {
    curDevice: {},
    role: {},

    skin: plugin.main.getSkin(),
    riskConst: riskConst,
    gradientHeight: 20,

    riskData: [],

    sHei: 550,
    page: {
      pageNum: 1,
      pageSize: 20,
      total: 0,
    },
    hasDataList: true,
    triggered: false,

    guideShow: false,

    curItem: {},
    noDataImg: plugin.main.getBaseImgUrl() + "images/device/no_device_data_v2.png",

    isFinish: false,

    riskShow: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let self = this
    self.setData({
      gradientHeight: (220 / wx.getWindowInfo().windowHeight).toFixed(2) * 100,
      sHei: wx.getWindowInfo().safeArea.bottom - 70 - 90,
    })

    if (options.item) {
      self.setData({
        curDevice: JSON.parse(decodeURIComponent(options.item)),
      })
      if (self.data.curDevice) {
        self.getList()
      }
    }

    if (options.role) {
      self.setData({
        role: JSON.parse(decodeURIComponent(options.role)),
      })
    }

    // 获取设备实时在线状态
    eventBus.on("wsAiDstatus", (status) => {
      console.log("%c[WS] 设备状态", "color:green", status)
      let { curDevice } = self.data
      curDevice.onlineStatus = status
      self.setData({
        curDevice,
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    if (this.data.needRefresh) {
      this.refreshList()
      this.setData({
        needRefresh: false,
      })
    }
  },

  /**
   * 获取风险预警列表数据
   */
  getList() {
    let self = this
    let { curDevice, page } = self.data
    let shareCode = curDevice.shareCode
    let ownerUid = curDevice.ownerUid
    plugin.ai.chatWarnList({
      productKey: curDevice.productKey,
      deviceKey: curDevice.deviceKey,
      endUserId: shareCode ? ownerUid : curDevice.uid,
      pageNum: page.pageNum,
      pageSize: page.pageSize,
      success(res) {
        console.log("chatWarnList:", res)
        if (res.rows) {
          let rows = res.rows
          rows.forEach((r) => {
            r.createTimeFmt = plugin.jsUtil.formatDate(
              new Date(r.createTime),
              "MM月dd日 hh:mm",
            )
          })
          self.setData({
            riskData: self.data.riskData.concat(rows),
            "page.total": res.total,
            hasDataList: res.total > 0,
          })
        }
      },
      fail(res) {
        self.setData({
          hasDataList: false,
        })
      },
      complete(res) {
        self.setData({
          triggered: false,
          isFinish: true,
        })
      },
    })
  },

  // 刷新列表
  refreshList() {
    let self = this
    let page = `page.pageNum`
    self.setData({
      [page]: 1,
      riskData: [],
      isFinish: false,
    })
    self.getList()
  },

  // 加载更多
  getMore() {
    let self = this
    if (self.data.riskData.length >= self.data.page.total) return
    let page = `page.pageNum`
    self.setData({
      [page]: !self.data.hasDataList ? 1 : self.data.page.pageNum + 1,
    })
    self.getList()
  },

  /**
   * 已处理-进详情
   */
  goDetail(e) {
    let self = this
    let { curDevice, role } = self.data
    let item = e.currentTarget.dataset.item
    self.setData({
      curItem: item,
    })
    console.log(item)

    self.pageRouter.navigateTo({
      url: `/panel/toy/module/risk/detail/index?item=${encodeURIComponent(
        JSON.stringify(curDevice),
      )}&role=${encodeURIComponent(JSON.stringify(role))}&riskId=${self.data.curItem.id}`,
    })
  },

  /**
   * 关闭引导弹框
   */
  riskClose() {
    this.setData({
      riskShow: false,
    })
  },

  /**
   * 一键引导
   */
  guideEv() {
    let self = this
    let { curDevice, role } = self.data
    self.guideClose()
    self.pageRouter.navigateTo({
      url: `/panel/toy/module/risk/detail/index?item=${encodeURIComponent(
        JSON.stringify(curDevice),
      )}&role=${encodeURIComponent(JSON.stringify(role))}&riskId=${self.data.curItem.id}`,
    })
  },

  /**
   * 查看聊天
   */
  goChat(e) {
    let { curDevice } = this.data
    let role = e.currentTarget.dataset.item
    this.pageRouter.navigateTo({
      url: `/panel/toy/module/chat/index/index?eUid=${encodeURIComponent(
        JSON.stringify(curDevice.uid),
      )}&item=${encodeURIComponent(JSON.stringify(curDevice))}&role=${encodeURIComponent(
        JSON.stringify(role),
      )}`,
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},
})
