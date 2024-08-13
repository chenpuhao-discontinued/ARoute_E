<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { ElCard, ElRow, ElCol } from 'element-plus';
import 'element-plus/dist/index.css';

// 定义文章数目的状态
const articleCount = ref(0);

// 从API获取文章数目
const fetchArticleCount = async () => {
  try {
    const response = await axios.get('/api/v1/passageControl/count');
    articleCount.value = response.data.count;
  } catch (error) {
    console.error('Error fetching article count:', error);
  }
};

onMounted(fetchArticleCount);
</script>

<template>
  <el-card class="article-count-container">
    <el-row justify="center">
      <el-col :span="24">
        <p class="article-count">{{ articleCount }}</p>
      </el-col>
      <el-col :span="24">
        <h5 class="title">文章数</h5>
      </el-col>
    </el-row>
  </el-card>
</template>

<style scoped>
.title{
  color: #aaa;
}

.article-count-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border-radius: 20px;
  background-color: #f9f9f9;
  width: 200px;
  height:200px;
  margin: 0 auto;
}

.article-count {
  font-size: 60px; /* 进一步放大字体 */
  font-weight: bold;
  color: #aaa; /* 改为浅灰色 */

}

.article-count-container h5 {
  font-size: 18px;
  margin: 0;
}
</style>