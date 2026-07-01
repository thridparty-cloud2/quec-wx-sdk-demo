const plugin = requirePlugin("quecPlugin");

// 全局音频播放对象
let playAudioObj = null;

/**
 * 音频播放工具类
 */
class AudioPlayer {
  /**
   * 播放音频
   * @param {string} soundUrl - 音频URL
   * @param {string|null} voiceId - 声音ID
   * @param {Object} context - 页面上下文对象
   * @param {Object} options - 额外选项
   * @param {boolean} options.keepSelectedVoiceId - 播放结束时是否保持selectedVoiceId不变
   */
  /** 当前实例是否仍归属该页面且处于活跃状态 */
  static _shouldNotify(context) {
    return (
      playAudioObj &&
      playAudioObj._active === true &&
      playAudioObj._ownerContext === context
    );
  }

  /** 安全更新页面数据（页面卸载或非活跃时不更新、不抛错） */
  static _safeSetData(context, obj) {
    if (!AudioPlayer._shouldNotify(context)) return;
    try {
      context.setData(obj);
    } catch (e) {
      // 页面可能已卸载或不可更新，吞掉异常
    }
  }

  static playVoiceAudio(soundUrl, voiceId = null, context, options = {}) {
    // 使用保持selectedVoiceId的停止逻辑，防止切换音频时取消选中状态
    this.stopCurrentAudio(context, { keepSelectedVoiceId: true });

    if (!soundUrl) {
      console.error("音频URL为空");
      plugin.jsUtil.tip("音频播放失败");
      return;
    }

    try {
      // 复用已有的音频实例，避免频繁创建销毁带来的延迟
      if (!playAudioObj) {
        playAudioObj = wx.createInnerAudioContext();
        wx.setInnerAudioOption({ obeyMuteSwitch: false });
        // iOS上不能直接使用autoplay，需要手动调用play()
        playAudioObj.autoplay = false;
        // 设置音频属性以提高iOS兼容性
        playAudioObj.obeyMuteSwitch = false; // 不遵循静音开关
        playAudioObj.volume = 1.0; // 设置音量
      } else {
        try {
          playAudioObj.stop();
        } catch (e) {
          console.warn("复用音频实例停止失败", e);
        }
      }

      // 清理旧的事件监听，防止重复绑定导致回调多次触发
      if (typeof playAudioObj.offPlay === "function") playAudioObj.offPlay();
      if (typeof playAudioObj.offEnded === "function") playAudioObj.offEnded();
      if (typeof playAudioObj.offError === "function") playAudioObj.offError();
      if (typeof playAudioObj.offCanplay === "function")
        playAudioObj.offCanplay();

      // 记录归属页面与活跃状态
      playAudioObj._ownerContext = context;
      playAudioObj._active = true;

      // 设置新的音频源
      playAudioObj.src = soundUrl;
      // 声明播放状态变量，供错误与重试回调共用（需在回调之前声明）
      let hasPlayed = false;
      let playAttempts = 0;
      const maxAttempts = 3;
      let errorTipTimer = null;

      // 播放成功回调
      playAudioObj.onPlay(() => {
        console.log("音频开始播放:", soundUrl);
        // 播放成功后清理可能等待中的错误提示定时器
        if (errorTipTimer) {
          clearTimeout(errorTipTimer);
          errorTipTimer = null;
        }
        const setDataObj = {
          playingVoiceId: voiceId, // 设置当前播放的声音ID
          isPlayingAudio: true, // 设置播放状态
        };
        if (options.setSelectedVoiceId !== false) {
          setDataObj.selectedVoiceId = voiceId;
        }
        AudioPlayer._safeSetData(context, setDataObj);
      });

      // 播放结束回调
      playAudioObj.onEnded(() => {
        console.log("音频播放结束");
        const setDataObj = {
          playingVoiceId: null,
          isPlayingAudio: false,
        };
        if (!options.keepSelectedVoiceId) {
          setDataObj.selectedVoiceId = null;
        }
        AudioPlayer._safeSetData(context, setDataObj);
      });

      // 播放错误回调（延时判断，避免误提示）
      playAudioObj.onError((err) => {
        console.error("音频播放错误:", err);
        // 如果稍后进入播放状态，则不提示失败；增加短暂延时，容错网络/设备短暂错误
        if (typeof errorTipTimer !== "undefined" && errorTipTimer) {
          clearTimeout(errorTipTimer);
        }
        errorTipTimer = setTimeout(() => {
          if (AudioPlayer._shouldNotify(context) && !hasPlayed) {
            plugin.jsUtil.tip("音频播放失败");
            AudioPlayer._safeSetData(context, {
              playingVoiceId: null,
              isPlayingAudio: false,
            });
          } else {
            console.warn("出现音频错误但已进入播放状态，忽略错误提示");
          }
        }, 400);
      });

      // 播放逻辑：立即尝试播放 + onCanplay触发重试 + 定时兜底重试
      const attemptPlay = () => {
        if (hasPlayed || !playAudioObj) return;
        playAttempts++;
        console.log(`尝试播放音频，第${playAttempts}次`);
        try {
          const playResult = playAudioObj.play();
          if (playResult && typeof playResult.then === "function") {
            playResult
              .then(() => {
                hasPlayed = true;
                console.log("音频播放成功");
              })
              .catch(handlePlayFailure);
          } else {
            hasPlayed = true;
            console.log("音频播放调用成功");
          }
        } catch (err) {
          console.error(`播放异常:`, err);
          handlePlayFailure();
        }
      };

      const handlePlayFailure = () => {
        if (playAttempts < maxAttempts) {
          setTimeout(attemptPlay, 300 * playAttempts);
        } else {
          if (AudioPlayer._shouldNotify(context) && !hasPlayed) {
            plugin.jsUtil.tip("音频播放失败");
            AudioPlayer._safeSetData(context, {
              playingVoiceId: null,
              isPlayingAudio: false,
            });
          }
        }
      };

      // 立即尝试一次，减少首播等待
      attemptPlay();

      // 设备就绪后再尝试（部分机型需要）
      playAudioObj.onCanplay(() => {
        if (!hasPlayed) {
          attemptPlay();
        }
      });

      // 备用播放方案：500ms后兜底
      setTimeout(() => {
        if (!hasPlayed && playAudioObj) {
          attemptPlay();
        }
      }, 500);
    } catch (error) {
      console.error("创建或复用音频实例失败:", error);
      if (AudioPlayer._shouldNotify(context)) {
        plugin.jsUtil.tip("音频播放失败");
        AudioPlayer._safeSetData(context, {
          playingVoiceId: null,
          isPlayingAudio: false,
        });
      }
    }
  }

