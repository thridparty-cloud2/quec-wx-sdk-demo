const plugin = requirePlugin('quecPlugin')

Component({

  /**
   * 组件的属性列表
   */
  properties: {
    icons: {
      type: Array
    },
    categories: {
      type: Array
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    icons: [],
    menuData: []
  },

  lifetimes: {
    attached () {
      let self = this
      let { icons, categories } = self.properties
      for (let cat of categories) {
        for (let icon of icons) {
          if (cat.name == icon.name) {
            cat.img = icon.img
          }
        }
      }
      self.setData({
        menuData: categories
      })
    },
    detached () { },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    goAlbumList (e) {
      let item = e.currentTarget.dataset.item
      this.triggerEvent('List', item)
    }
  }
})