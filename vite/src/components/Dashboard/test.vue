<script setup>
import { ref, onMounted } from 'vue';
import 'element-plus/dist/index.css';
import axios from 'axios';
import 'vditor/dist/index.css';
import Vditor from 'vditor';

const editorContent = ref('');
let vditorInstance = null;

// 加载编辑器内容
const loadEditorContent = async () => {
  try {
    const response = await axios.get('/api/v1/PassageControl/editor_content');
    editorContent.value = response.data.content;
    if (vditorInstance) {
      vditorInstance.setValue(editorContent.value);
    }
  } catch (error) {
    console.error('Failed to load editor content:', error);
  }
};

// 保存编辑器内容
const saveEditorContent = async () => {
  try {
    editorContent.value = vditorInstance.getValue();
    const response = await axios.post('/api/v1/PassageControl/set_editor_content', {
      content: editorContent.value
    });
    console.log(response.data.message);
  } catch (error) {
    console.error('Failed to save editor content:', error);
  }
};

onMounted(async () => {
  await loadEditorContent();
  vditorInstance = new Vditor('vditor', {
    height: '100%',
    width: '100%',
    mode: 'ir', // 使用即时渲染模式
    after: () => {
      vditorInstance.setValue(editorContent.value);
    }
  });
});
</script>

<template>
  <div class="editor-wrapper">
    <div id="vditor" class="editor-container"></div>
  </div>
</template>

<style scoped>
.editor-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  padding: 0;
  margin: 0;
}

.editor-container {
  height: 80%;
  width: 80%;
  max-width: 1200px; /* Optional: Set a max width */
  max-height: 800px; /* Optional: Set a max height */
  padding: 0;
  margin: 0;
}
</style>