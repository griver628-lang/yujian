/**
 * 治愈背景音乐与交互音效服务
 * 专为女性生理期情绪安抚设计的每日轻音乐与白噪音播放引擎
 */
import { ref } from 'vue';

export interface MusicTrack {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  url: string;
  duration?: number;
}

// 精选女性生理期舒缓治愈曲库（本地无损压缩包，真机免联网零延迟即时发声）
export const HEALING_PLAYLIST: MusicTrack[] = [
  {
    id: 'track-1',
    title: '静谧浅梦',
    subtitle: '柔和钢琴 · 舒缓神经与紧绷情绪',
    category: '慢板轻琴',
    url: '/static/audio/soothing-piano.mp3',
  },
  {
    id: 'track-2',
    title: '暖腹安神',
    subtitle: '432Hz 治愈和弦 · 暖胃舒缓小腹',
    category: '冥想暖音',
    url: '/static/audio/healing-ambient.mp3',
  },
  {
    id: 'track-3',
    title: '晨曦微风',
    subtitle: '温暖吉他 · 抚平经期敏感焦虑',
    category: '温柔伴眠',
    url: '/static/audio/gentle-lullaby.mp3',
  },
];

class AudioService {
  private audioCtx: any = null;
  private hasRetriedPath = false;

  public isPlaying = ref(false);
  public currentTrack = ref<MusicTrack>(HEALING_PLAYLIST[0]);
  public musicEnabled = ref(true);
  public soundEffectsEnabled = ref(true);

  constructor() {
    this.initSettings();
    this.initAudioContext();
  }

  /**
   * 初始化存储设置 (默认开启音乐，除非用户在设置中主动关闭)
   */
  public initSettings() {
    try {
      const musicPref = uni.getStorageSync('setting_music_enabled');
      if (musicPref === false || musicPref === 'false') {
        this.musicEnabled.value = false;
      } else {
        // 默认开启背景音乐
        this.musicEnabled.value = true;
      }

      const sfxPref = uni.getStorageSync('setting_sfx_enabled');
      if (sfxPref === false || sfxPref === 'false') {
        this.soundEffectsEnabled.value = false;
      } else {
        this.soundEffectsEnabled.value = true;
      }
    } catch (e) {
      this.musicEnabled.value = true;
      this.soundEffectsEnabled.value = true;
    }

    // 根据今日日期选择今天专属曲目
    this.currentTrack.value = this.getTodayRecommendedTrack();
  }

  /**
   * 基于今天的日期获取每日推荐曲目
   */
  public getTodayRecommendedTrack(): MusicTrack {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = (hash << 5) - hash + dateStr.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % HEALING_PLAYLIST.length;
    return HEALING_PLAYLIST[index];
  }

  /**
   * 确保微信音频选项生效（解除 iOS 静音拨片阻断）
   */
  public ensureAudioOptions() {
    try {
      // @ts-ignore
      const setOptionFn = (typeof wx !== 'undefined' && typeof wx.setInnerAudioOption === 'function')
        // @ts-ignore
        ? wx.setInnerAudioOption
        : (typeof uni !== 'undefined' && typeof uni.setInnerAudioOption === 'function' ? uni.setInnerAudioOption : null);

      if (setOptionFn) {
        setOptionFn({
          obeyMuteSwitch: false, // 强制解除静音开关，无论是否开启静音拨片都能发声
          mixWithOther: true,    // 允许与其他应用音效共存
          fail: (err: any) => {
            console.warn('⚠️ 设置静音模式失败:', err);
          },
        });
      }
    } catch (e) {
      console.warn('音频选项设置捕获:', e);
    }
  }

  /**
   * 初始化音频实例
   */
  private initAudioContext() {
    this.ensureAudioOptions();

    try {
      // 优先使用原生 wx.createInnerAudioContext 或 uni.createInnerAudioContext
      // @ts-ignore
      const createFn = (typeof wx !== 'undefined' && typeof wx.createInnerAudioContext === 'function')
        // @ts-ignore
        ? wx.createInnerAudioContext
        : (typeof uni !== 'undefined' && typeof uni.createInnerAudioContext === 'function' ? uni.createInnerAudioContext : null);

      if (createFn) {
        this.audioCtx = createFn({
          useWebAudioImplement: false, // 采用原生音频组件，规避 iOS WebAudio 挂起
        });
        this.audioCtx.obeyMuteSwitch = false;
        this.audioCtx.loop = true;

        this.audioCtx.onPlay(() => {
          this.isPlaying.value = true;
          this.hasRetriedPath = false;
          console.log('🎵 [愈见治愈音乐] 开始正常播放:', this.currentTrack.value.title);
        });

        this.audioCtx.onPause(() => {
          this.isPlaying.value = false;
          console.log('⏸️ [愈见治愈音乐] 已暂停');
        });

        this.audioCtx.onStop(() => {
          this.isPlaying.value = false;
        });

        this.audioCtx.onEnded(() => {
          this.nextTrack();
        });

        this.audioCtx.onError((err: any) => {
          console.warn('⚠️ [愈见治愈音乐播放异常]:', err);
          this.isPlaying.value = false;

          // 路径兼容智能自动重试（针对部分机型对前导斜杠或相对路径的解析差异）
          const currentSrc = this.audioCtx?.src || '';
          if (currentSrc.startsWith('/static/') && !this.hasRetriedPath) {
            this.hasRetriedPath = true;
            const fallback = currentSrc.slice(1); // 尝试去除斜杠: static/audio/...
            console.log('🔄 [愈见音乐] 尝试相对路径备用方案:', fallback);
            try {
              this.audioCtx.src = fallback;
              this.audioCtx.play();
            } catch (e) {}
          } else if (!currentSrc.startsWith('/') && currentSrc.startsWith('static/') && !this.hasRetriedPath) {
            this.hasRetriedPath = true;
            const fallback = '/' + currentSrc; // 尝试加上斜杠: /static/audio/...
            console.log('🔄 [愈见音乐] 尝试绝对路径备用方案:', fallback);
            try {
              this.audioCtx.src = fallback;
              this.audioCtx.play();
            } catch (e) {}
          }
        });
      }
    } catch (e) {
      console.warn('音频模块初始化环境提示:', e);
    }
  }

