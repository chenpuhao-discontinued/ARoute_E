<script setup>
import { onMounted, ref } from 'vue';
import {ElMenu, ElMenuItem, ElAside, ElMain, ElMessage} from 'element-plus';
import 'element-plus/dist/index.css'; // 确保引入样式
import axios from 'axios'; // Import axios for API calls

// 获取URL参数中的view
const urlParams = new URLSearchParams(window.location.search);
const initialView = urlParams.get('view') || 'home';

// 定义当前视图
const currentView = ref(initialView);

const disableScrollbar = () => {
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
};

// 动态导入组件的函数
const importComponent = async (name) => {
  // Use @vite-ignore to suppress the warning if the format cannot be changed
  return await import(/* @vite-ignore */ `./${name}.vue`);
};

// 导航函数
const navigate = async (view) => {
  const url = new URL(window.location);
  url.searchParams.set('view', view);
  window.history.pushState(null, '', url);
  currentView.value = view;
  currentComponent.value = (await importComponent(view)).default;
};

// 定义当前组件
const currentComponent = ref(null);


//获取用户名
const username = ref('');

const fetchUsername = async () => {
  try {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='));
    if (!token) {
      ElMessage.error('登录过期，请重新登录');
      setTimeout(() => {
        window.location.href = '/console/login';
      }, 1000);
      return;
    }
    const response = await axios.get('/api/v1/userControl/getUsername?'+token);
    if (response.data.code === 200) {
      username.value = response.data.data;
    } else {
      username.value = '未知用户';
    }
  } catch (error) {
    username.value = '获取用户失败';
  }
};

const logout = () => {
  // Delete the cookie named 'token'
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

  // Redirect to the login page
  window.location.href = '/console/login';
}

onMounted(async () => {
  disableScrollbar();
  await fetchUsername(); // 获取用户名
});

// 初始加载组件
navigate(initialView);
</script>

<template>
  <div class="dashboard-container">
    <el-aside class="sidebar">
      <div class="login-logo gradient-text">ARoute</div>

      <el-menu @select="navigate">
        <hr class="divider"/>
        <el-menu-item index="home">主页</el-menu-item>
        <hr class="divider"/>
        <el-menu-item index="newArticle">新建文章</el-menu-item>
        <el-menu-item index="allArticles">所有文章</el-menu-item>
        <el-menu-item index="allPages">所有页面</el-menu-item>
        <hr class="divider"/>
        <el-menu-item index="theme">主题</el-menu-item>
        <el-menu-item index="plugin">插件</el-menu-item>
        <el-menu-item index="store">商店</el-menu-item>
        <hr class="divider"/>
        <el-menu-item index="user">用户管理</el-menu-item>
        <el-menu-item index="setting">设置</el-menu-item>
        <hr class="divider"/>
      </el-menu>

      <div class="user-info">
        <div class="user-info-row">
          <span class="username">你好, {{ username }}</span>
        </div>
        <div class="user-info-row">
          <span></span>
          <div class="button-group">
            <el-button class="logout-button">
              <i class="fas fa-user"></i>
            </el-button>
            <el-button class="logout-button" @click="logout">
              <i class="fas fa-sign-out-alt"></i>
            </el-button>
          </div>
        </div>
      </div>
    </el-aside>
    <el-main class="main-content">
      <component :is="currentComponent"/>
    </el-main>
  </div>
</template>

<style scoped>
.dashboard-container {
  display: flex;
  height: 100vh;
  width: 100%;
}

.sidebar {
  user-select: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 250px;
  height: 100vh;
  background-color: white;
  color: #4c4c4c;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.main-content {
  margin-left: 250px;
  flex-grow: 1;
  height: 100vh;
  overflow: auto;
  box-sizing: border-box;
}

.login-logo {
  margin: 0 auto;
  display: block;
  user-select: none;
  font-size: 53px;
  font-weight: bold;
  border-right: 1px solid #ccc;
  padding-right: 10px;
}

.gradient-text {
  background: linear-gradient(to right, #0000ff, #00ffff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.divider {
  border: none;
  border-top: 1px solid #ccc;
  margin: 10px 0;
}

.user-info {
  display: flex;
  flex-direction: column;
  border-right: 1px solid #ccc;
  padding-right: 10px;
}

.user-info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.username {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.role {
  font-size: 16px;
  color: #666;
}

.button-group {
  display: flex;
  gap: 0; /* Remove gap between buttons */
}

.logout-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #4c4c4c;
  font-size: 16px;
  display: flex;
  align-items: center;
}

.logout-button .fas {
  font-size: 20px;
}
</style>