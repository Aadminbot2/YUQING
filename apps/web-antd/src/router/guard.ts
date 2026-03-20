import type { Router } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { $t } from '@vben/locales';
import { preferences } from '@vben/preferences';
import { useAccessStore, useDictStore, useUserStore } from '@vben/stores';
import { startProgress, stopProgress } from '@vben/utils';

import { message } from 'ant-design-vue';

import { getSimpleDictDataList } from '#/api/system/dict/data';
import { accessRoutes, coreRouteNames } from '#/router/routes';
import { useAuthStore } from '#/store';

import { generateAccess } from './access';

/**
 * 通用守卫配置
 * @param router
 */
function setupCommonGuard(router: Router) {
  // 记录已经加载的页面
  const loadedPaths = new Set<string>();

  router.beforeEach((to) => {
    to.meta.loaded = loadedPaths.has(to.path);

    // 页面加载进度条
    if (!to.meta.loaded && preferences.transition.progress) {
      startProgress();
    }
    return true;
  });

  router.afterEach((to) => {
    // 记录页面是否加载,如果已经加载，后续的页面切换动画等效果不在重复执行

    loadedPaths.add(to.path);

    // 关闭页面加载进度条
    if (preferences.transition.progress) {
      stopProgress();
    }
  });
}

/**
 * 权限访问守卫配置
 * @param router
 */
