<template>
  <div class="dashboard-header">
    <h2 class="dashboard-title">修改文章</h2>
    <div>
      <button class="settings-button" @click="isDrawerVisible = true">添加信息</button>
      <button class="settings-button" @click="saveArticle">仅保存</button>
      <button class="settings-button" @click="postArticle">保存并发布</button>
    </div>
  </div>
  <div class="components-container">
    <div id="vditor" class="editor-container"></div>
  </div>

  <el-drawer v-model="isDrawerVisible" title="添加组件" :with-header="false" size="500px">
    <el-form>
      <el-form-item class="form-item" label="标题">
        <el-input v-model="title" placeholder="请输入标题"></el-input>
      </el-form-item>
      <el-form-item class="form-item" label="创建时间">
        <el-date-picker
            v-model="createTime"
            type="datetime"
            placeholder="选择日期时间"
        ></el-date-picker>
      </el-form-item>
      <el-form-item class="form-item" label="标签">
        <el-select-v2
            ref="select"
            v-model="tags"
            :options="tagOptions"
            placeholder="请选择标签"
            style="width: 240px"
        >
          <template #footer>
            <el-button v-if="!isAddingTag" text bg size="small" @click="onAddTag">
              添加标签
            </el-button>
            <div v-else class="select-footer">
              <el-input
                  v-model="newTag"
                  class="option-input"
                  placeholder="输入标签名称"
                  size="small"
              />

              <div>
                <el-button type="primary" size="small" @click="onConfirmTag">
                  确认
                </el-button>
                <el-button size="small" @click="clearTag">取消</el-button>
              </div>
            </div>
          </template>
        </el-select-v2>
      </el-form-item>
      <el-form-item class="form-item" label="分类">
        <el-select-v2
            ref="select"
            v-model="cates"
            :options="cateOptions"
            placeholder="请选择分类"
            style="width: 240px"
        >
          <template #footer>
            <el-button v-if="!isAddingCate" text bg size="small" @click="onAddCate">
              添加分类
            </el-button>
            <div v-else class="select-footer">
              <el-input
                  v-model="newCate"
                  class="option-input"
                  placeholder="输入分类名称"
                  size="small"
              />

              <div>
                <el-button type="primary" size="small" @click="onConfirmCate">
                  确认
                </el-button>
                <el-button size="small" @click="clearCate">取消</el-button>
              </div>
            </div>
          </template>
        </el-select-v2>
      </el-form-item>
      <el-form-item class="form-item" label="封面">
        <el-input v-model="cover" placeholder="请输入封面链接"></el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="saveForm">保存</el-button>
        <el-button @click="cancelForm">取消</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import { ElSelectV2, ElMessage } from 'element-plus';
import 'element-plus/dist/index.css';
import axios from 'axios';
import 'vditor/dist/index.css';
import Vditor from 'vditor';


const editorContent = ref('');
let vditor = null;
const isDrawerVisible = ref(false);
const title = ref('');
const alias = ref('');
const author = ref('');
const tags = ref(''); // Single value for tag
const cover = ref('');
const isAddingTag = ref(false);
const newTag = ref('');
const tagOptions = ref([]);
const createTime = ref('');
const savedFormState = ref({});
const isAddingCate = ref(false);
const newCate = ref('');
const cateOptions = ref([]);
const cates = ref(''); // Single value for tag