  /**
   * 默认自动播放（页面加载/切回前台时调用）
   * 遵循用户偏好：只要未在设置中手动关闭，即默认自动启动播放
   */
  public autoPlay() {
    this.initSettings();
    if (!this.musicEnabled.value) {
      console.log('🔇 [愈见音乐] 用户偏好已关闭背景音乐');
      return;
    }
    if (this.isPlaying.value) {
      return;
    }
    console.log('▶️ [愈见音乐] 触发默认自动播放:', this.currentTrack.value.title);
    this.play();
  }

  /**
   * 针对部分 iOS 系统限制无手势拦截自动播放的无感唤醒机制：
   * 用户在屏幕上的任何轻触/滑动时，若未在播放则立即触发启动
   */
  public handleUserInteraction() {
    if (this.musicEnabled.value && !this.isPlaying.value) {
      console.log('👆 [愈见音乐] 屏幕手势触发默认播放唤醒');
      this.play();
    }
  }

  /**
   * 播放当前曲目
   */
  public play() {
    if (!this.audioCtx) {
      this.initAudioContext();
    }
    if (!this.audioCtx) return;

    try {
      this.ensureAudioOptions();
      const track = this.currentTrack.value;
      
      // 检查当前 src 是否已设置
      const currentSrc = this.audioCtx.src || '';
      if (!currentSrc || (!currentSrc.endsWith(track.url) && !currentSrc.endsWith(track.url.slice(1)))) {
        this.audioCtx.src = track.url;
      }
      this.audioCtx.play();
      this.isPlaying.value = true;
    } catch (e) {
      console.warn('播放音频调用异常:', e);
    }
  }

  /**
   * 暂停背景音乐
   */
  public pause() {
    if (this.audioCtx) {
      try {
        this.audioCtx.pause();
      } catch (e) {}
    }
    this.isPlaying.value = false;
  }

  /**
   * 切换播放/暂停（带友好状态提示）
   */
  public togglePlay() {
    if (this.isPlaying.value) {
      this.pause();
      uni.showToast({
        title: '已暂停音乐',
        icon: 'none',
        duration: 1500,
      });
    } else {
      // 用户主动点击试听/播放时，自动同步开启开关
      if (!this.musicEnabled.value) {
        this.setMusicEnabled(true);
      }
      this.play();
      uni.showToast({
        title: `正在播放: ${this.currentTrack.value.title}`,
        icon: 'none',
        duration: 2000,
      });
    }
  }

  /**
   * 下一曲
   */
  public nextTrack() {
    const currentIndex = HEALING_PLAYLIST.findIndex((t) => t.id === this.currentTrack.value.id);
    const nextIndex = (currentIndex + 1) % HEALING_PLAYLIST.length;
    this.currentTrack.value = HEALING_PLAYLIST[nextIndex];
    if (this.audioCtx) {
      this.audioCtx.src = this.currentTrack.value.url;
      if (this.isPlaying.value || this.musicEnabled.value) {
        this.audioCtx.play();
        this.isPlaying.value = true;
      }
    }
  }

  /**
   * 设置背景音乐开关
   */
  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled.value = enabled;
    try {
      uni.setStorageSync('setting_music_enabled', enabled);
    } catch (e) {}

    if (!enabled) {
      this.pause();
    } else {
      this.play();
    }
  }

  /**
   * 设置交互音效开关
   */
  public setSoundEffectsEnabled(enabled: boolean) {
    this.soundEffectsEnabled.value = enabled;
    try {
      uni.setStorageSync('setting_sfx_enabled', enabled);
    } catch (e) {}
  }

  /**
   * 播放轻触打卡/保存成功微音效（带开关判定）
   */
  public playClickFeedback() {
    if (!this.soundEffectsEnabled.value) return;

    try {
      // @ts-ignore
      if (typeof uni !== 'undefined' && typeof uni.vibrateShort === 'function') {
        // @ts-ignore
        uni.vibrateShort({ type: 'light' });
      }
    } catch (e) {}
  }
}

export const audioService = new AudioService();