function setupAccessGuard(router: Router) {
  router.beforeEach(async (to, from) => {
    const accessStore = useAccessStore();
    const userStore = useUserStore();
    const authStore = useAuthStore();
    const dictStore = useDictStore();

    // 基本路由，这些路由不需要进入权限拦截
    if (coreRouteNames.includes(to.name as string)) {
      if (to.path === LOGIN_PATH && accessStore.accessToken) {
        return decodeURIComponent(
          (to.query?.redirect as string) ||
            userStore.userInfo?.homePath ||
            preferences.app.defaultHomePath,
        );
      }
      return true;
    }

    // accessToken 检查
    if (!accessStore.accessToken) {
      // 明确声明忽略权限访问权限，则可以访问
      if (to.meta.ignoreAccess) {
        return true;
      }

      // 没有访问权限，跳转登录页面
      if (to.fullPath !== LOGIN_PATH) {
        return {
          path: LOGIN_PATH,
          // 如不需要，直接删除 query
          query:
            to.fullPath === preferences.app.defaultHomePath
              ? {}
              : { redirect: encodeURIComponent(to.fullPath) },
          // 携带当前跳转的页面，登录后重新跳转该页面
          replace: true,
        };
      }
      return to;
    }

    // 是否已经生成过动态路由
    if (accessStore.isAccessChecked) {
      return true;
    }

    // 加载字典数据（不阻塞加载）
    dictStore.setDictCacheByApi(getSimpleDictDataList);

    // 生成路由表
    // 当前登录用户拥有的角色标识列表
    let userInfo = userStore.userInfo;
    if (!userInfo) {
      // add by 芋艿：由于 yudao 是 fetchUserInfo 统一加载用户 + 权限信息，所以将 fetchMenuListAsync
      const loading = message.loading({
        content: `${$t('common.loadingMenu')}...`,
      });
      try {
        const authPermissionInfo = await authStore.fetchUserInfo();
        if (authPermissionInfo) {
          userInfo = authPermissionInfo.user;
        }
      } finally {
        loading();
      }
    }
    const userRoles = userStore.userRoles ?? [];

    // 生成菜单和路由
    const { accessibleMenus, accessibleRoutes } = await generateAccess({
      roles: userRoles,
      router,
      // 则会在菜单中显示，但是访问会被重定向到403
      routes: accessRoutes,
    });

    // --- 新增：全局黑名单过滤（强制隐藏指定路由） ---
    const blacklist = [
      '/bpm',
      '/member',
      '/mall',
      '/mp',
      '/crm',
      '/erp',
      '/ai',
      '/iot',
      '/pay',
      '/system',
      '/infra',
      '/report',
      'http', // 过滤所有外链
    ];

    const globalFilter = (items: any[]) => {
      return items.filter((item) => {
        // 检查当前项是否在黑名单中
        const isBlacklisted = blacklist.some((path) => {
          if (path === 'http') {
            return (
              item.path?.startsWith('http://') ||
              item.path?.startsWith('https://')
            );
          }
          return item.path === path || item.path?.startsWith(`${path}/`);
        });
        if (isBlacklisted) {
          return false;
        }
        // 如果有子项，递归过滤
        if (item.children && item.children.length > 0) {
          item.children = globalFilter(item.children);
        }
        return true;
      });
    };

    // 对所有用户（包括 admin）应用黑名单过滤
    const finalMenus = globalFilter([...accessibleMenus]);
    const finalRoutes = globalFilter([...accessibleRoutes]);

    const currentRole = accessStore.accessRoles?.[0] || 'user'; // 默认普通用户
    // 如果是超级管理员 (admin)，则拥有所有权限，不进行过滤
    if (currentRole === 'admin') {
      accessStore.setAccessMenus(finalMenus);
      accessStore.setAccessRoutes(finalRoutes);
    } else {
      // 普通用户 (user)：只保留白名单路由
      // 定义白名单路由 path (需要根据实际业务调整，这里是示例)
      const whiteList = [
        '/dashboard',
        '/dashboard/analytics',
        '/dashboard/workspace',
        // 确保包含 403, 404 等基础页面
        '/403',
        '/404',
        '/500',
        '/profile',
        '/profile/index',
      ];

      // 递归过滤菜单
      const filterMenus = (menus: any[]) => {
        return menus
          .map((menu) => {
            // 深拷贝，避免修改原始对象
            const newMenu = { ...menu };

            // 如果有子菜单，先递归过滤子菜单
            if (newMenu.children && newMenu.children.length > 0) {
              newMenu.children = filterMenus(newMenu.children);
            }

            // 判断当前菜单是否应该保留：
            // 1. 如果它在白名单里，保留
            // 2. 或者它的子菜单里有保留项（children 长度 > 0），也应该保留父级
            const isInWhiteList = whiteList.some(
              (path) =>
                newMenu.path === path || newMenu.path.startsWith(`${path}/`),
            );
            const hasValidChildren =
              newMenu.children && newMenu.children.length > 0;

            if (isInWhiteList || hasValidChildren) {
              return newMenu;
            }
            return null;
          })
          .filter((menu) => menu !== null); // 移除被过滤掉的项 (null)
      };

      // 递归过滤路由 (AccessRoutes)
      const filterRoutes = (routes: any[]) => {
        return routes.filter((route) => {
          // 始终保留 layout 等容器路由，只过滤实际页面
          if (route.component && route.children) {
            route.children = filterRoutes(route.children);
            // 如果子路由过滤完为空，且不是 layout 组件，则不保留
            return route.children.length > 0;
          }
          return whiteList.some(
            (path) => route.path === path || route.path.startsWith(`${path}/`),
          );
        });
      };

      // 在黑名单过滤的基础上，再应用白名单过滤
      const filteredMenus = filterMenus(finalMenus);
      const filteredRoutes = filterRoutes(finalRoutes);

      accessStore.setAccessMenus(filteredMenus);
      accessStore.setAccessRoutes(filteredRoutes);
    }
    // --- 新增结束 ---

    accessStore.setIsAccessChecked(true);
    userStore.setUserRoles(userRoles);
    const redirectPath = (from.query.redirect ??
      (to.path === preferences.app.defaultHomePath
        ? userInfo?.homePath || preferences.app.defaultHomePath
        : to.fullPath)) as string;

    return {
      ...router.resolve(decodeURIComponent(redirectPath)),
      replace: true,
    };
  });
}

/**
 * 项目守卫配置
 * @param router
 */
function createRouterGuard(router: Router) {
  /** 通用 */
  setupCommonGuard(router);
  /** 权限访问 */
  setupAccessGuard(router);
}

export { createRouterGuard };
