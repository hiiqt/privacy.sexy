// SPDX-License-Identifier: AGPL-3.0-or-later
// Regression test: android.yaml and grapheneos.yaml must parse without error through the real
// loader. The unit-level loader tests use stubs (which is why the bug slipped through).

import { describe, it, expect } from 'vitest';
import { BASE_APP_COMPILATION_TIMEOUT_MS } from '@tests/shared/TestTiming';
import { loadCollections } from '@/application/Application/Loader/Collections/CollectionsLoader';
import { ProjectDetailsStub } from '@tests/unit/shared/Stubs/ProjectDetailsStub';
import { OperatingSystem } from '@/domain/OperatingSystem';

describe('Mobile collections (real YAML)', () => {
  it('android.yaml and grapheneos.yaml parse without throwing', {
    timeout: BASE_APP_COMPILATION_TIMEOUT_MS,
  }, () => {
    const act = () => loadCollections(new ProjectDetailsStub());
    expect(act).not.to.throw();
  });

  it('parsed collections include android and grapheneos entries', {
    timeout: BASE_APP_COMPILATION_TIMEOUT_MS,
  }, () => {
    const collections = loadCollections(new ProjectDetailsStub());
    const osList = collections.map((c) => c.os);
    expect(osList).toContain(OperatingSystem.Android);
    expect(osList).toContain(OperatingSystem.GrapheneOS);
  });
});
