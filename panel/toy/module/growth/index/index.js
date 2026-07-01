const plugin = requirePlugin("quecPlugin")

const TASK_STATUS_LIST = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETE: "complete",
  DELETED: "deleted",
  UNKNOWN: "unknown",
}

const TASK_STATUS_MAP = {
  pending: "未开始",
  in_progress: "进行中",
  complete: "已结束",
  deleted: "已删除",
  unknown: "未知状态",
}

const NAV_PARAM_MAP = {
  editTask: (ctx, e) => {
    const editData = e.detail || {}
    const status =
      (e.detail && e.detail.status) ||
      (e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.status)
    const isComplete = status === TASK_STATUS_LIST.COMPLETE
    const isDeleted = status === TASK_STATUS_LIST.DELETED
    if (isComplete || isDeleted) {
      wx.showToast({
        title: `已${isComplete ? "结束" : "删除"}任务不可编辑`,
        icon: "none",
      })
      return null
    }
    return { editData }
  },
  editInfo: (ctx) => ({ babyInfo: ctx.data.babyInfo, deviceInfo: ctx.data.deviceInfo }),
  addTask: (ctx) => ({
    babyInfo: ctx.data.babyInfo,
    occupiedIds: ctx.getOccupiedGrowthTask(),
  }),
  weekStat: (ctx) => ({ babyInfo: ctx.data.babyInfo }),
  targetStat: (ctx, e) => ({
    task:
      (e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.task) ||
      (e.detail && e.detail.task),
  }),
}

const NAV_ROUTE_MAP = {
  editTask: {
    path: "/panel/toy/module/growth/target/edit/index",
    query: (data) =>
      "editData=" +
      encodeURIComponent(JSON.stringify(data.editData || {})) +
      "&deviceInfo=" +
      encodeURIComponent(JSON.stringify(data.deviceInfo || {})),
  },
  editInfo: {
    path: "/panel/toy/module/growth/info/index",
    query: (data) =>
      "edit&info=" +
      encodeURIComponent(
        JSON.stringify({ babyInfo: data.babyInfo, deviceInfo: data.deviceInfo }),
      ),
  },
  addTask: {
    path: "/panel/toy/module/growth/target/select/index",
    query: (data) =>
      "info=" +
      encodeURIComponent(JSON.stringify(data.babyInfo)) +
      "&occupiedIds=" +
      encodeURIComponent(data.occupiedIds || "") +
      "&deviceInfo=" +
      encodeURIComponent(JSON.stringify(data.deviceInfo || {})),
  },
  weekStat: {
    path: "/panel/toy/module/growth/statistics/week/index",
    query: (data) =>
      "info=" +
      encodeURIComponent(JSON.stringify(data.babyInfo)) +
      "&deviceInfo=" +
      encodeURIComponent(JSON.stringify(data.deviceInfo || {})),
  },
  targetStat: {
    path: "/panel/toy/module/growth/statistics/target/index",
    query: (data) =>
      "babyTask=" +
      encodeURIComponent(JSON.stringify(data.task || {})) +
      "&deviceInfo=" +
      encodeURIComponent(JSON.stringify(data.deviceInfo || {})),
  },
}

