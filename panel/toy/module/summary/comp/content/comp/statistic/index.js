Component({
  properties: {
    rounds: {
      type: Number,
      value: 10,
    },
    duration: {
      type: Number,
      value: 0,
    },
  },

  data: {
    showType: "sec",
    dur_hours: 0,
    dur_minutes: 0,
    dur_seconds: 0,
  },

  observers: {
    duration: function (newVal) {
      const seconds = typeof newVal === "number" ? newVal : parseInt(newVal, 10) || 0

      let showType = "sec"
      let dur_hours = 0
      let dur_minutes = 0
      let dur_seconds = 0

      if (seconds >= 3600) {
        showType = "hour"
        dur_hours = Math.floor(seconds / 3600)
        dur_minutes = Math.floor((seconds % 3600) / 60)
      } else if (seconds >= 60) {
        showType = "min"
        dur_minutes = Math.floor(seconds / 60)
        dur_seconds = seconds % 60
      } else {
        showType = "sec"
        dur_seconds = seconds
      }

      this.setData({
        showType,
        dur_hours,
        dur_minutes,
        dur_seconds,
      })
    },
  },
})
