<template>
  <el-form class="login-form" :model="registerForm" @submit.prevent="submitRegister">
    <el-form-item>
      <div class="login-logo gradient-text">ARoute</div>
    </el-form-item>
    <el-form-item>
      <el-input class="custom-el-input" v-model="registerForm.email" placeholder="邮箱" clearable required></el-input>
    </el-form-item>
    <el-form-item>
      <el-input class="custom-el-input" v-model="registerForm.verification_code" placeholder="验证码" required clearable >
        <template #append>
          <el-button type="primary" @click="sendEmail" :disabled="isButtonDisabled">
            {{ isButtonDisabled ? `${countdown}秒后重试` : '发送验证码' }}
          </el-button>
        </template>
      </el-input>
    </el-form-item>
    <el-form-item>
      <el-input class="custom-el-input" type="password" v-model="registerForm.password" placeholder="密码" show-password
                required></el-input>
    </el-form-item>
    <el-form-item>
      <el-input class="custom-el-input" type="password" v-model="registerForm.repeat" placeholder="重复密码"
                show-password required></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" native-type="submit" class="custom-el-button">
        立即注册
      </el-button>
    </el-form-item>
  </el-form>
  <div class="login-label">
    <div style="text-align: center;">
      已有账号,<a href="/console/login">立即登录</a>&nbsp;&nbsp;&nbsp;&nbsp;<a href="/console/reset">找回密码</a>
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
import { ElNotification } from "element-plus";

let code = '';
for (let i = 0; i < 6; i++) {
  code += Math.floor(Math.random() * 10);
}
let title = 'ARoute';
//获取网站名称
fetch(`/api/v1/systemInfo/getWebsiteName`, {
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
}).then(async data => {
  if (data) {
    //解析website_name
    title = data.website_name;
  }
})

const registerForm = ref({
  username: '',
  email: '',
  verification_code: '',
  password: '',
  repeat: ''
});

const countdown = ref(0);
const isButtonDisabled = ref(false);

const sendEmail = () => {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.value.email)) {
    ElNotification({
      title: '错误',
      message: '邮箱格式错误',
      type: 'error'
    });
    return;
  }

  //检查用户是否存在
  fetch(`/api/v1/userControl/isUserExist?email=${encodeURIComponent(registerForm.value.email)}`, {
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
    if (data) {
      ElNotification({
        title: '错误',
        message: '用户已存在',
        type: 'error'
      });
    } else {
      fetch(`/api/v1/sendMail/sendMail?to=${encodeURIComponent(registerForm.value.email)}&text=您的${encodeURIComponent(title)}注册验证码为${encodeURIComponent(code)}&subject=${encodeURIComponent(title)}注册验证码`, {
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
        if (data) {
          ElNotification({
            title: '成功',
            message: '验证码发送成功',
            type: 'success'
          });
          startCountdown();
        } else {
          ElNotification({
            title: '错误',
            message: '验证码发送失败',
            type: 'error'
          });
        }
      }).catch(error => {
        ElNotification({
          title: '错误',
          message: error,
          type: 'error'
        });
      });
    }
  }).catch(error => {
    ElNotification({
      title: '错误',
      message: error,
      type: 'error'
    });
  });



};

const startCountdown = () => {
  countdown.value = 30;
  isButtonDisabled.value = true;
  const interval = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(interval);
      isButtonDisabled.value = false;
    }
  }, 1000);
};

const submitRegister = () => {
  if (registerForm.value.password !== registerForm.value.repeat) {
    ElNotification({
      title: '错误',
      message: '两次输入的密码不一致',
      type: 'error'
    });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.value.email)) {
    ElNotification({
      title: '错误',
      message: '邮箱格式错误',
      type: 'error'
    });
    return;
  }
  if (registerForm.value.verification_code !== code) {
    ElNotification({
      title: '错误',
      message: '验证码错误',
      type: 'error'
    });
    return;
  }

  fetch(`/api/v1/userControl/isUserExist?email=${encodeURIComponent(registerForm.value.email)}`, {
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
    if (data) {
      ElNotification({
        title: '错误',
        message: '用户已存在',
        type: 'error'
      });
    } else {
      registerForm.value.username = registerForm.value.email.split('@')[0];
      fetch(`/api/v1/userControl/register?username=${encodeURIComponent(registerForm.value.username)}&email=${encodeURIComponent(registerForm.value.email)}&password=${encodeURIComponent(registerForm.value.password)}`, {
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
        if (data) {
          ElNotification({
            title: '成功',
            message: '注册成功',
            type: 'success'
          });
          setTimeout(() => {
            window.location.href = '/console/login';
          }, 1000);
        } else {
          ElNotification({
            title: '错误',
            message: '注册失败',
            type: 'error'
          });
        }
      }).catch(error => {
        ElNotification({
          title: '错误',
          message: error,
          type: 'error'
        });
      });
    }
  }).catch(error => {
    ElNotification({
      title: '错误',
      message: error,
      type: 'error'
    });
  });
};

onMounted(() => {
  document.title = "注册";
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
  font-size: 36px;
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