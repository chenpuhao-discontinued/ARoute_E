<template>
  <el-form class="login-form" :model="initForm" @submit.prevent="submitInit">
    <el-form-item>
      <div class="login-logo gradient-text">ARoute</div>
    </el-form-item>
    <el-form-item>
      <el-input class="custom-el-input" v-model="initForm.website_name" placeholder="站点名称" clearable required></el-input>
    </el-form-item>
    <el-form-item>
      <el-input class="custom-el-input" v-model="initForm.email" placeholder="管理员邮箱" clearable required></el-input>
    </el-form-item>
    <el-form-item>
      <el-input class="custom-el-input" type="password" v-model="initForm.password" placeholder="密码" show-password
                required></el-input>
    </el-form-item>
    <el-form-item>
      <el-input class="custom-el-input" type="password" v-model="initForm.repeat" placeholder="重复密码"
                show-password required></el-input>
    </el-form-item>
    <el-form-item>
      <el-input class="custom-el-input" v-model="initForm.host" placeholder="SMTP 服务器名称" clearable required></el-input>
    </el-form-item>
    <el-form-item>
      <el-input class="custom-el-input" type="number" v-model="initForm.port" placeholder="SMTP 端口" clearable required></el-input>
    </el-form-item>
    <el-form-item>
      <el-input class="custom-el-input" v-model="initForm.secure" placeholder="SMTP 加密(大写)" clearable required></el-input>
    </el-form-item>
    <el-form-item>
      <el-input class="custom-el-input" v-model="initForm.user" placeholder="SMTP 账号" clearable required></el-input>
    </el-form-item>
    <el-form-item>
      <el-input class="custom-el-input" type="password" v-model="initForm.pass" placeholder="SMTP 密码"
                show-password required></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" native-type="submit" class="custom-el-button">
        立即注册
      </el-button>
    </el-form-item>
  </el-form>
  <div class="bottom-center">
    <div class="login-label">
      Powered by <a href="https://www.hauchet.cn">hauchet</a>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import {ElNotification} from "element-plus";

const initForm = ref({
  website_name: '',
  username: '',
  email: '',
  verification_code: '',
  password: '',
  repeat: '',
  host: '',
  port: '',
  secure: '',
  user: '',
  pass: ''
});
const submitInit = () => {
  const button = document.querySelector('.custom-el-button');
  button.setAttribute('disabled', 'disabled');

  // 检查密码是否一致
  if (initForm.value.password !== initForm.value.repeat) {
    ElNotification({
      title: '错误',
      message: '两次输入的密码不一致',
      type: 'error'
    });
    button.removeAttribute('disabled');
    return;
  }

  // 检查邮箱格式
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(initForm.value.email)) {
    ElNotification({
      title: '错误',
      message: '邮箱格式错误',
      type: 'error'
    });
    button.removeAttribute('disabled');
    return;
  }

  const url = `/api/v1/installControl/setMailConfig?host=${encodeURIComponent(initForm.value.host)}&port=${encodeURIComponent(initForm.value.port)}&secure=${encodeURIComponent(initForm.value.secure)}&user=${encodeURIComponent(initForm.value.user)}&pass=${encodeURIComponent(initForm.value.pass)}`;

  fetch(url, {
    method: 'POST',
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
    if (data.code === 200) {
      ElNotification({
        title: '成功',
        message: '邮件配置更新成功',
        type: 'success'
      });
      return fetch(`/api/v1/sendMail/sendMail?to=${encodeURIComponent(initForm.value.email)}&subject=ARoute&text=ARoute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
    } else {
      throw new Error('邮件配置更新失败');
    }
  }).then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('网络错误');
    }
  }).then(data => {
    if (data.message === 'Email sent successfully') {
      ElNotification({
        title: '成功',
        message: '邮件发送成功',
        type: 'success'
      });
      return fetch(`/api/v1/installControl/setWebsiteName?website_name=${encodeURIComponent(initForm.value.website_name)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
    } else {
      throw new Error('邮件发送失败');
    }
  }).then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('网络错误');
    }
  }).then(data => {
    if (data.code === 200) {
      ElNotification({
        title: '成功',
        message: '站点名称更新成功',
        type: 'success'
      });
      return fetch(`/api/v1/installControl/install`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
    } else {
      throw new Error('站点名称更新失败');
    }
  }).then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('网络错误');
    }
  }).then(data => {
    if (data.code === 200) {
      ElNotification({
        title: '成功',
        message: '初始化成功',
        type: 'success'
      });
      initForm.value.username = initForm.value.email.split('@')[0];
      fetch(`/api/v1/userControl/registerAdmin?username=${encodeURIComponent(initForm.value.username)}&email=${encodeURIComponent(initForm.value.email)}&password=${encodeURIComponent(initForm.value.password)}`, {
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
        if (data.code === 200) {
          ElNotification({
            title: '成功',
            message: '管理员注册成功',
            type: 'success'
          });
          setTimeout(() => {
            window.location.href = '/console/login';
          }, 1000);
        } else {
          throw new Error('管理员注册失败');
        }
      }).catch(error => {
        ElNotification({
          title: '错误',
          message: error.message,
          type: 'error'
        });
      });
    } else {
      throw new Error('初始化失败');
    }
  }).catch(error => {
    ElNotification({
      title: '错误',
      message: error.message,
      type: 'error'
    });
  }).finally(() => {
    button.removeAttribute('disabled');
  });
};

onMounted(() => {
  document.title = "初始化";
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

.custom-el-input {
  max-width: 100%;
  width: 300px;
}

.custom-el-button {
  max-width: 100%;
  width: 300px;
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
  font-size: 38px;
  font-weight: bold;
}

.gradient-text {
  background: linear-gradient(to right, #0000ff, #00ffff);
  -webkit-background-clip: text;
  background-clip: text;
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