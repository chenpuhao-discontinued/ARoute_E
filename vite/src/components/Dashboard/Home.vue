<script setup>
import { ref, onMounted } from 'vue';
import { ElDrawer, ElButton, ElCard, ElRow, ElCol } from 'element-plus';
import 'element-plus/dist/index.css';
import axios from 'axios';

// 动态导入 Home_assembly 文件夹下的所有组件
const componentsContext = import.meta.glob('./Home_assembly/*.vue');
const availableComponents = ref([]);
const components = ref([]); // 确保在这里定义
const isEditing = ref(false); // 确保在这里定义
const isDrawerVisible = ref(false); // 确保在这里定义

const loadComponentsState = async () => {
  try {
    const response = await axios.get('/api/v1/PassageControl/home_assembly');
    const loadedComponents = JSON.parse(response.data.home_assembly);
    console.log('Loaded components from API:', loadedComponents); // Debugging line
    components.value = loadedComponents.map(comp => {
      const component = availableComponents.value.find(c => c.name === comp.componentName);
      return { ...comp, component: component ? component.component : null };
    });
    console.log('Components after mapping:', components.value); // Debugging line
  } catch (error) {
    console.error('Failed to load components state:', error);
  }
};

const loadAvailableComponents = async () => {
  const promises = Object.keys(componentsContext).map(async (path) => {
    const componentName = path.split('/').pop().replace('.vue', '');
    const module = await componentsContext[path]();
    availableComponents.value.push({ name: componentName, component: module.default });
  });
  await Promise.all(promises);
};

const toggleEdit = async () => {
  isEditing.value = !isEditing.value;
  if (!isEditing.value) {
    await saveComponentsState();
  }
};

const saveComponentsState = async () => {
  try {
    const response = await axios.post('/api/v1/PassageControl/set_home_assembly', {
      components: components.value.map(comp => ({
        id: comp.id,
        componentName: comp.componentName,
        x: comp.x,
        y: comp.y
      }))
    });
    console.log(response.data.message);
  } catch (error) {
    console.error('Failed to save components state:', error);
  }
};

const addComponent = (component, componentName) => {
  const newId = components.value.length ? components.value[components.value.length - 1].id + 1 : 1;
  components.value.push({ id: newId, component, componentName, x: 0, y: 0 });
  isDrawerVisible.value = false;
};

const deleteComponent = (id) => {
  components.value = components.value.filter(comp => comp.id !== id);
};

onMounted(async () => {
  await loadAvailableComponents();
  await loadComponentsState();
});
</script>

<template>
  <div class="dashboard-header">
    <h2 class="dashboard-title">仪表盘</h2>
    <el-button class="settings-button" @click="toggleEdit" v-if="!isEditing">修改</el-button>
    <div v-else>
      <el-button class="settings-button" @click="isDrawerVisible = true">添加</el-button>
      <el-button class="settings-button" @click="toggleEdit">完成</el-button>
    </div>
  </div>
  <div class="components-container">
    <div
        v-for="comp in components"
        :key="comp.id"
        class="component-wrapper"
    >
      <component :is="comp.component" />
      <el-button class="delete-button" v-if="isEditing" @click="deleteComponent(comp.id)">×</el-button>
    </div>
  </div>

  <el-drawer v-model="isDrawerVisible" title="添加组件" :with-header="false" size="500px">
    <el-row :gutter="20">
      <el-col :span="24" v-for="comp in availableComponents" :key="comp.name">
        <el-card>
          <component :is="comp.component" />
          <div style="text-align: center; margin-top: 10px;">
            <el-button type="primary" @click="addComponent(comp.component, comp.name)">添加</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </el-drawer>
</template>



<style scoped>
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
  display: grid;
  grid-template-columns: repeat(auto-fill, 250px);
  grid-auto-rows: 250px;
  gap: 10px;
  top: 60px;
  left: 250px;
  right: 0;
  bottom: 0;
  background-color: #fff;
  overflow: auto; /* Ensure the container is scrollable */
  user-select: none;
}

.component-wrapper {
  position: relative;
  width: 250px;
  height: 250px;
  margin: 10px;
  box-sizing: border-box;
}

.delete-button {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: transparent;
  color: red;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
  font-size: 16px;
  line-height: 20px;
  text-align: center;
  padding: 0;
}

.delete-button:hover {
  color: darkred;
}
</style>