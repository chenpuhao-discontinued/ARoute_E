

<template>
  <div class="dashboard-header">
    <h2 class="dashboard-title">新建文章</h2>
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
      <el-form-item class="form-item" label="别名">
        <el-input v-model="alias" placeholder="请输入别名"></el-input>
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
          multiple
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
import pinyin from 'pinyin';

const editorContent = ref('');
let vditorInstance = null;
const isDrawerVisible = ref(false);
const title = ref('');
const alias = ref('');
const author = ref('');
const tags = ref([]);
const cover = ref('');
const isAddingTag = ref(false);
const newTag = ref('');
const tagOptions = ref([]);
const createTime = ref('');

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
        tags.value.push(newTag.value);
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

// Function to remove punctuation, including Chinese punctuation
const removePunctuation = (str) => {
  return str.replace(/[.,\/#!$%\^&\*;:{}=_`~()，。！？、；：“”‘’（）【】《》]/g, '');
};

// Convert title to Pinyin, remove punctuation, and update alias
const updateAlias = () => {
  const pinyinTitle = pinyin(title.value, { style: pinyin.STYLE_NORMAL }).flat().join('-');
  const sanitizedTitle = removePunctuation(pinyinTitle);
  alias.value = sanitizedTitle.substring(0, 50);
};

// Watch title for changes and update alias
watch(title, updateAlias);

// 加载编辑器内容
// 保存编辑器内容
// 自动保存编辑器内容
const autoSaveEditorContent = async () => {
  try {
    editorContent.value = vditorInstance.getValue();
    console.log('Editor content auto-saved');
  } catch (error) {
    console.error('Failed to auto-save editor content:', error);
  }
};

// 检查表单是否全部填写
const isFormValid = () => {
  const isValid = title.value && alias.value && createTime.value && tags.value.length && cover.value && editorContent.value;
  if (!isValid) {
    console.log('Form validation failed:', {
      title: title.value,
      alias: alias.value,
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
  isDrawerVisible.value = false;
};

// 保存文章
const saveArticle = async () => {
  if (!isFormValid()) {
    ElMessage.error('请填写所有必填字段(包括添加信息)');
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

  try {
    const response = await axios.post('/api/v1/PassageControl/add_passage', null, {
      params: {
        author: author.value,
        time: timestamp,
        alias: alias.value,
        title: title.value,
        content: editorContent.value,
        read: 0,
        tag: tags.value.join(','),
        cover: cover.value,
        post: false
      }
    });
    ElMessage.success('文章保存成功');
    // 重置所有内容
    title.value = '';
    alias.value = '';
    createTime.value = '';
    tags.value = [];
    cover.value = '';
    editorContent.value = '';
    vditorInstance.setValue('');
  } catch (error) {
    console.error('Failed to save article:', error);
  }
};

const postArticle = async () => {
  if (!isFormValid()) {
    ElMessage.error('请填写所有必填字段(包括添加信息)');
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

  try {
    const response = await axios.post('/api/v1/PassageControl/add_passage', null, {
      params: {
        author: author.value,
        time: timestamp,
        alias: alias.value,
        title: title.value,
        content: editorContent.value,
        read: 0,
        tag: tags.value.join(','),
        cover: cover.value,
        post: true
      }
    });
    ElMessage.success('文章保存并发布成功');
    // 重置所有内容
    title.value = '';
    alias.value = '';
    createTime.value = '';
    tags.value = [];
    cover.value = '';
    editorContent.value = '';
    vditorInstance.setValue('');
  } catch (error) {
    console.error('Failed to save article:', error);
  }
};

onMounted(async () => {
  try {
    vditorInstance = new Vditor('vditor', {
      height: '100%',
      width: '100%',
      mode: 'ir', // 使用即时渲染模式
      after: () => {
        vditorInstance.setValue(editorContent.value);
      }
    });
    await fetchTags();
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