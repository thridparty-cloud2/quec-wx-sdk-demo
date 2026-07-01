const plugin = requirePlugin("quecPlugin");

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    curItem: {
      type: Object,
    },
    argsItem: {
      type: Object,
    },
    role: {
      type: Object,
    },
    url: {
      type: String,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    skin: plugin.main.getSkin(),
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 打开产品说明书
     */
    goBook() {
      wx.showToast({
        title: "正在打开",
        icon: "loading",
        mask: true,
        duration: 120000,
      });
      let deviceInfo = wx.getDeviceInfo();
      let plat = deviceInfo.platform;
      if (plat == "android") {
        let fs = wx.getFileSystemManager();
        wx.downloadFile({
          url: this.properties.url,
          filePath: wx.env.USER_DATA_PATH + `/tem.pdf`,
          success: function (res) {
            fs.rename({
              oldPath: wx.env.USER_DATA_PATH + `/tem.pdf`,
              newPath: wx.env.USER_DATA_PATH + `/产品说明书.pdf`,
              success: function (res) {
                wx.openDocument({
                  filePath: wx.env.USER_DATA_PATH + `/产品说明书.pdf`,
                  success: function (res) {
                    plugin.jsUtil.hideTip();
                  },
                  fail: function (res) {
                    plugin.jsUtil.hideTip();
                  },
                });
              },
              fail: function (res) {
                wx.showToast({
                  title: "文件重命名失败",
                  icon: "none",
                });
              },
            });
          },
          fail: function (res) {
            console.log("fail");
            console.log(res);
          },
        });
      } else {
        wx.downloadFile({
          url: this.properties.url,
          success: function (res) {
            wx.openDocument({
              filePath: res.tempFilePath,
              fileType: "pdf",
              showMenu: true,
              success: function (res) {
                plugin.jsUtil.hideTip();
              },
              fail(err) {
                plugin.jsUtil.hideTip();
              },
            });
          },
        });
      }
    },
  },
});
