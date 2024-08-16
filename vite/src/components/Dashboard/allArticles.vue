<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';

const articles = ref([]);
const isTagDrawerVisible = ref(false);
const isCateDrawerVisible = ref(false);
const isConfirmDialogVisible = ref(false);
const isConfirmDialogVisibleC = ref(false);
const tags = ref([]);
const tagOptions = ref([]);
const newTag = ref('');
const newTagForMigration = ref('');
const tagToDelete = ref('');
const cates = ref([]);
const cateOptions = ref([]);
const newCate = ref('');
const newCateForMigration = ref('');
const cateToDelete = ref('');

const fetchArticles = async () => {
  try {
    const response = await axios.get('/api/v1/PassageControl/all_passages');
    articles.value = response.data.passages;
  } catch (error) {
    ElMessage.error('Failed to fetch articles');
    console.error('Failed to fetch articles:', error);
  }
};

const fetchTags = async () => {
  try {
    const response = await axios.get('/api/v1/PassageControl/tags');
    tags.value = response.data.tags.map(tag => ({
      value: tag.name,
      label: tag.name,
    }));
    tagOptions.value = response.data.tags.map(tag => ({
      value: tag.name,
      label: tag.name,
    }));
  } catch (error) {
    console.error('Failed to fetch tags:', error);
  }
};

const fetchCates = async () => {
  try {
    const response = await axios.get('/api/v1/PassageControl/categories');
    cates.value = response.data.categories.map(cate => ({
      value: cate.name,
      label: cate.name,
    }));
    cateOptions.value = response.data.categories.map(cate => ({
      value: cate.name,
      label: cate.name,
    }));
  } catch (error) {
    console.error('Failed to fetch categories:', error);
  }
};

const redirectToEditArticle = (alias) => {
  const url = new URL(window.location);
  url.searchParams.set('view', 'editArticle');
  url.searchParams.set('passage', alias);
  window.location.href = url.toString();
};

const deleteArticle = async (alias) => {
  try {
    const response = await axios.delete(`/api/v1/PassageControl/delete_passage?alias=${alias}`);
    if (response.data.message === 'Passage deleted successfully') {
      ElMessage.success('文章删除成功');
      await fetchArticles(); // Refresh the articles list
    }
  } catch (error) {
    ElMessage.error('删除文章');
    console.error('Failed to delete article:', error);
  }
};

const checkTagExists = (tagName) => {
  return tags.value.some(tag => tag.value === tagName);
};

const addTag = async () => {
  if (newTag.value) {
    if (checkTagExists(newTag.value)) {
      ElMessage.error('标签已存在');
      return;
    }
    try {
      const response = await axios.post(`/api/v1/PassageControl/add_tag?tag=${newTag.value}`);
      if (response.data.message === 'Tag added successfully') {
        tags.value.push({
          label: newTag.value,
          value: newTag.value,
        });
        newTag.value = '';
        await fetchTags(); // Refresh the tags list
      }
    } catch (error) {
      console.error('Failed to add tag:', error);
    }
  }
};

const confirmDeleteTag = async (tag) => {
  try {
    const response = await axios.get(`/api/v1/PassageControl/tag_has_passage?tag=${tag}`);
    if (response.data.hasPassage) {
      tagToDelete.value = tag;
      newTagForMigration.value = '';
      tagOptions.value = tags.value.filter(t => t.value !== tag); // Exclude the tag to be deleted
      isConfirmDialogVisible.value = true;
    } else {
      await deleteTag(tag);
    }
  } catch (error) {
    console.error('Failed to check if tag has passages:', error);
  }
};

const deleteTag = async (tag) => {
  try {
    const response = await axios.delete(`/api/v1/PassageControl/delete_tag?tag=${tag}`);
    if (response.data.message === 'Tag deleted successfully') {
      tags.value = tags.value.filter(t => t.value !== tag);
    }
  } catch (error) {
    console.error('Failed to delete tag:', error);
  }
};

const migrateAndDeleteTag = async () => {
  try {
    await axios.put(`/api/v1/PassageControl/change_tag?oldTag=${tagToDelete.value}&newTag=${newTagForMigration.value}`);
    await deleteTag(tagToDelete.value);
    isConfirmDialogVisible.value = false;
  } catch (error) {
    console.error('Failed to migrate and delete tag:', error);
  }
};
const checkCateExists = (cateName) => {
  return cates.value.some(cate => cate.value === cateName);
};

const addCate = async () => {
  if (newCate.value) {
    if (checkCateExists(newCate.value)) {
      ElMessage.error('分类已存在');
      return;
    }
    try {
      const response = await axios.post(`/api/v1/PassageControl/add_category?category=${newCate.value}`);
      if (response.data.message === 'Category added successfully') {
        tags.value.push({
          label: newCate.value,
          value: newCate.value,
        });
        newCate.value = '';
        await fetchCates(); // Refresh the tags list
      }
    } catch (error) {
      console.error('Failed to add Category:', error);
    }
  }
};

const confirmDeleteCate = async (cate) => {
  try {
    const response = await axios.get(`/api/v1/PassageControl/category_has_passage?category=${cate}`);
    if (response.data.hasPassage) {
      cateToDelete.value = cate;
      newCateForMigration.value = '';
      cateOptions.value = cates.value.filter(t => t.value !== cate); // Exclude the tag to be deleted
      isConfirmDialogVisibleC.value = true;
    } else {
      await deleteCate(cate);
    }
  } catch (error) {
    console.error('Failed to check if tag has passages:', error);
  }
};

