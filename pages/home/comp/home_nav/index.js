const plugin = requirePlugin("quecPlugin");

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: "",
    },
    page: {
      type: String,
      value: "home",
    },
    navRefresh: {
      type: Boolean,
      value: false,
    },
    mode: {
      type: Boolean,
      value: undefined,
    },
    model: {
      type: Object,
      value: {},
    },
    commonFinish: {
      type: Boolean,
      value: false,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    title: "",
    page: "home",
    baseImgUrl: plugin.main.getExampleUrl(),
    familyShow: false,
    familyCheck: false,
    joinVisible: false,
    familyList: [],
    inviteList: [],
    curFamily: {},
    pager: {
      page: 1,
      pageSize: 50,
      total: 0,
    },
    scrollHeight: 100,
    itemHeight: 52,
    joinItem: {},
    locFamily: {}, //保存根据当前位置查询的家庭信息

    i18n: "",
    skin: "",
    saveTop: 0,
    hasDataList: true,
    triggered: false,
    navRefresh: false,
    uid: "",
  },

  lifetimes: {
    ready: function () {
      let self = this;
      self.setData({
        i18n: plugin.main.getLang(),
        skin: plugin.main.getSkin(),
        saveTop: wx.getWindowInfo().safeArea.top ? wx.getWindowInfo().safeArea.top : 50,
      });
    },
    detached: function () {
      this.setData({
        navRefresh: false,
      });
    },
  },

  observers: {
    "navRefresh,mode": function (navRefresh, mode) {
      let self = this;
      if (navRefresh) {
        if (this.properties.page === "home") {
          if (mode) {
            self.getUInfo();
          } else {
            plugin.config.clearStorageByKey("family");
            plugin.config.clearStorageByKey("activefrid");
          }
        }
      }
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 获取当前用户信息
     */
    getUInfo() {
      let self = this;
      plugin.quecUser.getUInfo({
        success(res) {
          self.setData({
            uid: res.data.uid,
          });
          self.refreshList();
        },
        fail(res) {},
        complete() {},
      });
    },
    /**
     * 返回
     */
    back() {
      this.triggerEvent("Back", true);
    },
    /**
     * 获取家庭列表
     */
    getFamily() {
      const self = this;
      plugin.quecHouse.getFamilyList({
        page: self.data.pager.page,
        pageSize: self.data.pager.pageSize,
        success(res) {
          if (res.data.list.length > 0) {
            let fmList = res.data.list;
            for (const flm of fmList) {
              flm.vJoin = false;
            }
            self.fmtData(fmList, res);
          }
        },
        fail(res) {
          self.setData({
            familyList: [],
            hasDataList: false,
          });
        },
        complete(res) {
          self.setData({
            triggered: false,
          });
        },
      });
    },

    /**
     * 查询被邀请的列表
     */
    getInviteList() {
      let self = this;
      plugin.quecHouse.getFamilyInviteList({
        page: self.data.pager.page,
        pageSize: self.data.pager.pageSize,
        success(res) {
          let fList = self.data.familyList;
          if (res.data.list.length > 0) {
            let inviteList = res.data.list;
            for (const ilm of inviteList) {
              ilm.vJoin = true;
            }
            fList = fList.concat(inviteList);
          }
          let scrollHeight = self.data.itemHeight * fList.length;
          self.setData({
            familyList: fList,
            scrollHeight,
          });
        },
      });
    },

    /**
     * 家庭列表数据
     */
    fmtData(listData, res) {
      let self = this;
      let loc = self.data.locFamily;
      let uid = self.data.uid;
      let curData = {};
      if (plugin.config.getStorageByKey("family")) {
        let sData = JSON.parse(plugin.config.getStorageByKey("family"));
        let lData = listData.filter((m) => {
          return m.fid == sData.fid && uid == sData.uid;
        });
        if (lData.length > 0) {
          if (lData[0].memberRole == sData.memberRole) {
            curData = sData;
          } else {
            plugin.config.setStorage("family", lData[0]);
            curData = JSON.parse(plugin.config.getStorageByKey("family"));
          }
        } else {
          plugin.config.clearStorageByKey("family");
          curData = listData[0];
        }
      } else {
        let locData = listData.filter((m) => {
          return m.fid == loc.fid;
        });
        if (locData.length > 0) {
          curData = loc;
        } else {
          curData = listData[0];
        }
      }

      self.setData({
        familyList: self.data.familyList.concat(listData),
        "pager.total": res.data.total,
        hasDataList: res.data.total > 0,
      });
      curData.uid = self.data.uid;
      let scrollHeight = self.data.itemHeight * self.data.familyList.length;
      self.setData({
        curFamily: curData,
        scrollHeight,
      });

      if (!plugin.config.getStorageByKey("family")) {
        plugin.config.setStorage("family", self.data.curFamily);
      }

      wx.nextTick(() => {
        self.getInviteList();
        self.triggerEvent(
          "curFamly",
          JSON.parse(plugin.config.getStorageByKey("family"))
        );
      });
    },

    /**
     * 家居模式下显示家庭列表
     */
    showFamily() {
      let self = this;
      wx.nextTick(() => {
        self.setData({
          familyShow: true,
        });
      });
    },
    /**
     * 家居模式下隐藏家庭列表
     */
    hideFamily() {
      this.setData({
        familyShow: false,
      });
    },
    /**
     * 家庭管理
     */
    goFamilyList() {
      this.hideFamily();
      this.triggerEvent("familyList", true);
    },
    /**
     * 选中家庭
     */
    check(e) {
      let item = e.currentTarget.dataset.item;
      item.uid = this.data.uid;
      this.setData({
        curFamily: item,
        familyShow: false,
      });
      plugin.config.setStorage("family", this.data.curFamily);
      plugin.config.clearStorageByKey("activefrid");
      this.triggerEvent("curFamly", JSON.parse(plugin.config.getStorageByKey("family")));
    },
    /**
     * 待加入
     */
    join(e) {
      let item = e.currentTarget.dataset.join;
      this.setData({
        joinVisible: true,
        joinItem: item,
        familyShow: false,
      });
    },
    /**
     * 关闭待加入弹框
     */
    joinCancel() {
      let fid = this.data.joinItem.fid;
      this.inviteHandle(fid, 0);
    },
    /**
     * 确定加入
     */
    joinConfirm() {
      let fid = this.data.joinItem.fid;
      this.inviteHandle(fid, 1);
    },
    /**
     * 邀请的处理
     */
    inviteHandle(fid, decide) {
      let self = this;
      /**decide：0-拒绝邀请 1-同意邀请 */
      plugin.quecHouse.familyMemberInviteHandle({
        fid,
        decide,
        success(res) {
          self.refreshList();
          self.setData({
            familyShow: false,
          });
        },
        fail(res) {},
      });
    },

    /**
     * 开始搜索
     */
    StartSearch(e) {
      this.triggerEvent("StartSearch", e.detail);
    },

    /**
     * 清空搜索
     */
    ClearSearch(e) {
      this.triggerEvent("ClearSearch", true);
    },

    // 刷新列表
    refreshList() {
      let self = this;
      let page = `pager.page`;
      self.setData({
        [page]: 1,
        familyList: [],
      });
      self.getFamily();
    },

    // 加载更多
    getMoreList() {
      let self = this;
      if (self.data.familyList.length >= self.data.pager.total) return;
      let page = `pager.page`;
      self.setData({
        [page]: !self.data.hasDataList ? 1 : self.data.pager.page + 1,
      });
      self.getFamily();
    },
  },
});
