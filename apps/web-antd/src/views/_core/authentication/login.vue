<script lang="ts" setup>
// 引入 Vben 表单 Schema 类型定义，用于构建动态表单
import type { VbenFormSchema } from '@vben/common-ui';

// 引入核心授权相关的 API 接口类型定义
import type { AuthApi } from '#/api/core/auth';

// 引入 Vue 的核心响应式 API：计算属性(computed)、生命周期钩子(onMounted)、响应式引用(ref)
import { computed, onMounted, ref } from 'vue';
// 引入 Vue Router 的 useRoute 钩子，用于获取当前路由参数
import { useRoute } from 'vue-router';

// 引入 Vben 提供的通用 UI 组件：登录组件(AuthenticationLogin)、验证码组件(Verification) 和 校验库(zod)
import { AuthenticationLogin, Verification, z } from '@vben/common-ui';
// 引入 Vben 的全局钩子：判断是否开启验证码(isCaptchaEnable)、判断是否开启多租户(isTenantEnable)
import { isCaptchaEnable, isTenantEnable } from '@vben/hooks';
// 引入 Vben 的国际化翻译函数
import { $t } from '@vben/locales';
// 引入 Vben 的访问控制状态管理库 (Pinia Store)
import { useAccessStore } from '@vben/stores';

// 引入自定义的授权相关 API 接口
import {
  checkCaptcha, // 校验验证码接口
  getCaptcha, // 获取验证码接口
  getTenantByWebsite, // 根据域名获取租户信息接口
  getTenantSimpleList, // 社交（第三方）登录重定向接口
} from '#/api/core/auth';
// 引入本地业务定义的认证状态管理库 (Pinia Store)
import { useAuthStore } from '#/store';

// 显式定义当前 Vue 组件的名称为 'Login'，方便调试和缓存
defineOptions({ name: 'Login' });

// 获取当前路由对象，主要用于获取 URL 上的 query 参数（如 redirect 回调地址）
const { query } = useRoute();
// 实例化认证相关的 Store
const authStore = useAuthStore();
// 实例化访问权限相关的 Store（用于存取 token、租户ID等）
const accessStore = useAccessStore();
// 调用钩子函数，获取系统是否开启了多租户功能（返回布尔值）
const tenantEnable = isTenantEnable();
// 调用钩子函数，获取系统是否开启了验证码功能（返回布尔值）
const captchaEnable = isCaptchaEnable();

// 创建一个响应式引用，用于绑定并获取登录组件(AuthenticationLogin)的实例
const loginRef = ref();
// 创建一个响应式引用，用于绑定并获取验证码组件(Verification)的实例
const verifyRef = ref();

// 定义验证码的类型为滑块拼图 ('blockPuzzle')，也可以是点选文字 ('clickWord')
const captchaType = 'blockPuzzle'; // 验证码类型：'blockPuzzle' | 'clickWord'
/** 获取租户列表，并默认选中 */
// 创建一个响应式引用，用于存储租户列表数据
const tenantList = ref<AuthApi.TenantResult[]>([]); // 租户列表
// 定义一个异步函数，用于从后端获取租户信息
async function fetchTenantList() {
  // 如果系统没有开启多租户功能，直接返回，不执行后续逻辑
  if (!tenantEnable) {
    return;
  }
  try {
    // 获取租户列表、域名对应租户
    // 发起异步请求：根据当前浏览器窗口的域名(window.location.hostname)获取对应的租户信息
    const websiteTenantPromise = getTenantByWebsite(window.location.hostname);
    // 发起异步请求：获取所有的租户简要列表，并赋值给 tenantList
    tenantList.value = await getTenantSimpleList();

    // 选中租户：域名 > store 中的租户 > 首个租户
    // 初始化一个变量，用于存放最终决定的租户 ID
    let tenantId: null | number = null;
    // 等待根据域名获取租户的请求完成
    const websiteTenant = await websiteTenantPromise;
    // 如果根据域名成功获取到了租户 ID，则优先使用它
    if (websiteTenant?.id) {
      tenantId = websiteTenant.id;
    }
    // 如果没有从域名获取到租户，尝试从 accessStore 缓存中获取之前保存的租户 ID
    if (!tenantId && accessStore.tenantId) {
      tenantId = accessStore.tenantId;
    }
    // 如果还是没有租户，则默认使用获取到的租户列表中的第一个租户 ID
    if (!tenantId && tenantList.value?.[0]?.id) {
      tenantId = tenantList.value[0].id;
    }

    // 将最终决定的租户 ID 保存到 accessStore 中（存入本地缓存）
    accessStore.setTenantId(tenantId);
    // 调用登录表单的 API，将表单中 'tenantId' 字段的值设置为该租户 ID（需要转成字符串）
    loginRef.value.getFormApi().setFieldValue('tenantId', tenantId?.toString());
  } catch (error) {
    // 如果获取租户列表过程中发生异常，在控制台打印错误信息
    console.error('获取租户列表失败:', error);
  }
}

