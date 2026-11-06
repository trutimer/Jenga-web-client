import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import i18nPlugin from './i18n';
import './index.css';
import { initTelemetry } from './services/telemetryService';
import { initWebUpdateWatcher } from './services/webUpdateService';

const app = createApp(App);
app.use(router);
app.use(i18nPlugin);

// Initialize client-side feature usage tracking and telemetry
initTelemetry(router);

// Watch for web updates (WhatsApp-style reload prompt)
initWebUpdateWatcher();

app.mount('#root');
