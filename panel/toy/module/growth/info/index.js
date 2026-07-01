const plugin = requirePlugin("quecPlugin")

Page({
  data: {
    nickName: "",
    birthday: "",
    gender: 1,
    birYear: 0,
    birMonth: 0,
    birDay: 0,
    birTimeStamp: 0,
    genders: [
      {
        key: 1,
        name: "男孩",
        img: plugin.main.getRootImg() + "ai/new/task/the_boy.png",
      },
      {
        key: 0,
        name: "女孩",
        img: plugin.main.getRootImg() + "ai/new/task/the_girl.png",
      },
    ],

    title: "",

    pickerShow: false,
    isDataComplete: false,
    submitting: false,
    maxDateOfBaby: 0,

    deviceInfo: {},
    babyInfo: {},
    isEdit: false,
  },

  onLoad(options) {
    const isEdit = options.edit !== undefined
    this.setData({ isEdit })

    this.setData({
      title: isEdit ? "编辑宝贝信息" : "添加宝贝信息",
    })

    if (isEdit) {
      const { babyInfo, deviceInfo } = JSON.parse(decodeURIComponent(options.info))

      this.setData({
        nickName: babyInfo.nickname,
        birthday: `${babyInfo.birthdayYear}年${babyInfo.birthdayMonth}月${babyInfo.birthdayDay}日`,
        gender: babyInfo.gender,
        birYear: babyInfo.birthdayYear,
        birMonth: babyInfo.birthdayMonth,
        birDay: babyInfo.birthdayDay,
        birTimeStamp: babyInfo.birthdayTime,
        babyInfo: babyInfo,
        deviceInfo: deviceInfo,
      })
    } else if (options.item) {
      const { productKey, deviceKey, uid } = JSON.parse(decodeURIComponent(options.item))
      this.setData({
        deviceInfo: {
          productKey: productKey,
          deviceKey: deviceKey,
          uid: uid,
        },
      })
    }
    const now = Date.now()
    this.setData({ maxDateOfBaby: now })
    this.checkDataCompleted()
  },

  onChange(e) {
    this.setData({
      nickName: e.detail,
    })

    this.checkDataCompleted()
  },

  onGenderSelect(e) {
    const { gender } = e.currentTarget.dataset
    if (this.data.deviceInfo.shareCode) return
    this.setData({
      gender,
    })
    this.checkDataCompleted()
  },

  openDatePicker() {
    if (this.data.deviceInfo.shareCode) return
    const { birYear, birMonth, birDay } = this.data
    const base =
      birYear && birMonth && birDay ? new Date(birYear, birMonth - 1, birDay) : new Date()
    const pickerYear = base.getFullYear()
    const pickerMonth = base.getMonth() + 1
    const pickerDay = base.getDate()
    this.setData(
      {
        birYear: pickerYear,
        birMonth: pickerMonth,
        birDay: pickerDay,
      },
      () => {
        this.setData({ pickerShow: true })
      },
    )
  },

  onDateChange(e) {
    const { year, month, day, date } = e.detail
    const nowTs = Date.now()
    const selTs = new Date(year, month - 1, day).getTime()
    if (selTs > nowTs) {
      wx.showToast({ title: "日期不能大于今天", icon: "none" })
      return
    }
    this.setData({
      birthday: date,
      birYear: year,
      birMonth: month,
      birDay: day,
      birTimeStamp: selTs,
    })
    this.checkDataCompleted()
  },

  buildGeneralParams() {
    const { birDay, birMonth, birYear, birTimeStamp, gender, nickName } = this.data
    return {
      birthdayDay: birDay,
      birthdayMonth: birMonth,
      birthdayYear: birYear,
      birthdayTime: birTimeStamp,
      gender: gender,
      nickname: nickName,
    }
  },

  submitInfo() {
    if (this.data.submitting) return
    if (this.data.isEdit) {
      this.editInfo()
    } else {
      this.addInfo()
    }
  },

  checkDataCompleted() {
    const { nickName, gender, birthday } = this.data
    const isDataComplete = nickName && gender !== null && birthday
    this.setData({
      isDataComplete,
    })
  },

  addInfo() {
    if (!this.data.isDataComplete) return
    const { deviceInfo } = this.data
    const params = this.buildGeneralParams()
    this.setData({ submitting: true })
    plugin.ai.addBabyInfo({
      productKey: deviceInfo.productKey,
      deviceKey: deviceInfo.deviceKey,
      endUserId: deviceInfo.uid,
      ...params,
      success: (res) => {
        console.log(res)
        wx.showToast({
          title: "添加成功",
          icon: "success",
        })
        this.setData({ submitting: false })
        setTimeout(() => {
          wx.redirectTo({
            url:
              "/panel/toy/module/growth/index/index?item=" +
              encodeURIComponent(JSON.stringify(deviceInfo)),
          })
        }, 500)
      },
      fail: (error) => {
        console.log(error)
        this.setData({ submitting: false })
      },
    })
  },

  editInfo() {
    if (!this.data.isDataComplete) return
    const { babyInfo } = this.data
    const params = this.buildGeneralParams()
    this.setData({ submitting: true })
    plugin.ai.updateBabyInfo({
      ...params,
      id: babyInfo.id,
      success: (res) => {
        console.log(res)
        wx.showToast({
          title: "修改成功",
          icon: "success",
        })
        this.setData({ submitting: false })
        setTimeout(() => {
          const pages = getCurrentPages()
          const prevPage = pages[pages.length - 2]
          if (prevPage && typeof prevPage.getBabyDetailInfo === "function") {
            prevPage.getBabyDetailInfo()
          }
          wx.navigateBack({
            delta: 1,
          })
        }, 500)
      },
      fail: (error) => {
        console.log(error)
        this.setData({ submitting: false })
      },
    })
  },
})