/** 处理登录 */
// 定义处理登录提交按钮点击事件的异步函数，接收表单收集到的值 (values)
async function handleLogin(values: any) {
  // 如果开启验证码，则先验证验证码
  // 检查系统是否开启了验证码功能
  if (captchaEnable) {
    // 如果开启了，则调用验证码组件实例的 show() 方法，弹出验证码弹窗
    verifyRef.value.show();
    // 阻断执行，等待用户完成验证码校验
    return;
  }
  // 无验证码，直接登录
  // 如果没有开启验证码，直接调用 authStore 的登录方法，传入登录类型 'username' 和表单数据
  await authStore.authLogin('username', values);
}

/** 验证码通过，执行登录 */
// 定义验证码校验成功后的回调函数，接收包含验证码凭证的对象
async function handleVerifySuccess({ captchaVerification }: any) {
  try {
    // 验证码通过后，调用 authStore 的登录方法
    await authStore.authLogin('username', {
      // 通过 loginRef 获取表单 API，并拿到用户输入的最新表单数据（账号、密码、租户等）
      ...(await loginRef.value.getFormApi().getValues()),
      // 将验证码成功后返回的凭证附加到登录参数中，一起发送给后端
      captchaVerification,
    });
  } catch (error) {
    // 如果登录过程中发生错误，在控制台打印错误信息
    console.error('Error in handleLogin:', error);
  }
}

/** 处理第三方登录 */
// 获取 URL 参数中的 redirect 值，即登录成功后需要跳回的页面路径
// const redirect = query?.redirect;
// 定义处理第三方（社交）登录的异步函数，接收第三方平台的类型标识 (type)
// async function handleThirdLogin(type: number) {
//   // 如果传入的类型不合法（小于等于 0），直接返回
//   if (type <= 0) {
//     return;
//   }
//   try {
//     // 计算 redirectUri
//     // tricky: type、redirect 需要先 encode 一次，否则钉钉回调会丢失。配合 social-login.vue#getUrlValue() 使用
//     // 拼接回调地址：当前域名 + /auth/social-login 路径，并附带编码后的 type 和 redirect 参数
//     const redirectUri = `${
//       location.origin
//     }/auth/social-login?${encodeURIComponent(
//       `type=${type}&redirect=${redirect || '/'}`,
//     )}`;

//     // 进行跳转
//     // 调用后端接口获取第三方平台的授权跳转链接，并将当前浏览器地址重定向到该链接
//     window.location.href = await socialAuthRedirect(type, redirectUri);
//   } catch (error) {
//     // 如果处理第三方登录发生错误，在控制台打印错误信息
//     console.error('第三方登录处理失败:', error);
//   }
// }

