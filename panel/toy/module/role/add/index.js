import eventBus from "../../../../common/eventBus.js"

const plugin = requirePlugin("quecPlugin")

let app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    showPopup: false,
    avatar: null,
    avatarList: [
      "https://iot-oss.quectelcn.com/wxsdk_img/ai/panel/airolepic3.png",
      "https://iot-oss.quectelcn.com/wxsdk_img/ai/panel/airolepic7.png",
      "https://iot-oss.quectelcn.com/wxsdk_img/ai/panel/airolepic6.png",
      "https://iot-oss.quectelcn.com/wxsdk_img/ai/panel/airolepic8.png",
      "https://iot-oss.quectelcn.com/wxsdk_img/ai/panel/airolepic2.png",
      "https://iot-oss.quectelcn.com/wxsdk_img/ai/panel/airolepic5.png",
      "https://iot-oss.quectelcn.com/wxsdk_img/ai/panel/airolepic4.png",
      "https://iot-oss.quectelcn.com/wxsdk_img/ai/panel/airolepic1.png",
    ],
    selectedIndex: null,

    active: 0,
    roleName: "", // 角色名称
    roleDesc: "", // 角色描述
    prompt: "", // 提示词
    roleDescLength: 0, // 角色描述字符数
    promptLength: 0, // 角色提示词字符数
    voiceId: null, //角色的音色id

    baseImgUrl: plugin.main.getRootImg(),
    roleCommandData: [],
    roleCusData: [],

    // swiper: {
    //   current: 0, // 当前显示的轮播图索引
    // },
    isEdit: false,

    i18n: "",
    skin: "",
    chatReloadObj: {},
    wsReport: {},
    deviceStatus: "",
    sFlag: true,
    isFinish: false,
    netErrorShow: false,
    isWSV2Connected: false,
    sendTimer: null,
    isSendSucc: false,
    netErrorVis: false,
    cFlag: false,
    isEditMode: false, // 是否为编辑模式
    showDeleteDialog: false, // 是否显示删除确认弹窗
    editRoleId: null, // 编辑的角色ID
    isFormValid: false, // 表单是否有效
    curItem: {}, // 当前设备信息
    curRole: {}, // 当前角色信息
    // 是否禁用删除按钮（置灰）
    isDeleteDisabled: false,
    picReloadImg: plugin.main.getRootImg() + "ai/new/pic_reload.png",
    isPolish: false,
    polishImg: plugin.main.getRootImg() + "ai/new/polish.png",
    polishingImg: plugin.main.getRootImg() + "ai/new/polishing.png",
    promptTemplateList: [],
  },

  /**
   * 检查表单是否完整
   */
  checkFormValid() {
    const { avatar, roleName, roleDesc, prompt } = this.data
    const isValid =
      avatar !== null &&
      roleName.trim() !== "" &&
      roleDesc.trim() !== "" &&
      prompt.trim() !== ""
    this.setData({
      isFormValid: isValid,
    })
  },

  // 新增：根据当前设备应用的角色是否为自定义，且正在编辑该角色，决定是否禁用删除按钮
  updateDeleteButtonState() {
    const { isEditMode, editRoleId, curRole } = this.data
    const curRoleId = curRole && curRole.roleId
    const isCurrentRole = !!curRoleId && String(editRoleId) === String(curRoleId)
    this.setData({
      isDeleteDisabled: !!(isEditMode && isCurrentRole),
    })
  },

  //   选择角色头像
  selectRoleImg() {
    const { avatarList, selectedIndex } = this.data
    if (selectedIndex !== null) {
      this.setData({
        avatar: avatarList[selectedIndex],
        showPopup: false,
      })
      this.checkFormValid()
    }
  },
  onSelectIcon(e) {
    const index = e.currentTarget.dataset.index
    this.setData({ selectedIndex: index })
    this.checkFormValid()
  },
  showPopup() {
    const { avatarList, avatar } = this.data
    this.setData({
      showPopup: true,
      selectedIndex: avatarList.indexOf(this.data.avatar),
    })
  },

  closePopup() {
    this.setData({ showPopup: false })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      i18n: plugin.main.getLang(),
      skin: plugin.main.getSkin(),
    })
    // 判断是否为编辑模式
    if (options.info) {
      const editRoleinfo = JSON.parse(decodeURIComponent(options.info))
      const roleDesc = editRoleinfo.roleDesc || ""
      const prompt = editRoleinfo.prompt || ""
      this.setData({
        isEditMode: true,
        editRoleId: editRoleinfo.roleId,
        voiceId: editRoleinfo.voiceId,
        roleName: editRoleinfo.roleName || "",
        roleDesc: roleDesc,
        prompt: prompt,
        roleDescLength: roleDesc.length,
        promptLength: prompt.length,
        avatar: editRoleinfo.rolePicUrl || null,
      })
      this.checkFormValid()
    }
    if (options.item) {
      this.setData({
        curItem: JSON.parse(decodeURIComponent(options.item)),
      })
      this.initRoleAndVoice()
      this.initdeviceStatus()
    }
    if (options.chatReloadObj) {
      this.setData({
        chatReloadObj: JSON.parse(decodeURIComponent(options.chatReloadObj)),
      })
    }
    if (options.wsReport) {
      this.setData({
        wsReport: JSON.parse(options.wsReport),
      })
    }
    this.getPropmtTemplateList()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    if (app.globalData.appStatus == "front") {
      if (this.data.netErrorShow) {
        return
      } else {
        if (this.data.deviceStatus == 1) {
          let pages = getCurrentPages() //  获取页面栈
          let prevPage = pages[pages.length - 2] // 上一个页面
          prevPage.setData({
            isWsConnecting: false,
          })
          prevPage.reconnectPopup()
          wx.nextTick(() => {
            app.globalData.appStatus = ""
          })
        }
      }
    }
    // 从声音配置页面返回后，数据已经通过voiceManager的confirmRoleSel方法设置到当前页面
    // 这里只需要重新检查表单有效性
    this.checkFormValid()
  },

  initdeviceStatus() {
    let pages = getCurrentPages() //  获取页面栈
    let prevPage = pages[pages.length - 2] // 上一个页面
    this.setData({
      deviceStatus: prevPage.data.deviceStatus,
    })
  },

  /**
   * 获取当前角色设置
   */
  initRoleAndVoice() {
    let self = this
    plugin.jsUtil.load(2000)
    let { curItem } = self.data
    plugin.ai.findDeviceRoleVoiceRelV2({
      productKey: curItem.productKey,
      deviceKey: curItem.deviceKey,
      endUserId: curItem.eUid,
      success(res) {
        if (res.data) {
          self.setData({
            curRole: res.data,
          })
          // 获取到当前设备应用的角色后，更新删除按钮状态
          self.updateDeleteButtonState()
        }
      },
      fail(res) {},
      complete(res) {
        self.setData({
          isFinish: true,
        })
        plugin.jsUtil.hideTip()
      },
    })
  },

  /**
   * 返回
   */
  backSet() {
    this.setData({
      isEdit: false,
    })
  },

  loop() {
    let self = this
    self.clearSendTimer()
    let n = 6
    self.data.sendTimer = setInterval(() => {
      let { isSendSucc } = self.data
      if (isSendSucc == true) {
        self.clearSendTimer()
      }
      if (n > 1) {
        n--
      } else {
        n = 1
        self.clearSendTimer()
        plugin.jsUtil.tip("服务端设置成功，但下发命令到设备失败")
        self.exitToHome()
        plugin.jsUtil.delayCb(() => {
          if (isSendSucc == false) {
            plugin.jsUtil.hideTip()
            self.setData({
              netErrorVis: true,
            })
          }
        }, 2000)
      }
    }, 1000)
  },

  /**
   * 清除超时定时器
   */
  clearSendTimer() {
    let { sendTimer } = this.data
    if (sendTimer) {
      clearInterval(sendTimer) //清除js定时器
      sendTimer = null
      this.setData({
        sendTimer,
        isSendSucc: false,
      })
    }
  },

  confirmRoleSel() {
    // 检查表单是否完整
    if (!this.data.isFormValid) {
      plugin.jsUtil.tip("请完善所有配置项")
      return
    }

    if (this.data.cFlag) {
      return
    }
    this.setData({ cFlag: true })
    plugin.jsUtil.delayCb(() => {
      this.setData({ cFlag: false })
    }, 1500)

    this.setApi()
  },

  /**
   * 验证表单数据
   */
  validateForm() {
    const { roleName } = this.data
    if (!roleName.trim()) {
      plugin.jsUtil.tip("请输入角色名称")
      return false
    }
    return true
  },

  /**
   * 获取默认系统音色ID
   */
  getDefaultVoiceId() {
    return new Promise((resolve, reject) => {
      const { curItem, curRole } = this.data
      const targetRoleId = curRole.roleId

      plugin.ai.queryAiBotVoiceList({
        pageNum: 1,
        pageSize: 100,
        deviceKey: curItem.deviceKey,
        productKey: curItem.productKey,
        botRoleId: targetRoleId,
        success: (res) => {
          if (res.rows && res.rows.length > 0) {
            // 找到第一个系统音色
            const systemVoice = res.rows[0]
            resolve(systemVoice.voiceId)
          } else {
            resolve(0)
          }
        },
        fail: (res) => {
          console.log("获取音色列表失败:", res)
          resolve(0)
        },
      })
    })
  },

  /**
   * 获取角色数据
   */
  async getRoleData() {
    const { curItem, roleName, roleDesc, prompt, editRoleId, voiceId, isEditMode } =
      this.data

    let finalVoiceId = voiceId

    // 新建角色时，如果没有voiceId，获取默认系统音色ID
    if (!isEditMode && (!voiceId || voiceId === 0)) {
      finalVoiceId = await this.getDefaultVoiceId()
    }

    return {
      productKey: curItem.productKey,
      deviceKey: curItem.deviceKey,
      roleId: editRoleId,
      voiceId: finalVoiceId,
      roleName: roleName,
      prompt: prompt,
      roleDesc: roleDesc,
      rolePicUrl: this.data.avatar,
    }
  },

  /**
   * 处理角色编辑成功后的设备下发逻辑
   */
  handleDeviceSync() {
    const { deviceStatus, curItem, curRole, editRoleId } = this.data

    // 检查设备是否离线
    if (deviceStatus === "离线" || deviceStatus === 0 || deviceStatus === "") {
      plugin.jsUtil.tip("服务端设置成功，但离线设备无法下发命令到设备")
      this.handleSuccess()
      return
    }

    // 判断当前使用的角色ID和修改的角色ID是否一致
    const isSameRole = curRole && curRole.roleId === editRoleId
    console.log(curRole.roleId, editRoleId)
    // 只有在自定义角色且角色ID一致时才下发指令
    if (!isSameRole) {
      this.handleSuccess()
      return
    }
    // 如果修改的角色是当前首页使用中的角色，调用editDeviceRoleVoice接口
    plugin.ai.editDeviceRoleVoiceV2({
      deviceKey: curItem.deviceKey,
      productKey: curItem.productKey,
      roleId: editRoleId,
      voiceId: this.data.voiceId,
      endUserId: curItem.eUid,
      success: (res) => {
        // 成功后继续原有的设备下发流程
        this.continueDeviceSync()
      },
      fail: (res) => {
        this.handleSuccess()
      },
      complete: (res) => {},
    })
  },

  continueDeviceSync() {
    const { chatReloadObj, curItem } = this.data

    // 开始设备下发流程
    this.loop()
    const sendData = [{ [chatReloadObj.code]: true }]

    eventBus.emit(
      "sendAttr",
      {
        productKey: curItem.productKey,
        deviceKey: curItem.deviceKey,
        code: chatReloadObj.code,
        value: true,
        sendData,
      },
      () => {
        this.setData({ isSendSucc: true })
        plugin.jsUtil.delayCb(() => {
          this.clearSendTimer()
          plugin.jsUtil.tip("更改成功")
          this.handleSuccess()
        })
      },
      () => {
        this.setData({ isSendSucc: false })
        plugin.jsUtil.tip("角色编辑成功，但设备下发失败")
        this.handleSuccess()
      },
    )
  },

  /**
   * 处理成功后的通用逻辑
   */
  handleSuccess() {
    app.globalData.needRefreshRoleList = true
    setTimeout(() => {
      wx.navigateBack()
    }, 500)
  },

  /**
   * 处理失败后的通用逻辑
   */
  handleError(errorMsg, defaultMsg) {
    console.error(errorMsg)
    plugin.jsUtil.tip(defaultMsg)
    this.setData({ cFlag: false })
  },

  /**
   * 编辑角色
   */
  async editRole() {
    const roleData = await this.getRoleData()

    plugin.ai.roleEdit({
      ...roleData,
      success: (res) => {
        this.handleDeviceSync()
      },
      fail: (res) => {
        this.handleError("角色编辑失败:", res.msg || "角色编辑失败，请重试")
      },
      complete: (res) => {
        this.setData({ cFlag: false })
      },
    })
  },

  /**
   * 创建角色
   */
  async createRole() {
    const roleData = await this.getRoleData()

    plugin.ai.roleAdd({
      ...roleData,
      success: (res) => {
        plugin.jsUtil.tip("角色创建成功")
        this.handleSuccess()
      },
      fail: (res) => {
        this.handleError("角色创建失败:", res.msg || "角色创建失败，请重试")
      },
      complete: (res) => {
        this.setData({ cFlag: false })
      },
    })
  },

  /**
   * 主要的API调用入口
   */
  setApi() {
    // 验证表单
    if (!this.validateForm()) {
      return
    }

    const { isEditMode } = this.data

    if (isEditMode) {
      this.editRole()
    } else {
      this.createRole()
    }
  },
  exitToHome() {
    let pages = getCurrentPages()
    pages.forEach((r) => {
      if (r.route && r.route == "panel/toy/index/index") {
        r.exitToHome()
      }
    })
  },

  reconnectPopup(res) {
    let self = this
    let { curRole } = self.data
    if (
      res &&
      res.detail &&
      res.detail.isNetConnected &&
      JSON.stringify(curRole) == "{}"
    ) {
      self.initRoleAndVoice()
    }
    let pages = getCurrentPages()
    pages.forEach((r) => {
      if (r.route && r.route == "panel/toy/index/index") {
        r.reconnectPopup()
      }
    })
  },

  getNetErrShow(e) {
    this.setData({
      netErrorShow: e.detail,
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

  /**
   * 跳到声音列表
   */

  // 角色名称输入
  onRoleNameInput(e) {
    this.setData({
      roleName: e.detail.value,
    })
    this.checkFormValid()
  },

  // 角色描述输入
  onRoleDescInput(e) {
    const value = e.detail.value
    // 限制字符数为1-200
    if (value.length >= 1 && value.length <= 200) {
      this.setData({
        roleDesc: value,
        roleDescLength: value.length,
      })
    } else if (value.length === 0) {
      this.setData({
        roleDesc: value,
        roleDescLength: 0,
      })
    }
    this.checkFormValid()
  },

  // 提示词输入
  onPromptInput(e) {
    const value = e.detail.value
    // 限制字符数为1-1024
    if (value.length >= 1 && value.length <= 1024) {
      this.setData({
        prompt: value,
        promptLength: value.length,
      })
    } else if (value.length === 0) {
      this.setData({
        prompt: value,
        promptLength: 0,
      })
    }
    this.checkFormValid()
  },

  // 提示词模板列表
  getPropmtTemplateList() {
    plugin.ai.promptTemplateList({
      supplier: "coze", // TODO:
      success: (res) => {
        if (res?.data) {
          this.setData({
            promptTemplateList: res.data,
          })
          console.log("promptTemplateList", this.data.promptTemplateList)
        }
      },
      fail: (error) => {
        console.error(error)
      },
    })
  },

  // 提示词模板详情 TODO:
  // 点击提示词模板
  onPromptTemplateClick(e) {
    const ptcId = e.currentTarget.dataset.ptcId
    this.getPromptTemplateDetail(ptcId)
  },

  getPromptTemplateDetail(ptcId) {
    plugin.ai.promptTemplateDetail({
      ptcId,
      success: (res) => {
        console.log("提示词模板详情:", res)
        if (res?.data?.content) {
          // 将模板内容填入提示词输入框
          this.setData({
            prompt: res.data.content,
            promptLength: res.data.content.length,
          })
          this.checkFormValid()
        }
      },
      fail: (error) => {
        console.error("获取提示词模板详情失败:", error)
      },
    })
  },

  // ai润色提示词
  onaiPromptPolish() {
    let self = this
    // 验证三个文本输入区域都有值
    if (!self.data.roleName || !self.data.roleDesc || !self.data.prompt) {
      wx.showToast({
        title: "请填写完整的角色信息",
        icon: "none",
      })
      return
    }

    self.setData({
      isPolish: true,
    })
    plugin.ai.obtainPolishPrompt({
      roleName: self.data.roleName,
      roleInput: self.data.prompt,
      roleDesc: self.data.roleDesc,
      success(res) {
        self.setData({
          isPolish: false,
          prompt: res.data,
          promptLength: res.data?.length || 0,
        })
        // 润色完成后重新校验，启用“确定”按钮
        self.checkFormValid()
      },
      fail(res) {},
      complete(res) {},
    })
  },

  //删除当前角色
  // 显示删除确认弹窗
  delRole() {
    // 二次保护：禁用态直接返回并提示
    if (this.data.isDeleteDisabled) {
      plugin.jsUtil.tip("当前设备正在使用该自定义角色，不能删除")
      return
    }
    this.setData({
      showDeleteDialog: true,
    })
  },

  // 取消删除
  cancelDelete() {
    this.setData({
      showDeleteDialog: false,
    })
  },

  // 确认删除角色
  confirmDelete() {
    const { curItem, editRoleId } = this.data
    plugin.ai.roleDelete({
      productKey: curItem.productKey,
      deviceKey: curItem.deviceKey,
      roleId: editRoleId,
      success: (res) => {
        wx.showToast({
          title: "删除成功",
          icon: "success",
        })
        // 返回上一页
        setTimeout(() => {
          wx.navigateBack()
        }, 1000)
      },
      fail: (res) => {
        if(res.code == 68050){
          wx.showToast({
            title: "该角色正在使用，无法删除",
            icon: "none",
          })
        }else{
          wx.showToast({
            title: "删除失败",
            icon: "none",
          })
        }
      },
      complete: (res) => {
        this.setData({
          showDeleteDialog: false,
        })
      },
    })
  },
})
