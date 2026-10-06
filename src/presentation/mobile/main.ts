// SPDX-License-Identifier: AGPL-3.0-or-later
import { createApp } from 'vue';
import MobileApp from './MobileApp.vue';
import { ApplicationBootstrapper } from '@/presentation/bootstrapping/ApplicationBootstrapper';

const app = createApp(MobileApp);

await new ApplicationBootstrapper()
  .bootstrap(app);

app.mount('#app');
