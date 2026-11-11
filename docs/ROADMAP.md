# Roadmap

Ideas and plans for the Pocket apps, so they are not forgotten. Nothing here is a promise or a date. The apps stay free and open, and everything runs on the device with no account.

## Where things stand

Feature branches published as test pages (TEST button on the landing page):
- **SING** `air-detector`: the AIR view, a clean or breathy tone meter with a coloured waveform and a side view of the mouth and throat.
- **TRACK** `lan-sync`: sync between devices on one Wi-Fi, paired by sound or by code, plus an APP QR that opens the app on a new device.
- **All three** `midi-defaults`: a starting function for each knob and pad of known controllers, with tags on the DEVICE drawing, plus Korg nanoPAD2 and nanoKEY2 drawings.
- **TUNE** `wind-wireframe`: the recorder and tin whistle redrawn as wireframes.
- **TUNE** `tune-storage`: an IndexedDB store, loops kept by themselves, sessions saved by name with export and import, and custom tunings moved to a `tune.` key.

## Next

- **SING sample recordings:** the voice sampler recordings can be saved, listed and opened again.
- **More controllers:** Korg nanoKONTROL2, Akai MPK mini mk3 and IV, Launchkey Mini mk3, Arturia MiniLab 3, Akai APC mini mk2 and Novation Launchpad (an 8x8 grid for live patterns and samples), Behringer X-Touch Mini, M-Audio Keystation and Oxygen, and digital pianos from Roland, Yamaha and Kawai as variants of the Casio profile. Each one needs a real report (OPTIONS, MIDI, TEST, COPY REPORT) kept in `docs/integration/`.
- **Launchkey lights:** LED feedback through MIDI out.
- **Hardening:** a Content Security Policy, validation of the cells inside loaded song files, and a dirty flag for TRACK's autosave.

## Sync beyond TRACK

Sync exists only in TRACK for now, because it is the only app where devices make one song together. The other two get it when there is a real use for it:
- **SING:** sync progress and compare it between friends or between teacher and students. Share vocal recordings, custom exercises and practice history.
- **TUNE:** jam in a live loop session with other instruments. The looper of one device feeds the session of the others.
- The APP QR button follows sync, so it appears in TUNE and SING when they get sync.

## TUNE: a PEDAL tab

A digital pedalboard in TUNE: a chain of effects for the microphone or an instrument, with the same look as the rest of the app. Together with the live loop session this makes an old phone a pedalboard and looper for a band.

## The long view

An old phone should be enough for almost a full studio: tune, loop, sing, record, sequence and mix, with several devices working as one.

After that, a desktop-oriented mix of all the apps in one window, free and open, kept that way for good.

## Housekeeping

- Release the first versions of the PWA builds (TRACK 1.2.0, TUNE 2.3.0 and SING 1.3.0 are in the pages and not tagged yet). Update the version tags on the landing page by hand with each release.
- Test the sound pairing and the AIR thresholds on real devices and real voices, and tune the numbers from what comes back.
- Delete a test page folder and its card when its branch is merged.
