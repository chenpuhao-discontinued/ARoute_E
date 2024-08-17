<template>
  <el-scrollbar class="full-page">
    <div class="content-container">
      <div class="flex items-center">
        <el-avatar
          class="mr-3"
          :size="32"
          src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
        />
        <span class="text-large font-600 mr-3"> {{ userInfo.username }} </span>
        <span
          class="text-sm mr-2"
          style="color: var(--el-text-color-regular)"
        >

        </span>
        <el-tag>          {{ userInfo.title }}</el-tag>
      </div>
    </div>
    <el-descriptions :column="3" size="small" class="mt-4">
      <el-descriptions-item label="用户名">
        {{ userInfo.username }}
      </el-descriptions-item>
      <el-descriptions-item label="邮箱">
        {{ userInfo.email }}
      </el-descriptions-item>
    </el-descriptions>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { ElNotification as notify } from 'element-plus';

const userInfo = ref({
  username: '',
  email: '',
  token: '',
  title: ''
});

const fetchUserInfo = async () => {
  try {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='));
    const response = await axios.get('/api/v1/userControl/getUserInfo?' + token);
    if (response.data.code === 200) {
      userInfo.value = response.data.data;
    } else {
      console.error('获取用户信息失败:', response.data.message);
    }
  } catch (error) {
    console.error('获取用户信息时出错:', error);
  }
};

const onBack = () => {
  notify('返回');
};

onMounted(() => {
  fetchUserInfo();
});
</script>

<style scoped>
.full-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;
}

.content-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.extra-container {
  display: flex;
  align-items: center;
}

.text-large {
  font-size: 18px;
  font-weight: bold;
}

.font-600 {
  font-weight: 600;
}

.mt-4 {
  margin-top: 16px;
}
</style>