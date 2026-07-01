const plugin = requirePlugin("quecPlugin")

let riskConst = {
  rIcon: plugin.main.getRootImg() + "ai/new/risk/rIcon.png",
  guideIcon: plugin.main.getRootImg() + "ai/new/risk/guideIcon.png",
  record: plugin.main.getRootImg() + "ai/new/risk/record.png?v=1.0",
  sRecIcon: plugin.main.getRootImg() + "ai/new/risk/recIcon.png?v=1.0",
  voiceIcon: plugin.main.getRootImg() + "ai/new/risk/voice_icon.png",
  offlineBg: plugin.main.getRootImg() + "ai/new/risk/risk_offline.png",
  positioningIcon: plugin.main.getRootImg() + "ai/new/positioning.png",

  stateConst: {
    true: "已处理",
    false: "未处理",
    true: "已处理",
    false: "未处理",
  },

  boGif: plugin.main.getRootImg() + "ai/new/risk/bo.gif",
}

module.exports = riskConst
