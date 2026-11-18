# Roadmap

Ideas and plans for the Pocket apps, so they are not forgotten. Nothing here is a promise or a date. The apps stay free and open, and everything runs on the device with no account.

## Where things stand

Merged into `main`: TUNE `wind-wireframe` (the recorder and tin whistle redrawn as wireframes), and `midi-defaults` in all three apps (a starting function for each knob and pad of known controllers, with tags on the DEVICE drawing, plus the Korg nanoPAD2 and nanoKEY2 drawings).

Feature branches published as test pages (a BETA button on each app card of the landing page):
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

## PLAY sampler slicer
The four SAMPLE instruments play one recording across the keys. A slicer would cut a sample at its hits (onsets) and give each slice its own key or pad, for drum loops and breaks. The onset worklet (`pp-onset`) already exists in PLAY. Also later: a root note for a sample (today the C key is the original pitch).

## FM1.Pocket: bootloader, firmware install and MIDI sync (built 13-14 Nov 2026 on the `pocket` branch; BACKUP, PROTECTOR and INSTALL tried on a real FM-1, 015 firmware, Puya chip)
Built: CONNECT, PLAY TOGETHER (notes and clock, no emulator MIDI out), BACKUP (RAM helper through the update route, kept per unit in the browser), PROTECTOR, INSTALL on every firmware card, a flash map, a manual per firmware (its README), a step-by-step REAL FM-1 screen (see `fm1-pocket/pocket/README.md`). Not tried on the newer UC25HQ80 chip. Not built: restoring a backup, SMK-37 support, emulator clock in. The notes below are the original investigation.

