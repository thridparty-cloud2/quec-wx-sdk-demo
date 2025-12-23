const plugin = requirePlugin('quecPlugin')

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    headImage: '',
    nikeName: '',
    phone: '',
    i18n: '',
    email: '',
    isWechat: true,
    skin: '',
    headShow: false,
    imgs: [],
    curImg: '',
    phoneInfo: {},
    authVisible: false,
    keyHeight: 0,
    uname: '',
    isToken: undefined
  },

  lifetimes: {
    ready: function () {
      this.setData({
        i18n: plugin.main.getLang(),
        skin: plugin.main.getSkin(),
      })
    },
    detached: function () { }
  },

  pageLifetimes: {
    show: function () {
      this.setData({
        imgs: plugin.config.getHeadImg(true),
        isToken: plugin.jsUtil.isToken()
      })
      if (this.data.isToken) {
        this.initUInfo()
      }
    },
    hide: function () { }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 获取用户信息
     */
    initUInfo () {
      let self = this
      plugin.quecUser.getUInfo({
        success (res) {
          let result = res.data
          let imgList = plugin.config.getHeadImg(false)
          let imgs = self.data.imgs
          let hImg = result.headimg
          if (hImg && imgList.indexOf(hImg) > 0) {
            imgs.forEach((elm) => {
              if (elm.url === hImg) {
                elm.check = true
              } else {
                elm.check = false
              }
            })
          } else {
            hImg = imgList[0]
            imgs[0].check = true
          }
          let uname = self.data.uname
          if (result.phone) {
            uname = result.phone
          } else if (result.email) {
            uname = result.email
          }
          self.setData({
            nikeName: result.nikeName ? result.nikeName : self.data.i18n['defaultNikeName'],
            headImage: hImg,
            curImg: hImg,
            phone: result.phone ? result.phone : '',
            email: result.email ? result.email : '',
            isWechat: !result.wechatMiniprogramUserId ? false : true,
            imgs,
            uname
          })
        },
        fail (res) { },
        complete () { }
      })
    },

    /**
    * 选择头像
    */
    pickImg () {
      let self = this
      plugin.jsUtil.toSafe(self, () => {
        let imgs = self.data.imgs
        let headImage = self.data.headImage
        imgs.forEach((elm) => {
          if (elm.url === headImage) {
            elm.check = true
          } else {
            elm.check = false
          }
        })
        self.setData({
          headShow: true,
          imgs
        })
      })
    },

    checkImg (e) {
      let self = this
      let item = e.currentTarget.dataset.img
      let imgs = self.data.imgs
      imgs.forEach((elm) => {
        if (elm.url == item.url) {
          elm.check = true
        } else {
          elm.check = false
        }
      })
      self.setData({
        curImg: item.url,
        imgs
      })
    },

    /**
     * 设置昵称
     */
    goNikeName () {
      plugin.jsUtil.toSafe(this, () => {
        this.triggerEvent('goNikeName', this.data.nikeName)
      })
    },

    /**
     * 修改密码
     */
    goChangePwd (e) {
      plugin.jsUtil.toSafe(this, () => {
        this.triggerEvent('goChangePwd', e.currentTarget.dataset.uname)
      })
    },

    /**
     * 退出成功
     */
    logoutSuccess () {
      this.triggerEvent('logoutSuccess', true)
    },

    /**
     * 注销账户
     */
    goCancel () {
      plugin.jsUtil.toSafe(this, () => {
        let uname = ''
        if (this.data.phone) {
          uname = this.data.phone
        }
        if (this.data.email) {
          uname = this.data.email
        }
        this.triggerEvent('goCancel', uname)
      })
    },

    /**
     * 选择头像
     */
    headClose () {
      let self = this
      let headImage = self.data.headImage
      self.setData({
        headShow: false,
        curImg: headImage
      })
    },

    /**
     * 修改头像
     */
    editHeadImg () {
      let self = this
      plugin.quecUser.editHeadImg({
        headImage: self.data.curImg,
        success (res) {
          if (res.code == 200) {
            self.headClose()
            self.initUInfo()
          }
        },
        fail (res) { }
      })
    },

    /**
     * 关联手机号
     */
    relatePhone () {
      plugin.jsUtil.toSafe(this, () => {
        this.setData({
          authVisible: true
        })
      })
    },

    /**
     * 关闭授权弹框
     */
    authClose () {
      this.setData({
        authVisible: false
      })
    },

    /**
     * 授权成功
     */
    authSuccess () {
      let self = this
      self.authClose()
      self.initUInfo()
    },

    /**
     * 获取键盘高度
     */
    getKeyHeight (e) {
      let self = this
      self.setData({
        keyHeight: Number(e.detail)
      })
    },


  }
})
