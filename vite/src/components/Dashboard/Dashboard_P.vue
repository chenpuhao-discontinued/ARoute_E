<script setup>
import { ref } from 'vue';
import { ElMenu, ElMenuItem, ElAside, ElMain } from 'element-plus';

// 获取URL参数中的view
const urlParams = new URLSearchParams(window.location.search);
const initialView = urlParams.get('view') || 'home';

// 定义当前视图
const currentView = ref(initialView);

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

// 初始加载组件
navigate(initialView);
</script>

<template>
  <div class="dashboard-container">
    <el-aside class="sidebar">
      <div class="login-logo gradient-text">ARoute</div>

      <el-menu @select="navigate">
        <hr class="divider" />
        <el-menu-item index="home">主页</el-menu-item>
        <hr class="divider" />
        <el-menu-item index="newArticle">新建文章</el-menu-item>
        <el-menu-item index="allArticles">所有文章</el-menu-item>
        <el-menu-item index="allPages">所有页面</el-menu-item>
        <hr class="divider" />
        <el-menu-item index="theme">主题</el-menu-item>
        <el-menu-item index="plugin">插件</el-menu-item>
        <el-menu-item index="store">商店</el-menu-item>
        <hr class="divider" />
        <el-menu-item index="user">用户管理</el-menu-item>
        <el-menu-item index="setting">设置</el-menu-item>
      </el-menu>
    </el-aside>
    <el-main class="main-content">
        <component :is="currentComponent" />
    </el-main>
  </div>
</template>

<style scoped>
.dashboard-container {
  display: flex;
  height: 100vh;
  width: 100%; /* 确保宽度占满父容器 */
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
}

.main-content {
  margin-left: 250px; /* 确保左边界与sidebar右边界对齐 */
  flex-grow: 1; /* 确保占满剩余空间 */
  height: 100vh; /* 确保高度铺满 */
  overflow: auto;
  box-sizing: border-box; /* 确保padding不会导致宽度超出 */
}
.login-logo {
  margin: 0 auto;
  display: block;
  user-select: none;
  font-size: 36px;
  font-weight: bold;
  border-right: 1px solid #ccc; /* 添加右侧边框 */
  padding-right: 10px; /* 确保边框与文字之间有间距 */
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
</style>