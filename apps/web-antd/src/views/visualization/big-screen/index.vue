<template>
  <div class="h-full w-full bg-[#001529] text-white p-4 flex flex-col items-center justify-center">
    <h1 class="text-4xl font-bold mb-4">可视化大屏</h1>
    <div class="grid grid-cols-3 gap-4 w-full max-w-6xl">
      <div class="bg-[#1f2937] p-6 rounded-lg h-64 flex items-center justify-center">
        <span class="text-2xl">图表区域 1</span>
      </div>
      <div class="bg-[#1f2937] p-6 rounded-lg h-64 flex items-center justify-center">
        <span class="text-2xl">图表区域 2</span>
      </div>
      <div class="bg-[#1f2937] p-6 rounded-lg h-64 flex items-center justify-center">
        <span class="text-2xl">图表区域 3</span>
      </div>
      <div class="bg-[#1f2937] p-6 rounded-lg h-96 col-span-2 flex items-center justify-center">
        <span class="text-2xl">主图表区域</span>
      </div>
      <div class="bg-[#1f2937] p-6 rounded-lg h-96 flex items-center justify-center">
        <span class="text-2xl">图表区域 4</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineOptions({
  name: 'VisualizationBigScreen',
});
</script>

<style scoped>
/* Ensure full height */
:deep(#app) {
  height: 100%;
}
</style>
