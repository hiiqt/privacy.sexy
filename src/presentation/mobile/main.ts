// SPDX-License-Identifier: AGPL-3.0-or-later
import { createApp } from 'vue';
import MobileApp from './MobileApp.vue';
import { ApplicationBootstrapper } from '@/presentation/bootstrapping/ApplicationBootstrapper';
import { DependencyBootstrapper } from '@/presentation/bootstrapping/Modules/DependencyBootstrapper';
import { RuntimeSanityBootstrapper } from '@/presentation/bootstrapping/Modules/RuntimeSanityBootstrapper';
import { AppInitializationLogger } from '@/presentation/bootstrapping/Modules/AppInitializationLogger';
import { MobileSafariActivePseudoClassEnabler } from '@/presentation/bootstrapping/Modules/MobileSafariActivePseudoClassEnabler';
import { buildContext } from '@/application/Context/ApplicationContextFactory';
import { loadMobileApplicationComposite } from '@/application/Application/Loader/CompositeApplicationLoader';
import { AsyncLazy } from '@/infrastructure/Threading/AsyncLazy';
import type { Application } from '@/domain/Application/Application';

// Provide a dedicated mobile application provider that only loads Android + GrapheneOS collections.
// This avoids the shared singleton which would load all 5 OS collections (Windows/macOS/Linux).
const mobileAppGetter = new AsyncLazy<Application>(() =>
  Promise.resolve(loadMobileApplicationComposite()),
);
const mobileBuildContext = () => buildContext(() => mobileAppGetter.getValue());

const app = createApp(MobileApp);

await new ApplicationBootstrapper([
  new RuntimeSanityBootstrapper(),
  new DependencyBootstrapper(mobileBuildContext),
  new AppInitializationLogger(),
  new MobileSafariActivePseudoClassEnabler(),
]).bootstrap(app);

app.mount('#app');
