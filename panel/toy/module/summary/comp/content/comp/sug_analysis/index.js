const plugin = requirePlugin("quecPlugin")

const { processContents } = require("../../../../util/common-util")

/** Tab 配置常量 */
const TAB_SUGGESTION = { name: "互动建议", index: 0 }
const TAB_ANALYSIS = { name: "互动分析", index: 1 }
const ALL_TABS = [TAB_SUGGESTION, TAB_ANALYSIS]

/** 内容区 section 配置 */
const rootImg = plugin.main.getRootImg()
const SECTION_CONFIG = {
  suggestions: {
    title: "成长建议",
    icon: rootImg + "ai/new/sug.png",
    bgColor: "#FAF8FF",
    compact: true,
  },
  toletter: {
    title: "给家长的一封信",
    icon: rootImg + "ai/new/sugMail.png",
    bgColor: "#F3FBFF",
    compact: false,
  },
  emotion: {
    title: "情绪分析",
    icon: rootImg + "ai/new/anaEmo.png",
    bgColor: "#FFFCF8",
    compact: true,
  },
  report: {
    title: "综合分析报告",
    icon: rootImg + "ai/new/anaSearch.png",
    bgColor: "#F8F9FA",
    compact: false,
  },
}

/**
 * 构建 section 数据
 * @param {Object} cfg - SECTION_CONFIG 中的配置项
 * @param {Array} contents - 已处理的内容数组
 */
function buildSection(cfg, contents) {
  return {
    title: cfg.title,
    icon: cfg.icon,
    bgColor: cfg.bgColor,
    compact: cfg.compact,
    contents: contents,
  }
}

Component({
  properties: {
    suggestions: { type: Array, value: [] },
    emotion: { type: Array, value: [] },
    report: { type: Array, value: [] },
    toletter: { type: String, value: "" },
    /** 控制"互动建议"Tab 是否展示 */
    showSuggestion: { type: Boolean, value: true },
  },

  data: {
    tabLineIcon: rootImg + "ai/new/tab-icon.png",
    currentTab: TAB_SUGGESTION.index,
    tabs: ALL_TABS,
    contentData: [],
  },

  lifetimes: {
    attached() {
      this._buildAndApply()
    },
  },

  observers: {
    "suggestions, toletter, emotion, report": function () {
      this._buildAndApply()
    },
    showSuggestion: function (show) {
      const tabs = show ? ALL_TABS : [TAB_ANALYSIS]
      const currentTab = show ? this.data.currentTab : TAB_ANALYSIS.index
      this.setData({ tabs, currentTab })
    },
  },

  methods: {
    switchTab(e) {
      const index = e.currentTarget.dataset.index
      if (index === this.data.currentTab) return
      this.setData({ currentTab: index })
    },

    /**
     * 一次性构建全部 contentData 并单次 setData，
     * 避免 4 个 observer 各自触发 setData 导致多次渲染
     */
    _buildAndApply() {
      const { suggestions, toletter, emotion, report } = this.data

      const sugContents = suggestions?.length ? processContents(suggestions) : []
      const letterContents = toletter ? [{ text: toletter }] : []
      const emoContents = emotion?.length ? processContents(emotion) : []
      const rptContents = report?.length ? processContents(report) : []

      const contentData = [
        {
          tabIndex: TAB_SUGGESTION.index,
          sections: [
            buildSection(SECTION_CONFIG.suggestions, sugContents),
            buildSection(SECTION_CONFIG.toletter, letterContents),
          ],
        },
        {
          tabIndex: TAB_ANALYSIS.index,
          sections: [
            buildSection(SECTION_CONFIG.emotion, emoContents),
            buildSection(SECTION_CONFIG.report, rptContents),
          ],
        },
      ]

      this.setData({ contentData })
    },
  },
})