  /**
   * 停止当前音频播放
   * @param {Object} context - 页面上下文对象
   * @param {Object} options - 额外选项
   * @param {boolean} options.keepSelectedVoiceId - 是否保持selectedVoiceId不变
   */
  static stopCurrentAudio(context, options = {}) {
    if (playAudioObj) {
      try {
        // 解绑所有事件监听，防止残留回调在页面切换后触发
        if (typeof playAudioObj.offPlay === "function") playAudioObj.offPlay();
        if (typeof playAudioObj.offEnded === "function")
          playAudioObj.offEnded();
        if (typeof playAudioObj.offError === "function")
          playAudioObj.offError();
        if (typeof playAudioObj.offCanplay === "function")
          playAudioObj.offCanplay();
      } catch (e) {
        console.warn("解绑音频监听失败", e);
      }
      try {
        playAudioObj.stop();
      } catch (error) {
        console.error("停止音频失败:", error);
      }
      // 标记实例为非活跃，避免后续错误或兜底重试弹出误提示
      playAudioObj._active = false;
      playAudioObj._ownerContext = null;
    }

    const setDataObj = {
      playingVoiceId: null,
      isPlayingAudio: false,
    };
    if (!options.keepSelectedVoiceId) {
      setDataObj.selectedVoiceId = null;
    }
    try {
      context.setData(setDataObj);
    } catch (e) {
      // 页面可能已卸载，不做处理
    }
  }
}

module.exports = AudioPlayer;
