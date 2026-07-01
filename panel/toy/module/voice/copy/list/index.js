const plugin = requirePlugin("quecPlugin")
const AudioPlayer = require("../../util/audioPlayer")
const MicAuth = require("../../util/micAuth")
const RecordHandlers = require("../../util/recordHandlers")
const StepNavigation = require("../../util/stepNavigation")
const WavConverter = require("../../util/wavConverter")
import eventBus from "../../../../../common/eventBus"

let app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 页面数据
    active: "a",
    selectedVoiceId: null,
    selectedEditCopyVoiceId: null,
    playingVoiceId: null, // 当前播放的声音ID
    isPlayingAudio: false, // 是否正在播放音频
    selectedEditCopyVoiceAvailableTrainingTimes: null,
    showCopyButton: false,
    showCloneButton: false, // 显示克隆声音按钮
    showReCloneButton: false, // 显示重新克隆按钮
    showCloneTab: false, // 控制克隆声音tab的显示
    currentVoiceId: null, // 记录当前设备的声音ID
    // 移除了分别控制的确定按钮状态，改为统一逻辑
    selectedRoleInfo: null, // 从角色设置页面传入的选中角色信息
    // 图片资源
    noDataImg: plugin.main.getRootImg() + "example/images/noChatHistory.png",
    recodingImg: plugin.main.getRootImg() + "example/images/recording.png",
    voiceDefaultData: [],
    voiceCopyData: [],
    copyVoiceLoaded: false,
    copyVoiceLoading: false,
    // 是否只有一条未克隆的声音数据
    isSingleEmptyCopyVoice: false,
    refresherTriggered: false,

    // 复刻声音弹窗相关
    showCopyVoicePopup: false,
    copyVoiceStep: 0,
    copyVoicePopupTitle: "",
    langType: "中文", // 设置默认语言为中文

    // 语速调节相关
    showSpeedControl: false, // 控制语速调节面板的显示/隐藏
    currentSpeedIndex: null, // 当前选中的语速索引，初始不选，避免载入时闪烁到“标准”
    speedLabels: ["慢", "标准", "快"], // 语速选项标签
    speedVlaue: ["slow", "normal", "fast"], //语速选项值
    configContent: null, // 当前语速值（无默认值）
    hasSpeedChanged: false, // 标记用户是否调节了语速
    // 修改名称弹窗相关
    showChangeNameDialog: false,
    changeNameDialog: "",
    renameVoiceId: null,

    // 国际化和皮肤
    i18n: "",
    skin: "",

    // 当前选中的项目和角色
    curItem: {},
    curRole: {},
    curVoice: {},
    chatReloadObj: {},
    deviceStatus: "",
    isFinish: false,
    netErrorShow: false,

    // 发送相关
    sendTimer: null,
    isSendSucc: false,
    cFlag: false,

    // 发布弹窗相关
    showPublishDialog: false,
    publishDialogData: null,

    voice_hui: plugin.main.getRootImg() + "rongyao/img/voice_default.png",
    voice_blue: plugin.main.getRootImg() + "rongyao/img/voice_active.png",
    try_gif: plugin.main.getRootImg() + "rongyao/img/try.gif",

    env: app.globalData.envData,
  },

  onRecordStart() {
    RecordHandlers.onRecordStart(this, "copyVoicePopupTitle", "录音中，请朗读")
  },

  onRecordComplete(e) {
    RecordHandlers.onRecordComplete(e, (tempFilePath) => {
      this.uploadRecordedAudio(tempFilePath)
    })
  },

  onRecordTitleReset() {
    RecordHandlers.onRecordTitleReset(this, "copyVoicePopupTitle", "请朗读")
  },

  onRightIconTapStop() {
    // 用于阻止右侧图标区域的点击冒泡到整卡
    // 该函数不需要做任何事情，只要存在即可让捕获阶段和冒泡阶段的拦截生效
  },

  /**
   * 点击复刻声音项时设置相关变量控制克隆按钮显隐
   */
  clickCopyVoiceItem(event) {
    // 如果来自“编辑名称”icon，则不触发整卡选中
    const isFromRenameIcon = !!(
      event &&
      event.target &&
      event.target.dataset &&
      event.target.dataset.stopSelect
    )
    if (isFromRenameIcon) {
      return
    }

    const voiceId = event.currentTarget.dataset.voiceId
    const copyVoice = event.currentTarget.dataset.copyVoice
    const { active } = this.data
    const isPublished = copyVoice.publishStatus
    const hasClonedData = copyVoice.hasClonedData
    const isEmpty = copyVoice.isEmpty
    // 新买的套餐，没有剩余次数
    const hasRemainingTimes =
      copyVoice.availableTrainingTimes === null ||
      copyVoice.availableTrainingTimes > 0

    const shouldShowCloneButton =
      active === "b" && isEmpty && hasRemainingTimes && !isPublished
    const shouldShowReCloneButton =
      active === "b" && hasClonedData && hasRemainingTimes && !isPublished

    this.setData({
      selectedEditCopyVoiceId: voiceId,
      selectedEditCopyVoiceAvailableTrainingTimes:
        copyVoice.availableTrainingTimes,
      selectedVoiceId: null, // 清空系统声音选中状态，避免radio选中冲突
      showCloneButton: shouldShowCloneButton,
      showReCloneButton: shouldShowReCloneButton,
    })
    // 播放克隆声音音频
    if (copyVoice.soundUrl) {
      this.playVoiceAudio(copyVoice.soundUrl, voiceId)
    }
  },

  // 开始克隆声音（用于新数据）
  startCloneVoice() {
    const self = this
    // 检查麦克风权限后打开录音弹窗
    this.checkMicAuth().then((hasAuth) => {
      if (hasAuth) {
        self.setData({
          showCopyVoicePopup: true,
          copyVoiceStep: 1,
          copyVoicePopupTitle: "注意事项",
          showCopyButton: true, // 显示取消按钮
        })
      } else {
        self.setData({
          showCopyVoicePopup: true,
          copyVoiceStep: 0,
          showCopyButton: true, // 显示取消按钮
        })
      }
    })
  },

  // 声音克隆音频上传
  uploadRecordedAudio(filePath) {
    const {
      curItem,
      selectedEditCopyVoiceId,
      showCloneButton,
      showReCloneButton,
      curRole,
    } = this.data
    const roleId = curRole.roleId

    if (showCloneButton || showReCloneButton) {
      this.setData({
        copyVoicePopupTitle: "录音文件处理中...",
      })

      // PCM to WAV 转换
      WavConverter.pcmToWav(filePath, {
        sampleRate: 24000,
        numChannels: 1,
        bitsPerSample: 16,
      })
        .then((wavFilePath) => {
          this.setData({
            copyVoicePopupTitle: "录音文件上传校验中...",
          })
          this._doUploadAudio(wavFilePath, selectedEditCopyVoiceId, roleId)
        })
        .catch((err) => {
          console.error("PCM 转 WAV 失败", err)
          this.setData({
            copyVoicePopupTitle: "音频处理失败，请重试",
          })
        })
    }
  },

  // 执行实际上传
  _doUploadAudio(filePath, voiceId, roleId) {
    const { curItem } = this.data
    plugin.saas.eduUploadCopyVoiceAudio({
      productKey: curItem.productKey,
      deviceKey: curItem.deviceKey,
      voiceId,
      file: filePath,
      roleId,
      content:
        "你说的没错呀，哪吒这部电影我周末也去看了，这部电影可以称得上是五年内最好的国产动画片了。",
      success: (res) => {
        // 处理嵌套的JSON响应数据
        let responseData = JSON.parse(res.data)
        // 检查返回的code
        if (responseData.code === 200) {
          this.setData({
            copyVoicePopupTitle: "生成中，请稍后...",
          })
          // 3秒后关闭弹窗并刷新列表
          setTimeout(() => {
            this.closeCopyVoicePopup()
            this.setData({ active: "b" })
            this.getCopyVoiceList()
          }, 3000)
        } else if (responseData.code === 68080) {
          this.setData({
            copyVoicePopupTitle: "校验失败，请按文本朗读",
          })
        } else {
          this.setData({
            copyVoicePopupTitle: responseData.msg || "上传失败",
          })
        }
      },
      fail: (res) => {
        console.error("上传失败", res)
        let resData = JSON.parse(res.data)
        this.setData({
          copyVoicePopupTitle: resData.msg || "录音文件上传失败",
        })
      },
    })
  },

  // 修改标签页切换逻辑
  onChangeTab(event) {
    const newActiveTab = event.detail.name

    this.setData({
      active: newActiveTab,
      // 切换tab时保持选中状态不变
      // selectedVoiceId 和 selectedEditCopyVoiceId 保持原值
      // 隐藏所有按钮
      showCloneButton: false,
      showReCloneButton: false,
      showCopyButton: false,
      // 重置语速调节标记
      hasSpeedChanged: false,
    })
  },

  //批量设置智能体配置,音色&语速
  onbatchSetBotConfig() {
    const {
      configContent,
      selectedVoiceId,
      selectedEditCopyVoiceId,
      selectedRoleInfo,
      active,
      voiceCopyData,
      curRole,
    } = this.data

    // 确定选中的音色ID
    const selectedVoice = selectedVoiceId || selectedEditCopyVoiceId

    if (!selectedVoice) {
      wx.showToast({
        title: "请先选择音色",
        icon: "none",
      })
      return
    }

    // 检查未发布的克隆声音
    if (active === "b" && selectedEditCopyVoiceId) {
      const selectedCopyVoice = voiceCopyData.find(
        (voice) => voice.voiceId === selectedEditCopyVoiceId,
      )

      // 未发布的克隆声音显示发布弹窗
      if (selectedCopyVoice && !selectedCopyVoice.publishStatus) {
        this.setData({
          showPublishDialog: true,
          publishDialogData: selectedCopyVoice,
        })
        return
      }
    }

    let configList = [
      {
        configContent: configContent, //语速
        configType: "botSpeechRate",
      },
      {
        configContent: selectedVoice, //音色
        configType: "botVoiceId",
      },
    ]

    const roleIdForConfig = selectedRoleInfo?.roleId || curRole?.roleId

    plugin.ai.setBotConfigBatch({
      configList,
      roleId: roleIdForConfig,
      success: () => {
        const voiceChanged = selectedVoice !== this.data.currentVoiceId

        // 更新当前音色ID
        this.setData({
          currentVoiceId: selectedVoice,
        })

        // 向角色设置页回传最新音色，避免额外接口
        eventBus.emit("roleVoiceUpdated", {
          roleId: roleIdForConfig,
          voiceId: selectedVoice,
          voiceName:
            this.data.voiceCopyData.find((v) => v.voiceId === selectedVoice)
              ?.voiceName ||
            this.data.voiceDefaultData.find((v) => v.voiceId === selectedVoice)
              ?.voiceName ||
            "",
        })

        if (!this.shouldTriggerSetApi()) {
          // 修改的不是当前使用中的角色，无需下发设备指令
          setTimeout(() => {
            wx.navigateBack()
          }, 1000)
          return
        }

        if (voiceChanged) {
          // 音色有变化，走原有 setApi 流程（含 editDeviceRoleVoiceV2 + chatReload 下发）
          this.setData(
            {
              curVoice: {
                ...this.data.curVoice,
                voiceId: selectedVoice,
              },
            },
            () => {
              this.setApi()
            },
          )
        } else {
          // 音色未变，仅语速变化，直接下发重新进房
          this.sendChatReload()
        }
      },
      fail: (error) => {
        wx.showToast({
          title: "设置失败",
          icon: "none",
        })
        console.error("设置失败:", error)
      },
    })
  },

  /**
   * 下发重新进房
   */
  sendChatReload() {
    const { curItem, chatReloadObj, deviceStatus } = this.data

    if (deviceStatus === "离线" || deviceStatus === 0 || deviceStatus === "") {
      plugin.jsUtil.tip("服务端设置成功，但离线设备无法下发命令到设备")
      setTimeout(() => {
        wx.navigateBack()
      }, 1000)
      return
    }

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
          setTimeout(() => {
            wx.navigateBack()
          }, 800)
        })
      },
      () => {
        this.setData({ isSendSucc: false })
      },
    )
  },

  /**
   * 判断是否需要触发setApi
   */
  shouldTriggerSetApi() {
    const { selectedRoleInfo, curRole } = this.data

    // 路径1：从面板首页进入（没有selectedRoleInfo参数）
    // 此时默认修改的就是当前使用中的角色
    if (!selectedRoleInfo) {
      return true
    }

    // 路径2：从角色设置页进入，判断选中的角色是否是当前设备正在使用的角色
    if (selectedRoleInfo && curRole) {
      return selectedRoleInfo.roleId === curRole.roleId
    }

    return false
  },
  // 声音录制 下一步
  toNextStep() {
    StepNavigation.handleNextStep(this, {
      stepField: "copyVoiceStep",
      titleField: "copyVoicePopupTitle",
      step0Title: "注意事项",
      step1Title: "请朗读",
    })
  },

  checkMicAuth() {
    return MicAuth.checkMicAuth()
  },

  //   打开和关闭克隆声音的dialog
  closeCopyVoicePopup(e) {
    StepNavigation.closeRecordPopup(this, {
      popupField: "showCopyVoicePopup",
      stepField: "copyVoiceStep",
      resetFields: {
        showChangeLangDialog: false,
        langType: "中文",
      },
    })
  },

  // 打开声音录制弹框
  openCopyVoicePopup(e) {
    // 停止当前播放
    this.stopCurrentAudio()
    StepNavigation.openRecordPopup(this, {
      popupField: "showCopyVoicePopup",
      stepField: "copyVoiceStep",
      titleField: "copyVoicePopupTitle",
      hasAuthTitle: "注意事项",
      hasAuthStep: 1,
      noAuthStep: 0,
      additionalData: {
        showCopyButton: true,
      },
    })
  },

  //   打开和关闭修改语言的dialog
  openChangeLangDialog(e) {
    this.setData({
      showChangeLangDialog: true,
    })
  },

  changLang(e) {
    this.setData({
      langType: e.detail.langType,
    })
    console.log(e.detail.langType)
  },

  // 关闭语言选择弹窗时重置为中文
  closeChangeLangDialog(e) {
    this.setData({
      langType: "中文", // 关闭弹窗时重置为默认中文
      showChangeLangDialog: false,
    })
  },

  // 语速调节相关方法
  toggleSpeedControl() {
    this.setData({
      showSpeedControl: !this.data.showSpeedControl,
    })
  },

  onSpeedChange(e) {
    const index = e.currentTarget.dataset.index
    const curconfigContent = this.data.speedVlaue[index]

    // 如果选择的语速与当前语速相同，则不执行任何操作
    if (index === this.data.currentSpeedIndex) {
      console.log("选择的语速与当前语速相同，不执行操作")
      return
    }

    // 只更新本地状态，不调用接口，等用户点击确定按钮时再统一提交
    this.setData({
      currentSpeedIndex: index,
      configContent: curconfigContent,
      hasSpeedChanged: true,
    })

    console.log("语速值已更新为:", curconfigContent)
    console.log("语速已切换为:", this.data.speedLabels[index])
  },

  //   打开和关闭复刻声音编辑名称的dialog
  closeChangeNameDialog(e) {
    this.setData({
      showChangeNameDialog: false,
    })
  },

  openChangeNameDialog(e) {
    const voiceId = e.target.dataset.voiceId || e.currentTarget.dataset.voiceId
    const initNameValue =
      e.target.dataset.initNameValue || e.currentTarget.dataset.initNameValue

    this.setData({
      showChangeNameDialog: true,
      changeNameDialog: initNameValue,
      // 不改变当前选中项，仅记录要重命名的目标ID
      renameVoiceId: voiceId,
    })
    console.log("icon被点击了")
  },

  // 修改克隆声音名称
  onChangeName(e) {
    this.setData({
      changeNameDialog: e.detail.value,
    })
  },

  // 添加 getUserInfo 方法处理名称修改确认
  getUserInfo(e) {
    const self = this
    const {
      curItem,
      changeNameDialog,
      selectedEditCopyVoiceId,
      renameVoiceId,
    } = self.data

    // 验证输入
    if (!changeNameDialog || changeNameDialog.trim() === "") {
      wx.showToast({
        title: "声音名称不能为空",
        icon: "none",
      })
      return
    }

    const targetVoiceId =
      renameVoiceId != null ? renameVoiceId : selectedEditCopyVoiceId

    // 调用接口修改声音名称
    plugin.saas.setVoiceNameAudio({
      productKey: curItem.productKey,
      deviceKey: curItem.deviceKey,
      voiceId: targetVoiceId,
      voiceName: changeNameDialog.trim(),
      success(res) {
        if (res.code === 200) {
          wx.showToast({
            title: "修改成功",
            icon: "success",
          })

          // 关闭弹窗并清理重命名状态
          self.setData({
            showChangeNameDialog: false,
            changeNameDialog: "",
            renameVoiceId: null,
          })

          // 刷新复刻声音列表
          self.getCopyVoiceList()
        } else {
          wx.showToast({
            title: res.message || "修改失败",
            icon: "none",
          })
        }
      },
      fail(res) {
        wx.showToast({
          title: "修改失败，请重试",
          icon: "none",
        })
      },
      complete(res) {
        // 可以在这里添加完成后的通用处理
      },
    })
  },

  /**
   * 点击声音处理
   */
  voiceItemClickListen(event) {
    const soundUrl = event.currentTarget.dataset.soundUrl
    // 从事件中获取声音ID
    const voiceId = event.currentTarget.dataset.voiceId
    console.log(event.detail)

    // 一次性更新所有相关状态，避免多次setData调用
    this.setData({
      selectedEditCopyVoiceId: null,
      showCloneButton: false,
      showReCloneButton: false,
      audioSrc: event.detail,
      selectedVoiceId: voiceId, // 设置选中的声音ID
    })

    // 播放音频
    if (soundUrl) {
      this.playVoiceAudio(soundUrl, voiceId)
    }
  },

  // 播放声音音频
  playVoiceAudio(soundUrl, voiceId = null) {
    // 使用公共音频播放工具，播放时设置selectedVoiceId但播放结束时不保持（copy组件行为）
    AudioPlayer.playVoiceAudio(soundUrl, voiceId, this, {
      keepSelectedVoiceId: true,
      setSelectedVoiceId: true,
    })
  },

  // 停止当前音频播放
  stopCurrentAudio() {
    // 使用公共音频播放工具，保持selectedVoiceId（避免切后台后失去选中状态）
    AudioPlayer.stopCurrentAudio(this, { keepSelectedVoiceId: true })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let initialData = {
      i18n: plugin.main.getLang(),
      skin: plugin.main.getSkin(),
      showCloneButton: false,
      showReCloneButton: false,
      selectedEditCopyVoiceId: null,
      hasInitialRefreshed: false,
    }

    if (options.item) {
      initialData.curItem = JSON.parse(decodeURIComponent(options.item))
    }
    if (options.info) {
      const roleInfo = JSON.parse(decodeURIComponent(options.info))
      initialData.selectedRoleInfo = roleInfo
      initialData.selectedVoiceId = roleInfo.voiceId
    }
    if (options.chatReloadObj) {
      initialData.chatReloadObj = JSON.parse(
        decodeURIComponent(options.chatReloadObj),
      )
    }
    if (options.wsReport) {
      initialData.wsReport = JSON.parse(options.wsReport)
    }

    if (options.from === "feature") {
      initialData.active = "b"
      initialData.showCloneTab = true
    }

    this.setData(initialData)

    // 确保在设置了所有初始数据后再调用初始化逻辑
    if (this.data.curItem) {
      this.checkVoiceCopyStatus()
      this.initRoleAndVoice(true)
      this.initdeviceStatus()
    }

    console.log(this.data.chatReloadObj)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    let self = this
    if (app.globalData.appStatus == "front") {
      self.reconnectWsV2()
      wx.nextTick(() => {
        app.globalData.appStatus = ""
      })
    }
    // 每次页面显示时刷新声音列表（首屏已刷新则跳过一次，避免重复请求）
    const currentRoleId = this.data.selectedRoleInfo
      ? this.data.selectedRoleInfo.roleId
      : this.data.curRole.roleId
    if (this.data.isFinish && currentRoleId) {
      this.refreshVoiceData("all")
    }
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

  onHide() {
    this.stopCurrentAudio()
  },

  initdeviceStatus() {
    let self = this
    let pages = getCurrentPages() //  获取页面栈
    let prevPage = pages[pages.length - 2] // 上一个页面
    self.setData({
      deviceStatus: prevPage.data.deviceStatus,
    })
    eventBus.on("wsAiDstatus", (status) => {
      self.setData({
        deviceStatus: status,
      })
    })
  },

  /**
   * 获取当前角色设置
   */
  initRoleAndVoice(isGetVoiceList) {
    let self = this
    plugin.jsUtil.load(2000)
    let { curItem, curVoice, selectedRoleInfo } = self.data
    console.log("initRoleAndVoice dfdfd 681")
    console.log(curItem)
    // 如果从角色设置页面跳转且有选中的角色信息，直接使用该角色信息
    if (selectedRoleInfo) {
      curVoice.voiceName = selectedRoleInfo.voiceName
      curVoice.voiceId = selectedRoleInfo.voiceId

      let selectedVoiceId = self.data.selectedVoiceId
      if (selectedVoiceId === null) {
        selectedVoiceId = selectedRoleInfo.voiceId
      }

      self.setData({
        selectedVoiceId: selectedVoiceId,
        curVoice,
        currentVoiceId: selectedRoleInfo.voiceId,
      })

      // 通过接口获取设备当前使用中的角色，确保 shouldTriggerSetApi 判断准确
      const { curItem } = self.data
      plugin.ai.findDeviceRoleVoiceRelV2({
        productKey: curItem.productKey,
        deviceKey: curItem.deviceKey,
        endUserId: curItem.uid,
        success(res) {
          if (res.data) {
            self.setData({ curRole: res.data })
          }
        },
      })

      self.getSpeedConfig()

      if (isGetVoiceList) {
        self.refreshVoiceData("all")
        // 记录首屏已经刷新过，避免 onShow 再次刷新造成重复请求
        self.setData({ hasInitialRefreshed: true })
      }

      self.setData({
        isFinish: true,
      })
      plugin.jsUtil.hideTip()
      return
    }

    // 从首页跳转，获取当前设备的角色信息
    plugin.ai.findDeviceRoleVoiceRelV2({
      productKey: curItem.productKey,
      deviceKey: curItem.deviceKey,
      endUserId: curItem.uid,
      success(res) {
        //console.log(res)
        if (res.data) {
          curVoice.voiceName = res.data.voiceName
          curVoice.voiceId = res.data.voiceId
          let selectedVoiceId = self.data.selectedVoiceId
          if (selectedVoiceId === null) {
            selectedVoiceId = res.data.voiceId
          }
          self.setData({
            selectedVoiceId: selectedVoiceId,
            curRole: res.data,
            curVoice,
            currentVoiceId: res.data.voiceId, // 记录当前设备的声音ID
          })
          self.getSpeedConfig()
        }
        if (isGetVoiceList) {
          self.refreshVoiceData("all")
          // 记录首屏已经刷新过，避免 onShow 再次刷新造成重复请求
          self.setData({ hasInitialRefreshed: true })
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

  // 统一的刷新处理方法
  handleRefreshComplete() {
    this.setData({
      refresherTriggered: false,
    })
  },
  /**
   * 通用刷新方法
   */
  refreshVoiceData(refreshType = "all") {
    // 根据不同入口确定使用的roleId
    const roleId = this.data.selectedRoleInfo
      ? this.data.selectedRoleInfo.roleId
      : this.data.curRole.roleId
    if (refreshType === "all" || refreshType === "system") {
      this.getVoiceList(roleId)
    }
    if (refreshType === "all" || refreshType === "copy") {
      this.getCopyVoiceList(roleId)
    }
  },

  /**
   * 系统声音下拉刷新
   */
  onRefreshSystemVoice() {
    this.setData({ refresherTriggered: true })
    this.refreshVoiceData("system")
  },

  /**
   * 克隆声音下拉刷新
   */
  onRefreshCopyVoice() {
    this.setData({ refresherTriggered: true })
    this.refreshVoiceData("copy")
  },

  /**
   * 查询默认声音页
   */
  getVoiceList(roleId) {
    let self = this
    let { curItem, curVoice, curRole, selectedRoleInfo } = self.data

    // 根据入口确定使用的角色ID
    let targetRoleId
    if (selectedRoleInfo) {
      // 从角色设置页面跳转，使用选中角色的ID
      targetRoleId = selectedRoleInfo.roleId
    } else {
      // 从首页跳转，使用当前设备角色的ID
      targetRoleId = roleId ?? curRole.roleId
    }

    plugin.saas.queryAiBotVoiceList({
      pageNum: 1,
      pageSize: 100,
      deviceKey: curItem.deviceKey,
      productKey: curItem.productKey,
      botRoleId: targetRoleId,
      success(res) {
        if (res.rows) {
          let list = res.rows
          const { selectedVoiceId } = self.data
          list.forEach((l) => {
            if (selectedVoiceId && selectedVoiceId == l.voiceId) {
              l.check = true
              curVoice.soundUrl = l.soundUrl
            } else if (!selectedVoiceId && curVoice.voiceId == l.voiceId) {
              l.check = true
              curVoice.soundUrl = l.soundUrl
            } else {
              l.check = false
            }
          })
          console.log(list)
          self.setData({
            voiceDefaultData: list,
            curVoice,
          })
        }
      },
      fail(res) {},
      complete(res) {
        // 刷新完成，隐藏下拉刷新状态
        self.setData({
          refresherTriggered: false,
        })
      },
    })
  },

  /**
   * 处理复刻声音数据，添加状态标识
   */
  processVoiceCopyData(voiceData) {
    // 数据验证
    if (!Array.isArray(voiceData)) {
      console.warn("processVoiceCopyData: voiceData is not an array", voiceData)
      return []
    }

    const processedData = voiceData
      .map((item) => {
        // 基础数据验证
        if (!item || typeof item !== "object") {
          console.warn("processVoiceCopyData: invalid item", item)
          return null
        }

        // 判断是否已克隆：有声音文件且克隆状态为成功或激活
        const hasClonedData =
          item.soundUrl && ["Success", "Active"].includes(item.sourceState)
        // 判断是否为空数据：soundUrl为空则代表这条数据还没有进行声音复刻
        const isEmpty = !item.soundUrl

        // 检查是否已到期
        let isExpired = false
        if (item.sourceExpireTime) {
          try {
            const expireDate = new Date(item.sourceExpireTime)
            const now = new Date()
            // 验证日期是否有效
            if (!isNaN(expireDate.getTime()) && !isNaN(now.getTime())) {
              isExpired = expireDate <= now
            }
          } catch (error) {
            console.warn(
              "processVoiceCopyData: invalid expireTime",
              item.sourceExpireTime,
              error,
            )
          }
        }

        // 添加状态文本处理
        let statusText = ""
        switch (item.sourceState) {
          case "Training":
            statusText = "生成中，下拉刷新"
            break
          case "Unknown":
            statusText = "生成超时"
            break
          case "Success":
            break
          case "Active":
            break
          case "Expired":
            statusText = "火山控制台实例已过期或账号欠费"
            break
          case "Reclaimed":
            statusText = "火山控制台实例已回收"
            break
          default:
            if (item.failReason) {
              statusText = `失败：${item.failReason}`
            }
        }

        return {
          ...item,
          isEmpty,
          hasClonedData,
          isExpired,
          statusText,
        }
      })
      .filter((item) => item !== null) // 过滤掉无效数据

    // 检查当前选中的音色是否已到期
    try {
      this.checkAndSwitchExpiredVoice(processedData)
    } catch (error) {
      console.error(
        "processVoiceCopyData: checkAndSwitchExpiredVoice failed",
        error,
      )
    }

    return processedData
  },

  /**
   * 检查并切换已到期的音色
   */
  checkAndSwitchExpiredVoice(voiceCopyData) {
    const { curVoice, voiceDefaultData } = this.data

    // 检查当前使用的音色是否在复刻音色列表中且已到期
    if (curVoice && curVoice.voiceId) {
      const currentVoiceInCopy = voiceCopyData.find(
        (voice) => voice.voiceId === curVoice.voiceId,
      )

      if (currentVoiceInCopy && currentVoiceInCopy.isExpired) {
        // 当前音色已到期，切换到默认音色列表的第一个
        if (voiceDefaultData && voiceDefaultData.length > 0) {
          const defaultVoice = voiceDefaultData[0]

          // 更新当前音色为默认音色
          this.setData({
            curVoice: {
              voiceId: defaultVoice.voiceId,
              voiceName: defaultVoice.voiceName,
              soundUrl: defaultVoice.soundUrl,
            },
            selectedVoiceId: defaultVoice.voiceId,
            active: "a", // 切换到默认音色标签页
          })

          // 根据页面入口条件判断是否需要调用setApi
          if (this.shouldTriggerSetApi()) {
            this.setApi()
          }

          // 提示用户
          plugin.jsUtil.tip(
            `音色已到期，已自动切换为"${defaultVoice.voiceName}"`,
          )
        }
      }
    }
  },

  /**
   * 查询复刻声音页
   */
  getCopyVoiceList(roleId) {
    let self = this
    let { curItem, curRole, curVoice, selectedRoleInfo } = self.data // 进入克隆声音列表加载状态，避免空态闪现
    this.setData({ copyVoiceLoading: true, copyVoiceLoaded: false })
    plugin.saas.getEduVoiceCopyAudio({
      deviceKey: curItem.deviceKey,
      productKey: curItem.productKey,
      botRoleId: selectedRoleInfo
        ? selectedRoleInfo.roleId
        : (roleId ?? curRole.roleId),
      success(res) {
        if (res.data) {
          let list = res.data
          list.forEach((l) => {
            if (l.voiceName === null) {
              l.voiceName = "--"
            }
            // 处理到期时间
            if (l.sourceExpireTime) {
              const expireDate = new Date(l.sourceExpireTime)
              const now = new Date()

              if (expireDate > now) {
                // 计算剩余天数
                const timeDiff = expireDate.getTime() - now.getTime()
                const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))

                if (daysDiff <= 30) {
                  // 剩余30天内，显示剩余天数
                  l.expireTimeText = `云服务 剩余${daysDiff}天到期`
                } else {
                  // 超过30天，显示具体到期时间
                  const year = expireDate.getFullYear()
                  const month = String(expireDate.getMonth() + 1).padStart(
                    2,
                    "0",
                  )
                  const day = String(expireDate.getDate()).padStart(2, "0")
                  l.expireTimeText = `云服务 ${year}-${month}-${day}到期`
                }
              } else {
                // 已到期
                l.expireTimeText = "云服务 已到期"
              }
            } else {
              // 没有到期时间数据
              l.expireTimeText = "云服务 --到期"
            }
          })

          // 使用处理方法添加状态标识
          const processedData = self.processVoiceCopyData(list)

          // 设置复刻声音的选中状态
          const { selectedVoiceId } = self.data
          processedData.forEach((l) => {
            if (selectedVoiceId && selectedVoiceId == l.voiceId) {
              l.check = true
              curVoice.soundUrl = l.soundUrl
            } else if (!selectedVoiceId && curVoice.voiceId == l.voiceId) {
              l.check = true
              curVoice.soundUrl = l.soundUrl
            } else {
              l.check = false
            }
          })

          // 当角色使用的是克隆声音时，确保进入页面后选中对应的克隆声音
          if (
            selectedVoiceId &&
            processedData.some((v) => v.voiceId == selectedVoiceId)
          ) {
            self.setData({
              selectedEditCopyVoiceId: selectedVoiceId,
              // 清空系统声音选中状态，避免与克隆声音的radio冲突
              selectedVoiceId: null,
            })
          }

          console.log(processedData)
          self.setData({
            voiceCopyData: processedData,
            isSingleEmptyCopyVoice:
              processedData.length === 1 && processedData[0].isEmpty,
            curVoice,
            copyVoiceLoaded: true,
          })

          // 如果有选中的声音，重新设置按钮状态
          if (self.data.selectedEditCopyVoiceId) {
            self.updateSelectedVoiceButtonState(processedData)
          }
        } else {
          // 无数据也视为加载完成，交由视图层展示空态
          self.setData({ copyVoiceLoaded: true })
        }
      },
      fail(res) {},
      complete(res) {
        // 刷新完成，隐藏下拉刷新状态
        self.setData({
          refresherTriggered: false,
          copyVoiceLoading: false,
          copyVoiceLoaded: true,
        })
      },
    })
  },

  // 更新选中声音的按钮状态
  updateSelectedVoiceButtonState(voiceCopyData) {
    const selectedVoiceId = this.data.selectedEditCopyVoiceId
    const selectedVoice = voiceCopyData.find(
      (voice) => voice.voiceId === selectedVoiceId,
    )

    if (selectedVoice) {
      const { active } = this.data
      const hasClonedData = selectedVoice.hasClonedData
      const isEmpty = selectedVoice.isEmpty
      const isPublished = selectedVoice.publishStatus
      const hasRemainingTimes =
        selectedVoice.availableTrainingTimes === null ||
        selectedVoice.availableTrainingTimes > 0

      const shouldShowCloneButton =
        active === "b" && isEmpty && hasRemainingTimes && !isPublished
      const shouldShowReCloneButton =
        active === "b" && hasClonedData && hasRemainingTimes && !isPublished

      this.setData({
        selectedEditCopyVoiceAvailableTrainingTimes:
          selectedVoice.availableTrainingTimes,
        showCloneButton: shouldShowCloneButton,
        showReCloneButton: shouldShowReCloneButton,
        showCopyButton: false,
      })
    }
  },

  /**
   * 设置当前设备的音色与角色
   */
  setApi() {
    let self = this
    let { curItem, curVoice, curRole, chatReloadObj, deviceStatus } = self.data
    if (curVoice?.voiceId === undefined) {
      return plugin.jsUtil.tip("未选择声音")
    }

    const currentRoleId = self.data.selectedRoleInfo
      ? self.data.selectedRoleInfo.roleId
      : curRole?.roleId

    plugin.ai.editDeviceRoleVoiceV2({
      productKey: curItem.productKey,
      deviceKey: curItem.deviceKey,
      endUserId: curItem.uid,
      roleId: currentRoleId,
      voiceId: curVoice?.voiceId,
      success(res) {
        if (
          deviceStatus === "离线" ||
          deviceStatus === 0 ||
          deviceStatus === ""
        ) {
          plugin.jsUtil.tip("服务端设置成功，但离线设备无法下发命令到设备")
          // 显示tip后自动返回上一页
          setTimeout(() => {
            wx.navigateBack()
          }, 1000)
          return
        }
        self.loop()
        let sendData = [{ [chatReloadObj.code]: true }]

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
            self.setData({
              isSendSucc: true,
              voiceShow: false,
            })
            plugin.jsUtil.delayCb(() => {
              self.clearSendTimer()
              // 显示成功提示后返回上一级页面
              setTimeout(() => {
                wx.navigateBack()
              }, 800)
            })
          },
          () => {
            self.setData({
              isSendSucc: false,
            })
          },
        )

        plugin.jsUtil.delayCb(() => {
          self.setData({
            isEdit: false,
          })
        })
      },
      fail(res) {},
      complete(res) {},
    })
  },

  loop() {
    let self = this
    self.clearSendTimer()
    let n = 6
    self.data.sendTimer = setInterval(() => {
      let { isSendSucc } = self.data
      // console.log('n:' + n)
      // console.log('角色声音:' + isSendSucc)
      if (isSendSucc == true) {
        self.clearSendTimer()
      }
      if (n > 1) {
        n--
      } else {
        n = 1
        self.clearSendTimer()
        plugin.jsUtil.tip("服务端设置成功，但下发命令到设备失败")
        // console.log('发送:' + isSendSucc)
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

  /**
   * 确认选择角色声音时触发，验证选择、声音应用
   */
  confirmRoleSel() {
    this.onbatchSetBotConfig()
  },

  // 关闭发布确认弹窗
  closePublishDialog() {
    this.setData({
      showPublishDialog: false,
    })
    // 延迟清空publishDialogData，避免弹窗关闭动画过程中显示错误数值
    setTimeout(() => {
      this.setData({
        publishDialogData: null,
      })
    }, 300) // 等待弹窗关闭动画完成
  },

  // 确认发布声音
  confirmPublishVoice() {
    const { publishDialogData, curItem } = this.data
    if (!publishDialogData) return
    plugin.jsUtil.load(10000)
    plugin.saas.changePublishStatus({
      productKey: curItem.productKey,
      deviceKey: curItem.deviceKey,
      id: publishDialogData.voiceId,
      publishStatus: true,
      success: (res) => {
        this.setData({
          curVoice: {
            voiceId: publishDialogData.voiceId,
            voiceName: publishDialogData.voiceName,
            soundUrl: publishDialogData.soundUrl,
          },
          showPublishDialog: false,
          publishDialogData: null,
        })
        const currentRoleId = this.data.selectedRoleInfo
          ? this.data.selectedRoleInfo.roleId
          : this.data.curRole.roleId
        this.getCopyVoiceList(currentRoleId)

        // 回传最新音色到角色设置页
        eventBus.emit("roleVoiceUpdated", {
          roleId: currentRoleId,
          voiceId: publishDialogData.voiceId,
          voiceName: publishDialogData.voiceName,
        })

        // 根据页面入口条件判断是否需要调用setApi
        if (this.shouldTriggerSetApi()) {
          this.setApi()
        } else {
          // 若无需调用 setApi（修改的不是当前使用角色），直接返回上一页
          wx.navigateBack()
        }
      },
      fail: () => plugin.jsUtil.tip("发布失败，请重试"),
      complete: () => plugin.jsUtil.hideTip(),
    })
  },

  // 通用页面跳转方法
  navigateToPage(pagePath, extraParams = {}) {
    this.clearSendTimer()
    const baseParams = {
      item: encodeURIComponent(JSON.stringify(this.data.curItem)),
      chatReloadObj: JSON.stringify(this.data.chatReloadObj),
      wsReport: JSON.stringify(this.data.wsReport),
      ...extraParams,
    }
    const queryString = Object.keys(baseParams)
      .map((key) => `${key}=${baseParams[key]}`)
      .join("&")
    wx.navigateTo({
      url: `${pagePath}?${queryString}`,
    })
  },

  // 检查声音复刻开通状态
  checkVoiceCopyStatus() {
    const self = this
    const { curItem } = self.data

    plugin.saas.getAiVoiceCopyStatus({
      productKey: curItem.productKey,
      success(res) {
        const enabled =
          res?.data?.configContent === "true" ||
          res?.data?.configContent === true

        let newActive = "a"
        if (enabled && self.data.active === "b") {
          newActive = "b"
        }

        self.setData({
          showCloneTab: !!enabled,
          active: newActive,
        })
      },
      fail(res) {
        // 查询失败时，默认回到系统声音tab
        self.setData({
          showCloneTab: false,
          active: "a",
        })
      },
    })
  },

  getSpeedConfig() {
    let self = this
    const currentRoleId = self.data.selectedRoleInfo
      ? self.data.selectedRoleInfo.roleId
      : self.data.curRole.roleId
    console.log(currentRoleId)
    plugin.ai.findBotList({
      roleId: currentRoleId,
      configTypes: "botSpeechRate",
      success(res) {
        if (res.data) {
          const list = res.data
          if (Array.isArray(list) && list.length > 0) {
            const raw = list[0]?.configContent
            const value = typeof raw === "string" ? raw.toLowerCase() : ""
            const index = self.data.speedVlaue.indexOf(value)
            self.setData({
              showSpeedControl: index >= 0, // 有有效语速值时展开语速卡片
              currentSpeedIndex: index >= 0 ? index : null,
              configContent: index >= 0 ? value : "normal",
              hasSpeedChanged: false,
            })
          } else {
            // 无语速配置时默认展示“标准”
            const normalIndex = self.data.speedVlaue.indexOf("normal")
            self.setData({
              showSpeedControl: true,
              currentSpeedIndex: normalIndex >= 0 ? normalIndex : 1,
              configContent: "normal",
              hasSpeedChanged: false,
            })
          }
        }
      },
      fail(res) {
        // 查询失败时收起语速卡片
        self.setData({
          showSpeedControl: false,
        })
      },
      complete(res) {},
    })
  },

  /**
   *跳转到购买克隆声音服务页
   */
  gotoCreateOrder() {
    this.navigateToPage("../buy/index")
  },

  // 监听页面卸载
  onUnload() {
    this.stopCurrentAudio()
  },
})
