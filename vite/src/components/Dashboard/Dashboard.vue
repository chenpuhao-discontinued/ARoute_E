<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import DashboardP from './Dashboard_P.vue';
import DashboardM from './Dashboard_M.vue';

const isPC = ref(window.innerWidth > window.innerHeight);

const updateIsPC = () => {
  isPC.value = window.innerWidth > window.innerHeight;
};

onMounted(() => {
  window.addEventListener('resize', updateIsPC);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateIsPC);
});

const currentComponent = computed(() => (isPC.value ? DashboardP : DashboardM));
</script>

<template>
  <component :is="currentComponent" />
</template>

<style scoped>
/* Add any necessary styles here */
</style>