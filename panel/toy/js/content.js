import eventBus from "../../common/eventBus.js";
const plugin = requirePlugin("quecPlugin");
let KEY = "ai_content_cur_play"; //当前播放专辑key

/**
 * @param {*} obj - 播放专辑信息Object
 * @param {*} device - 当前设备信息Object
 */
export function setContentStorage(obj, device) {
  let nObj = obj;
  nObj["productKey"] = device.productKey;
  nObj["deviceKey"] = device.deviceKey;
  console.log(nObj);
  wx.setStorageSync(KEY, JSON.stringify(nObj));
}

/**
 * 获取缓存专辑信息
 */
export function getContentStorage() {
  let stObj = {};
  if (wx.getStorageSync(KEY)) {
    stObj = JSON.parse(wx.getStorageSync(KEY));
  }
  return stObj;
}

/**
 * 构建续播列表配置
 * 从当前歌曲的下一首开始取歌，若不足10首则从列表头部循环补充（跳过当前播放歌曲），
 * 确保续播列表尽量填满10首。
 * 以下场景返回 null：
 * 1. 设备不支持续播列表物模型（无 continuationListTsl）
 * 2. 二期新版本设备（由设备自行管理续播）
 * 3. 当前歌曲未在列表中找到
 * 4. 专辑只有当前这一首歌（无其他可用歌曲）
 * @param {Object} continuationListTsl - 续播列表物模型
 * @param {Object} newVersionFieldTsl - 新版本字段物模型
 * @param {Object} playingObj - 当前播放的歌曲对象
 * @param {Array} songList - 完整曲目列表
 * @returns {Object|null} continuationOpts，包含 tsl 和 items 字段；不适用时返回 null
 */
export function buildContinuationOpts(
  continuationListTsl,
  newVersionFieldTsl,
  playingObj,
  songList,
) {
  const isNewVersion =
    newVersionFieldTsl && newVersionFieldTsl.vdata === "1.0.0";
  const hasContinuationList =
    continuationListTsl && Object.keys(continuationListTsl).length > 0;
  if (!hasContinuationList || isNewVersion) return null;

  const idx = songList.findIndex((s) => s.id === playingObj.id);
  if (idx === -1) return null;

  const afterSongs = songList.slice(idx + 1);
  const beforeSongs = songList.slice(0, idx);
  const candidates = afterSongs.concat(beforeSongs).slice(0, 10);

  // 专辑只有当前这一首歌，无法构建续播列表
  if (candidates.length === 0) return null;

  // 格式：[{ "0": "url1" }, { "0": "url2" }, ...]
  return {
    tsl: continuationListTsl,
    items: candidates.map((song) => ({ 0: song.play_link_url })),
  };
}

/* @param {*} curObj - 播放专辑信息Object
 * @param {*} playStatus 播放状态  0:上一首 1：下一首 2：暂停 3：继续播放
 * @param {*} tsl 物模型
 * @param {*} device 设备
 * @param {*} switsl 开关物模型
 * @param {*} newVersionFieldTsl 新版本物模型（二期新增，可选）
 * @param {*} continuationOpts 续播列表配置（可选）{ tsl, items }
 */
export function playSend(
  obj,
  playStatus,
  tsl,
  device,
  switsl,
  newVersionFieldTsl,
  continuationOpts,
) {
  if (switsl.vdata == false || switsl.vdata == "false") {
    return plugin.jsUtil.tip("点播失败,设备待机中");
  }

  // 判断是否为二期新版本设备
  const isNewVersion =
    newVersionFieldTsl &&
    Object.keys(newVersionFieldTsl).length > 0 &&
    newVersionFieldTsl.vdata &&
    newVersionFieldTsl.vdata === "1.0.0";

  const sendValue = [
    { appOnDemandUrl: obj.play_link_url },
    { albumId: obj.album_id },
    { songId: obj.id },
    { playStatus: playStatus },
    { songTitle: obj.name },
    { albumCoverUrl: "" },
  ];

  // 如果是新版本设备，下发物模型新增字段 episode
  if (isNewVersion && obj.episode !== undefined) {
    sendValue.push({ episode: obj.episode });
  }

  const sendData = [
    {
      [tsl.code]: sendValue,
    },
  ];

  // 如果有续播列表配置，一并下发续播列表物模型给设备
  if (
    continuationOpts &&
    continuationOpts.tsl &&
    continuationOpts.items &&
    continuationOpts.items.length > 0
  ) {
    sendData.push({
      [continuationOpts.tsl.code]: continuationOpts.items,
    });
  }
  eventBus.emit(
    "sendAttr",
    {
      productKey: device.productKey,
      deviceKey: device.deviceKey,
      code: tsl.code,
      value: playStatus,
      sendData,
      isSuccByReport: true,
    },
    () => {
      console.log("成功");
    },
    () => {
      console.log("失败");
    },
  );
}

/**
 * 图片url http 转换为https
 */
export function covertImgUrl(list) {
  let nList = list;
  nList.forEach((l) => {
    if (l.cover_url.large.indexOf("http:") >= 0) {
      let url = l.cover_url.large;
      l.img = url.replace("http:", "https:");
    } else {
      l.img = l.cover_url.large;
    }
  });
  return nList;
}