/** 组件挂载时获取租户信息 */
// Vue 生命周期钩子：当组件挂载到 DOM 上后执行
onMounted(() => {
  // 调用获取租户列表的函数
  fetchTenantList();
});

// 使用 computed 计算属性动态生成表单的结构配置 (Schema)
const formSchema = computed((): VbenFormSchema[] => {
  // 返回一个数组，每个对象代表表单中的一个输入项
  return [
    {
      // 1. 租户选择框配置
      component: 'VbenSelect', // 指定使用的组件为 Vben 封装的下拉选择框
      componentProps: {
        // 将获取到的租户列表映射为下拉框需要的 options 格式 (label, value)
        options: tenantList.value.map((item) => ({
          label: item.name,
          value: item.id.toString(),
        })),
        // 设置下拉框的占位符文本（国际化翻译）
        placeholder: $t('authentication.tenantTip'),
      },
      fieldName: 'tenantId', // 对应表单数据模型中的字段名为 'tenantId'
      label: $t('authentication.tenant'), // 表单项的标签文本（如 "租户"）
      // 使用 zod 定义校验规则：必须是字符串且长度至少为 1，否则提示错误信息
      rules: z.string().min(1, { message: $t('authentication.tenantTip') }),
      dependencies: {
        // 定义依赖关系，当 'tenantId' 字段的值发生变化时触发
        triggerFields: ['tenantId'],
        // 仅当 tenantEnable (开启多租户) 为 true 时，才在页面上渲染此组件
        if: tenantEnable,
        // 当该字段值发生变化时执行的回调逻辑
        trigger(values) {
          // 如果选中了新的租户，则将其更新到 accessStore 中
          if (values.tenantId) {
            accessStore.setTenantId(Number(values.tenantId));
          }
        },
      },
    },
    {
      // 2. 用户名输入框配置
      component: 'VbenInput', // 指定使用的组件为普通文本输入框
      componentProps: {
        // 设置输入框的占位符文本（国际化翻译）
        placeholder: $t('authentication.usernameTip'),
      },
      fieldName: 'username', // 对应表单数据模型中的字段名为 'username'
      label: $t('authentication.username'), // 表单项的标签文本（如 "账号"）
      // 使用 zod 定义校验规则：必填，并设置从环境变量读取的默认值
      rules: z
        .string()
        .min(1, { message: $t('authentication.usernameTip') })
        .default(import.meta.env.VITE_APP_DEFAULT_USERNAME),
    },
    {
      // 3. 密码输入框配置
      component: 'VbenInputPassword', // 指定使用的组件为密码输入框（带眼睛图标隐藏/显示）
      componentProps: {
        // 设置输入框的占位符文本（国际化翻译）
        placeholder: $t('authentication.passwordTip'),
      },
      fieldName: 'password', // 对应表单数据模型中的字段名为 'password'
      label: $t('authentication.password'), // 表单项的标签文本（如 "密码"）
      // 使用 zod 定义校验规则：必填，并设置从环境变量读取的默认值
      rules: z
        .string()
        .min(1, { message: $t('authentication.passwordTip') })
        .default(import.meta.env.VITE_APP_DEFAULT_PASSWORD),
    },
  ];
});
</script>

<template>
  <!-- 根节点 div -->
  <div>
    <!-- 使用 Vben 封装的通用登录组件 -->
    <AuthenticationLogin
      ref="loginRef"
      :form-schema="formSchema"
      :loading="authStore.loginLoading"
      @submit="handleLogin"
      @third-login="handleThirdLogin"
    />
    <!-- 验证码组件，仅在 captchaEnable 为 true 时才渲染 -->
    <Verification
      ref="verifyRef"
      v-if="captchaEnable"
      :captcha-type="captchaType"
      :check-captcha-api="checkCaptcha"
      :get-captcha-api="getCaptcha"
      :img-size="{ width: '400px', height: '200px' }"
      mode="pop"
      @on-success="handleVerifySuccess"
    />
  </div>
</template>
