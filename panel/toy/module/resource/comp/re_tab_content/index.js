import { currencyUnitMap } from "../../../../api/bss"

Component({
  properties: {
    packageList: {
      type: Array,
      value: [],
    },
    emptyText: {
      type: String,
      value: "暂无套餐",
    },
    serviceDesc: {
      type: Array,
      value: [],
    },
    selectedIndex: {
      type: Number,
      value: 0,
    },
    emptyImg: {
      type: String,
      value: "",
    },
    curPackageStatus: {
      type: Boolean,
      value: true,
    },
  },

  data: {
    currencyUnitMap,
  },

  methods: {
    onSelectPackage(e) {
      const { index } = e.currentTarget.dataset
      this.triggerEvent("selectPackage", { index })
    },
  },
})
