const plugin = requirePlugin("quecPlugin");
const { getAllRolesList } = require("../../../api/roles");

const HISTROY_PAGE_SIZE = 10;

Page({
  data: {
    productKey: "",
    deviceKey: "",
    deviceInfo: {},
    curRoleId: 0,
    roleIds: [],

    rolesList: [], // 角色列表
    selectedRole: "", // 选中的角色名称
    selectedRoleId: "", // 选中的角色ID
    selectedSupplierId: "", // 选中的供应商ID

    reLastId: "",
    isRefreshing: false,
    isLoadingMoreMsg: false,
    firstMsgIdBeforeLoad: null, // 加载前第一条消息ID
    canLoadMore: true, // 是否可以继续加载更多
    initialLoading: false,
    showDelBtn: false,

    chatData: {
      selectedPicUrl: "", // 选中的角色头像URL
      chatMsgList: [], // 聊天记录列表
    },
  },

  onLoad(options) {
    if (options.item) {
      const deviceInfo = JSON.parse(decodeURIComponent(options.item));
      this.setData({
        productKey: deviceInfo.productKey,
        deviceKey: deviceInfo.deviceKey,
        showDelBtn: !deviceInfo.shareCode,
        deviceInfo: deviceInfo,
      });
      console.log("deviceInfo:", deviceInfo);
    }
    if (options.role) {
      const role = JSON.parse(decodeURIComponent(options.role));
      this.setData({
        curRoleId: role.roleId,
      });
    }
    this.getAllRoles();
  },

  // 角色切换事件
  onRoleSwitchSelect(event) {
    const selRoleInfo = event.detail;
    console.log("当前切换的角色id", selRoleInfo.roleId);

    this.setData({
      selectedRole: selRoleInfo.selectedName,
      selectedRoleId: selRoleInfo.roleId,
      selectedSupplierId: selRoleInfo.supplier,
      chatData: {
        selectedPicUrl: selRoleInfo.rolePicUrl,
        chatMsgList: selRoleInfo.chatMsgList, // 立即清空聊天记录，避免显示旧内容
      },
      initialLoading: selRoleInfo.supplier === "coze",
    });
    if (this.data.selectedSupplierId === "coze" && this.data.selectedRoleId) {
      this.getCozeAiChatHistory();
    }
  },

  // 聊天记录删除事件
  onDeleteConfirm(event) {
    const { type } = event.detail;
    this.generalDelChatHistoryApiCall(type);
  },

  // 刷新事件
  onRefresh(event) {
    if (this.data.selectedSupplierId === "coze") {
      this.refreshCozeHistory();
    }
  },

  // 加载更多事件
  onLoadMore(event) {
    if (this.data.selectedSupplierId === "coze") {
      const firstMsgId =
        this.data.chatData.chatMsgList.length > 0
          ? this.data.chatData.chatMsgList[0].thirdId
          : null;
      this.setData({
        isLoadingMoreMsg: true,
        firstMsgIdBeforeLoad: firstMsgId,
      });
      this.loadCozeHistory();
    }
  },

  getAllRoles() {
    const { deviceKey, productKey } = this.data;
    getAllRolesList(deviceKey, productKey)
      .then((rolesList) => {
        this.setData({
          rolesList: rolesList || [],
        });
        const roleIds = rolesList.map((role) => role.roleId);
        this.setData({
          roleIds: roleIds,
        });
      })
      .catch((error) => {
        console.error(error);
      });
  },

  // 获取Coze聊天记录
  getCozeAiChatHistory() {
    this.setData({
      canLoadMore: true,
      initialLoading: true,
    });
    this.generalGetCozeHistoryApiCall(false);
  },

  // 刷新Coze聊天记录
  refreshCozeHistory() {
    console.log("触发了刷新");

    this.setData({
      isRefreshing: true,
      canLoadMore: true,
    });
    wx.showToast({
      title: "刷新中...",
      icon: "loading",
      duration: 5000,
    });
    this.generalGetCozeHistoryApiCall(false);
  },

  // 加载更多Coze聊天记录
  loadCozeHistory() {
    if (!this.data.canLoadMore) {
      setTimeout(() => {
        this.setData({
          isLoadingMoreMsg: false,
        });
      }, 500);
      return;
    }
    this.generalGetCozeHistoryApiCall(true);
  },

  generalGetCozeHistoryApiCall(isLoadMore = false) {
    const isRefreshing = this.data.isRefreshing;
    const { deviceKey, productKey, selectedRoleId, reLastId, deviceInfo } =
      this.data;

    const cozeParams = {
      deviceKey: deviceKey,
      productKey: productKey,
      endUserId: deviceInfo.shareCode ? deviceInfo.ownerUid : deviceInfo.uid,
      roleId: selectedRoleId,
      status: 0,
      afterId: isLoadMore && !isRefreshing ? reLastId : "",
      limit: HISTROY_PAGE_SIZE,
      supplier: "coze", // 默认供应商coze 待迭代
    };

    plugin.ai.deviceMessageV2({
      ...cozeParams,
      success: (res) => {
        console.log("CozeHistory:", res);
        if (res?.data?.messageList) {
          this.setData({
            reLastId: res.data.lastId || "",
          });
          const reversedChatList = res.data.messageList.reverse();

          // 检查是否有重复消息
          let hasNewMessages = true;
          if (isLoadMore && this.data.chatData.chatMsgList.length > 0) {
            const existingIds = new Set(
              this.data.chatData.chatMsgList.map((msg) => msg.thirdId),
            );
            const newMessages = reversedChatList.filter(
              (msg) => !existingIds.has(msg.thirdId),
            );
            if (newMessages.length === 0) {
              hasNewMessages = false;
              this.setData({
                canLoadMore: false,
              });
              console.log("检测到重复消息，已到达最后一页");
              return;
            }
            const chatMsgList = [
              ...newMessages,
              ...this.data.chatData.chatMsgList,
            ];
            if (newMessages.length < HISTROY_PAGE_SIZE) {
              this.setData({
                canLoadMore: false,
              });
            }
            this.setData({
              chatData: {
                selectedPicUrl: this.data.chatData.selectedPicUrl,
                chatMsgList: chatMsgList,
              },
            });
          } else {
            const chatMsgList = isLoadMore
              ? [...reversedChatList, ...this.data.chatData.chatMsgList]
              : reversedChatList;
            if (isLoadMore && res.data.messageList.length < HISTROY_PAGE_SIZE) {
              this.setData({
                canLoadMore: false,
              });
            }
            this.setData({
              chatData: {
                selectedPicUrl: this.data.chatData.selectedPicUrl,
                chatMsgList: chatMsgList,
              },
            });
          }
        }
      },
      fail: (error) => {
        console.error(error);
      },
      complete: () => {
        if (isLoadMore) {
          this.setData({
            isLoadingMoreMsg: false,
          });
        }
        if (isRefreshing) {
          this.setData({
            isRefreshing: false,
          });
          wx.showToast({
            icon: "success",
            duration: 1500,
          });
        }
        if (!isLoadMore && !isRefreshing) {
          this.setData({
            initialLoading: false,
          });
        }
      },
    });
  },

  generalDelChatHistoryApiCall(type) {
    const { deviceKey, productKey, roleIds, selectedRoleId, deviceInfo } =
      this.data;
    const delParams = {
      deviceKey: deviceKey,
      productKey: productKey,
      roleIds: type === "current" ? [parseInt(selectedRoleId)] : roleIds,
      endUserId: deviceInfo.uid,
    };
    plugin.ai.deleteHistoryV2({
      ...delParams,
      success: (res) => {
        console.log(res);
        this.getCozeAiChatHistory();
      },
      fail: (error) => {
        console.error(error);
      },
      complete: () => {
        wx.showToast({
          title: "删除成功",
          icon: "success",
          duration: 1500,
        });
      },
    });
  },
});
