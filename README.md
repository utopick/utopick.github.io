# Pocket apps: landing page

The page at https://utopick.github.io/ : the banners of TRACK.Pocket, TUNE.Pocket and SING.Pocket, each linking to its app.
Plain HTML, no build. Banners are copies of each app's `.github/banner.png`; refresh them here if an app's banner changes.

The version tags (v1.2.0 ...) are typed by hand: when you release an app, update its tag here (it is `APP_VERSION` in the app's `index.html`).

## Test builds

The **TEST** button in the header lists feature branches published as test pages (`test/<app>-<branch>/`). Publish one with
`../test-build.sh <app> <branch>` (it gives the copy its own storage names, so it cannot touch the real apps' data, and
removes the manifest), commit and push, and add or update its card in the `TESTS` list in `index.html`. Delete the folder and
its card when the branch is merged.
