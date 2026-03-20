<script lang="ts" setup>
import type {
  WorkbenchQuickNavItem,
  WorkbenchTodoItem,
  WorkbenchTrendItem,
} from '@vben/common-ui';

import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import {
  useVbenModal,
  WorkbenchHeader,
  WorkbenchQuickNav,
  WorkbenchTodo,
  WorkbenchTrends,
} from '@vben/common-ui';
import { preferences } from '@vben/preferences';
import { useUserStore } from '@vben/stores';
import { openWindow } from '@vben/utils';

import { Button, Input } from 'ant-design-vue';

const userStore = useUserStore();

// 系统公告数据
const noticeList = [
  {
    title: '舆情系统 V2.0 版本升级更新公告',
    type: '系统通知',
    color: 'blue',
    datetime: '2026-03-15 10:00:00',
    description: '本次升级优化了各大平台的抓取速率，并新增了 AI 情感分析模型。',
  },
  {
    title: '关于近期部分节点网络波动的说明',
    type: '维护通知',
    color: 'orange',
    datetime: '2026-03-14 14:30:00',
    description:
      '因机房网络割接，可能导致部分社交平台数据抓取延迟，预计明日恢复。',
  },
  {
    title: '新增【小红书】平台数据源抓取功能',
    type: '功能发布',
    color: 'green',
    datetime: '2026-03-12 09:15:00',
    description: '现已支持小红书图文笔记的关键词监测与评论抓取，欢迎体验。',
  },
  {
    title: '3月份第一周全网舆情宏观分析报告已发布',
    type: '业务播报',
    color: 'purple',
    datetime: '2026-03-08 17:00:00',
    description: '系统已自动生成本周宏观报告，涵盖主要行业及竞品动态。',
  },
];

// 同样，这里的 url 也可以使用以 http 开头的外部链接
const quickNavItems: WorkbenchQuickNavItem[] = [
  {
    color: '#1fdaca',
    icon: 'ion:home-outline',
    title: '首页',
    url: '/',
  },
  {
    color: '#ff6b6b',
    icon: 'lucide:shopping-bag',
    title: '商城中心',
    url: '/mall',
  },
  {
    color: '#7c3aed',
    icon: 'tabler:ai',
    title: 'AI 大模型',
    url: '/ai',
  },
  {
    color: '#3fb27f',
    icon: 'simple-icons:erpnext',
    title: 'ERP 系统',
    url: '/erp',
  },
  {
    color: '#4daf1bc9',
    icon: 'simple-icons:civicrm',
    title: 'CRM 系统',
    url: '/crm',
  },
  {
    color: '#1a73e8',
    icon: 'fa-solid:hdd',
    title: 'IoT 物联网',
    url: '/iot',
  },
];

const todoItems = ref<WorkbenchTodoItem[]>([
  {
    completed: false,
    content: `系统支持 JDK 8/17/21，Vue 2/3`,
    date: '2024-07-15 09:30:00',
    title: '技术兼容性',
  },
  {
    completed: false,
    content: `后端提供 Spring Boot 2.7/3.2 + Cloud 双架构`,
    date: '2024-08-30 14:20:00',
    title: '架构灵活性',
  },
  {
    completed: false,
    content: `全部开源，个人与企业可 100% 直接使用，无需授权`,
    date: '2024-07-25 16:45:00',
    title: '开源免授权',
  },
  {
    completed: false,
    content: `国内使用最广泛的快速开发平台，远超 10w+ 企业使用`,
    date: '2024-07-10 11:15:00',
    title: '广泛企业认可',
  },
]);
const trendItems: WorkbenchTrendItem[] = [
  {
    content: `在 <a>开源组</a> 创建了项目 <a>Vue</a>`,
    date: '刚刚',
    title: '威廉',
  },
  {
    content: `关注了 <a>威廉</a> `,
    date: '1个小时前',
    title: '艾文',
  },
  {
    content: `发布了 <a>个人动态</a> `,
    date: '1天前',
    title: '克里斯',
  },
  {
    content: `发表文章 <a>如何编写一个Vite插件</a> `,
    date: '2天前',
    title: 'Vben',
  },
  {
    content: `回复了 <a>杰克</a> 的问题 <a>如何进行项目优化？</a>`,
    date: '3天前',
    title: '皮特',
  },
  {
    content: `关闭了问题 <a>如何运行项目</a> `,
    date: '1周前',
    title: '杰克',
  },
  {
    content: `发布了 <a>个人动态</a> `,
    date: '1周前',
    title: '威廉',
  },
  {
    content: `推送了代码到 <a>Github</a>`,
    date: '2021-04-01 20:00',
    title: '威廉',
  },
  {
    content: `发表文章 <a>如何编写使用 Admin Vben</a> `,
    date: '2021-03-01 20:00',
    title: 'Vben',
  },
];

