<script lang="ts" setup>
import type { AnalysisOverviewItem } from '@vben/common-ui';
import type { TabOption } from '@vben/types';

import { ref } from 'vue';

import {
  AnalysisChartsTabs,
  AnalysisOverview,
} from '@vben/common-ui';
import {
  SvgBellIcon,
  SvgCardIcon,
  SvgDownloadIcon,

} from '@vben/icons';

import { ElButton, ElTable, ElTableColumn, ElTag } from 'element-plus';

// 定义组件名称
defineOptions({ name: 'ZhihuSentiment' });

// 概览数据
const overviewItems: AnalysisOverviewItem[] = [
  {
    icon:  SvgDownloadIcon,
    title: '监控话题数',
    totalTitle: '总监控话题',
    totalValue: 128,
    value: 12,
  },
  {
    icon: SvgCardIcon,
    title: '今日讨论量',
    totalTitle: '总讨论量',
    totalValue: 45680,
    value: 3280,
  },
  {
    icon: SvgBellIcon,
    title: '预警事件',
    totalTitle: '总预警数',
    totalValue: 23,
    value: 5,
  },
  {
    icon: SvgDownloadIcon,
    title: '舆情报告',
    totalTitle: '总报告数',
    totalValue: 89,
    value: 8,
  },
];

// 图表标签
const chartTabs: TabOption[] = [
  {
    label: '舆情趋势',
    value: 'trends',
  },
  {
    label: '情感分布',
    value: 'sentiment',
  },
];

// 热门话题列表
const hotTopics = ref([
  {
    rank: 1,
    title: '大学生就业难问题',
    heat: 9850000,
    sentiment: '负面',
    trend: '上升',
  },
  {
    rank: 2,
    title: '考研分数线公布',
    heat: 8760000,
    sentiment: '中性',
    trend: '平稳',
  },
  {
    rank: 3,
    title: '校园食品安全事件',
    heat: 7650000,
    sentiment: '负面',
    trend: '下降',
  },
  {
    rank: 4,
    title: '优秀毕业生创业故事',
    heat: 6540000,
    sentiment: '正面',
    trend: '上升',
  },
  {
    rank: 5,
    title: '学术造假事件调查',
    heat: 5430000,
    sentiment: '负面',
    trend: '上升',
  },
  {
    rank: 6,
    title: '校园文化活动展示',
    heat: 4320000,
    sentiment: '正面',
    trend: '平稳',
  },
]);

// 预警信息列表
const warnings = ref([
  {
    id: 1,
    title: '某高校食堂卫生问题引发热议',
    level: 'high',
    time: '10 分钟前',
    status: '未处理',
  },
  {
    id: 2,
    title: '学生投诉宿舍管理问题',
    level: 'medium',
    time: '30 分钟前',
    status: '处理中',
  },
  {
    id: 3,
    title: '网络传言学校收费调整',
    level: 'high',
    time: '1 小时前',
    status: '已处理',
  },
  {
    id: 4,
    title: '学生对课程设置意见较大',
    level: 'low',
    time: '2 小时前',
    status: '未处理',
  },
]);

// 获取预警等级标签类型
function getWarningLevelType(level: string) {
  const levelMap: Record<string, 'danger' | 'warning' | 'success'> = {
    high: 'danger',
    medium: 'warning',
    low: 'success',
  };
  return levelMap[level] || 'info';
}

// 获取情感标签类型
function getSentimentType(sentiment: string) {
  const typeMap: Record<string, 'success' | 'info' | 'danger'> = {
    正面: 'success',
    中性: 'info',
    负面: 'danger',
  };
  return typeMap[sentiment] || 'info';
}

// 获取趋势图标
function getTrendIcon(trend: string) {
  if (trend === '上升') return '↑';
  if (trend === '下降') return '↓';
  return '→';
}
</script>

