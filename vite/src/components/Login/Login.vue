<template>
    <el-form class="login-form" :model="loginForm" @submit.prevent="submitLogin">
      <el-form-item>
        <div class="login-logo gradient-text">ARoute</div>
      </el-form-item>
      <el-form-item>
        <el-input class="custom-el-input" v-model="loginForm.email" placeholder="邮箱" clearable required></el-input>
      </el-form-item>
      <el-form-item class="password-with-button">
        <el-input class="custom-el-password-input" type="password" v-model="loginForm.password" placeholder="密码" show-password required></el-input>
        <el-button type="primary" native-type="submit" class="login-button">
          <template #icon>
            <ArrowRight/>
          </template>
        </el-button>
      </el-form-item>
    </el-form>
    <div class="login-label">
      <div style="text-align: center;">
        没有账号,<a href="/console/register">立即注册</a>&nbsp;&nbsp;&nbsp;&nbsp;<a href="/console/reset">找回密码</a>
      </div>
    </div>
  <div class="bottom-center">
    <div class="login-label">
      Powered by <a href="https://www.hauchet.cn">hauchet</a>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ArrowRight } from '@element-plus/icons-vue';
import {ElNotification} from "element-plus";

const loginForm = ref({
  email: '',
  password: ''
});

const submitLogin = () => {
  fetch(`/api/v1/userControl/login?email=${encodeURIComponent(loginForm.value.email)}&password=${encodeURIComponent(loginForm.value.password)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  }).then(response => {
    if (response.ok) {
      return response.json();
    } else if (response.status === 401) {
      throw new Error('登录失败');
    } else {
      throw new Error('网络错误');
    }
  }).then(data => {
    if (data.message === 'true') {
      ElNotification({
        title: '成功',
        message: '登录成功',
        type: 'success'
      });
      //储存返回的token为5分钟的cookie
      document.cookie = `token=${data.token};max-age=300;path=/`;
      //延迟1秒跳转到登录页面
      setTimeout(() => {
        window.location.href = '/console/dashboard';
      }, 1000);
    }
  }).catch(error => {
    ElNotification({
      title: '错误',
      message: error.message === '登录失败' ? '登录失败' : '网络错误',
      type: 'error'
    });
  });
};

const checkToken = () => {
  const token = document.cookie.split('; ').find(row => row.startsWith('token='));
  if (token) {
    // 如果 token 存在，执行相应的操作
    //首先校验cookie是否有效
    fetch(`/api/v1/userControl/checkToken?token=${token.split('=')[1]}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    }).then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('网络错误');
      }
    }).then(data => {
      if (data.message === 'success') {
        //如果token有效，跳转到dashboard
        //延迟1秒跳转到登录页面
        //提示
        ElNotification({
          title: '成功',
          message: '检测到已有会话，即将跳转到控制台',
          type: 'success'
        });
        setTimeout(() => {
          window.location.href = '/console/dashboard';
        }, 1000);
      }
    }).catch(() => {
      //如果token无效，清除cookie
      document.cookie = 'token=;max-age=0;path=/';
    });
  }
};

onMounted(() => {
  document.title = "登录"; // Set the page title
  checkToken();
});
</script>

<style scoped>
.login-label {
  font-size: 15px;
  color: #838181;
  user-select: none;
  text-align: center;
  width: 100%;
}

.custom-el-input,
.custom-el-password-input,
.custom-el-button {
  max-width: 100%;
  width: 300px;
}

.custom-el-password-input {
  width: 245px;
}

.custom-el-input .el-button,
.custom-el-input .el-button:focus,
.custom-el-input .el-button:active {
  outline: none;
  box-shadow: none;
}

.login-form {
  max-width: 100%;
  width: 100%;
}

.login-logo {
  margin: 0 auto;
  display: block;
  user-select: none;
  font-size: 36px;
  font-weight: bold;
}

.gradient-text {
  background: linear-gradient(to right, #0000ff, #00ffff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.password-with-button {
  display: flex;
  align-items: center;
  width: 100%;
}

.password-with-button .custom-el-input,
.password-with-button .login-button {
  flex: 1;
}

.login-button {
  flex: 0 1 auto;
  margin-left: 10px;
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