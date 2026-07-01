const plugin = requirePlugin('quecPlugin')

let conConst = {
  storageCode: 'ai_content_cur_play',//当前播放专辑key

  //儿童类目
  childMenu: [
    {
      img: plugin.main.getRootImg() + 'ai/new/content/child_menu1.png',
      name: '儿歌'
    },
    {
      img: plugin.main.getRootImg() + 'ai/new/content/child_menu2.png',
      name: '故事'
    },
    {
      img: plugin.main.getRootImg() + 'ai/new/content/child_menu3.png',
      name: '百科'
    },
    {
      img: plugin.main.getRootImg() + 'ai/new/content/child_menu4.png',
      name: '国学'
    },
    {
      img: plugin.main.getRootImg() + 'ai/new/content/child_menu5.png',
      name: '诗词'
    },
    {
      img: plugin.main.getRootImg() + 'ai/new/content/child_menu6.png',
      name: '动画'
    },
  ],

  //音乐类目
  musicMenu: [
    {
      img: plugin.main.getRootImg() + 'ai/new/content/music_menu1.png',
      name: '儿歌'
    },
    {
      img: plugin.main.getRootImg() + 'ai/new/content/music_menu2.png',
      name: '甄选歌单'
    },
    {
      img: plugin.main.getRootImg() + 'ai/new/content/music_menu3.png',
      name: '流行音乐'
    },
    {
      img: plugin.main.getRootImg() + 'ai/new/content/music_menu4.png',
      name: '精选音乐'
    },
    {
      img: plugin.main.getRootImg() + 'ai/new/content/music_menu5.png',
      name: '厂牌音乐'
    },
    {
      img: plugin.main.getRootImg() + 'ai/new/content/music_menu6.png',
      name: '官方音乐'
    }
  ],

  //文学类目
  cultureMenu: [
    {
      img: plugin.main.getRootImg() + 'ai/new/content/culture_menu1.png',
      name: '名著'
    },
    {
      img: plugin.main.getRootImg() + 'ai/new/content/culture_menu2.png',
      name: '诗词'
    },
    {
      img: plugin.main.getRootImg() + 'ai/new/content/culture_menu3.png',
      name: '散文'
    },
    {
      img: plugin.main.getRootImg() + 'ai/new/content/culture_menu4.png',
      name: '小说'
    }
  ],

  //亲子类目
  parentMenu: [
    {
      img: plugin.main.getRootImg() + 'ai/new/content/parent_menu1.png',
      name: '亲子'
    },
    {
      img: plugin.main.getRootImg() + 'ai/new/content/parent_menu2.png',
      name: '家庭教育'
    },
    {
      img: plugin.main.getRootImg() + 'ai/new/content/parent_menu3.png',
      name: '好习惯'
    },
    {
      img: plugin.main.getRootImg() + 'ai/new/content/parent_menu4.png',
      name: '安全教育'
    }
  ],

  default_album_img: plugin.main.getRootImg() + 'ai/new/content/default_album_img.png',

  default_album: plugin.main.getRootImg() + 'ai/new/content/album_default.png',
  album_bg: plugin.main.getRootImg() + 'ai/new/content/album_img_bg.png',

  album_detail_img: plugin.main.getRootImg() + 'ai/new/content/album_img.png',

  icon_play: plugin.main.getRootImg() + 'ai/new/content/icon_play.png',
  icon_pause: plugin.main.getRootImg() + 'ai/new/content/icon_pause.png',

  play_close: plugin.main.getRootImg() + 'ai/new/content/play_close.png',
  prev: plugin.main.getRootImg() + 'ai/new/content/prev.png',
  prev_hui: plugin.main.getRootImg() + 'ai/new/content/prev_hui.png',

  next: plugin.main.getRootImg() + 'ai/new/content/next.png',
  next_hui: plugin.main.getRootImg() + 'ai/new/content/next_hui.png',

  bo: plugin.main.getRootImg() + 'ai/new/content/bo.png?v=1.0',
  bo_hui: plugin.main.getRootImg() + 'ai/new/content/bo_hui.png?v=1.0',
  pause: plugin.main.getRootImg() + 'ai/new/content/pause.png?v=1.0',

  huanyihuan:plugin.main.getRootImg() + 'ai/new/content/huanyihuan.png?v=1.0'
}

module.exports = conConst