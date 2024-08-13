<script setup>
import { ref, onMounted } from 'vue';
import { ElDialog } from 'element-plus';
import 'element-plus/dist/index.css';

const isWelcomeDialogVisible = ref(false);

onMounted(() => {
  isWelcomeDialogVisible.value = true;
});
</script>

<template>
  <el-dialog v-model:visible="isWelcomeDialogVisible" title="欢迎" width="30%" custom-class="center-dialog">
    <p>你好</p>
  </el-dialog>
</template>

<style scoped>
.center-dialog .el-dialog {
  top: 50% !important;
  transform: translateY(-50%) !important;
}
</style>