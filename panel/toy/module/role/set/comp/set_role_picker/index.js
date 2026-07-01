let app = getApp()

Component({
  properties: {
    rolesList: {
      type: Array,
      value: [],
    },
    currentRoleId: {
      type: Number,
      value: 0,
    },
    defaultRoleInfo: {
      type: Object,
      value: {},
    },
    // 由父页面传入的选中角色（用于滑动预览时同步高亮与居中）
    activeRoleId: {
      type: Number,
      value: 0,
    },
    canAddRole: {
      type: Boolean,
      value: true,
    },
  },

  data: {
    selectedRoleId: 0,
    processRolesList: [],
    customRolesCount: 0,
    env: app.globalData.envData,
    // 用于控制横向滚动位置
    scrollLeft: 0,
  },

  lifetimes: {
    attached: function () {
      this.setData({
        selectedRoleId: this.properties.currentRoleId,
      })
      this.updateProcessRolesList()
      // 列表渲染后自动居中当前角色
      this.centerAfterRender()
    },
  },

  observers: {
    currentRoleId: function (newVal, oldVal) {
      if (newVal !== oldVal) {
        this.setData({
          selectedRoleId: newVal,
        })
        // 选中角色变化时自动居中
        this.centerAfterRender()
      }
    },
    "rolesList, defaultRoleInfo": function (rolesList, defaultRoleInfo) {
      this.updateProcessRolesList()
      if (
        rolesList.length === 0 &&
        this.data.selectedRoleId === 0 &&
        defaultRoleInfo.roleId
      ) {
        this.setData({
          selectedRoleId: defaultRoleInfo.roleId,
        })
      }
      // 数据源变化时尝试自动居中
      this.centerAfterRender()
    },
    // 父页面通过 activeRoleId 控制本组件的高亮与居中
    activeRoleId: function (newVal) {
      if (!newVal) return
      if (this.data.selectedRoleId !== newVal) {
        this.setData({ selectedRoleId: newVal })
        this.centerAfterRender()
      }
    },
  },

  methods: {
    updateProcessRolesList() {
      const { rolesList, defaultRoleInfo } = this.properties
      let displayList = []

      if (rolesList.length !== 0) {
        displayList = rolesList
      } else if (defaultRoleInfo && defaultRoleInfo.roleId) {
        displayList = [defaultRoleInfo]
      }

      this.setData({
        processRolesList: displayList,
        customRolesCount: displayList.filter((r) => r.roleType === "device").length,
      })
    },

    // 选择角色后也自动居中
    selectRole(e) {
      if (this.properties.rolesList.length === 0) {
        return
      }

      const { roleId, roleType } = e.currentTarget.dataset
      const normalizedRoleId = Number(roleId)
      const nextRoleId = Number.isNaN(normalizedRoleId) ? roleId : normalizedRoleId
      this.setData({
        selectedRoleId: nextRoleId,
      })
      // 居中滚动
      this.centerAfterRender()

      this.triggerEvent("roleSelected", {
        roleId: nextRoleId,
        roleType: roleType,
      })
    },

    toAddRole() {
      if (this.properties.rolesList.length !== 0) {
        this.triggerEvent("toAddRole")
      }
    },

    // 内部方法：等下一帧（渲染完成）后再计算并设置滚动位置
    centerAfterRender() {
      wx.nextTick(() => {
        this.centerSelectedRole()
      })
    },

    // 计算并将选中项滚动到中间
    centerSelectedRole() {
      const selectedId = this.data.selectedRoleId
      if (!selectedId) return

      const query = wx.createSelectorQuery().in(this)
      query.select("#rolePickerScroll").boundingClientRect()
      query.select("#rolePickerScroll").scrollOffset()
      query.select(`#role-${selectedId}`).boundingClientRect()
      query.exec((res) => {
        const containerRect = res && res[0]
        const containerOffset = res && res[1]
        const itemRect = res && res[2]
        if (!containerRect || !itemRect || !containerOffset) return

        const currentScrollLeft = containerOffset.scrollLeft || 0
        const itemLeftRelativeToContainer = itemRect.left - containerRect.left
        const targetLeft =
          currentScrollLeft +
          itemLeftRelativeToContainer -
          (containerRect.width - itemRect.width) / 2

        const newScrollLeft = Math.max(0, Math.round(targetLeft))
        if (newScrollLeft !== this.data.scrollLeft) {
          this.setData({ scrollLeft: newScrollLeft })
        }
      })
    },

    onScroll(e) {
      // 记录当前滚动位置，便于后续计算更准确
      const sl = (e && e.detail && e.detail.scrollLeft) || 0
      this.data.scrollLeft = sl
    },
  },
})