const todoForm = reactive({
  title: '',
  content: '',
});

const [TodoModal, modalApi] = useVbenModal({
  title: '添加待办',
  async onConfirm() {
    console.log('正在调用接口提交数据...');
    console.log('标题:', todoForm.title);
    console.log('内容:', todoForm.content);

    // 假设这是调用后端接口的代码，例如：
    // try {
    //   modalApi.lock(); // 锁定模态框，显示 loading 状态
    //   await createTodoApi({ title: todoForm.title, content: todoForm.content });
    //   message.success('添加成功');
    //   // 重新加载列表数据
    //   // await loadTodoList();
    // } catch (error) {
    //   console.error('添加失败', error);
    // } finally {
    //   modalApi.unlock(); // 解锁模态框
    // }

    // 模拟接口请求延迟
    modalApi.lock();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    modalApi.unlock();

    // Reset form
    todoForm.title = '';
    todoForm.content = '';
    modalApi.close();
  },
  onCancel() {
    todoForm.title = '';
    todoForm.content = '';
    modalApi.close();
  },
});

function showModal() {
  modalApi.open();
}

const router = useRouter();

// 这是一个示例方法，实际项目中需要根据实际情况进行调整
// This is a sample method, adjust according to the actual project requirements
function navTo(nav: WorkbenchProjectItem | WorkbenchQuickNavItem) {
  if (nav.url?.startsWith('http')) {
    openWindow(nav.url);
    return;
  }
  if (nav.url?.startsWith('/')) {
    router.push(nav.url).catch((error) => {
      console.error('Navigation failed:', error);
    });
  } else {
    console.warn(`Unknown URL for navigation item: ${nav.title} -> ${nav.url}`);
  }
}
</script>

<template>
  <div class="p-5">
    <WorkbenchHeader
      :avatar="userStore.userInfo?.avatar || preferences.app.defaultAvatar"
    >
      <template #title>
        早安, {{ userStore.userInfo?.nickname }}, 开始您一天的工作吧！
      </template>
      <template #description> 今日晴，20℃ - 32℃！ </template>
    </WorkbenchHeader>

    <div class="mt-5 flex flex-col lg:flex-row">
      <div class="mr-4 w-full lg:w-3/5">
        <Card title="系统公告" :bordered="false" class="w-full">
          <template #extra>
            <a class="cursor-pointer text-sm text-primary">更多</a>
          </template>
          <List item-layout="horizontal" :data-source="noticeList">
            <template #renderItem="{ item }">
              <List.Item>
                <List.Item.Meta :description="item.description">
                  <template #title>
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <a href="javascript:;" class="text-base font-normal">{{
                          item.title
                        }}</a>
                        <Tag :color="item.color" class="ml-3">
                          {{ item.type }}
                        </Tag>
                      </div>
                      <span class="text-sm font-normal text-gray-400">{{
                        item.datetime
                      }}</span>
                    </div>
                  </template>
                </List.Item.Meta>
              </List.Item>
            </template>
          </List>
        </Card>
        <WorkbenchTrends
          :items="trendItems"
          class="mt-5"
          title="我的订阅内容"
        />
      </div>
      <div class="w-full lg:w-2/5">
        <WorkbenchQuickNav
          :items="quickNavItems"
          class="mt-5 lg:mt-0"
          title="快捷导航"
          @click="navTo"
        />
        <WorkbenchTodo :items="todoItems" class="mt-5" title="待办事项">
          <template #extra>
            <Button size="small" type="primary" @click="showModal">
              添加
            </Button>
          </template>
        </WorkbenchTodo>
        <TodoModal>
          <div class="flex flex-col gap-4 px-6 py-4">
            <Input v-model:value="todoForm.title" placeholder="请输入标题" />
            <Input.TextArea
              v-model:value="todoForm.content"
              :rows="4"
              placeholder="请输入内容"
            />
          </div>
        </TodoModal>
        <!-- <AnalysisChartCard class="mt-5" title="访问来源">
          <AnalyticsVisitsSource />
        </AnalysisChartCard> -->
      </div>
    </div>
  </div>
</template>
