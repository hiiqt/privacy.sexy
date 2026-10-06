# Mobile Privacy Guide — a privacy.sexy modernization

> Fork of **[privacy.sexy](https://github.com/undergroundwires/privacy.sexy)** — modernized into a mobile-first privacy guide for Android & GrapheneOS. Built with [IBM Bob](https://bob.ibm.com/) for the AngelHack *Building With IBM Bob* hackathon (Theme 2: Modernize What Matters).

## What this fork adds

Upstream enforces privacy scripts on desktop. This fork turns its data-driven engine into an **honest mobile guide** — it advises, never executes:

- **38 plain-English privacy guides** — 21 Android + 17 GrapheneOS, every setting explained with color-coded recommendations
- **Privacy posture slider** — Standard / Strict filtering matched to your threat model
- **Interactive checklist** — check off guides as you complete them, progress persists per device ("7 of 21 guides secured")
- **Reference commands, never execution** — ADB commands and settings paths are shown for you to run yourself; there is no Run button, by design
- **Official-source directory** — firmware, flashing, and FRP guidance linking only to official sources

## Live demo

Deploying before the Oct 18 deadline — URL coming soon.

## Tech stack

TypeScript · Vue 3 · Vite · YAML-driven collections · `localStorage` persistence · AGPL-3.0

## Run it

```bash
npm install
npm run build:mobile    # builds the mobile webapp into dist-mobile/
npx serve dist-mobile   # open http://localhost:3000 (or your LAN IP on your phone)
```

## Test

```bash
npm run test:unit         # unit suite
npm run test:integration # integration suite (incl. MobileCollections regression test)
npx vue-tsc --noEmit      # typecheck
```

## What's new in this fork

| Path | What |
|---|---|
| `src/application/collections/android.yaml` | 21 Android guides |
| `src/application/collections/grapheneos.yaml` | 17 GrapheneOS guides |
| `src/presentation/mobile/` | Mobile entry point (`main.ts`, `MobileApp.vue`, `index.html`) |
| `src/presentation/components/Mobile/` | Layout, accordions, script cards, checklist, progress bar |
| `vite.mobile.config.ts` | Mobile build config behind `npm run build:mobile` |
| `docs/mobile-guide-plan.md` | Architecture plan |
| `.bob/` | Bob IDE rules & skills used to build this |

## Built with IBM Bob

Designed in Plan mode, implemented session-by-session in Agent mode — see `.bob/` for the rules and skills, `docs/mobile-guide-plan.md` for the plan.

## License

AGPL-3.0, same as upstream — see [LICENSE](LICENSE).

---

*Upstream README follows.*

---

# privacy.sexy — Privacy is sexy

> Enforce privacy & security best-practices on Windows, macOS and Linux, because privacy is sexy.

<!-- markdownlint-disable MD033 -->
<p align="center">
  <a href="https://undergroundwires.dev/donate?project=privacy.sexy" target="_blank" rel="noopener noreferrer">
    <img
      alt="donation badge"
      src="https://undergroundwires.dev/img/badges/donate/flat.svg"
    />
  </a>
  <a href="https://github.com/undergroundwires/privacy.sexy/blob/master/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">
    <img
      alt="contributions are welcome"
      src="https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat"
    />
  </a>
  <a href="https://codeclimate.com/github/undergroundwires/privacy.sexy/maintainability" target="_blank" rel="noopener noreferrer">
    <img
      alt="Maintainability"
      src="https://api.codeclimate.com/v1/badges/3a70b7ef602e2264342c/maintainability"
    />
  </a>
  <!-- Tests -->
  <br />
  <a href="https://github.com/undergroundwires/privacy.sexy/actions/workflows/tests.unit.yaml" target="_blank" rel="noopener noreferrer">
    <img
      alt="Unit tests status"
      src="https://github.com/undergroundwires/privacy.sexy/workflows/unit-tests/badge.svg"
    />
  </a>
  <a href="https://github.com/undergroundwires/privacy.sexy/actions/workflows/tests.integration.yaml" target="_blank" rel="noopener noreferrer">
    <img
      alt="Integration tests status"
      src="https://github.com/undergroundwires/privacy.sexy/workflows/integration-tests/badge.svg"
    />
  </a>
  <a href="https://github.com/undergroundwires/privacy.sexy/actions/workflows/tests.e2e.yaml" target="_blank" rel="noopener noreferrer">
    <img
      alt="E2E tests status"
      src="https://github.com/undergroundwires/privacy.sexy/workflows/e2e-tests/badge.svg"
    />
  </a>
  <!-- Security checks -->
  <br />
  <a href="https://github.com/undergroundwires/privacy.sexy/actions/workflows/checks.security.sast.yaml" target="_blank" rel="noopener noreferrer">
    <img
      alt="Status of dependency security checks"
      src="https://github.com/undergroundwires/privacy.sexy/workflows/checks.security.sast/badge.svg"
    />
  </a>
  <a href="https://github.com/undergroundwires/privacy.sexy/actions/workflows/checks.security.dependencies.yaml" target="_blank" rel="noopener noreferrer">
    <img
      alt="Status of Static Analysis Security Testing (SAST)"
      src="https://github.com/undergroundwires/privacy.sexy/workflows/checks.security.dependencies/badge.svg"
    />
  </a>
  <!-- Checks -->
  <br />
  <a href="https://github.com/undergroundwires/privacy.sexy/actions/workflows/checks.quality.yaml" target="_blank" rel="noopener noreferrer">
    <img
      alt="Status of quality checks"
      src="https://github.com/undergroundwires/privacy.sexy/workflows/checks.quality/badge.svg"
    />
  </a>
  <a href="https://github.com/undergroundwires/privacy.sexy/actions/workflows/checks.build.yaml" target="_blank" rel="noopener noreferrer">
    <img
      alt="Status of build checks"
      src="https://github.com/undergroundwires/privacy.sexy/workflows/checks.build/badge.svg"
    />
  </a>
  <a href="https://github.com/undergroundwires/privacy.sexy/actions/workflows/checks.desktop-runtime-errors.yaml" target="_blank" rel="noopener noreferrer">
    <img
      alt="Status of runtime error checks for the desktop application"
      src="https://github.com/undergroundwires/privacy.sexy/workflows/checks.desktop-runtime-errors/badge.svg"
    />
  </a>
  <a href="https://github.com/undergroundwires/privacy.sexy/actions/workflows/checks.scripts.yaml" target="_blank" rel="noopener noreferrer">
    <img
      alt="Status of script checks"
      src="https://github.com/undergroundwires/privacy.sexy/workflows/checks.scripts/badge.svg"
    />
  </a>
  <a href="https://github.com/undergroundwires/privacy.sexy/actions/workflows/checks.external-urls.yaml" target="_blank" rel="noopener noreferrer">
    <img
      alt="Status of external URL checks"
      src="https://github.com/undergroundwires/privacy.sexy/workflows/checks.external-urls/badge.svg"
    />
  </a>
  <!-- Release -->
  <br />
  <a href="https://github.com/undergroundwires/privacy.sexy/actions/workflows/release.git.yaml" target="_blank" rel="noopener noreferrer">
    <img
      alt="Git release status"
      src="https://github.com/undergroundwires/privacy.sexy/workflows/release-git/badge.svg"
    />
  </a>
  <a href="https://github.com/undergroundwires/privacy.sexy/actions/workflows/release.site.yaml" target="_blank" rel="noopener noreferrer">
    <img
      alt="Site release status"
      src="https://github.com/undergroundwires/privacy.sexy/workflows/release-site/badge.svg"
    />
  </a>
  <a href="https://github.com/undergroundwires/privacy.sexy/actions/workflows/release.desktop.yaml" target="_blank" rel="noopener noreferrer">
    <img
      alt="Desktop application release status"
      src="https://github.com/undergroundwires/privacy.sexy/workflows/release-desktop/badge.svg"
    />
  </a>
  <!-- Others -->
  <br />
  <a href="https://github.com/undergroundwires/bump-everywhere" target="_blank" rel="noopener noreferrer">
    <img
      alt="Auto-versioned by bump-everywhere"
      src="https://github.com/undergroundwires/bump-everywhere/blob/master/badge.svg?raw=true"
    />
  </a>
</p>
<!-- markdownlint-restore -->

## Get started

- 🌍️ **Online**: [https://privacy.sexy](https://privacy.sexy).
- 🖥️ **Offline**: Download directly for: [Windows](https://github.com/undergroundwires/privacy.sexy/releases/download/0.13.8/privacy.sexy-Setup-0.13.8.exe), [macOS](https://github.com/undergroundwires/privacy.sexy/releases/download/0.13.8/privacy.sexy-0.13.8.dmg), [Linux](https://github.com/undergroundwires/privacy.sexy/releases/download/0.13.8/privacy.sexy-0.13.8.AppImage). For more options, see [here](#additional-install-options).

See also:

- [Desktop vs. Web Features](./docs/desktop/desktop-vs-web-features.md): Differences and unique aspects of desktop and web versions.
- [System Requirements](./docs/desktop/system-requirements.md): Hardware and software requirements for the desktop version.

💡 Regularly applying your configuration with privacy.sexy is recommended, especially after each new release and major operating system updates. Each version updates scripts to enhance stability, privacy, and security.

[![privacy.sexy application](img/screenshot.png?raw=true )](https://privacy.sexy)

## Features

- **Rich**: Hundreds of scripts that aims to give you control of your data.
- **Free**: Both free as in "beer" and free as in "speech".
- **Transparent**. Have full visibility into what the tweaks do as you enable them.
- **Reversible**. Revert if something feels wrong.
- **Accessible**. No need to run any compiled software on your computer with web version.
- **Secure**: Security is a top priority at privacy.sexy with [comprehensive safeguards](./SECURITY.md#security-practices) in place.
- **Open**. What you see as code in this repository is what you get. The application itself, its infrastructure and deployments are open-source and automated thanks to [bump-everywhere](https://github.com/undergroundwires/bump-everywhere).
- **Tested**. A lot of tests. Automated and manual. Community-testing and verification. Stability improvements comes before new features.
- **Extensible**. Effortlessly [extend scripts](./CONTRIBUTING.md#extend-scripts) with a custom designed [templating language](./docs/templating.md).
- **Portable and simple**. Every script is independently executable without cross-dependencies.

## Support

**Sponsor 💕**. Consider sponsoring on [GitHub Sponsors](https://github.com/sponsors/undergroundwires), or you can donate using [other ways such as crypto or a coffee](https://undergroundwires.dev/donate).

**Star 🤩**. Feel free to give it a star ⭐ .

**Contribute 👷**. Contributions of any type are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) as the starting point. It includes useful information like [how to add new scripts](./CONTRIBUTING.md#extend-scripts).

## Additional Install Options

- Check the [releases page](https://github.com/undergroundwires/privacy.sexy/releases) for all available versions.
- Other unofficial channels (not maintained by privacy.sexy) for Windows include:
  - [Scoop 🥄](https://scoop.sh/#/apps?q=privacy.sexy&s=2&d=1&o=true) (latest version):

    ```powershell
      scoop bucket add extras
      scoop install privacy.sexy
    ```

  - [winget 🪟](https://winget.run/pkg/undergroundwires/privacy.sexy) (may be outdated):

    ```powershell
      winget install -e --id undergroundwires.privacy.sexy
    ```

    With winget, updates require manual submission; the auto-update feature within privacy.sexy will notify you of new releases post-installation.

## Development

Refer to [development.md](./docs/development.md) for Docker usage and reading more about setting up your development environment.

Check [architecture.md](./docs/architecture.md) for an overview of design and how different parts and layers work together. You can refer to [application.md](./docs/application.md) for a closer look at application layer codebase and [presentation.md](./docs/presentation.md) for code related to GUI layer. [collection-files.md](./docs/collection-files.md) explains the YAML files that are the core of the application and [templating.md](./docs/templating.md) documents how to use templating language in those files. In [ci-cd.md](./docs/ci-cd.md), you can read more about the pipelines that automates maintenance tasks and ensures you get what see.

[docs/](./docs/) folder includes all other documentation.

## Security

Security is a top priority at privacy.sexy.
An extensive commitment to security verification ensures this priority.
For any security concerns or vulnerabilities, please consult the [Security Policy](./SECURITY.md).

## Supporters

[![Supporters appreciation banner showing the supporters](https://undergroundwires.dev/img/supporters.jpg)](https://undergroundwires.dev/supporters)
