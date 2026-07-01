const plugin = requirePlugin("quecPlugin")

const INTERCEPT = {
  TOLETTER: "给家长的话",
  STRATEGY: "长期成长策略",
}

Component({
  properties: {
    // content数据
    summaryConData: {
      type: Array,
      value: [],
    },
    // 互动时长
    duration: {
      type: String,
      value: "",
    },
    // 是否显示成长建议
    showSuggestion: {
      type: Boolean,
      value: true,
    },
  },

  data: {
    rounds: 0, // 互动轮数
    lightSpots: [], // 互动亮点
    suggestions: [], // 成长建议
    emotion: [], // 情感分析
    report: [], // 综合分析报告
    toletter: "", // 家长的一封信
    showToLetter: false, // 是否显示家长的一封信
    emptyImg: plugin.main.getRootImg() + "example/images/ic_empty.png",
    showNoData: false, // 是否显示暂无数据
    cduration: 0, // 互动时长
    // showSuggestion: true, // 是否显示成长建议
  },

  observers: {
    summaryConData: function (summaryConData) {
      const hasData =
        Array.isArray(summaryConData) && summaryConData.length > 0 && summaryConData[0]
      if (hasData) {
        const duration = this.properties.duration

        const content0 = Array.isArray(summaryConData[0].content)
          ? summaryConData[0].content
          : []
        const lightSpots = Array.isArray(summaryConData[0].lightSpot)
          ? summaryConData[0].lightSpot
          : []

        const roundsTitle =
          content0[0] && typeof content0[0].title === "string" ? content0[0].title : ""
        const rounds = roundsTitle
          ? roundsTitle.replace("互动轮数：", "").replace("轮", "").trim()
          : 0

        const emotion = Array.isArray(content0[2]?.content) ? content0[2].content : []

        const baseSuggestionsArr = Array.isArray(content0[3]?.content)
          ? content0[3].content
          : []
        const baseSuggestions = baseSuggestionsArr.slice()

        const reportContents = Array.isArray(content0[4]?.content)
          ? content0[4].content
          : []

        let toLetterText = ""
        let strategyText = ""
        for (let i = 0; i < reportContents.length; i++) {
          const item = reportContents[i]
          if (typeof item !== "string") continue
          const s = item.trim()
          if (!toLetterText && s.includes(INTERCEPT.TOLETTER)) {
            const after = s.split(INTERCEPT.TOLETTER)[1] || ""
            const inlineText = after.replace(/^[\s：:\-—]+/, "").trim()
            toLetterText = inlineText || ""
          }
          if (!strategyText && s.includes(INTERCEPT.STRATEGY)) {
            const afterS = s.split(INTERCEPT.STRATEGY)[1] || ""
            const inlineStrategy = afterS.replace(/^[\s：:\-—]+/, "").trim()
            strategyText = inlineStrategy || ""
          }
          if (toLetterText && strategyText) {
            break
          }
        }

        const finalSuggestions = baseSuggestions.slice()
        if (strategyText) {
          if (!finalSuggestions.includes(strategyText)) {
            finalSuggestions.push(strategyText)
          }
        }

        const filteredReport = reportContents.filter((x) => {
          if (typeof x !== "string") return true
          const s = x.trim()
          return !s.includes(INTERCEPT.TOLETTER) && !s.includes(INTERCEPT.STRATEGY)
        })

        this.setData({
          showToLetter: true,
          showNoData: false,
          cduration: duration,
          rounds: rounds,
          lightSpots: lightSpots,
          emotion: emotion,
          report: filteredReport,
          toletter: toLetterText,
          suggestions: finalSuggestions,
        })
      } else {
        this.setData({
          rounds: 0,
          lightSpots: [],
          suggestions: [],
          emotion: [],
          report: [],
          toletter: "",
          showToLetter: false,
          showNoData: true,
          cduration: 0,
        })
      }
    },
  },
})
