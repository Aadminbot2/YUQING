import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:layers',
      title: '全部平台',
      order: 10,
    },
    name: 'Platform',
    path: '/platform',
    children: [
      {
        name: 'DouyinPlatform',
        path: '/platform/douyin',
        component: () => import('#/views/platform/douyin/index.vue'),
        meta: {
          icon: 'ri:tiktok-fill',
          title: '抖音',
        },
      },
      {
        name: 'KuaishouPlatform',
        path: '/platform/kuaishou',
        component: () => import('#/views/platform/kuaishou/index.vue'),
        meta: {
          icon: 'ri:video-line',
          title: '快手',
        },
      },
      {
        name: 'XiaohongshuPlatform',
        path: '/platform/xiaohongshu',
        component: () => import('#/views/platform/xiaohongshu/index.vue'),
        meta: {
          icon: 'simple-icons:xiaohongshu',
          title: '小红书',
        },
      },
      {
        name: 'ZhihuPlatform',
        path: '/platform/zhihu',
        component: () => import('#/views/platform/zhihu/index.vue'),
        meta: {
          icon: 'ri:zhihu-line',
          title: '知乎',
        },
      },
      {
        name: 'BilibiliPlatform',
        path: '/platform/bilibili',
        component: () => import('#/views/platform/bilibili/index.vue'),
        meta: {
          icon: 'ri:bilibili-line',
          title: 'B站',
        },
      },
      {
        name: 'WeiboPlatform',
        path: '/platform/weibo',
        component: () => import('#/views/platform/weibo/index.vue'),
        meta: {
          icon: 'ri:weibo-line',
          title: '微博',
        },
      },
    ],
  },
];

export default routes;
