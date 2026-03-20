import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'ant-design:fund-projection-screen-outlined',
      order: 1000,
      title: '可视化',
    },
    name: 'Visualization',
    path: '/visualization',
    children: [
      {
        name: 'VisualizationBigScreenLink',
        path: 'big-screen-link',
        component: () => import('#/views/visualization/big-screen/index.vue'), // Dummy component, won't be rendered due to redirect?
        // Actually, if we redirect, component might not be needed, but TS might require it or Vben menu might need it.
        // We can use a dummy component.
        meta: {
          icon: 'ant-design:desktop-outlined',
          title: '可视化大屏',
          openInNewWindow: true,
        },
        redirect: '/big-screen',
      },
    ],
  },
  {
    component: () => import('#/views/visualization/big-screen/index.vue'),
    meta: {
      hideInMenu: true,
      title: '可视化大屏展示',
    },
    name: 'VisualizationBigScreen',
    path: '/big-screen',
  },
];

export default routes;
