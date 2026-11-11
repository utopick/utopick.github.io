# Roadmap

Ideas and plans for the Pocket apps, so they are not forgotten. Nothing here is a promise or a date. The apps stay free and open, and everything runs on the device with no account.

## Where things stand

Merged into `main`: TUNE `wind-wireframe` (the recorder and tin whistle redrawn as wireframes), and `midi-defaults` in all three apps (a starting function for each knob and pad of known controllers, with tags on the DEVICE drawing, plus the Korg nanoPAD2 and nanoKEY2 drawings).

Feature branches published as test pages (TEST button on the landing page):
- **SING** `air-detector`: the AIR view, a clean or breathy tone meter with a coloured waveform and a side view of the mouth and throat.
- **TRACK** `lan-sync`: sync between devices on one Wi-Fi, paired by sound or by code, plus an APP QR that opens the app on a new device.
- **TRACK** `track-fixes`, **TUNE** `tune-fixes`, **SING** `sing-fixes`: MIDI master knob follows on screen, the MIDI pads and keys play the FX pads while they are open (in all three apps), a piano, drum pads and waveform in TUNE's JAM with a KEYS PLAY instrument, bigger sampler marks in SING.
- **TUNE** `cof-instruments`: the circle of fifths chords sound like the chosen instrument.
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

## Sharing by QR (and by link)

The pairing by QR opens a way to share small things with no server: a link whose part after the `#` carries the data, shown as a QR that the other device scans with its normal camera. Candidates, all small enough for one QR (about 130 bytes of data), or a few QRs in a row for a bit more:
- **SING:** a custom vocal exercise, a warm-up set, a song's lyrics with timing.
- **TRACK:** a pattern, a short song seed for the Variator, a drum kit choice.
- **TUNE:** a custom tuning, a scale, a chord progression for the JAM band.
- **Scores** and other short text-like data. Samples and recordings stay for sync, files and links, since they are far too big.

Everything that arrives by a link or a QR is untrusted data, the same as an imported file. The rules for every kind of share:
- A hard size limit before anything is decoded, and a strict check of every field (types, ranges, lengths), reusing the file checks (`vetSong` and the like).
- Names and text are escaped, never put into HTML as they come.
- Nothing is applied until the person taps a clear button that says what it will change, and what it replaces is kept (as with *Before sync*).
- The link is cleared from the address bar once read, so a reload does not apply it again.
- Data that could start something on its own (sync invitations) carries a one-time secret and the answer carries a proof of it.

## TUNE: a PEDAL tab

A digital pedalboard in TUNE: a chain of effects for the microphone or an instrument, with the same look as the rest of the app. Together with the live loop session this makes an old phone a pedalboard and looper for a band.

## The long view

An old phone should be enough for almost a full studio: tune, loop, sing, record, sequence and mix, with several devices working as one.

After that, a desktop-oriented mix of all the apps in one window, free and open, kept that way for good.

## Housekeeping

- Release the first versions of the PWA builds (TRACK 1.2.0, TUNE 2.3.0 and SING 1.3.0 are in the pages and not tagged yet). Update the version tags on the landing page by hand with each release.
- Test the sound pairing and the AIR thresholds on real devices and real voices, and tune the numbers from what comes back.
- Delete a test page folder and its card when its branch is merged.

## Sync as several screens of one instrument (TRACK)
Idea from the owner: the synced devices act like extra screens. The piano open on one, the effects on another, the mixer on the PC, all driving the same sound.
- Already shared: the song, the mixer values (volume, pan, effects, mute), master, swing, echo, play/stop, samples. SILENT keeps a device from making sound.
- Missing: the screens themselves (each device shows what it chooses), and live playing. A note on the piano, a Live FX pad or a live loop trigger on one device does not reach the others.
- Plan: small live events (`t:"n"` note on/off with channel, `t:"fx"` pad state, `t:"lp"` loop trigger) sent to the host and passed on, played by devices that are not SILENT. Each device keeps its own view. Events are untrusted data: numbers clamped, channels checked against the song.
- Open question: when two devices play at once, whose sound wins (both play, or only the device chosen as the sound maker).
