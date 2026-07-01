import conConst from "../../../../js/conConst.js";
const plugin = requirePlugin("quecPlugin");
import { covertImgUrl } from "../../../../js/content.js";

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    citem: {
      type: Object,
    },
    curDevice: {
      type: Object,
    },
    newVersionFieldTsl: {
      type: Object,
      value: {},
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    conConst: conConst,
    album: {},
    albumData: [],
  },

  lifetimes: {
    attached() {},
    detached() {},
  },

  observers: {
    citem: function (citem) {
      let self = this;
      let cur = self.properties.citem;
      if (cur && cur.name) {
        cur.pageNum = 1;
        cur.pageSize = 3;
        self.setData({
          album: cur,
        });
        self.getData(self.data.album);
      }
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getData(item) {
      console.log("item", item.name);

      let self = this;
      const { curDevice } = self.properties;

      plugin.ai.onDemandSearchalbum({
        productKey: curDevice.productKey,
        type: item.type,
        name: item.name,
        pageNum: item.pageNum,
        pageSize: item.pageSize,
        success(res) {
          if (res.data && res.data.list) {
            let { album } = self.data;
            let list = res.data.list;
            let nList = covertImgUrl(list);
            album.list = nList;
            album.total = res.data.total;
            self.setData({
              album,
            });
          }
        },
        fail(res) {},
        compete(res) {},
      });
    },

    /**
     * 换一换
     */
    changeOther(e) {
      console.log("changeOther:");
      console.log(e.currentTarget.dataset.item);
      let item = e.currentTarget.dataset.item;

      if (item.pageSize * item.pageNum > item.total) {
        item.pageNum = 1;
      } else {
        item.pageNum = item.pageNum + 1;
      }

      // if (item.pageSize !== item.total) {
      //   item.pageNum = 1
      // } else {
      //   item.pageNum = item.pageNum + 1
      // }

      this.setData({
        album: item,
      });
      this.getData(item);
    },

    goDetail(e) {
      this.pageRouter.navigateTo({
        url: `/panel/toy/module/content/album/detail/index?item=${encodeURIComponent(JSON.stringify(e.currentTarget.dataset.item))}&device=${encodeURIComponent(JSON.stringify(this.properties.curDevice))}`,
      });
    },
  },
});