const fetchTags = async () => {
  try {
    const response = await axios.get('/api/v1/PassageControl/tags');
    tagOptions.value = response.data.tags.map(tag => ({
      value: tag.name,
      label: tag.name,
    }));
  } catch (error) {
    console.error('Failed to fetch tags:', error);
  }
};
const fetchArticleByAlias = async (alias) => {
  try {
    const response = await fetch(`/api/v1/PassageControl/passage_by_alias?alias=${encodeURIComponent(alias)}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    const article = data.passage;
    console.log('Fetched article:', article);
    title.value = article.title;
    createTime.value = new Date(article.created_at);
    tags.value = typeof article.tab === 'string' ? article.tab : article.tab.join(', '); // Ensure this is a string
    cover.value = article.cover;
    cates.value = typeof article.categorization === 'string' ? article.categorization : article.categorization.join(', ');
    editorContent.value = article.content;
    if (vditor) {
      console.log('vditor is initialized');
      vditor.setValue(editorContent.value);
    } else {
      console.error('vditor is not initialized');
    }
  } catch (error) {
    console.error('Failed to fetch article by alias:', error);
  }
};

const onAddTag = () => {
  isAddingTag.value = true;
};

const onConfirmTag = async () => {
  if (newTag.value) {
    try {
      const response = await axios.post(`/api/v1/PassageControl/add_tag?tag=${newTag.value}`);
      if (response.data.message === 'Tag added successfully') {
        tagOptions.value.push({
          label: newTag.value,
          value: newTag.value,
        });
        tags.value = newTag.value; // Set single tag value
        clearTag();
        nextTick(() => {
          select.value?.scrollTo(tagOptions.value.length - 1);
        });
      }
    } catch (error) {
      console.error('Failed to add tag:', error);
    }
  }
};

const clearTag = () => {
  newTag.value = '';
  isAddingTag.value = false;
};

const fetchCate = async () => {
  try {
    const response = await axios.get('/api/v1/PassageControl/categories');
    cateOptions.value = response.data.categories.map(cate => ({
      value: cate.name,
      label: cate.name,
    }));
  } catch (error) {
    console.error('Failed to fetch categories:', error);
  }
};

const onAddCate = () => {
  isAddingCate.value = true;
};

const onConfirmCate = async () => {
  if (newCate.value) {
    try {
      const response = await axios.post(`/api/v1/PassageControl/add_category?category=${newCate.value}`);
      if (response.data.message === 'Category added successfully') {
        cateOptions.value.push({
          label: newCate.value,
          value: newCate.value,
        });
        cates.value = newCate.value; // Set single tag value
        clearCate();
        nextTick(() => {
          select.value?.scrollTo(cateOptions.value.length - 1);
        });
      }
    } catch (error) {
      console.error('Failed to add Category:', error);
    }
  }
};

const clearCate = () => {
  newCate.value = '';
  isAddingCate.value = false;
};

// Restore the saved form state
const restoreFormState = () => {
  title.value = savedFormState.value.title;
  alias.value = savedFormState.value.alias;
  createTime.value = savedFormState.value.createTime;
  tags.value = savedFormState.value.tags;
  cover.value = savedFormState.value.cover;
  editorContent.value = savedFormState.value.editorContent;
  vditor.setValue(editorContent.value);
};

// 加载编辑器内容
// 保存编辑器内容
// 自动保存编辑器内容
const autoSaveEditorContent = async () => {
  try {
    editorContent.value = vditor.getValue();

  } catch (error) {
    console.error('Failed to auto-save editor content:', error);
  }
};

// 检查表单是否全部填写
const isFormValid = () => {
  const isValid = title.value && createTime.value && tags.value && cover.value && editorContent.value;
  if (!isValid) {
    console.log('Form validation failed:', {
      title: title.value,
      createTime: createTime.value,
      tags: tags.value,
      cover: cover.value,
      editorContent: editorContent.value
    });
  }
  return isValid;
};

// 保存表单
const saveForm = () => {
  console.log('保存表单:', title.value, alias.value, createTime.value, tags.value, cover.value, editorContent.value);
  isDrawerVisible.value = false;
};

// 取消表单
const cancelForm = () => {
  console.log('取消表单');
  restoreFormState();
  isDrawerVisible.value = false;
};


// 保存文章
const saveArticle = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const alias = urlParams.get('passage');
  console.log('Alias from URL:', alias); // Log the alias to verify
  if (!isFormValid()) {
    ElMessage.error('请填写所有必填字段(包括附加加信息)');
    return;
  }
  const token = document.cookie.split('; ').find(row => row.startsWith('token='));
  if (!token) {
    ElMessage.error('登录过期，请重新登录');
    setTimeout(() => {
      window.location.href = '/console/login';
    }, 1000);
    return;
  }
  try {
    const response = await axios.get(`/api/v1/userControl/getUsername`, {
      params: { token: token.split('=')[1] }
    });
    author.value = response.data.data;
  } catch (error) {
    console.error('Failed to get username:', error);
  }

  const date = new Date(createTime.value);
  if (isNaN(date.getTime())) {
    ElMessage.error('无效的创建时间');
    return;
  }
  // 将 createTime 转换为时间戳
  const timestamp = date.getTime();

  // 保存编辑器内容
  editorContent.value = vditor.getValue();


  try {
    const response = await axios.post('/api/v1/PassageControl/update_passage', null, {
      params: {
        category: cates.value,
        author: author.value,
        time: timestamp,
        alias: alias, // 使用从URL获取的alias
        title: title.value,
        content: editorContent.value,
        tag: tags.value,
        cover: cover.value,

        post: false
      }
    });
    ElMessage.success('文章保存成功');
    // 重置所有内容
    title.value = '';
    createTime.value = '';
    tags.value = '';
    cover.value = '';
    cates.value = '';
    editorContent.value = '';
    vditor.setValue('');
    window.location.href = '/console/dashboard?view=allArticles';
  } catch (error) {
    ElMessage.error('文章保存失败:',error);
  }

  //重定向到所有文章页面

};

const postArticle = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const alias = urlParams.get('passage');
  console.log('Alias from URL:', alias); // Log the alias to verify
  if (!isFormValid()) {
    ElMessage.error('请填写所有必填字段(包括附加加信息)');
    return;
  }
  const token = document.cookie.split('; ').find(row => row.startsWith('token='));
  if (!token) {
    ElMessage.error('登录过期，请重新登录');
    setTimeout(() => {
      window.location.href = '/console/login';
    }, 1000);
    return;
  }
  try {
    const response = await axios.get(`/api/v1/userControl/getUsername`, {
      params: { token: token.split('=')[1] }
    });
    author.value = response.data.data;
  } catch (error) {
    ElMessage.error('Failed to get username:', error);
  }

  const date = new Date(createTime.value);
  if (isNaN(date.getTime())) {
    ElMessage.error('无效的创建时间');
    return;
  }
  // 将 createTime 转换为时间戳
  const timestamp = date.getTime();

  // 保存编辑器内容
  editorContent.value = vditor.getValue();


  try {
    const response = await axios.post('/api/v1/PassageControl/update_passage', null, {
      params: {
        category: cates.value,
        author: author.value,
        time: timestamp,
        alias: alias, // 使用从URL获取的alias
        title: title.value,
        content: editorContent.value,
        tag: tags.value,
        cover: cover.value,
        post: true
      }
    });
    ElMessage.success('文章保存成功');
    // 重置所有内容
    title.value = '';
    createTime.value = '';
    tags.value = '';
    cover.value = '';
    cates.value = '';
    editorContent.value = '';
    vditor.setValue('');
    window.location.href = '/console/dashboard?view=allArticles';
  } catch (error) {
    console.error('Failed to save article:', error);
  }

  //重定向到所有文章页面

};

onMounted(async () => {
  try {
    await nextTick(); // Ensure DOM is fully rendered
    vditor = new Vditor('vditor', {
      height: '100%',
      width: '100%',
      mode: 'ir', // 使用即时渲染模式
      upload: { // Disable upload functionality
        url: '',
        linkToImgUrl: '',
        format: (files, responseText) => responseText,
        file: (files) => files,
        success: () => {},
        error: () => {},
      },
      after: () => {
        const urlParams = new URLSearchParams(window.location.search);
        const alias = urlParams.get('passage');
        console.log('Alias from URL:', alias); // Log the alias to verify
        if (alias) {
          fetchArticleByAlias(alias);
        }
      },
    });
    await fetchTags();
    await fetchCate();
    setInterval(autoSaveEditorContent, 5000); // 自动保存间隔为5秒
  } catch (error) {
    console.error('Failed to initialize Vditor or fetch tags:', error);
  }
});
</script>

<style scoped>
.form-item {
  user-select: none;
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

.editor-container {
  height: 100%;
  width: 100%;
  max-width: 1200px; /* Optional: Set a max width */
  max-height: 800px; /* Optional: Set a max height */
  padding: 0;
  margin: 0;
}

.select-footer {
  display: flex;
  flex-direction: column;

  .option-input {
    width: 100%;
    margin-bottom: 8px;
  }
}
</style>