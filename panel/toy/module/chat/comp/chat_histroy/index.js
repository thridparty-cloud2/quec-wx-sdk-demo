const plugin = requirePlugin("quecPlugin");

Component({
  properties: {
    isRefreshing: {
      type: Boolean,
      value: false,
    },
    isLoadingMoreMsg: {
      type: Boolean,
      value: false,
    },
    initialLoading: {
      type: Boolean,
      value: false,
      observer: "onInitialLoadingChange",
    },
    chatData: {
      type: Object,
      value: {
        selectedPicUrl: "",
        chatMsgList: [],
      },
      observer: "onChatDataChange",
    },
    firstMsgIdBeforeLoad: {
      type: String,
      value: null,
    },
  },

  data: {
    emptyImg: plugin.main.getRootImg() + "example/images/ic_empty.png",
    scrollTop: 0, // 滚动位置
    scrollIntoView: "", // 滚动到指定元素
    scrollHeight: 0, // 内容高度
    contentHeight: 0, // 容器高度
    touchStartY: 0, // 触摸开始位置
    touchMoveY: 0, // 触摸移动距离
    isAtBottom: false, // 是否底部
    pullDistance: 0, // 下拉距离
    refreshThreshold: 80, // 上拉刷新阈值
    lastTimeScrollTop: undefined, // 记录上次滚动位置
    isScrollableTip: false, // tip是否可滚动
    scrollThrottleTimer: null, // 滚动节流定时器
    scrollReady: false, // 滚动是否完成
    showNoData: false, // 是否显示暂无数据
    showSkeleton: true, // 是否显示骨架屏
    scrollIntoOffset: 0, // 滚动到指定元素偏移量
    noDataTimer: null,
    renderChatList: [],
    mp3IconUrl:
      "https://quec-pro-oss.oss-cn-shanghai.aliyuncs.com/common/icon/mp3.png",
    parsedCache: {},
  },

  methods: {
    getList(val) {
      const list = val && val.chatMsgList ? val.chatMsgList : [];
      return Array.isArray(list) ? list : [];
    },

    hasListData(list) {
      return Array.isArray(list) && list.length > 0;
    },

    clearNoDataTimer() {
      if (this.data.noDataTimer) {
        clearTimeout(this.data.noDataTimer);
        this.setData({ noDataTimer: null });
      }
    },

    setVisualState(state) {
      this.setData(state);
    },

    isEmptyChat() {
      const d = this.properties.chatData;
      return d && d.chatMsgList && d.chatMsgList.length === 0;
    },

    scheduleEmptyState() {
      if (this.properties.initialLoading) return;
      const timer = setTimeout(() => {
        const stillEmpty = this.isEmptyChat();
        if (
          stillEmpty &&
          !this.properties.isRefreshing &&
          !this.properties.isLoadingMoreMsg &&
          !this.properties.initialLoading
        ) {
          this.setVisualState({
            scrollReady: true,
            showSkeleton: false,
            showNoData: true,
            // 空列表不可滚动，scrolltolower 永远不会触发，
            // 这里手动把 isAtBottom 置为 true，否则用户在 noData 状态下
            // 底部上拉刷新会被 screenTouchStart 直接拦掉。
            isAtBottom: true,
          });
        }
        this.setData({ noDataTimer: null });
      }, 300);
      this.setData({ noDataTimer: timer });
    },

    parseMusicPlayInstructMsg(raw) {
      if (typeof raw !== "string") return null;
      let s = raw.trim();
      if (s.startsWith("(") && s.endsWith(")")) s = s.slice(1, -1).trim();
      try {
        const obj = JSON.parse(s);
        if (
          obj &&
          typeof obj === "object" &&
          typeof obj.app === "string" &&
          typeof obj.input === "string"
        ) {
          return { text: obj.input };
        }
      } catch (e) {}
      return null;
    },

    mapRenderFields(list) {
      const cache = this.data.parsedCache || {};
      return (list || []).map((item) => {
        const key = item.thirdId || item.id || item._id || item.content;
        let parsed = cache[key];
        if (parsed === undefined) {
          const res = this.parseMusicPlayInstructMsg(item.content);
          parsed = res
            ? { isMusicPlayMsg: true, musicPlayText: res.text }
            : { isMusicPlayMsg: false, musicPlayText: "" };
          cache[key] = parsed;
        }
        return { ...item, ...parsed };
      });
    },

    computeRestoreOffsetAndScroll(list) {
      const query = this.createSelectorQuery();
      const firstMsgId = list[0]?.thirdId;
      const secondMsgId = list[1]?.thirdId;
      if (firstMsgId && secondMsgId) {
        query.select(`#msg-${firstMsgId}`).boundingClientRect();
        query.select(`#msg-${secondMsgId}`).boundingClientRect();
        query.exec((res) => {
          if (res[0] && res[1]) {
            const firstCenter = res[0].top + res[0].height / 2;
            const secondCenter = res[1].top + res[1].height / 2;
            const distance = Math.abs(secondCenter - firstCenter);
            this.setData({ scrollIntoOffset: -distance });
            this.scrollToMessage(this.properties.firstMsgIdBeforeLoad);
          }
        });
      } else {
        query
          .select(`#msg-${this.properties.firstMsgIdBeforeLoad}`)
          .boundingClientRect();
        query.exec((res) => {
          if (res[0]) {
            this.scrollToMessage(this.properties.firstMsgIdBeforeLoad);
          }
        });
      }
    },
    isLoadingLocked() {
      return (
        this.properties.isLoadingMoreMsg === true || this.data.pullDistance > 0
      );
    },
    // 监听消息数据变化
    onChatDataChange(newVal, oldVal) {
      const isLoadingMore = this.properties.isLoadingMoreMsg === true;
      const list = this.getList(newVal);
      const hasData = this.hasListData(list);
      const propChatData = this.properties.chatData;
      this.clearNoDataTimer();
      this.setData({ renderChatList: this.mapRenderFields(list) });
      if (isLoadingMore) {
        if (hasData) {
          this.setVisualState({
            showSkeleton: false,
            showNoData: false,
            scrollReady: true,
          });
          this.checkScrollable();
          if (this.properties.firstMsgIdBeforeLoad)
            this.computeRestoreOffsetAndScroll(list);
        }
        return;
      }
      if (hasData) {
        // 有数据：直接交给 prepareAndReveal 在 SelectorQuery 回调里
        // 一次性写入 scrollTop / isScrollableTip / showSkeleton / scrollReady。
        // 注意这里不要再同步走 setVisualState({showSkeleton:true})，否则
        // SelectorQuery 的异步间隙会把骨架强制刷一帧，造成
        // "空状态 → 骨架 → 真实数据" 的闪烁。
        this.prepareAndReveal();
      } else if (this.properties.initialLoading) {
        this.setVisualState({
          scrollReady: false,
          showSkeleton: true,
          showNoData: false,
        });
      }
      // 仅在"非空 → 空"时排空态（例如清除聊天后重新拉到空列表）。
      // 初次属性 observer 也会带 chatMsgList:[] 进来，那种情况下不能排，
      // 否则在角色 / 数据未就绪期间会先闪一下 noData。
      // 真正的"首次加载完仍为空"由 onInitialLoadingChange 在 complete 后兜底。
      const oldList =
        oldVal && Array.isArray(oldVal.chatMsgList) ? oldVal.chatMsgList : [];
      if (
        propChatData &&
        Array.isArray(propChatData.chatMsgList) &&
        propChatData.chatMsgList.length === 0 &&
        oldList.length > 0
      ) {
        this.scheduleEmptyState();
      }
    },

    // 检查是否可滚动
    checkScrollable() {
      const query = this.createSelectorQuery();
      query.select(".chat-histroy-content").boundingClientRect();
      query.select(".chat-histroy-content").scrollOffset();
      query.exec((res) => {
        if (res[0] && res[1]) {
          const containerHeight = res[0].height + 8;
          const scrollHeight = res[1].scrollHeight;
          const isScrollable = scrollHeight > containerHeight;
          if (this.data.isScrollableTip !== isScrollable) {
            this.setData({ isScrollableTip: isScrollable });
          }
        }
      });
    },

    // 定位底部
    scrollToBottom() {
      const query = this.createSelectorQuery();
      query.select(".chat-histroy-content").scrollOffset();
      query.exec((res) => {
        if (res[0]) {
          this.setData({
            scrollTop: res[0].scrollHeight || 999999999999,
          });
          if (this.data.scrollHeight <= this.data.contentHeight) {
            this.onScrollToLower();
          }
        }
      });
    },

    // 首屏/切换角色后：先把 scrollTop 与 isScrollableTip 一次性算好并写入，
    // 再在下一帧打开 scrollReady 做淡入，避免空白态闪烁。
    prepareAndReveal() {
      const reveal = () => {
        this.setData({
          showSkeleton: false,
          showNoData: false,
          scrollReady: true,
        });
      };
      const query = this.createSelectorQuery();
      query.select(".chat-histroy-content").boundingClientRect();
      query.select(".chat-histroy-content").scrollOffset();
      query.exec((res) => {
        const rect = res[0];
        const offset = res[1];
        const patch = {};
        if (offset) {
          patch.scrollTop = offset.scrollHeight || 999999999999;
        }
        if (rect && offset) {
          const containerHeight = rect.height + 8;
          const isScrollable = offset.scrollHeight > containerHeight;
          if (this.data.isScrollableTip !== isScrollable) {
            patch.isScrollableTip = isScrollable;
          }
        }
        if (Object.keys(patch).length > 0) {
          this.setData(patch, () => {
            // setData 渲染完成的下一帧再淡入，确保滚动位置与 tip 样式已生效
            wx.nextTick ? wx.nextTick(reveal) : setTimeout(reveal, 16);
          });
        } else {
          wx.nextTick ? wx.nextTick(reveal) : setTimeout(reveal, 16);
        }
        // 兜底：到底事件
        if (
          offset &&
          rect &&
          offset.scrollHeight <= rect.height + 8 &&
          !this.data.isAtBottom
        ) {
          this.setData({ isAtBottom: true });
        }
      });
    },

    // 滚动到指定消息
    scrollToMessage(messageId) {
      if (!messageId) return;

      this.setData({
        scrollIntoView: `msg-${messageId}`,
        scrollIntoOffset: this.data.scrollIntoOffset || 0,
      });
    },

    // 监听滚动事件
    onScroll(e) {
      const { scrollTop, scrollHeight } = e.detail;

      if (this.data.scrollThrottleTimer)
        clearTimeout(this.data.scrollThrottleTimer);

      const timer = setTimeout(() => {
        if (this.isLoadingLocked()) {
          this.setData({
            scrollThrottleTimer: null,
          });
          return;
        }
        const query = this.createSelectorQuery();
        query.select(".chat-histroy-content").boundingClientRect();
        query.exec((res) => {
          if (res[0]) {
            const containerHeight = res[0].height + 8;
            const isScrollable = scrollHeight > containerHeight;

            console.log(
              "scrollHeight",
              scrollHeight,
              containerHeight,
              isScrollable,
            );

            if (this.data.isScrollableTip !== isScrollable) {
              this.setData({
                isScrollableTip: isScrollable,
              });
            }

            if (
              isScrollable &&
              this.data.lastTimeScrollTop !== undefined &&
              scrollTop < this.data.lastTimeScrollTop
            ) {
              if (this.data.isAtBottom) {
                this.setData({
                  isAtBottom: false,
                });
              }
            } else if (!isScrollable && !this.data.isAtBottom) {
              this.setData({
                isAtBottom: true,
              });
            }

            this.setData({
              lastTimeScrollTop: scrollTop,
            });
          }
        });
        this.setData({
          scrollThrottleTimer: null,
        });
      }, 150);
      this.setData({
        scrollThrottleTimer: timer,
      });
    },

    // 滚动底部判断
    onScrollToLower() {
      console.log("触发scrolltolower事件，设置isAtBottom为true");
      this.setData({
        isAtBottom: true,
      });
      setTimeout(() => {
        this.setData({
          scrollReady: true,
          showSkeleton: false,
        });
      }, 300);
    },

    // 触摸开始
    screenTouchStart(e) {
      if (!this.data.isAtBottom || this.properties.isRefreshing) {
        return;
      }
      this.setData({
        touchStartY: e.touches[0].clientY,
        touchMoveY: e.touches[0].clientY,
        pullDistance: 0,
      });
    },

    // 触摸移动
    screenTouchMove(e) {
      if (!this.data.isAtBottom || this.properties.isRefreshing) {
        return;
      }
      const currentY = e.touches[0].clientY;
      const moveDistance = currentY - this.data.touchStartY;

      // 处理向上拖拽
      if (moveDistance < 0) {
        const pullDistance = Math.abs(moveDistance);
        this.setData({
          touchMoveY: currentY,
          pullDistance: pullDistance,
        });

        // 阻止默认滚动行为
        if (pullDistance > 10) {
          e.preventDefault && e.preventDefault();
        }
      }
    },

    // 触摸结束
    screenTouchEnd() {
      if (!this.data.isAtBottom || this.properties.isRefreshing) {
        return;
      }

      // 检查是否超过刷新阈值
      if (this.data.pullDistance >= this.data.refreshThreshold) {
        console.log("达到刷新阈值，触发刷新");
        this.triggerRefresh();
      } else {
        console.log("未达到刷新阈值");
      }

      // 重置触摸数据
      this.setData({
        touchStartY: 0,
        touchMoveY: 0,
        pullDistance: 0,
      });
    },

    // 触发刷新
    triggerRefresh() {
      if (this.properties.isRefreshing) {
        return;
      }
      this.triggerEvent("refresh", {
        type: "pullUp",
      });
    },

    // 触发加载
    triggerLoadMore() {
      if (this.properties.isLoadingMoreMsg) {
        return;
      }
      this.triggerEvent("loadmore", {
        type: "pullDown",
      });
    },

    // 监听首屏加载状态变化
    onInitialLoadingChange(newVal) {
      this.clearNoDataTimer();
      if (newVal === false && this.isEmptyChat()) this.scheduleEmptyState();
    },
  },
});
