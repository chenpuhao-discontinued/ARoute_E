<template>
  <el-form class="login-form" :model="resetForm" @submit.prevent="submitLogin">
    <el-form-item>
      <div class="login-logo gradient-text">ARoute</div>
    </el-form-item>
    <el-form-item>
      <el-input class="custom-el-input" v-model="resetForm.username" placeholder="用户名" clearable required></el-input>
    </el-form-item>
    <el-form-item>
      <el-input class="custom-el-input" v-model="resetForm.email" placeholder="邮箱" clearable required></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" native-type="submit" class="custom-el-button">
        发送重置邮件
      </el-button>
    </el-form-item>
  </el-form>
  <div class="login-label">
    <div style="text-align: center;">
      想起密码,<a href="/console/login">立即登录</a>
    </div>
  </div>
  <div class="bottom-center">
    <div class="login-label">
      Powered by <a href="https://www.hauchet.cn">hauchet</a>
    </div>
  </div>

</template>

<script setup>
import { ref } from 'vue'
import { onMounted } from 'vue';

const sendEmail = () => {
  // 在这里添加发送邮件逻辑

}

onMounted(async () => {

});

onMounted(() => {
  document.title = "重置密码"; // Set the page title
});


const resetForm = ref({
  username: '',
  password: ''
})

const submitLogin = () => {
  // 在这里添加登录逻辑

}

</script>

<style scoped>
.login-label {
  font-size: 15px;
  color: #838181;
  user-select: none;
  margin-left: 0;
  display: block;
  text-align: center; /* Ensure text is centered */
  width: 100%; /* Ensure the container is wide enough */
}

.custom-el-input .el-button {
  outline: none; /* Remove the default outline */
  box-shadow: none; /* Remove the default box-shadow */
}

.custom-el-input .el-button:focus,
.custom-el-input .el-button:active {
  outline: none; /* Remove the outline on focus and active states */
  box-shadow: none; /* Remove the box-shadow on focus and active states */
}

.custom-el-button {
  max-width: 100%; /* Ensure the button does not exceed the parent container's width */
  width: 300px;

}

.custom-el-input {
  max-width: 100%; /* Ensure the input does not exceed the parent container's width */
  width: 300px;
}

.login-form {
  max-width: 100%; /* Ensure the form does not exceed the parent container's width */
  width: 100%; /* Make the form take the full width of the parent container */
}
.login-logo {
  margin: 0 auto; /* 水平居中 */
  display: block; /* 使文本居中 */
  user-select: none; /* 防止用户选中文本 */
  font-size: 36px; /* 设置字体大小 */
  font-weight: bold; /* 设置字体粗细 */
}

.gradient-text {
  background: linear-gradient(to right, #0000ff, #00ffff); /* Adjusted gradient for a more pronounced effect */
  -webkit-background-clip: text;
  background-clip: text; /* Standard property for compatibility */
  color: transparent;
}
.bottom-center {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  padding: 10px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
</style>