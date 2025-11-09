import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

// 1. PrimeVue 및 테마 임포트
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import ToastService from 'primevue/toastservice';
import 'primeicons/primeicons.css'; // (아이콘)

const app = createApp(App);

app.use(createPinia());
app.use(router);

// 2. PrimeVue 플러그인 등록
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});

// 3. ToastService 등록
app.use(ToastService);

app.mount('#app');