const plugin = requirePlugin('quecPlugin')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    fid: {
      type: String,
      value: ''
    },
    sceneRefresh: {//是否刷新
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    sData: [],
    isFinish: false,
    excuResultConst: plugin.jsConst.excuResult,
  },
  observers: {
    'sceneRefresh': function (sceneRefresh) {
      if (sceneRefresh) {
        this.refreshList()
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    refreshList () {
      let self = this
      self.setData({
        sData: [],
        isFinish: false
      })
      self.getComSceneList()
    },

    /**
     * 获取常用场景列表
     */
    getComSceneList () {
      //jsUtil.load(2000)
      let self = this
      plugin.scene.selectCommonSceneList({
        fid: self.properties.fid.length > 0 ? self.properties.fid : '',
        success (res) {
          if (res.data.list) {
            let list = res.data.list
            list.forEach((ls) => {
              ls.isAn = false
            })

            self.setData({
              sData: list
            })
          }
        },
        fail (res) { },
        complete (res) {
          self.setData({
            isFinish: true
          })
          self.triggerEvent('SceneFinish', self.data.isFinish)
        }
      })
    },
    /**
     * 执行
     */
    excute (e) {
      let self = this
      let sceneId = e.currentTarget.dataset.sceneid
      self.an(sceneId)
      plugin.scene.sceneExecute({
        fid: self.properties.fid,
        sceneId,
        success (res) {
          let executionResult = null
          if (res.data) {
            let data = res.data
            if (data.executeResult) {
              executionResult = 1
            } else {
              if (data.successCount == 0 && data.failCount > 0) {
                executionResult = 2
              } else if (data.successCount > 0 && data.failCount > 0) {
                executionResult = 3
              }
            }
            if (executionResult == 2) {
              plugin.jsUtil.tip(self.data.excuResultConst[executionResult], 'error')
            } else {
              plugin.jsUtil.tip(self.data.excuResultConst[executionResult], 'success')
            }
          }
        },
        fail (res) { },
        complete (res) {
          self.an(sceneId)
        }
      })
    },

    /**
    * 是否执行动画
    */
    an (sceneId) {
      let self = this
      let sData = self.data.sData
      sData.forEach((s) => {
        if (s.sceneInfo.sceneId == sceneId) {
          s.isAn = !s.isAn
        }
      })
      self.setData({
        sData
      })
    },
  }
})
