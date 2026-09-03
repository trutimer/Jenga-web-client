import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import i18nPlugin from './i18n';
import './index.css';

const app = createApp(App);
app.use(router);
app.use(i18nPlugin);
app.mount('#root');