<template>
  <div class="p-5">
    <!-- 顶部概览 -->
    <AnalysisOverview :items="overviewItems" />

    <!-- 图表分析 -->
    <AnalysisChartsTabs :tabs="chartTabs" class="mt-5">
      <template #trends>
        <div class="h-80 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded">
          <div class="text-center">
            <div class="text-6xl mb-4">📈</div>
            <div class="text-gray-600 dark:text-gray-400">舆情趋势图表区域</div>
            <div class="text-sm text-gray-500 dark:text-gray-500 mt-2">
              显示 24 小时内舆情讨论量变化趋势
            </div>
          </div>
        </div>
      </template>
      <template #sentiment>
        <div class="h-80 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded">
          <div class="text-center">
            <div class="text-6xl mb-4">🎯</div>
            <div class="text-gray-600 dark:text-gray-400">情感分布图表区域</div>
            <div class="text-sm text-gray-500 dark:text-gray-500 mt-2">
              正面：45% | 中性：35% | 负面：20%
            </div>
          </div>
        </div>
      </template>
    </AnalysisChartsTabs>

    <!-- 热门话题和预警信息 -->
    <div class="mt-5 w-full md:flex">
      <!-- 热门话题 TOP10 -->
      <div class="mt-5 md:mr-4 md:mt-0 md:w-1/2">
        <div class="bg-white dark:bg-gray-900 rounded-lg shadow p-5 h-full">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">🔥 热门话题 TOP10</h3>
            <el-button type="primary" size="small">查看更多</el-button>
          </div>
          <el-table :data="hotTopics" size="large" stripe class="dark:text-gray-300">
            <el-table-column type="index" label="排名" width="60" align="center">
              <template #default="{ $index }">
                <span
                  :class="{
                    'text-red-500 font-bold': $index < 3,
                    'text-gray-500': $index >= 3,
                  }"
                >
                  {{ $index + 1 }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="title" label="话题内容" min-width="180" />
            <el-table-column prop="heat" label="热度" width="100" align="center">
              <template #default="{ row }">
                {{ (row.heat / 10000).toFixed(1) }}w
              </template>
            </el-table-column>
            <el-table-column
              prop="sentiment"
              label="情感"
              width="80"
              align="center"
            >
              <template #default="{ row }">
                <el-tag :type="getSentimentType(row.sentiment)" size="small">
                  {{ row.sentiment }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="trend"
              label="趋势"
              width="80"
              align="center"
            >
              <template #default="{ row }">
                <span
                  :class="{
                    'text-red-500': row.trend === '上升',
                    'text-green-500': row.trend === '下降',
                    'text-gray-500': row.trend === '平稳',
                  }"
                >
                  {{ getTrendIcon(row.trend) }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 实时预警 -->
      <div class="mt-5 md:mt-0 md:w-1/2">
        <div class="bg-white dark:bg-gray-900 rounded-lg shadow p-5 h-full">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">⚠️ 实时预警</h3>
            <el-button type="warning" size="small">处理记录</el-button>
          </div>
          <div class="space-y-3 flex-1 overflow-y-auto">
            <div
              v-for="warning in warnings"
              :key="warning.id"
              class="border-l-4 p-3 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              :class="{
                'border-red-500': warning.level === 'high',
                'border-yellow-500': warning.level === 'medium',
                'border-green-500': warning.level === 'low',
              }"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="font-medium text-sm mb-1 text-gray-800 dark:text-gray-200">
                    {{ warning.title }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {{ warning.time }}
                  </div>
                </div>
                <div class="flex flex-col items-end gap-1">
                  <el-tag
                    :type="getWarningLevelType(warning.level)"
                    size="small"
                  >
                    {{ warning.level === 'high' ? '高危' : warning.level === 'medium' ? '中危' : '低危' }}
                  </el-tag>
                  <el-tag size="small" effect="plain">
                    {{ warning.status }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 舆情监控关键词 -->
    <div class="mt-5">
      <div class="bg-white dark:bg-gray-900 rounded-lg shadow p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">🎯 监控关键词</h3>
          <el-button type="primary" size="small">添加关键词</el-button>
        </div>
        <div class="flex flex-wrap gap-2">
          <el-tag
            v-for="keyword in [
              '石家庄信息工程学院',
              '校园舆情',
              '学生管理',
              '教学质量',
              '食品安全',
              '宿舍条件',
              '收费标准',
              '就业情况',
              '考研率',
              '学术诚信',
            ]"
            :key="keyword"
            closable
            size="large"
            class="px-3 py-1"
          >
            {{ keyword }}
          </el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.el-table) {
  font-size: 13px;
}

:deep(.el-tag) {
  margin-right: 0;
}
</style>
