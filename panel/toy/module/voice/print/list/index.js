const plugin = requirePlugin("quecPlugin")
const AudioPlayer = require("../../util/audioPlayer")
const MicAuth = require("../../util/micAuth")
const RecordHandlers = require("../../util/recordHandlers")
const StepNavigation = require("../../util/stepNavigation")

Page({
  /**
   * 页面的初始数据
   */
  data: {
    switchVal: true, // 默认开启状态
    noCreateImg: plugin.main.getRootImg() + "example/images/ic_empty.png",
    // 录音相关图片资源已移至公共组件
    // microPhoneImg: plugin.main.getRootImg() + "example/images/microPhone.png",
    vpfExpiredImg: plugin.main.getRootImg() + "ai/new/shengwen/vpf_expired.png", //声纹过期图标
    vpfNoOpenImg: plugin.main.getRootImg() + "ai/new/shengwen/vpf_noOpen.png", //声纹未开启图标
    voice_hui: plugin.main.getRootImg() + "rongyao/img/voice_default.png", // 声纹默认图标
    voice_blue: plugin.main.getRootImg() + "rongyao/img/voice_active.png", //声纹选中时的图标
    try_gif: plugin.main.getRootImg() + "rongyao/img/try.gif", //声纹录音播放gif
    productKey: "",
    deviceKey: "",
    endUserId: "",

    //声纹信息参数相关
    diId: 0, //设备信息表ID
    voiceFeatureNum: 0, //创建声纹序列号
    vpfId: null, //声纹识别特征ID(单个)
    vpId: null, //声纹识别组信息Id（表Id）
    featureStatus: null, //声纹征状态
    featureList: [], //声纹特征列表
    hasNoAppliedVoice: true, //是否没有应用中的声纹
    activeStatus: true, //声纹识别配置是否开启（最外层状态）
    soundUrl: null, //声纹录音url
    isVoicePrintInfoEmpty: false, //请求到的声纹数据是否为空

    // 声纹录音弹窗相关
    showVoicePrintPopup: false,
    voicePrintStep: 0,
    voicePrintPopupTitle: "",
    langType: "中文", // 设置默认语言为中文

    // 购买入口标记（避免在接口回调里重复解析页面参数）
    isAutoOpen: false,

    // popup相关
    showMorePopup: false, // 控制更多操作弹窗显示
    popupPosition: {
      // 弹窗位置
      left: 0,
      top: 0,
    },
    currentVoiceItem: null, // 当前操作的声纹项

    // 编辑弹窗相关
    showEditPopup: false, // 控制编辑弹窗显示
    editVoiceName: "", // 编辑的声纹名称

    // 删除确认弹窗相关
    showDeletePopup: false, // 控制删除确认弹窗显示

    // 服务过期相关
    groupExpireTime: null, // 声纹识别服务过期时间戳
    expireTimeFormatted: "", // 格式化后的过期时间
    isServiceExpired: false, // 服务是否已过期
    showExpirePopup: false, // 控制服务过期弹窗显示

    // 音频播放相关
    playingVoiceId: null, // 当前播放的声纹ID
    isPlayingAudio: false, // 是否正在播放音频
    selectedVoiceId: null, // 当前选中的声纹ID
    showBackConfirmPopup: false, // 控制返回确认弹窗显示
    initialized: false, // 数据是否已初始化，未初始化不渲染页面

    deviceInfo: {},
  },

  /**
   * 打开声纹录音弹窗
   */
  openVoicePrintPopup() {
    this.stopCurrentAudio()
    StepNavigation.openRecordPopup(this, {
      popupField: "showVoicePrintPopup",
      stepField: "voicePrintStep",
      titleField: "voicePrintPopupTitle",
    })
  },

  /**
   * 关闭声纹录音弹窗
   */
  closeVoicePrintPopup() {
    StepNavigation.closeRecordPopup(this, {
      popupField: "showVoicePrintPopup",
      stepField: "voicePrintStep",
      titleField: "voicePrintPopupTitle",
      resetFields: {
        vpfId: null,
        featureStatus: null,
        langType: "中文",
      },
    })
  },

  /**
   * 处理下一步事件
   */
  handleNextStep() {
    StepNavigation.handleNextStep(this, {
      stepField: "voicePrintStep",
      titleField: "voicePrintPopupTitle",
      confirmText: "确定",
    })
  },

  onRecordPopupLangChange(e) {
    this.setData({
      langType: e.detail.langType,
    })
  },

  onRecordStart() {
    RecordHandlers.onRecordStart(this, "voicePrintPopupTitle")
  },

  onRecordComplete(e) {
    RecordHandlers.onRecordComplete(e, (tempFilePath) => {
      this.handleRecordUpload(tempFilePath)
    })
  },

  onRecordTitleReset() {
    RecordHandlers.onRecordTitleReset(this, "voicePrintPopupTitle", "请朗读")
  },

  /**
   * 录音完成后处理上传逻辑
   */
  handleRecordUpload(filePath) {
    const self = this
    const { vpfId } = self.data

    // 如果已有vpfId（点击init状态声纹时），直接上传录音
    if (vpfId) {
      self.uploadRecordedAudio(filePath)
    } else {
      // 否则先创建声纹特征记录，然后上传录音
      self.createFeatureAndUpload(filePath)
    }
  },

  /**
   * 录音完成后创建声纹特征记录并上传录音
   */
  createFeatureAndUpload(filePath) {
    const self = this
    const { vpId, voiceFeatureNum } = self.data
    const num = voiceFeatureNum + 1
    // 若数字小于10则补0，否则直接转换
    const formattedNum = num < 10 ? `0${num}` : `${num}`
    plugin.ai.addFeature({
      vpId: vpId,
      featureName: `声纹${formattedNum}`,
      featureDesc: "",
      success(res) {
        // 成功后获取返回的必要数据
        if (res.code === 200 && res.data) {
          // 设置声纹识别特征ID和状态，供后续uploadFeature使用
          self.setData({
            vpfId: res.data.vpfId, // 声纹识别特征ID
            featureStatus: res.data.featureStatus, // 声纹征状态
          })
          // 创建成功后立即上传录音
          self.uploadRecordedAudio(filePath)
        }
      },
      fail(res) {},
      complete(res) {},
    })
  },

  /**
   * 检查麦克风权限
   */
  checkMicAuth() {
    return MicAuth.checkMicAuth()
  },

  /**
   * 上传录音文件
   */
  uploadRecordedAudio(filePath) {
    const self = this
    const { vpfId } = self.data

    self.setData({
      voicePrintPopupTitle: "录音文件上传中...",
    })

    plugin.ai.uploadFeature({
      vpfId: vpfId,
      file: filePath,
      fileType: "pcm",
      sampleRate: 24000,
      channel: 1,
      success: (res) => {
        // 处理嵌套的JSON响应数据
        let responseData = JSON.parse(res.data)
        // 检查返回的code
        if (responseData.code === 200) {
          // code 200表示声纹特征创建成功
          self.setData({
            voicePrintPopupTitle: "上传中，请稍后...",
          })
          // 3秒后关闭弹窗并刷新列表
          setTimeout(() => {
            self.closeVoicePrintPopup()
            // 刷新声纹列表数据
            self.getDeviceVoicePrintInfo()
          }, 3000)
        } else if (responseData.code === 68123) {
          self.setData({
            voicePrintPopupTitle: "校验失败，请按文本朗读",
          })
        } else {
          self.setData({
            voicePrintPopupTitle: responseData.msg || "上传失败",
          })
        }
      },
      fail: (res) => {
        console.log("上传失败", res)
        let errorMsg = "录音文件上传失败"

        // 安全地解析返回数据
        if (res.data && typeof res.data === "string") {
          try {
            let resData = JSON.parse(res.data)
            errorMsg = resData.msg || errorMsg
          } catch (e) {
            console.log("解析返回数据失败", e)
          }
        }

        self.setData({
          voicePrintPopupTitle: errorMsg,
        })
      },
    })
  },

  /**
   * 获取当前设备的声纹详情
   */
  getDeviceVoicePrintInfo() {
    let self = this
    const { vpId, productKey, deviceKey, endUserId } = self.data
    plugin.ai.getDeviceVoicePrintInfo({
      vpId: vpId,
      productKey: productKey,
      deviceKey: deviceKey,
      endUserId: endUserId,
      success(res) {
        console.log("查询声纹详情成功", res.data)
        // 处理返回的声纹列表数据
        if (res.data) {
          const featureList = res.data.featureList || []
          const hasAppliedVoice = featureList.some((item) => item.activeStatus === true)

          // 处理服务过期时间
          let expireTimeFormatted = ""
          let isServiceExpired = false
          let switchVal = self.data.switchVal
          let groupExpireTime = res.data.groupExpireTime

          if (groupExpireTime) {
            // 使用项目已有的时间格式化工具函数
            const expireDate = new Date(groupExpireTime)
            expireTimeFormatted = plugin.jsUtil.formatDate(expireDate, "yyyy-MM-dd")

            // 检查服务是否已过期
            const currentTime = new Date().getTime()
            isServiceExpired = groupExpireTime <= currentTime

            // 如果服务已过期，自动关闭开关
            if (isServiceExpired) {
              switchVal = false
            }
          }

          // 获取最外层的activeStatus，表示声纹识别配置是否开启
          const originalActiveStatus = res.data.activeStatus !== false // 默认为true，只有明确为false时才是未开启
          let activeStatus = originalActiveStatus

          // 如果是购买后的首次进入（携带 autoOpen 标志），且服务未过期，则默认开启
          const isAutoOpen = self.data.isAutoOpen
          if (isAutoOpen && !isServiceExpired) {
            switchVal = true
            activeStatus = true
          }

          self.setData({
            diId: res.data.diId,
            featureList: featureList,
            voiceFeatureNum: res.data.voiceFeatureNum,
            hasNoAppliedVoice: !hasAppliedVoice,
            groupExpireTime: groupExpireTime,
            expireTimeFormatted: expireTimeFormatted,
            isServiceExpired: isServiceExpired,
            switchVal: switchVal,
            activeStatus: activeStatus,
            initialized: true,
          })

          // 在购买入口且原始为关闭时,更新开关开启状态
          if (isAutoOpen && !isServiceExpired && !originalActiveStatus) {
            const activeVpfIds = featureList
              .filter((feature) => feature.activeStatus === true)
              .map((feature) => feature.vpfId)
              .join(",")
            plugin.ai.updateDeviceVoicePrint({
              diId: res.data.diId,
              vpId: self.data.vpId,
              vpfIds: activeVpfIds,
              activeStatus: 1,
              success: () => {},
              fail: () => {},
            })
          }
        } else {
          self.setData({
            isVoicePrintInfoEmpty: true,
            initialized: true,
          })
        }
      },
      fail(res) {},
      complete(res) {
        // 无论成功失败，结束初始化占位
        if (!self.data.initialized) {
          self.setData({ initialized: true })
        }
      },
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.item) {
      const deviceInfo = JSON.parse(decodeURIComponent(options.item))
      this.setData({
        productKey: deviceInfo.productKey,
        deviceKey: deviceInfo.deviceKey,
        endUserId: deviceInfo.uid,
        deviceInfo,
      })
    }
    if (options.associatedIds) {
      const voicePrintId = decodeURIComponent(options.associatedIds)
      this.setData({
        vpId: voicePrintId,
      })
    }
    // 购买后首次进入
    if (options.autoOpen === "true" || options.autoOpen === true) {
      this.setData({
        switchVal: true,
        activeStatus: true,
        isAutoOpen: true,
      })
    } else {
      this.setData({
        isAutoOpen: false,
      })
    }
    this.getDeviceVoicePrintInfo()
    console.log("终端用户ID", this.data.endUserId)
  },

  /**
   * 添加声纹特征，先添加一条记录才能上传的声纹录音
   */
  addvoicePrint() {
    let self = this
    const { vpId, voiceFeatureNum } = self.data
    const num = voiceFeatureNum + 1
    // 若数字小于10则补0，否则直接转换
    const formattedNum = num < 10 ? `0${num}` : `${num}`
    plugin.ai.addFeature({
      vpId: vpId,
      featureName: `声纹${formattedNum}`,
      featureDesc: "",
      success(res) {
        // 成功后获取返回的必要数据
        if (res && res.data) {
          const responseData =
            typeof res.data === "string" ? JSON.parse(res.data) : res.data
          if (responseData.code === 200 && responseData.data) {
            // 设置声纹识别特征ID和状态，供后续uploadFeature使用
            self.setData({
              vpfId: responseData.data.vpfId, // 声纹识别特征ID
              featureStatus: responseData.data.featureStatus, // 声纹征状态
            })
            console.log(
              "声纹特征记录创建成功，vpfId:",
              responseData.data.vpfId,
              "featureStatus:",
              responseData.data.featureStatus,
            )
          } else {
            console.error("创建声纹特征记录失败:", responseData.msg)
            wx.showToast({
              title: responseData.msg,
              icon: "none",
            })
          }
        }
      },
      fail(res) {},
      complete(res) {},
    })
  },

  changeDeviceVoicePrintStatus(e) {
    const { vpId, diId, featureList } = this.data
    const { item } = e.currentTarget.dataset

    if (!item?.vpfId) return

    // 更新当前点击项的状态并获取所有应用中的声纹ID
    const activeVpfIds = featureList
      .map((feature) =>
        feature.vpfId === item.vpfId
          ? { ...feature, activeStatus: !item.activeStatus }
          : feature,
      )
      .filter((feature) => feature.activeStatus)
      .map((feature) => feature.vpfId)
      .join(",")

    plugin.ai.updateDeviceVoicePrint({
      diId,
      vpId,
      vpfIds: activeVpfIds,
      activeStatus: 1,
      success: () => this.getDeviceVoicePrintInfo(),
      fail: () => {},
      complete: () => {},
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  switchChange(e) {
    const { vpId, diId, isServiceExpired } = this.data
    const switchVal = e.detail
    this.stopCurrentAudio()

    // 如果服务已过期且尝试开启开关，显示续费弹窗
    if (isServiceExpired && switchVal) {
      this.setData({
        switchVal: false,
        showExpirePopup: true,
      })
      return
    }

    // 更新开关状态
    this.setData({ switchVal, selectedVoiceId: null })

    // 获取声纹ID列表
    const activeVpfIds = this.getActiveVpfIds()

    // 调用API更新设备声纹识别状态
    plugin.ai.updateDeviceVoicePrint({
      diId,
      vpId,
      vpfIds: activeVpfIds,
      activeStatus: switchVal ? 1 : 0,
      success: () => {
        this.getDeviceVoicePrintInfo()
      },
      fail: () => {
        // 失败时恢复开关状态
        this.setData({ switchVal: !switchVal })
      },
    })
  },

  // 获取当前应用中的声纹ID列表
  getActiveVpfIds() {
    const { featureList } = this.data
    return featureList
      .filter((feature) => feature.activeStatus === true)
      .map((feature) => feature.vpfId)
      .join(",")
  },

  // 点击更多按钮显示popup
  showMoreOptions(e) {
    const { currentTarget } = e
    const { dataset } = currentTarget
    const { item, vpfid } = dataset

    // 使用唯一ID选择器，避免 wx:for 索引与实际节点位置不一致
    const targetId = `#more-btn-${vpfid || (item && item.vpfId)}`

    const query = wx.createSelectorQuery().in(this)
    query.select(targetId).boundingClientRect()
    query.exec((res) => {
      const rect = res && res[0]
      if (rect) {
        this.setData({
          showMorePopup: true,
          popupPosition: {
            left: rect.left - 15,
            top: rect.bottom + 50,
          },
          currentVoiceItem: item,
        })
      }
    })
  },

  // 关闭popup
  closeMorePopup() {
    this.setData({
      showMorePopup: false,
      currentVoiceItem: null,
    })
  },

  // 修改声纹
  editVoice() {
    const currentItem = this.data.currentVoiceItem
    this.setData({
      showEditPopup: true,
      editVoiceName: currentItem ? currentItem.featureName || "" : "",
      showMorePopup: false, // 只关闭更多操作弹窗，不清空currentVoiceItem
    })
  },

  // 删除声纹
  deleteVoice() {
    this.setData({
      showDeletePopup: true,
      showMorePopup: false, // 只关闭更多操作弹窗，不清空currentVoiceItem
    })
  },

  // 关闭编辑弹窗
  closeEditPopup() {
    this.setData({
      showEditPopup: false,
      editVoiceName: "",
      currentVoiceItem: null, // 清空当前操作的声纹项
    })
  },

  // 关闭删除确认弹窗
  closeDeletePopup() {
    this.setData({
      showDeletePopup: false,
      currentVoiceItem: null, // 清空当前操作的声纹项
    })
  },

  // 输入框内容变化
  onEditNameInput(e) {
    this.setData({
      editVoiceName: e.detail.value,
    })
  },

  // 确认修改声纹名称
  confirmEditVoice() {
    const { editVoiceName, currentVoiceItem } = this.data
    if (!editVoiceName.trim()) {
      wx.showToast({
        title: "请输入声纹名称",
        icon: "none",
      })
      return
    }

    if (!currentVoiceItem || !currentVoiceItem.vpfId) {
      this.closeEditPopup()
      return
    }

    plugin.ai.updateFeature({
      vpfId: currentVoiceItem.vpfId,
      featureName: editVoiceName.trim(),
      featureDesc: "",
      success: (res) => {
        wx.showToast({
          title: "修改成功",
          icon: "success",
        })
        this.getDeviceVoicePrintInfo()
        this.closeEditPopup()
      },
      fail: (res) => {
        wx.showToast({
          title: res.errMsg || "修改失败",
          icon: "none",
        })
      },
      complete: (res) => {},
    })
  },

  // 确认删除声纹
  confirmDeleteVoice() {
    const currentItem = this.data.currentVoiceItem
    if (!currentItem || !currentItem.vpfId) {
      return
    }
    plugin.ai.deleteFeature({
      vpfId: currentItem.vpfId,
      success: (res) => {
        this.getDeviceVoicePrintInfo()
        this.closeDeletePopup()
      },
      fail: (res) => {},
      complete: (res) => {
        wx.hideLoading()
      },
    })
  },

  // 关闭服务过期弹窗
  closeExpirePopup() {
    this.setData({
      showExpirePopup: false,
    })
  },

  // 播放声纹录音
  playVoiceAudio(soundUrl, voiceId = null) {
    // 使用公共音频播放工具，保持selectedVoiceId不变（声纹保持选中状态）
    AudioPlayer.playVoiceAudio(soundUrl, voiceId, this, {
      keepSelectedVoiceId: true,
    })
  },

  // 停止当前音频播放
  stopCurrentAudio() {
    // 使用公共音频播放工具，保持selectedVoiceId不变
    AudioPlayer.stopCurrentAudio(this, { keepSelectedVoiceId: true })
  },

  // 点击声纹项播放录音或进行录音上传
  onVoiceItemTap(e) {
    const { item } = e.currentTarget.dataset

    // 如果声纹特征状态为init，弹出录音弹窗进行录音上传
    if (item && item.featureStatus === "init") {
      // 设置当前要上传的声纹特征ID
      this.setData({
        vpfId: item.vpfId,
        featureStatus: item.featureStatus,
      })
      // 打开录音弹窗
      this.openVoicePrintPopup()
      return
    }

    // 原有的播放录音逻辑
    if (item && item.soundUrl) {
      // 如果当前正在播放这个声纹，则停止播放
      if (this.data.playingVoiceId === item.vpfId) {
        this.stopCurrentAudio()
      } else {
        // 否则播放这个声纹的录音，这会自动设置选中状态
        this.playVoiceAudio(item.soundUrl, item.vpfId)
      }
    }
  },

  // 处理返回按钮点击事件
  handleBackTip() {
    // 检查是否开启了声纹识别且没有应用中的声纹
    if (this.data.switchVal && this.data.activeStatus && this.data.hasNoAppliedVoice) {
      this.setData({
        showBackConfirmPopup: true,
      })
    } else {
      // 直接返回
      wx.navigateBack({
        delta: 1,
      })
    }
  },

  // 确认返回
  confirmBack() {
    const self = this
    // 关闭声纹识别服务
    plugin.ai.updateDeviceVoicePrint({
      diId: self.data.diId,
      vpId: self.data.vpId,
      vpfIds: self.data.vpfIds,
      activeStatus: 0, // 设置为关闭状态
      success(res) {
        console.log("关闭声纹识别服务成功", res)
        self.setData({
          showBackConfirmPopup: false,
          activeStatus: false,
          switchVal: false,
        })
        wx.navigateBack({
          delta: 1,
        })
      },
      fail(err) {},
    })
  },

  // 取消返回
  cancelBack() {
    this.setData({
      showBackConfirmPopup: false,
    })
  },

  // 跳转到声纹识别续费页面
  goToVoicePrintBuy() {
    const { deviceInfo } = this.data

    const url = `/panel/toy/module/voice/print/buy/index?item=${encodeURIComponent(
      JSON.stringify(deviceInfo),
    )}&associatedIds=${encodeURIComponent(
      this.data.vpId,
    )}&endUserId=${encodeURIComponent(JSON.stringify(deviceInfo.uid))}&isRenew=true`

    wx.navigateTo({
      url: url,
      success: () => {
        // 关闭弹窗
        this.setData({
          showExpirePopup: false,
        })
      },
      fail: (err) => {},
    })
  },

  delvoicePrint(e) {
    const { item } = e.currentTarget.dataset
    const vpfId = item?.vpfId
    const self = this
    plugin.ai.deleteFeature({
      vpfId,
      success(res) {
        self.getDeviceVoicePrintInfo()
      },
      fail(res) {},
      complete(res) {},
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    this.stopCurrentAudio()
  },

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
