<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Button, Input, message, Modal, Tree } from 'ant-design-vue';

import { TableAction, useVbenVxeGrid } from '#/adapter/vxe-table';

// 模拟数据
const mockData = Array.from({ length: 20 }).map((_, index) => ({
  id: index + 1,
  publishTime: `2024-03-${String(index + 1).padStart(2, '0')} 12:00:00`,
  content: `这是第 ${index + 1} 条抖音发布的内容，非常精彩！为了测试截取功能，我们需要让这段文字变得更长一些，超过20个字。`,
  likes: Math.floor(Math.random() * 10_000),
  shares: Math.floor(Math.random() * 1000),
}));

const searchContent = ref('');

// --- 搜索弹窗相关状态 ---
const isModalVisible = ref(false);

const modalData = ref({
  publisher: '抖音用户123',
  publishTime: '2024-03-01 12:00:00',
  likes: 8888,
  shares: 666,
});

const treeData = ref([
  {
    title: '一级回复：这个视频太棒了！',
    key: '1',
    children: [
      { title: '二级回复：确实不错，很有用！', key: '1-1' },
      { title: '二级回复：同意楼上。', key: '1-2' },
    ],
  },
  {
    title: '一级回复：请问背景音乐是什么？',
    key: '2',
    children: [{ title: '二级回复：好像是《某某某》', key: '2-1' }],
  },
  {
    title: '一级回复：期待下期更新！',
    key: '3',
    children: [{ title: '二级回复：正在赶制中，谢谢支持！', key: '3-1' }],
  },
]);

const gridOptions: VxeTableGridOptions = {
  columns: [
    { field: 'id', title: 'ID', width: 60 },
    { field: 'publishTime', title: '发布时间', width: 180 },
    {
      field: 'content',
      title: '发布内容',
      minWidth: 200,
      formatter: ({ cellValue }) => {
        return cellValue && cellValue.length > 20
          ? `${cellValue.slice(0, 20)}...`
          : cellValue;
      },
    },
    { field: 'likes', title: '点赞量', width: 100 },
    { field: 'shares', title: '分享量', width: 100 },
    {
      title: '操作',
      width: 150,
      slots: { default: 'action' },
    },
  ],
  pagerConfig: {
    enabled: true,
    pageSize: 10,
    total: mockData.length,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        // 模拟搜索逻辑
        const content = searchContent.value;
        let resultData = mockData;
        if (content) {
          resultData = mockData.filter((item) =>
            item.content.includes(content),
          );
        }

        // 模拟分页
        const start = (page.currentPage - 1) * page.pageSize;
        const end = start + page.pageSize;
        return {
          list: resultData.slice(start, end),
          total: resultData.length,
        };
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions,
});

function handleSearch() {
  gridApi.grid.commitProxy('query');
}

function handleSubscribe(row: any) {
  message.success(`订阅成功：ID ${row.id}`);
}

function handleView(row: any) {
  // 更新弹窗的基础信息数据
  modalData.value = {
    publisher: `抖音用户${row.id}`, // 这里使用 mock 的发布人，实际可替换为 row.publisher
    publishTime: row.publishTime,
    likes: row.likes,
    shares: row.shares,
  };
  // 触发弹窗显示
  isModalVisible.value = true;
}
</script>

<template>
  <Page title="抖音">
    <div class="p-4">
      <div
        class="rounded-md bg-white p-6 shadow-md transition-all hover:shadow-lg dark:bg-black dark:text-white"
      >
        <div class="mb-4 flex items-center justify-between pb-2">
          <h2 class="text-xl font-bold text-gray-800 dark:text-gray-100">
            抖音数据平台
          </h2>
          <div class="flex h-10 items-center gap-3">
            <Input
              v-model:value="searchContent"
              placeholder="搜索发布内容..."
              class="h-full w-40 rounded-full border-gray-300 px-4 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 sm:w-64 md:w-80"
              @press-enter="handleSearch"
            >
              <template #prefix>
                <span class="i-lucide-search text-gray-400"></span>
              </template>
            </Input>
            <Button
              type="primary"
              class="h-full rounded-full border-none bg-gradient-to-r from-blue-500 to-indigo-600 px-6 font-medium shadow-md transition-transform hover:scale-105 hover:from-blue-600 hover:to-indigo-700 active:scale-95"
              @click="handleSearch"
            >
              搜索
            </Button>
          </div>
        </div>

        <Grid>
          <template #action="{ row }">
            <TableAction
              :actions="[
                {
                  label: '订阅',
                  type: 'primary',
                  class:
                    'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border-none font-medium',
                  onClick: () => handleSubscribe(row),
                },
                {
                  label: '查看',
                  type: 'default',
                  class:
                    'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-none font-medium',
                  onClick: () => handleView(row),
                },
              ]"
            />
          </template>
        </Grid>
      </div>
    </div>

    <!-- 搜索结果弹窗 -->
    <Modal
      v-model:open="isModalVisible"
      title="搜索详情"
      width="600px"
      @ok="isModalVisible = false"
    >
      <div class="mb-4 rounded-md bg-gray-50 p-4 dark:bg-gray-800">
        <h3 class="mb-3 text-base font-bold">基础信息</h3>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-gray-500">发布人：</span>{{ modalData.publisher }}
          </div>
          <div>
            <span class="text-gray-500">发布时间：</span>{{ modalData.publishTime }}
          </div>
          <div>
            <span class="text-gray-500">点赞量：</span>{{ modalData.likes }}
          </div>
          <div>
            <span class="text-gray-500">分享量：</span>{{ modalData.shares }}
          </div>
        </div>
      </div>

      <div>
        <h3 class="mb-3 text-base font-bold">二级回复内容</h3>
        <div class="rounded-md border p-2 dark:border-gray-700">
          <Tree :tree-data="treeData" default-expand-all class="text-sm" />
        </div>
      </div>
    </Modal>
  </Page>
</template>
