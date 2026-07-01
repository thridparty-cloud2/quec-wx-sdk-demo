const plugin = requirePlugin("quecPlugin")
const { getAllRolesList } = require("../../../../api/roles")
import eventBus from "../../../../../common/eventBus"

let app = getApp()

const isSameId = (left, right) => String(left) === String(right)

Page({
  data: {
    productKey: "",
    deviceKey: "",
    eUid: "",
    deviceInfo: {},

    deviceStatus: "", //设备在线状态
    defaultRoleInfo: {},
    chatReloadObj: {},
    selectedRoleId: 0, // 选中的角色id
    currentRoleId: 0, // 当前选择的角色id
    selectedRoleVoiceId: 0, //选中的角色的音色id
    rolesList: [], // 角色列表
    currentRoleInfo: {}, // 当前选择的角色信息
    deviceRolePrompt: "", // 设备角色提示词
    needRefresh: false, // 是否需要刷新角色列表
    roleDetailLoading: false, // 角色详情加载状态
    // 用于声音配置页回传与兜底的状态标记
    refreshFromVoicePage: false,
    pendingVoiceUpdateRoleId: 0,
    updatedByEvent: false,
    // 触摸滑动相关状态
    touchStartX: 0,
    touchStartY: 0,
    touching: false,
    lastDeltaX: 0,
    swipeThreshold: 60, // 最小水平滑动距离，避免误触
    verticalGuard: 50, // 垂直容错，超过视为纵向滚动
    edgeGuard: 20, // 左右边缘防护像素，避免系统返回手势
    isShareDevice: false,
  },

  onLoad(options) {
    if (options.item) {
      let item = JSON.parse(decodeURIComponent(options.item))
      this.setData({
        productKey: item.productKey,
        deviceKey: item.deviceKey,
        eUid: item.eUid,
        isShareDevice: !!item.isShareDevice,
        deviceInfo: item,
      })
    }
    if (options.chatReloadObj) {
      this.setData({
        chatReloadObj: JSON.parse(decodeURIComponent(options.chatReloadObj)),
      })
    }
    if (options.role) {
      this.setData({
        defaultRoleInfo: JSON.parse(decodeURIComponent(options.role)),
      })
    }
    this.initdeviceStatus()
    this.getAllRoles()
    // 订阅声音更新事件
    this.roleVoiceUpdatedHandler = (payload) => this.onRoleVoiceUpdated(payload)
    eventBus.on("roleVoiceUpdated", this.roleVoiceUpdatedHandler)
  },

  onShow() {
    let self=this
    if (app.globalData.appStatus == "front") {
      self.reconnectWsV2()
      wx.nextTick(() => {
        app.globalData.appStatus = ""
      })
    }

    // 只有当需要刷新时才重新获取，避免与onLoad重复调用
    if (self.data.needRefresh) {
      // 从声音配置页返回时，以接口结果为准更新该角色音色
      if (self.data.refreshFromVoicePage && self.data.pendingVoiceUpdateRoleId) {
        const roleId = self.data.pendingVoiceUpdateRoleId
        plugin.ai.findBotVoice({
          roleId,
          success: (res) => {
            if (res?.data) {
              self.applyRoleVoiceUpdate({
                roleId,
                voiceId: res.data.voiceId,
                voiceName: res.data.voiceName,
              })
            }
          },
          complete: () => {
            self.setData({
              needRefresh: false,
              refreshFromVoicePage: false,
              updatedByEvent: false,
              pendingVoiceUpdateRoleId: 0,
            })
          },
        })
        return
      }
      // 普通刷新场景（如新增/编辑角色返回）
      self.getAllRoles()
      self.setData({ needRefresh: false })
    }else{
      console.log('444444444444')
    }
  },

  onUnload() {
    // 取消订阅
    if (this.roleVoiceUpdatedHandler) {
      eventBus.off("roleVoiceUpdated", this.roleVoiceUpdatedHandler)
      this.roleVoiceUpdatedHandler = null
    }
  },

  //通过页面栈拿到设备在线状态
  initdeviceStatus() {
    let pages = getCurrentPages() //  获取页面栈
    let prevPage = pages[pages.length - 2] // 上一个页面
    this.setData({
      deviceStatus: prevPage.data.curDevice.deviceStatus,
    })
  },

  onRoleSelected(e) {
    const { roleId, roleType } = e.detail
    const parsedRoleId = Number(roleId)
    const selectedRoleId = Number.isNaN(parsedRoleId) ? roleId : parsedRoleId
    const self = this

    // 设置loading状态，隐藏角色详情内容
    this.setData({
      selectedRoleId: selectedRoleId,
      roleDetailLoading: true,
      deviceRolePrompt: "",
    })

    const currentRoleInfo = this.data.rolesList.find(
      (role) => Number(role.roleId) === Number(selectedRoleId),
    )

    // 获取角色智能体最新记录
    plugin.ai.findBotVoice({
      roleId: selectedRoleId,
      success(res) {
        const hasData = !!res?.data
        const voiceId = hasData ? res.data.voiceId : currentRoleInfo?.voiceId || 0
        const voiceName = hasData ? res.data.voiceName : currentRoleInfo?.voiceName || ""
        const newRoleInfo = { ...currentRoleInfo, voiceId, voiceName }
        const newRolesList = self.data.rolesList.map((r) =>
          Number(r.roleId) === Number(selectedRoleId) ? newRoleInfo : r,
        )
        self.setData({
          currentRoleInfo: newRoleInfo,
          selectedRoleVoiceId: voiceId,
          rolesList: newRolesList,
        })
      },
      fail(res) {
        console.error("获取角色智能体记录失败", res)
        const voiceId = currentRoleInfo?.voiceId || 0
        const voiceName = currentRoleInfo?.voiceName || ""
        const newRoleInfo = { ...currentRoleInfo, voiceId, voiceName }
        const newRolesList = self.data.rolesList.map((r) =>
          Number(r.roleId) === Number(selectedRoleId) ? newRoleInfo : r,
        )
        self.setData({
          currentRoleInfo: newRoleInfo,
          selectedRoleVoiceId: voiceId,
          rolesList: newRolesList,
        })
      },
      complete() {
        if (roleType && roleType === "device") {
          self.getRoleDetail()
        } else {
          setTimeout(() => {
            self.setData({
              roleDetailLoading: false,
            })
          }, 300)
        }
      },
    })
  },

  toAddRole() {
    if (this.data.isShareDevice) {
      plugin.jsUtil.tip("分享设备不支持添加角色")
      return
    }

    let self = this
    const curItem = {
      productKey: self.data.productKey,
      deviceKey: self.data.deviceKey,
      eUid: self.data.eUid,
    }
    this.setData({ needRefresh: true })
    wx.navigateTo({
      url: `/panel/toy/module/role/add/index?item=${encodeURIComponent(
        JSON.stringify(curItem),
      )}`,
    })
  },

  toEditRole(e) {
    let self = this
    const curItem = {
      productKey: self.data.productKey,
      deviceKey: self.data.deviceKey,
    }
    const { roleId } = e.detail
    plugin.ai.roleDetail({
      productKey: self.data.productKey,
      deviceKey: self.data.deviceKey,
      roleId,
      success: (res) => {
        const roleDetailInfo = res.data
        roleDetailInfo.roleId = roleId
        console.log("获取角色详情成功:", roleDetailInfo)
        // 若能获取到该角色的最新音色，则覆盖 roleDetailInfo 的 voiceId/voiceName
        plugin.ai.findBotVoice({
          roleId,
          success: (voiceRes) => {
            if (voiceRes && voiceRes.data) {
              roleDetailInfo.voiceId = voiceRes.data.voiceId
              roleDetailInfo.voiceName = voiceRes.data.voiceName
            }
          },
          fail: (err) => {
            console.warn("获取角色音色失败", err)
          },
          complete: () => {
            // 设置刷新标记，从编辑页面返回时刷新列表
            self.setData({ needRefresh: true })
            // 将接口返回的完整数据传递给编辑页面（已覆盖可能的音色信息）
            wx.navigateTo({
              url: `/panel/toy/module/role/add/index?item=${encodeURIComponent(
                JSON.stringify(curItem),
              )}&info=${encodeURIComponent(
                JSON.stringify(roleDetailInfo),
              )}&chatReloadObj=${JSON.stringify(self.data.chatReloadObj)}`,
            })
          },
        })
      },
      fail: (error) => {
        console.error(error)
        plugin.jsUtil.tip(error.message || "获取角色详情失败")
      },
    })
  },

  toVoiceConfig(e) {
    console.log('toVoiceConfig:')
    console.log(e)
    let { chatReloadObj, productKey, deviceKey, deviceRolePrompt, eUid } = this.data
    let currentRoleInfo = e.detail

    const deviceItem = {
      productKey,
      deviceKey,
      uid: eUid,
    }
    currentRoleInfo.prompt = deviceRolePrompt

    // 设置刷新标记，从声音配置页面返回时刷新角色信息（并记录来源与角色）
    this.setData({
      needRefresh: true,
      refreshFromVoicePage: true,
      pendingVoiceUpdateRoleId: currentRoleInfo.roleId,
      updatedByEvent: false,
    })
    wx.navigateTo({
      url: `/panel/toy/module/voice/copy/list/index?info=${encodeURIComponent(
        JSON.stringify(currentRoleInfo),
      )}&item=${encodeURIComponent(
        JSON.stringify(deviceItem),
      )}&chatReloadObj=${encodeURIComponent(JSON.stringify(chatReloadObj))}&from=roleSet`,
    })
  },

  getAllRoles() {
    const { deviceKey, productKey, selectedRoleId } = this.data
    const self = this
    getAllRolesList(deviceKey, productKey)
      .then((rolesList) => {
        self.setData({ rolesList })

        // 只有在没有选中角色时才获取当前角色信息
        if (self.data.eUid && !selectedRoleId && rolesList.length !== 0) {
          self.getCurRoleInfo()
        } else if (!selectedRoleId && rolesList.length !== 0) {
          const defaultRoleId = Number(self.data.defaultRoleInfo?.roleId)
          const fallbackRole =
            rolesList.find((role) => Number(role.roleId) === defaultRoleId) ||
            rolesList[0] ||
            self.data.defaultRoleInfo ||
            {}

          self.setData({
            currentRoleId: fallbackRole.roleId || 0,
            selectedRoleId: fallbackRole.roleId || 0,
            currentRoleInfo: fallbackRole,
            selectedRoleVoiceId: fallbackRole.voiceId || 0,
          })

          if (fallbackRole.roleType === "device") {
            self.getRoleDetail()
          } else {
            self.setData({
              roleDetailLoading: false,
            })
          }
        } else if (selectedRoleId) {
          // 如果有选中的角色，更新选中角色的信息
          const selectedRoleInfo = rolesList.find(
            (role) => isSameId(role.roleId, selectedRoleId),
          )
          if (selectedRoleInfo) {
            self.setData({
              currentRoleInfo: selectedRoleInfo,
              selectedRoleVoiceId: selectedRoleInfo.voiceId || 0,
            })
            // 刷新选中角色的详情信息（包括提示词）
            self.getRoleDetail()
          } else {
            // 如果选中的角色已被删除，清空选中状态并获取当前角色信息
            self.setData({
              selectedRoleId: 0,
              currentRoleInfo: self.data.defaultRoleInfo || {},
              selectedRoleVoiceId: 0,
              deviceRolePrompt: "",
              roleDetailLoading: false,
            })
            if (self.data.eUid) {
              self.getCurRoleInfo()
            }
          }
        } else if (rolesList.length === 0) {
          this.setData({
            selectedRoleId: 0,
            currentRoleInfo: this.data.defaultRoleInfo || {},
            selectedRoleVoiceId: 0,
            deviceRolePrompt: "",
            roleDetailLoading: false,
          })
        }
      })
      .catch((error) => {
        console.error(error)
      })
  },

  getCurRoleInfo() {
    const { productKey, deviceKey, eUid, rolesList } = this.data
    plugin.ai.findDeviceRoleVoiceRelV2({
      productKey: productKey,
      deviceKey: deviceKey,
      endUserId: eUid,
      success: (res) => {
        if (res?.data?.roleId) {
          const currentRoleId = res.data.roleId
          const idx = rolesList.findIndex((role) => isSameId(role.roleId, currentRoleId))
          let newRolesList = rolesList
          let newCurrentRoleInfo =
            rolesList.find((role) => isSameId(role.roleId, currentRoleId)) || this.data.defaultRoleInfo || {}
          if (idx > -1) {
            newCurrentRoleInfo = {
              ...rolesList[idx],
              voiceName: res.data.voiceName,
              voiceId: res.data.voiceId,
            }
            newRolesList = rolesList.slice()
            newRolesList[idx] = newCurrentRoleInfo
          }
          const currentRoleType = newCurrentRoleInfo?.roleType || ""
          this.setData({
            currentRoleId: currentRoleId,
            selectedRoleId: currentRoleId,
            currentRoleInfo: newCurrentRoleInfo,
            selectedRoleVoiceId: res.data.voiceId,
            rolesList: newRolesList,
          })
          if (currentRoleType === "device") {
            this.getRoleDetail()
          }
        }
      },
      fail: (res) => {
        console.error(res)
      },
    })
  },

  changeRole() {
    console.log("changeRole")
    const { productKey, deviceKey, selectedRoleId, selectedRoleVoiceId, eUid } = this.data

    if (!selectedRoleId || !selectedRoleVoiceId) {
      plugin.jsUtil.tip("请先选择角色和音色")
      return
    }

    plugin.ai.editDeviceRoleVoiceV2({
      productKey,
      deviceKey,
      endUserId: eUid,
      roleId: selectedRoleId,
      voiceId: selectedRoleVoiceId,
      success: (res) => {
        const self = this
        const { chatReloadObj, deviceStatus } = self.data
        // 开始设备下发流程
        const sendData = [{ [chatReloadObj.code]: true }]
        if (res) {
          self.getCurRoleInfo()
        }
        setTimeout(() => {
          wx.navigateBack()
        }, 500)
        if (deviceStatus === "离线" || deviceStatus === 0 || deviceStatus === "") {
          return plugin.jsUtil.tip("服务端设置成功，但离线设备无法下发命令到设备")
        }
        eventBus.emit("sendAttr", {
          productKey: self.data.productKey,
          deviceKey: self.data.deviceKey,
          code: chatReloadObj.code,
          value: true,
          sendData,
        })
      },
      fail: (error) => {
        console.error(error)
      },
    })
  },

  getRoleDetail() {
    const { productKey, deviceKey, selectedRoleId, currentRoleId, currentRoleInfo } =
      this.data

    // 如果是系统角色，不调用接口，直接取消loading状态
    if (currentRoleInfo && currentRoleInfo.roleType !== "device") {
      setTimeout(() => {
        this.setData({
          roleDetailLoading: false,
        })
      }, 300)
      return
    }

    plugin.ai.roleDetail({
      productKey: productKey,
      deviceKey: deviceKey,
      roleId: selectedRoleId ? selectedRoleId : currentRoleId,
      success: (res) => {
        if (res?.data) {
          this.setData({
            deviceRolePrompt: res.data.prompt || "",
          })
        }
        // 300ms延时后显示角色详情或仅取消loading，避免用户看到渲染过程
        setTimeout(() => {
          this.setData({
            roleDetailLoading: false,
          })
        }, 300)
      },
      fail: (error) => {
        console.log(error)
        // 请求失败时也要取消loading状态
        setTimeout(() => {
          this.setData({
            roleDetailLoading: false,
          })
        }, 300)
      },
    })
  },

  // 事件回调，更新列表与当前角色信息
  onRoleVoiceUpdated(payload) {
    if (!payload) return
    this.applyRoleVoiceUpdate(payload, { updatedByEvent: true })
  },

  applyRoleVoiceUpdate(payload, options = {}) {
    const { roleId, voiceId, voiceName } = payload
    const {
      rolesList,
      currentRoleInfo,
      defaultRoleInfo,
      selectedRoleId,
      currentRoleId,
      selectedRoleVoiceId,
    } = this.data

    const idx = rolesList.findIndex((r) => isSameId(r.roleId, roleId))
    const matchedRole = idx > -1 ? rolesList[idx] : null
    const currentMatches = isSameId(currentRoleInfo?.roleId, roleId)
    const defaultMatches = isSameId(defaultRoleInfo?.roleId, roleId)
    const selectedMatches = isSameId(selectedRoleId, roleId)
    const currentDeviceMatches = isSameId(currentRoleId, roleId)
    const shouldUpdateCurrent = currentMatches || selectedMatches || currentDeviceMatches || defaultMatches

    const baseRoleInfo = matchedRole || (currentMatches ? currentRoleInfo : null) || (defaultMatches ? defaultRoleInfo : null) || currentRoleInfo || {}
    const newRoleInfo = { ...baseRoleInfo, roleId, voiceId, voiceName }
    const newRolesList = idx > -1 ? rolesList.slice() : rolesList
    if (idx > -1) {
      newRolesList[idx] = newRoleInfo
    }

    this.setData({
      rolesList: newRolesList,
      currentRoleInfo: shouldUpdateCurrent ? newRoleInfo : currentRoleInfo,
      defaultRoleInfo: defaultMatches ? { ...defaultRoleInfo, voiceId, voiceName } : defaultRoleInfo,
      selectedRoleVoiceId: selectedMatches ? voiceId : selectedRoleVoiceId,
      updatedByEvent: options.updatedByEvent ? true : this.data.updatedByEvent,
    })
  },

  /**
   * 关闭ws
   */
  closeWsSocket() {
    eventBus.emit("tryCloseWsSocket")
  },

  /**
   * 重连
   */
  reconnectWsV2() {
    eventBus.emit("reconnectWsV2")
  },

  // 滑动开始
  onSwipeStart(e) {
    const t = e.changedTouches && e.changedTouches[0]
    if (!t) return
    this.setData({
      touchStartX: t.pageX,
      touchStartY: t.pageY,
      touching: true,
      lastDeltaX: 0,
    })
  },

  // 滑动中
  onSwipeMove(e) {
    if (!this.data.touching) return
    const t = e.changedTouches && e.changedTouches[0]
    if (!t) return
    const dx = t.pageX - this.data.touchStartX
    const dy = t.pageY - this.data.touchStartY
    // 若为纵向滚动，则不视为切换
    if (Math.abs(dy) > this.data.verticalGuard) {
      this.setData({ touching: false })
      return
    }
    this.data.lastDeltaX = dx
  },

  // 滑动结束
  onSwipeEnd() {
    const {
      touching,
      lastDeltaX,
      swipeThreshold,
      edgeGuard,
      rolesList,
      selectedRoleId,
      currentRoleId,
    } = this.data
    if (!touching) return
    this.setData({ touching: false })
    const startX = this.data.touchStartX
    const screenWidth = wx.getWindowInfo().windowWidth
    if (startX < edgeGuard || startX > screenWidth - edgeGuard) {
      return
    }
    if (Math.abs(lastDeltaX) < swipeThreshold) {
      return
    }
    const isNext = lastDeltaX < 0
    const baseRoleId = selectedRoleId || currentRoleId
    const idx = rolesList.findIndex((r) => isSameId(r.roleId, baseRoleId))
    if (idx === -1) return
    let targetIdx = isNext ? idx + 1 : idx - 1
    if (targetIdx < 0 || targetIdx >= rolesList.length) {
      return
    }
    const targetRole = rolesList[targetIdx]
    if (!targetRole) return

    // 仅更新“选中角色”，不改动设备当前角色
    this.setData({ selectedRoleId: targetRole.roleId })
    // 触发已有的选中逻辑（用于加载提示词等）
    this.onRoleSelected({
      detail: { roleId: targetRole.roleId, roleType: targetRole.roleType },
    })
  },
})
