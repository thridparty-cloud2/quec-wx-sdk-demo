const plugin = requirePlugin("quecPlugin")
const { getAllRolesList } = require("../../../api/roles")

Page({
  data: {
    gradientHeight: 20,
    showConfirmDialog: false,
    dialogConfig: {
      title: "",
      message: "",
      type: "", // 'record' 或 'memory'
    },
    roleIds: [],
    eUid: "",

    productKey: "",
    deviceKey: "",
    deviceInfo: {},
    role:{}//当前角色
  },

  onLoad(options) {
    this.setData({
      gradientHeight: (150 / wx.getWindowInfo().windowHeight).toFixed(2) * 100,
    })
    if (options.item) {
      const item = JSON.parse(decodeURIComponent(options.item))
      this.setData({
        productKey: item.productKey,
        deviceKey: item.deviceKey,
        deviceInfo: item,
      })
    }
    if (options.eUid) {
      const eUid = JSON.parse(decodeURIComponent(options.eUid))
      this.setData({
        eUid: eUid,
      })
    }
    if(options.role){
      this.setData({
        role:JSON.parse(decodeURIComponent(options.role))
      })
    }
    if (this.data.productKey && this.data.deviceKey) {
      this.getAllRoleIdsList()
    }
  },

  allActionClick(event) {
    const type = event.currentTarget.dataset.type
    const dialogConfigs = {
      record: {
        title: "清空聊天记录",
        message: "是否清空所有聊天记录？此操作不可恢复",
        type: "record",
      },
      memory: {
        title: "清除所有长期记忆",
        message: "是否清除所有长期记忆？此操作不可恢复",
        type: "memory",
      },
    }

    this.setData({
      showConfirmDialog: true,
      dialogConfig: dialogConfigs[type],
    })
  },

  getAllRoleIdsList() {
    const { deviceKey, productKey } = this.data
    getAllRolesList(deviceKey, productKey)
      .then((rolesList) => {
        const roleIds = rolesList.map((role) => role.roleId)
        this.setData({
          roleIds: roleIds,
        })
      })
      .catch((error) => {
        console.error(error)
      })
  },

  buildGeParam() {
    const { roleIds, productKey, deviceKey, eUid } = this.data
    return {
      roleIds: roleIds,
      endUserId: eUid,
      productKey: productKey,
      deviceKey: deviceKey,
    }
  },

  deleteAllChatHistroy() {
    const { role, productKey, deviceKey, eUid } = this.data
    let params = {
      roleIds: [role.roleId],
      endUserId: eUid,
      productKey: productKey,
      deviceKey: deviceKey,
    }
    plugin.ai.deleteHistoryV2({
      ...params,
      success: (res) => {
        console.log(res)
      },
      fail: (error) => {
        console.log(error)
      },
      complete: () => {
        setTimeout(() => {
          wx.hideToast()
        }, 1500)
      },
    })
  },

  deleteAllMemory() {
    const params = this.buildGeParam()
    plugin.ai.deleteMemoryV2({
      ...params,
      success: (res) => {
        console.log(res)
      },
      fail: (error) => {
        console.log(error)
      },
      complete: () => {
        setTimeout(() => {
          wx.hideToast()
        }, 1500)
      },
    })
  },

  onDialogCancel() {
    this.setData({
      showConfirmDialog: false,
    })
  },

  onDialogConfirm() {
    const type = this.data.dialogConfig.type
    const toastTitle = type === "record" ? "聊天记录清除成功" : "长期记忆清除成功"

    this.setData({
      showConfirmDialog: false,
    })

    if (type === "record") {
      this.deleteAllChatHistroy()
    } else if (type === "memory") {
      this.deleteAllMemory()
    }

    wx.showToast({
      title: toastTitle,
      icon: "none",
    })
  },
})
