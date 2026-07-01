const plugin = requirePlugin("quecPlugin");

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    curItem: {
      type: Object,
      value: {},
    },
    visible: {
      type: Boolean,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    deviceName: "",
    curItem: {},
    i18n: "",
    skin: "",
  },

  lifetimes: {
    attached: function () {
      this.setData({
        i18n: plugin.main.getLang(),
        skin: plugin.theme.getSkin(),
      });
    },
    detached: function () {},
  },

  observers: {
    visible: function (visible) {
      if (visible) {
        let self = this;
        if (JSON.stringify(self.data.curItem) !== "{}") {
          self.setData({
            deviceName: self.data.curItem.deviceName,
          });
        }
      }
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 重命名-确定
     */
    confirmRename(e) {
      let self = this;
      if (self.data.deviceName === "") {
        return plugin.jsUtil.tip(self.data.i18n["dnameValid"]);
      }
      wx.nextTick(() => {
        if (self.data.curItem.shareCode) {
          self.shareRename();
        } else {
          self.dmpRename();
        }
      });
    },

    /**
     * 分享设备重命名
     */
    shareRename() {
      let self = this;
      const originName = plugin.jsValid.noEmo(
        plugin.jsValid.trimField(self.data.curItem.deviceName || "")
      );
      const inputName = plugin.jsValid.noEmo(
        plugin.jsValid.trimField(self.data.deviceName || "")
      );
      if (inputName === originName) {
        plugin.jsUtil.tip("请先修改", "none");
        return;
      }
      plugin.quecShare.shareRename({
        shareCode: self.data.curItem.shareCode,
        deviceName: self.data.deviceName,
        success(res) {
          if (res.code === 200) {
            plugin.jsUtil.tip("修改成功", "success");
            plugin.jsUtil.delayCb(() => {
              self.triggerEvent("renameSuccess", true);
            });
          }
        },
        fail(res) {
          plugin.jsUtil.invalidCb(res, self, true);
        },
      });
    },

    /**
     * 设备重命名
     */
    dmpRename() {
      let self = this;
      plugin.quecManage.rename({
        dk: self.data.curItem.deviceKey,
        pk: self.data.curItem.productKey,
        deviceName: self.data.deviceName,
        success(res) {
          if (res.code === 200) {
            plugin.jsUtil.tip("修改成功", "success");
            plugin.jsUtil.delayCb(() => {
              self.triggerEvent("renameSuccess", true);
            });
          }
        },
        fail(res) {
          plugin.jsUtil.invalidCb(res, self, true);
        },
      });
    },

    /**
     * 重命名-取消
     */
    renameCancel() {
      let self = this;
      self.setData({
        deviceName: "",
      });
    },

    /**
     * 关闭重命名弹框
     */
    onClose() {
      this.setData({
        renameVisible: false,
      });
    },

    /**
     * 设备名称change
     */
    dnameChange(e) {
      let self = this;
      let dname = plugin.jsValid.trimField(e.detail);
      dname = plugin.jsValid.noEmo(dname);
      self.setData({
        deviceName: dname,
      });
    },
  },
});
