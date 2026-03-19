import type { AuthPermissionInfo, Recordable, UserInfo } from '@vben/types';

import type { AuthApi } from '#/api';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { ElNotification } from 'element-plus';
import { defineStore } from 'pinia';

import {
  getAuthPermissionInfoApi,
  loginApi,
  logoutApi,
  register,
  smsLogin,
  socialLogin,
} from '#/api';
import { $t } from '#/locales';

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  const loginLoading = ref(false);

  /**
   * 异步处理登录操作
   * Asynchronously handle the login process
   * @param type 登录类型
   * @param params 登录表单数据
   * @param onSuccess 登录成功后的回调函数
   */
  async function authLogin(
    type: 'mobile' | 'register' | 'social' | 'username',
    params: Recordable<any>,
    onSuccess?: () => Promise<void> | void,
  ) {
    // 异步处理用户登录操作并获取 accessToken
    let userInfo: null | UserInfo = null;
    try {
      let loginResult: AuthApi.LoginResult;
      loginLoading.value = true;
      switch (type) {
        case 'mobile': {
          loginResult = await smsLogin(params as AuthApi.SmsLoginParams);
          break;
        }
        case 'register': {
          loginResult = await register(params as AuthApi.RegisterParams);
          break;
        }
        case 'social': {
          loginResult = await socialLogin(params as AuthApi.SocialLoginParams);
          break;
        }
        default: {
          loginResult = await loginApi(params);
        }
      }
      const { accessToken, refreshToken } = loginResult;

      // 如果成功获取到 accessToken
      if (accessToken) {
        accessStore.setAccessToken(accessToken);
        accessStore.setRefreshToken(refreshToken);

        // 获取用户信息并存储到 userStore、accessStore 中
        // TODO @芋艿：清理掉 accessCodes 相关的逻辑
        // const [fetchUserInfoResult, accessCodes] = await Promise.all([
        //   fetchUserInfo(),
        //   // getAccessCodesApi(),
        // ]);
        const fetchUserInfoResult = await fetchUserInfo();

        userInfo = fetchUserInfoResult.user;

        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false);
        } else {
          onSuccess
            ? await onSuccess?.()
            : await router.push(
                userInfo.homePath || preferences.app.defaultHomePath,
              );
        }

        if (userInfo?.nickname) {
          ElNotification.success({
            message: `${$t('authentication.loginSuccessDesc')}:${userInfo?.nickname}`,
            duration: 3,
            title: $t('authentication.loginSuccess'),
          });
        }
      }
    } finally {
      loginLoading.value = false;
    }

    return {
      userInfo,
    };
  }

  async function logout(redirect: boolean = true) {
    try {
      const accessToken = accessStore.accessToken as string;
      if (accessToken) {
        await logoutApi(accessToken);
      }
    } catch {
      // 不做任何处理
    }
    resetAllStores();
    accessStore.setLoginExpired(false);

    // 回登录页带上当前路由地址
    await router.replace({
      path: LOGIN_PATH,
      query: redirect
        ? {
            redirect: encodeURIComponent(router.currentRoute.value.fullPath),
          }
        : {},
    });
  }

  async function fetchUserInfo() {
    // 加载
    const authPermissionInfo: AuthPermissionInfo | null =
      await getAuthPermissionInfoApi();
    
    // add by 芋艿：打印后端返回的菜单数据，方便调试
    // console.log('后端返回的菜单数据:', authPermissionInfo?.menus);
    
    // 只保留"概览"菜单
    const dashboardMenu = authPermissionInfo?.menus?.find(
      (menu) => menu.name === '概览' || menu.path === '/dashboard'
    );
    const filteredMenus = dashboardMenu ? [dashboardMenu] : [];
    
    // userStore
    userStore.setUserInfo(authPermissionInfo.user);
    userStore.setUserRoles(authPermissionInfo.roles);
    // accessStore
    accessStore.setAccessMenus(filteredMenus);
    accessStore.setAccessCodes(authPermissionInfo.permissions);
    
    // add by 芋艿：打印设置后的 accessMenus
    // console.log('设置后的 accessMenus:', accessStore.accessMenus);
    
    // 根据租户 ID 设置用户角色
    const currentTenantId = accessStore.tenantId;
    if (currentTenantId === 1) {
      accessStore.setAccessRoles(['admin']);
    } else {
      accessStore.setAccessRoles(['user']);
    }
    
    return authPermissionInfo;
  }

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    fetchUserInfo,
    loginLoading,
    logout,
  };
});
