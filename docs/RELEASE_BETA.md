# Releasing the betas

How to bring each app's `beta` branch into `main` and release it. Written on 2026-11-12. Nothing here has been run:
`main` is untouched in the four repos. Every command is run from `~/Documents/TP`.

## Where things stand

| App | `main` (published) | `beta` shows | Release as | Commits `main..beta` |
|---|---|---|---|---|
| TRACK.Pocket | 1.2.0 (last tag v1.1.0, one README commit not pushed) | 1.3.0-beta | `./release.sh track 1.3.0` | sync by QR, shared Variator, MIDI master knob |
| TUNE.Pocket | 2.3.0 (last tag v2.2.0) | 2.4.0-beta | `./release.sh tune 2.4.0` | audio input and tests, kept loops and FILES, JAM keys, circle of fifths |
| SING.Pocket | 1.3.0 (last tag v1.2.0) | 1.4.0-beta | `./release.sh sing 1.4.0` | microphone setup, AIR view, sampler marks |
| PLAY.Pocket | 0.4.0, local only (GitHub has no `main` yet) | 0.5.0-beta | `./release.sh play 0.5.0` | the whole app as a PWA |

- Every `beta` contains its `main`, so each merge is clean.
- The version on `beta` ends in `-beta`. `release.sh` with the plain number removes the suffix, commits `vX.Y.Z`, tags,
  pushes and creates the GitHub release. The help section "What's new" already has the `## Version X.Y.Z` notes it looks for.
- `release.sh` now accepts `play`.
- `tests/e2e.py` is the same file in the four repos (22 tests, the ones of the other apps are skipped).

## Before anything: tick these in `CHECKLIST.md`

Release an app only when its line under "Test the betas" is ticked. They are things only real devices can show:

1. **TRACK beta, SYNC** on two phones (and the MIDI line).
2. **TUNE beta** with an interface and a guitar, loops kept after a reload.
3. **SING beta** microphone setup and the AIR view.
4. **PLAY.Pocket beta** on the pedal board, LIVE PLAY, looper, synth, voice, mixer, latency test.
5. **iPhone or iPad** warnings.
6. Decide the open questions that change what ships (the fifth button of PLAY's ribbon can stay empty).

Then, for each app you release, in its repo: `.venv/bin/python tests/e2e.py` and (not PLAY) `node --test tests/midi-device.test.js`.

## The order

One app at a time, the older ones first, PLAY last (it needs a new Pages site). After each one, open the published
page on a phone before starting the next.

### 1. TUNE, then SING, then TRACK (the same steps)

```sh
cd ~/Documents/TP/tune-pocket            # then sing-pocket, then track-pocket
git status                               # must be clean
git switch main && git pull
git rev-parse HEAD                       # write this down: it is the point to come back to
git merge --no-ff beta -m "Merge beta: audio input, kept loops, JAM keys, circle of fifths"
#   SING:  "Merge beta: microphone setup, AIR view, sampler marks"
#   TRACK: "Merge beta: sync by QR, shared Variator, MIDI master knob"
.venv/bin/python tests/e2e.py            # once more, on main
cd .. && ./release.sh tune 2.4.0         # sing 1.4.0, track 1.3.0. It asks before it pushes
```

Commit with the utopick identity if git asks for one (the command is in `CLAUDE.md`). TRACK's `main` has one local
commit that is not on GitHub (the README section): the release pushes it too.

Check after each: `https://utopick.github.io/<app>-pocket/` shows the new version in the help title (a minute or two
after the push), the old songs, tunings and settings are still there, and the installed app updates after it is opened
online once.

### 2. PLAY (new site)

```sh
cd ~/Documents/TP/play-pocket
git status && git switch main
git merge --no-ff beta -m "Merge beta: PLAY.Pocket 0.5.0, the first public beta"
git push -u origin main                  # GitHub has no main for this repo yet
```

Then on GitHub (owner only): the repo must be public, Settings ▸ Pages ▸ Deploy from a branch ▸ `main` / `(root)`.
Wait for the "pages build and deployment" run, open `https://utopick.github.io/play-pocket/`, and check
`manifest.webmanifest`, `sw.js` and `icons/icon-192.png` answer (steps in `play-pocket/docs/PWA.md`). Then:

```sh
cd ~/Documents/TP && ./release.sh play 0.5.0
```

### 3. The landing page (`utopick.github.io`), after the releases

- The version tags on the cards: v1.3.0, v2.4.0, v1.4.0, and for PLAY a `v0.5.0` tag with the MIT tag.
- PLAY's card: both links go to `https://utopick.github.io/play-pocket/`, the button says OPEN, the text loses "New, in beta" if you want.
- "Print it": remove "(after its release)" under PLAY's QR code. The code already points at the final address.
- The TEST list: remove the four beta cards and their `test/<app>-beta/` folders, or keep them for the next round.
- In the three older apps, the About page of the help says "a family of three pocket music apps": make it four in the next version.
- Update `CLAUDE.md` (state, versions) and `CHECKLIST.md`.

## What only the owner does

- Ticking the device tests above.
- Every push of `main`, every tag and every GitHub release (`release.sh` does the three, after asking).
- PLAY: making the repository public if it is not, and turning Pages on.
- Deciding whether `beta-synth-voice` (already merged into PLAY's `beta`) and the feature branches are deleted or kept.

## Rolling back

- **Before the release** (merged, not pushed): `git reset --hard <the hash you wrote down>` on `main`. Nothing left the Mac.
- **After the release**, undo it without rewriting history:
  ```sh
  gh release delete vX.Y.Z --yes --cleanup-tag && git tag -d vX.Y.Z
  git revert -m 1 <hash of the "Merge beta" commit>     # then revert the "vX.Y.Z" commit too
  git push origin main
  ```
  Pages serves the old app again in a minute or two. Installed apps follow the next time they open online.
  To bring the beta back later, revert the revert.
- **Data when going back:** TUNE 2.4.0 moves custom tunings from `customTunings` to `tune.customTunings`. The old version
  does not read the new key, so tunings look lost under 2.3.0 until the app is updated again (they are still stored).
  Loops, sessions, TRACK songs and SING data are not changed by the betas in a way the old versions mind.
- PLAY has no earlier public version: rolling back is turning Pages off.

## Not verified (desktop Chrome only)

Everything was checked in headless desktop Chrome at 390 x 844, PLAY with Chrome's pretend microphone. Not checked on
hardware: TRACK sync pairing between real devices, the iOS microphone warnings, every latency number, tone and
feedback in PLAY, MIDI in PLAY's synth, Safari and Firefox.