Page({
  data: {
    gradientHeight: 20,

    emptyImg: plugin.main.getRootImg() + "example/images/ic_empty.png",
    addBtnIcon: plugin.main.getRootImg() + "ai/new/task/add_task.png",

    showNoData: false,
    addBtnShow: false,
    showDialog: false,

    deviceInfo: {},
    babyInfo: {},

    babyTaskList: [],
    normalTaskList: [],

    delCacheId: null,
    deletedTaskGroup: null,
    delPageNum: 1,
    delHasMore: true,
    isDelLoading: false,
    reachLimit: false,
  },

  onLoad(options) {
    const payload = options.item
    if (payload) {
      const { productKey, deviceKey, uid, shareCode, ownerUid } = JSON.parse(
        decodeURIComponent(payload),
      )
      this.setData({
        deviceInfo: {
          productKey,
          deviceKey,
          uid,
          shareCode,
          ownerUid,
        },
      })
      if (this.data.deviceInfo) {
        this.getBabyDetailInfo()
      }
    }
  },

  onScrollToLower() {
    if (this.data.delHasMore && !this.data.isDelLoading) {
      this.getDelBabyTaskList(true)
    }
  },

  onTabExpand(e) {
    const index = e.currentTarget.dataset.index
    const { normalTaskList, deletedTaskGroup } = this.data

    if (index < normalTaskList.length) {
      const list = normalTaskList.slice()
      list[index].expanded = !list[index].expanded
      this.setData({ normalTaskList: list })
    } else if (deletedTaskGroup && index === normalTaskList.length) {
      const group = { ...deletedTaskGroup, expanded: !deletedTaskGroup.expanded }
      this.setData({ deletedTaskGroup: group })
    }
    this.buildFinalBabyTaskList()
  },

  buildFinalBabyTaskList() {
    const { normalTaskList, deletedTaskGroup, reachLimit } = this.data
    const list = [...normalTaskList]
    if (deletedTaskGroup) {
      list.push(deletedTaskGroup)
    }
    const showNoData = list.length === 0
    this.setData({
      babyTaskList: list,
      showNoData,
      addBtnShow: !showNoData && !reachLimit,
    })
  },

  getBabyDetailInfo() {
    const { deviceInfo } = this.data

    plugin.ai.getBabyInfo({
      deviceKey: deviceInfo.deviceKey,
      endUserId: deviceInfo.shareCode ? deviceInfo.ownerUid : deviceInfo.uid,
      productKey: deviceInfo.productKey,
      success: (res) => {
        res?.data &&
          this.setData({ babyInfo: res.data }, () => {
            if (this.data.babyInfo?.id) {
              this.getNormalTasksList()
              this.getDelBabyTaskList()
            }
          })
      },
      fail: (error) => {
        console.log(error)
      },
    })
  },

  getNormalTasksList() {
    const { babyInfo } = this.data
    const babyId = babyInfo.id || 0

    plugin.ai.babyTaskList({
      babyId,
      success: (res) => {
        const raw = Array.isArray(res?.data) ? res.data : []
        const normalTaskList = raw
          .filter((x) => Array.isArray(x.babyTaskList) && x.babyTaskList.length > 0)
          .map((item) => ({
            ...item,
            statusName: TASK_STATUS_MAP[item.status] || TASK_STATUS_MAP.unknown,
            count: item.babyTaskList.length,
            expanded: true,
          }))
        const totals = raw.reduce(
          (acc, item) => {
            if (!item) return acc
            const n = (item.babyTaskList || []).length
            if (item.status === TASK_STATUS_LIST.PENDING) {
              acc.pending += n
              acc.active += n
            } else if (item.status === TASK_STATUS_LIST.IN_PROGRESS) {
              acc.inProgress += n
              acc.active += n
            }
            return acc
          },
          { active: 0, pending: 0, inProgress: 0 },
        )
        const activeCount = totals.active
        const pendingCount = totals.pending
        const inProgressCount = totals.inProgress
        const reachLimit =
          activeCount >= 10 || pendingCount >= 10 || inProgressCount >= 10
        this.setData({
          normalTaskList,
          reachLimit,
        })
        this.buildFinalBabyTaskList()
      },
      fail: (error) => {
        console.log(error)
      },
    })
  },

  getDelBabyTaskList(isLoadMore = false) {
    if (this.data.isDelLoading) return
    if (isLoadMore) {
      wx.showLoading({ title: "加载中" })
    }
    this.setData({ isDelLoading: true })
    const { babyInfo, delPageNum } = this.data
    const babyId = babyInfo.id || 0
    const pageNum = isLoadMore ? delPageNum + 1 : 1
    const pageSize = 10

    plugin.ai.listDeleteBabyTask({
      babyId,
      pageNum,
      pageSize,
      success: (res) => {
        if (isLoadMore) {
          wx.hideLoading()
        }
        const rows = Array.isArray(res?.rows) ? res.rows : []
        const total = res?.total || 0
        let newGroup = this.data.deletedTaskGroup
        if (!isLoadMore || !newGroup) {
          newGroup =
            rows.length > 0
              ? {
                  status: TASK_STATUS_LIST.DELETED,
                  statusName: TASK_STATUS_MAP[TASK_STATUS_LIST.DELETED],
                  count: total,
                  expanded: true,
                  babyTaskList: rows,
                }
              : null
        } else if (rows.length > 0) {
          newGroup = {
            ...newGroup,
            count: total,
            babyTaskList: [...newGroup.babyTaskList, ...rows],
          }
        }
        const currentCount = newGroup ? newGroup.babyTaskList.length : 0
        const hasMore = currentCount < total
        this.setData({
          deletedTaskGroup: newGroup,
          delPageNum: pageNum,
          delHasMore: hasMore,
          isDelLoading: false,
        })
        this.buildFinalBabyTaskList()
      },
      fail: (error) => {
        console.log(error)
        this.setData({ isDelLoading: false })
      },
    })
  },

  getOccupiedGrowthTask() {
    const list = this.data.babyTaskList || []
    const ids = new Set(
      list
        .filter(
          (item) =>
            item &&
            (item.status === TASK_STATUS_LIST.IN_PROGRESS ||
              item.status === TASK_STATUS_LIST.PENDING),
        )
        .reduce((acc, item) => {
          ;(item.babyTaskList || []).forEach((t) => {
            const gid = t && t.growthTaskId
            if (gid !== undefined && gid !== null) acc.push(String(gid))
          })
          return acc
        }, []),
    )
    return Array.from(ids).join(",")
  },

  secondConfirmDelete(e) {
    const id = e.detail.growthTaskId || null
    const status = e.detail.status || undefined
    if (status === TASK_STATUS_LIST.DELETED) {
      wx.showToast({ title: "不可删除", icon: "none" })
      return
    }
    this.setData({
      delCacheId: id,
      showDialog: true,
    })
  },

  onDialogConfirm() {
    const { delCacheId } = this.data
    if (!delCacheId) return
    this.deleteTask(delCacheId)
  },

  deleteTask(id) {
    const babyTaskId = id
    if (babyTaskId === undefined || babyTaskId === null) return

    plugin.ai.deleteBabyTask({
      babyTaskId,
      success: (res) => {
        if (res?.code === 200) {
          Promise.all([this.getNormalTasksList(), this.getDelBabyTaskList()]).then(() => {
            this.setData({ showDialog: false, delCacheId: null })
            wx.showToast({ title: "删除成功", icon: "success" })
          })
        }
      },
      fail: (error) => {
        console.log(error)
      },
    })
  },

  onDialogCancel() {
    this.setData({ showDialog: false, delCacheId: null })
  },

  onLinkIconRoute(e) {
    const type = e.detail.type
    this.generalRouteTo({
      currentTarget: {
        dataset: { type },
      },
    })
  },

  buildNavUrl(type, params) {
    const conf = NAV_ROUTE_MAP[type]
    if (!conf) return ""
    const q = conf.query(params || {})
    return conf.path + (q ? "?" + q : "")
  },

  go(type, params) {
    const url = this.buildNavUrl(type, params)
    if (!url) return
    wx.navigateTo({ url })
  },

  generalRouteTo(e) {
    const type =
      (e.detail && e.detail.type) ||
      (e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.type)
    if (!type) return
    const builder = NAV_PARAM_MAP[type]
    if (!builder) return
    const params = builder(this, e)
    if (!params) return
    this.go(type, params)
  },
})