What exists (checked on GitHub, November 2026): the FM-1 (JieLi AC791N) is updated over **USB MIDI** with the M-UPGRADE protocol (SysEx, the unit answers as `ota-FM-1_nnn`). Browser installers (Felucca, Melodee, SLOOP, ChoralRoot, M-VAVE's own workbench) use Web MIDI with SysEx in Chrome or Edge, also Android with a USB cable, not iOS.
- **The protector** is `jvitkauskas/m-bootloader` (MIT): it replaces M-VAVE's bootloader, adds download mode (hold REC while switching on), a recovery menu (hold PLAY), a MIDI mode that reinstalls firmware over USB MIDI from a phone, a full flash backup, a checked start (checksum) and it only ever writes `[0x4000, size)`, so the boot area and the key area stay safe. Melodee 1.3.5+ and ChoralRoot have their own boot protection (GPL-3.0, a stub plus a marker sector). The protector is installed with M-Flasher, or as an M-UPGRADE package through the firmware's own update route (needs uninterrupted power: the boot sector is written).
- **Plan:** (1) a BACKUP button first (m-bootloader MIDI mode and its RAM stage answer read commands `0x23`/`0x24`, the whole 1 MiB flash with CRC), always before any write. (2) INSTALL PROTECTOR: send m-bootloader's `uboot.fwsc` (MIT, can be bundled) through the update route, with a clear warning. (3) After the protector is detected (command `0x12` answers `MBOOT`), the FM1.Pocket firmware store gets an INSTALL ON MY FM-1 button for each firmware: the unit asks for the package with `0x30` reads, the page serves it. Not offered before the protector is there. (4) MIDI sync between the emulator and the real unit: clock, start/stop and notes both ways over Web MIDI (the emulated one follows the real clock, or the other way round). Melodee 1.6.1 sends clock out and Song Position, the stock V16 firmware's MIDI is to be checked.
- **Risks:** FM-1s sold since late 2026 can have a UCUN UC25HQ80 flash chip (JEDEC `0xB36014`) that some firmwares do not support. Bricking is possible with any flash tool, recovery needs download mode or ROM boot mode. Every step needs the owner's real FM-1. The installers of other projects are GPL-3.0: write ours from the m-bootloader specification (MIT), do not copy their code.

## FM1.Pocket manual: an interactive aid for every section
The manual is HTML, so each section can carry a small interactive picture: the panel with the controls of that section lit (tap a control to read its line, tap a line to see its control), the screen with its popups, the keys with their range and combos, the MIDI flow. First step **done (17 Nov 2026)** for the FM-1 manual: a miniature panel beside the text, the control lit from the names in each paragraph, chips in the text, tap a control to jump to its entry. Next: the upper keys (OP1 to POLY) and the screen's real pages (FX grid, algorithm drawing) as pictures, and the same for this app's own manual.

## Learn.Pocket (alpha started)
Where the suite teaches: understand and produce a tune in an evening, with progressive difficulty and in the genre of your choosing. Chord progressions (when to use which, why they work), staying in the scale, getting the tone of a song. The alpha is a path of short interactive stages per genre (key and scale, chords, progression with a drum feel, melody over the chords with only the safe notes lit, tone, export as MIDI), with levels that unlock. See `learn-pocket/`. Later: ear training, songs analysed bar by bar, sharing a tune by QR like TRACK, talking to the other Pocket apps (a progression to TRACK as a pattern, a scale to TUNE).

## Studio.Pocket
A desktop app (Electron) made of some of the elements of the Pocket suite, laid out for a big screen: not all of them, only those that gain from a desktop (a tracker with a real mixer and piano roll next to it, the looper and the device panels with room to breathe, MIDI devices without a phone's limits, Learn.Pocket lessons beside a keyboard). Offline, installers for macOS, Windows and Linux, the same files as the web apps where possible (the Pocket apps stay single `index.html` files that Studio loads), no cloud. Needs a decision on what is in the first cut before any code.

## Audio experiments in LAB.Pocket (first version built 14 Nov 2026, test page `test/latency-lab/`, sections 7 and 8)
- **Mouth to MIDI**: hum a melody or beatbox; it becomes notes and drum pads (not audio slices), plays back, exports a .mid. YIN pitch, note segmentation, 16th-grid quantising with a count-in click, key snap; drums by onset detection plus a short spectral fingerprint, with a 12-hit CALIBRATE (4 kicks, 4 snares, 4 hats) so it learns each mouth. Next: hum and beatbox in one take (split by pitched vs noisy frames), velocity from loudness, tempo from the performance, send results to TRACK as a pattern.
- **Live jam**: a band that follows what you play (mic, MIDI keyboard or a demo player), in the spirit of Rocksmith's jam mode. It keeps a key with hysteresis, picks one chord per bar from the last bar's notes, **a bar behind you on purpose**, and holds the chord and thins out when unsure. A slider goes from "sticks to a progression" to "chases every note". Next: tempo following, strummed chords (chroma from the spectrum), genres and swing from Learn.Pocket, the idea becoming a Learn.Pocket stage or a TUNE JAM mode.
- Tests: `tests/lab.test.js` (node, synthetic hums and drum hits, jam brain) and `tests/lab.py` (Selenium, fake microphone, wall-clock for the audio clock).

## Scale-lit keys in every app (idea, 16 Nov 2026)
Learn.Pocket lights the keys that are in the chosen scale, so you can freestyle without a wrong note. Share it: one `scaleKeys(root, scale)` helper and a SCALE option on the on-screen keyboards of TRACK (piano and pad entry), PLAY (synth keys), SING (practice piano) and FM1.Pocket (its piano keys); TUNE already knows the scales. Same look in all of them (lit = in the scale, brighter = root).

## FM1.Pocket: phone as the FM-1's screen (feasibility, 16 Nov 2026)
Possible in the browser, with conditions. Community firmwares make the unit stream its 240x240 RGB565 screen as SysEx over USB MIDI, and Web MIDI can read it (Chrome/Edge on a computer or Android with a cable; **no iOS**, no Web MIDI there). Needs a firmware that has the screen messages: **stock M-VAVE firmware cannot**. Two wire formats exist, so pick one or decode both: (a) pfkellogg/fm1-mirror, GPL-3.0: host sends `F0 7D 'F' 'S' 00 F7` about once a second (`01` = whole screen again); rows come as `F0 7D 'F' 'S' 01 y(2x7bit) x(2x7bit) runs F7`, a run = count + RGB565 split 7+7+2 bits. (b) charlesvestal/fm1-base, MPL-2.0 (LOOM-8 and others): `F0 pack7(00 59 cmd len24 body ~sum8) F7`, keep-alive `0x50` every 2 s, rects `0x51` with run-length and a 64-colour cache, fills `0x52`, input report `0x53`. Write our own decoder from the protocol, do not copy GPL code. Draw it on the canvas that already shows the emulated LCD (`vendor/real-fm1.js` already opens Web MIDI with SysEx). Not yet read: the Android app, fm1-base `docs/`.

## Controller lights as the FM-1's lights (Launchkey MK4, idea)
The MK4 37 takes lights from the computer (LIGHT TEST works, pads in drum layout, notes 36-51 on channel 10) and supports colours (the note's velocity picks the colour). Idea: mirror each FM-1 button's LED (`ledNow`) on the pad bound to it, with a colour per state (steady, blink for SEQ steps and EDIT). Needs a MIDI output opened per controller and a colour table per model. Also, the unit sends MIDI clock (119.8 BPM measured): once FM1.Pocket takes an external clock, a controller's clock can drive the SEQ/ARP tempo.
