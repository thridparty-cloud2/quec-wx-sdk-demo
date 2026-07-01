const plugin = requirePlugin("quecPlugin")

const APP = getApp()
const PACKAGE_TYPE = "AI_CHAT_ADD_PACKAGE"
const RENEW_PACKAGE_TYPE = "AI_CHAT"

Page({
  data: {
    deviceInfo: {},
    metaData: APP.globalData.envData["metaData"],

    addPackageList: [],
    renewPackageList: [],
    showAddTab: false,
    showRenewTab: false,
    defaultTab: "",
    currentPackage: {},
    curPackageStatus: false,
    isMoreThan: false,
    hasPackage: false,
    canPay: false,

    payInfoVisible: false,
    selectedPackage: {},

    emptyImg: plugin.main.getRootImg() + "example/images/ic_empty.png",
  },

  onLoad(options) {
    if (options.item) {
      console.log("deviceInfo", JSON.parse(decodeURIComponent(options.item)))

      this.setData(
        {
          deviceInfo: JSON.parse(decodeURIComponent(options.item)),
          showAddTab: options.showAddTab === "true",
          showRenewTab: options.showRenewTab === "true",
          defaultTab: options.defaultTab || "",
        },
        () => {
          if (this.data.deviceInfo && this.data.metaData) {
            this.getPackageLists()
            this.getCurrentPackage()
            this.getAiPackagePageList()
            this.getLicenceServiceStatus()
          }
        },
      )
    }
  },

  getPackageLists() {
    const { productKey, deviceKey } = this.data.deviceInfo
    const merchantNo = this.data.metaData["merchantNo"].metadataValue
    const terminalCode = this.data.metaData["bssClientAppId"].metadataValue

    const getPackageList = (packageType) =>
      new Promise((resolve) => {
        plugin.ai.findPackageListV2({
          productKey,
          deviceKey,
          merchantNo,
          packageType,
          terminalCode,
          success: (res) => resolve(Array.isArray(res?.data) ? res.data : []),
          fail: () => resolve([]),
        })
      })

    Promise.all([
      getPackageList(PACKAGE_TYPE),
      getPackageList(RENEW_PACKAGE_TYPE),
    ]).then(([addPackageList, renewPackageList]) => {
      this.setData({
        addPackageList,
        renewPackageList,
        hasPackage: addPackageList.length > 0 || renewPackageList.length > 0,
      })
      console.log("addPackageList", addPackageList)
      console.log("renewPackageList", renewPackageList)
    })
  },

  getCurrentPackage() {
    const { productKey, deviceKey, uid } = this.data.deviceInfo
    const endUserId = uid

    plugin.ai.aiChatCurrent({
      productKey,
      deviceKey,
      endUserId,
      success: (res) => {
        console.log("aiChatCurrent", res)
        this.setData({
          currentPackage: res?.data ?? {},
          curPackageStatus: !!(res?.data && Object.keys(res.data).length > 0),
        })
      },
      fail: (error) => {
        console.log(error)
      },
    })
  },

  getAiPackagePageList() {
    const { productKey, deviceKey, uid } = this.data.deviceInfo
    const endUserId = uid

    plugin.ai.aiChatPage({
      productKey,
      deviceKey,
      endUserId,
      pageNum: 1,
      pageSize: 10,
      success: (res) => {
        console.log("aiChatPage", res)
        this.setData({
          isMoreThan: Boolean(res?.total >= 1),
        })
      },
      fail: (error) => {
        console.log(error)
      },
    })
  },

  getLicenceServiceStatus() {
    const { productKey, deviceKey } = this.data.deviceInfo

    plugin.ai.findLicenseTime({
      productKey,
      deviceKey,
      success: (res) => {
        console.log("getLicenceServiceStatus", res)
        const canPay = Boolean(res?.data?.serviceStatus !== "EXPIRED")
        this.setData({ canPay })
        console.log("canPay", canPay)
      },
      fail: (error) => {
        console.log(error)
      },
    })
  },

  toPackageOrderPage() {
    this.pageRouter.navigateTo({
      url: "/panel/toy/module/order/list/index?packageType=" + PACKAGE_TYPE,
    })
  },

  toResourcePackageList() {
    const { deviceInfo } = this.data
    this.pageRouter.navigateTo({
      url:
        "/panel/toy/module/resource/mine/index?deviceInfo=" +
        encodeURIComponent(JSON.stringify(deviceInfo)),
    })
  },

  payNow(e) {
    const { selectedPackage } = e.detail
    console.log("selectedPackage", selectedPackage)
    this.setData({
      selectedPackage,
      payInfoVisible: true,
    })
  },

  closePay() {
    this.setData({
      payInfoVisible: false,
    })
  },

  successPay() {
    this.closePay()
    this.getCurrentPackage()
    this.getAiPackagePageList()
    this.getPackageLists()
  },

  continuePay() {
    this.setData({
      payInfoVisible: true,
    })
  },
})
