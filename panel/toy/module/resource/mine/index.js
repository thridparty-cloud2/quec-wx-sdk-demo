const plugin = requirePlugin("quecPlugin")

const PAGE_SIZE = 15

Page({
  data: {
    packagePageList: [],
    deviceInfo: {},
    page: {
      pageNum: 1,
      total: 0,
    },
    hasMore: true,
  },

  onLoad(options) {
    if (options.deviceInfo) {
      this.setData(
        {
          deviceInfo: JSON.parse(decodeURIComponent(options.deviceInfo)),
        },
        () => {
          if (this.data.deviceInfo) {
            this.getAiPackagePageList()
          }
        },
      )
    }
  },

  getAiPackagePageList() {
    const { productKey, deviceKey, uid } = this.data.deviceInfo
    const { pageNum } = this.data.page
    const endUserId = uid
    wx.showToast({ title: "加载中...", icon: "loading" })

    plugin.ai.aiChatPage({
      productKey,
      deviceKey,
      endUserId,
      pageNum: pageNum,
      pageSize: PAGE_SIZE,
      success: (res) => {
        wx.hideToast()
        const rows = Array.isArray(res?.rows) ? res.rows : []
        const total = res?.total || 0
        const packagePageList =
          pageNum === 1 ? rows : this.data.packagePageList.concat(rows)

        this.setData({
          packagePageList,
          "page.total": total,
          hasMore: packagePageList.length < total,
        })
      },
      fail: (error) => {
        console.log(error)
      },
    })
  },

  onScrollToLower() {
    if (this.data.hasMore) {
      this.setData(
        {
          "page.pageNum": this.data.page.pageNum + 1,
        },
        () => {
          this.getAiPackagePageList()
        },
      )
    }
  },
})
