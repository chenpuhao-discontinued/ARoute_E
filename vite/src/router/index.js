import { createRouter, createWebHistory } from 'vue-router';
import Login from "../components/Login/Login.vue";
import Register from "../components/Register/Register.vue";
import ResetPassword from "../components/ResetPassword/ResetPassword.vue";
import Init from "../components/Init/Init.vue";
import Dashboard from "../components/Dashboard/Dashboard.vue"; // 假设有一个 Dashboard 组件

const routes = [
    {
        path: '/console',
        name: 'Console',
        redirect: '/console/login'
    },
    {
        path: '/console/login',
        name: 'Login',
        component: Login
    },
    {
        path: '/console/register',
        name: 'Register',
        component: Register
    },
    {
        path: '/console/reset',
        name: 'ResetPassword',
        component: ResetPassword
    },
    {
        path: '/init',
        name: 'Init',
        component: Init
    },
    {
        path: '/console/dashboard',
        name: 'Dashboard',
        component: Dashboard,
        beforeEnter: async (to, from, next) => {
            const token = document.cookie.split('; ').find(row => row.startsWith('token='));
            if (token) {
                const tokenValue = token.split('=')[1];
                try {
                    const response = await fetch(`/api/v1/userControl/checkToken?token=${tokenValue}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });
                    const data = await response.json();
                    if (data.message === 'success') {
                        next();
                    } else {
                        next('/console/login');
                    }
                } catch (error) {
                    next('/console/login');
                }
            } else {
                next('/console/login');
            }
        }
    }
];

const router = createRouter({
    history: createWebHistory('/'),
    routes
});

router.beforeEach(async (to, from, next) => {
    try {
        const response = await fetch('http://localhost:5173/api/v1/installControl/checkInstall', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });
        const data = await response.json();
        const value = parseInt(data.value, 10);
        if (value === 0 && to.path !== '/init') {
            next('/init');
        } else if (value === 1 && to.path === '/init') {
            next('/console/login');
        } else {
            next();
        }
    } catch (error) {
        next();
    }
});

export default router;