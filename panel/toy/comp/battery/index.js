const plugin = requirePlugin("quecPlugin");

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    batteryObj:{
      type:Object
    },
    curItem: {
      type: Object,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    show: false,
  },
  pageLifetimes: {},
  observers: {
  
  },
  /**
   * 组件的方法列表
   */
  methods: {
  },
  ready(){
    console.log("当前组件的batteryObj：",this.properties.batteryObj)
  }
});
