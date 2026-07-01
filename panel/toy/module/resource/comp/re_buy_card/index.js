const plugin = requirePlugin("quecPlugin")
import { currencyUnitMap } from "../../../../api/bss"

Component({
  properties: {
    curPackageStatus: {
      type: Boolean,
      value: true,
    },
    addPackageList: {
      type: Array,
      value: [],
    },
    renewPackageList: {
      type: Array,
      value: [],
    },
    canPay: {
      type: Boolean,
      value: false,
    },
    showAddTab: {
      type: Boolean,
      value: false,
    },
    showRenewTab: {
      type: Boolean,
      value: false,
    },
    defaultTab: {
      type: String,
      value: "",
    },
  },
  data: {
    agreeShow: false,
    agreeChecked: false,

    activeTab: 0,
    activeList: [],
    activeListEmpty: true,
    isSingleTab: false,
    singleTabConfig: null,
    selectedPackageIndex: 0,
    _defaultTabApplied: false,
    currencyUnitMap,

    emptyImg: plugin.main.getRootImg() + "ai/sim_no_data.png",

    tabsConfig: [
      {
        title: "充值加油包",
        emptyText: "暂未配置充值加油包",
        serviceDesc: [
          "1、当套餐内的AI资源用完后，可充值加油包，继续与设备进行语音聊天；",
          "2、虚拟商品一经购买后不支持退款；请在有效期内使用完，过期将自动作废；",
          "3、请理性消费，未成年需要在法定监护人的指导及同意下才可购买；",
          "4、购买成功还是无法正常使用，请尝试关闭App后重新进入；",
          "5、购买成功后可在页面右上角查看相关订单。",
        ],
      },
      {
        title: "续费套餐",
        emptyText: "暂未配置续费套餐",
        serviceDesc: [
          "1、购买后可与设备进行语音聊天；",
          "2、虚拟商品一经购买后不支持退款；请在有效期内使用完，过期将自动作废；",
          "3、请理性消费，未成年需要在法定监护人的指导及同意下才可购买；",
          "4、购买成功还是无法正常使用，请尝试关闭App后重新进入；",
          "5、购买成功后可在页面右上角查看相关订单。",
        ],
      },
    ],
  },

  observers: {
    "addPackageList, renewPackageList": function () {
      this._syncActiveList()
    },
    "showAddTab, showRenewTab": function () {
      this._syncTabsConfig()
    },
  },

  methods: {
    _getActiveList(activeTab) {
      const tab = activeTab !== undefined ? activeTab : this.data.activeTab
      return tab === 0
        ? this.properties.addPackageList
        : this.properties.renewPackageList
    },

    _syncActiveList(activeTab) {
      const activeList = this._getActiveList(activeTab)
      this.setData({
        activeList,
        activeListEmpty: activeList.length === 0,
      })
    },

    _syncTabsConfig() {
      const { showAddTab, showRenewTab, defaultTab } = this.properties
      const isSingleTab = !(showAddTab && showRenewTab)

      let singleTabConfig = null
      if (isSingleTab) {
        singleTabConfig = showRenewTab
          ? this.data.tabsConfig[1]
          : this.data.tabsConfig[0]
      }

      const update = { isSingleTab, singleTabConfig }

      if (!isSingleTab && defaultTab && !this.data._defaultTabApplied) {
        update.activeTab = defaultTab === "renew" && showRenewTab ? 1 : 0
        update._defaultTabApplied = true
      }

      this.setData(update)
      this._syncActiveList(
        update.activeTab !== undefined ? update.activeTab : this.data.activeTab,
      )
    },

    onTabChange(e) {
      const activeTab = e.detail.index
      this.setData({
        activeTab,
        selectedPackageIndex: 0,
      })
      this._syncActiveList(activeTab)
    },

    onSelectPackage(e) {
      const { index } = e.detail
      this.setData({
        selectedPackageIndex: index,
      })
    },

    onServiceCheckChange(e) {
      this.setData({
        agreeChecked: e.detail,
      })
    },

    pay() {
      if (!this.properties.canPay) {
        wx.showToast({ title: "套餐已过期，请先续费", icon: "none" })
        return
      }

      const activeList = this._getActiveList()
      if (!this.data.agreeChecked && activeList.length !== 0) {
        this.setData({ agreeShow: true })
        return
      }
      this.payFor()
    },

    agreeConfirm() {
      this.setData({
        agreeChecked: true,
        agreeShow: false,
      })
      this.payFor()
    },

    agreeClose() {
      this.setData({ agreeShow: false })
    },

    payFor() {
      const activeList = this._getActiveList()
      if (activeList.length === 0) return
      const selectedPackage = activeList[this.data.selectedPackageIndex]
      this.triggerEvent("pay", { selectedPackage })
    },

    toServiceTermsPage() {
      // Demo: mode/payment 已移除
    },
  },
})