const deleteCate = async (cate) => {
  try {
    const response = await axios.post(`/api/v1/PassageControl/delete_category?category=${cate}`);
    if (response.data.message === 'Category deleted successfully') {
      cates.value = cates.value.filter(t => t.value !== cate);
    }
  } catch (error) {
    console.error('Failed to delete category:', error);
  }
};

const migrateAndDeleteCate = async () => {
  try {
    await axios.post(`/api/v1/PassageControl/change_category?oldCategory=${cateToDelete.value}&newCategory=${newCateForMigration.value}`);
    await deleteCate(cateToDelete.value);
    isConfirmDialogVisibleC.value = false;
  } catch (error) {
    console.error('Failed to migrate and delete:', error);
  }
};
onMounted(() => {
  fetchArticles();
  fetchTags();
  fetchCates();
});
</script>

<template>
  <div class="dashboard-header">
    <h2 class="dashboard-title">所有文章</h2>
    <div>
      <el-button class="settings-button" @click="isTagDrawerVisible = true">标签</el-button>
      <el-button class="settings-button" @click="isCateDrawerVisible = true">分类</el-button>
    </div>
  </div>
  <div class="components-container">
    <el-table :data="articles" style="width: 100%">
      <el-table-column prop="creator" label="创作者" sortable></el-table-column>
      <el-table-column prop="created_at" label="创作时间" sortable>
        <template #default="scope">
          {{ new Date(scope.row.created_at).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column prop="title" label="标题" sortable></el-table-column>
      <el-table-column prop="read" label="阅读数" sortable></el-table-column>
      <el-table-column prop="tab" label="标签" sortable></el-table-column>
      <el-table-column prop="categorization" label="分类" sortable></el-table-column>
      <el-table-column prop="post" label="发布状态" sortable></el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button @click="redirectToEditArticle(scope.row.alias)">修改</el-button>
          <el-button type="danger" @click="deleteArticle(scope.row.alias)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>

  <el-drawer style="user-select: none" v-model="isTagDrawerVisible" title="管理标签" :with-header="true" size="500px">
    <div class="input-button-container">
      <el-input class="short-input" v-model="newTag" placeholder="输入新标签名称"></el-input>
      <el-button type="primary" @click="addTag">添加标签</el-button>
    </div>
    <div class="table-container">
      <el-table :data="tags" style="width: 100%">
        <el-table-column prop="label" label="标签名称"></el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button type="danger" @click="confirmDeleteTag(scope.row.value)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-drawer>

    <el-drawer style="user-select: none" v-model="isCateDrawerVisible" title="管理分类" :with-header="true" size="500px">
      <div class="input-button-container">
        <el-input class="short-input" v-model="newCate" placeholder="输入新分类名称"></el-input>
        <el-button type="primary" @click="addCate">添加分类</el-button>
      </div>
      <div class="table-container">
        <el-table :data="cates" style="width: 100%">
          <el-table-column prop="label" label="分类名称"></el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <el-button type="danger" @click="confirmDeleteCate(scope.row.value)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
  </el-drawer>

  <el-dialog v-model="isConfirmDialogVisible" title="标签有文章">
    <div class="dialog-content">
      <div class="dialog-text">
        <span>该标签有文章，是否将文章迁移到新标签？</span>
      </div>
      <el-radio-group v-model="newTagForMigration" class="radio-group">
        <el-radio v-for="tag in tagOptions" :label="tag.value" :key="tag.value">{{ tag.label }}</el-radio>
      </el-radio-group>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="isConfirmDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="migrateAndDeleteTag">确认</el-button>
    </span>
  </el-dialog>


  <el-dialog v-model="isConfirmDialogVisibleC" title="分类有文章">
    <div class="dialog-content">
      <div class="dialog-text">
        <span>该分类有文章，是否将文章迁移到新分类？</span>
      </div>
      <el-radio-group v-model="newCateForMigration" class="radio-group">
        <el-radio v-for="cate in cateOptions" :label="cate.value" :key="cate.value">{{ cate.label }}</el-radio>
      </el-radio-group>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="isConfirmDialogVisibleC = false">取消</el-button>
      <el-button type="primary" @click="migrateAndDeleteCate">确认</el-button>
    </span>
  </el-dialog>
</template>

<style scoped>
.input-button-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
}

.short-input {
  width: 200px;
}

.dialog-content {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.dialog-text {
  margin-bottom: 10px;
}

.radio-group {
  margin-top: 10px;
}

.radio-group  {
  margin-bottom: 10px;
}
.dashboard-header {
  position: absolute;
  top: 0;
  left: 0;
  width: calc(100% - 250px);
  height: 50px;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-sizing: border-box;
  margin-left: 250px;
}

.dashboard-title {
  user-select: none;
  font-size: 24px;
  font-weight: bold;
}

.settings-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 4px;
  margin-left: 10px;
}

.settings-button:hover {
  background-color: #0056b3;
}

.components-container {
  position: absolute;
  top: 60px;
  left: 250px;
  right: 0;
  bottom: 0;
  background-color: #fff;
  overflow: auto; /* Ensure the container is scrollable */
  user-select: none;
}
</style>