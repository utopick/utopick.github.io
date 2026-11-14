# .venv/bin/python tests/lab.py : opens the lab page in headless Chrome (fake microphone) and checks sections 7 and 8
import functools, http.server, os, threading, time, unittest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "test", "latency-lab"))
# worklets from a blob need a real origin, not file://
srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT))
srv.RequestHandlerClass.log_message = lambda *a: None
threading.Thread(target=srv.serve_forever, daemon=True).start()
PAGE = "http://127.0.0.1:%d/index.html" % srv.server_address[1]

class Lab(unittest.TestCase):
    def setUp(self):
        o = Options()
        for a in ("--headless=new", "--mute-audio", "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", "--autoplay-policy=no-user-gesture-required", "--window-size=900,1400"):
            o.add_argument(a)
        o.set_capability("goog:loggingPrefs", {"browser": "ALL"})
        self.d = webdriver.Chrome(options=o)
        # headless Chrome has no sound card, so the audio clock stands still: drive currentTime from the wall clock to exercise the schedulers
        self.d.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {"source": "const t0=performance.now();Object.defineProperty(BaseAudioContext.prototype,'currentTime',{get(){return (performance.now()-t0)/1000}})"})
        self.d.get(PAGE)

    def tearDown(self):
        self.d.quit()

    def errors(self):
        return [l["message"] for l in self.d.get_log("browser") if l["level"] == "SEVERE" and "favicon" not in l["message"]]

    def test_loads_without_errors(self):
        self.assertTrue(self.d.find_element(By.ID, "mouthPanel").is_displayed())
        self.assertTrue(self.d.find_element(By.ID, "jamPanel").is_displayed())
        self.assertEqual(self.errors(), [])

    def test_demo_band_finds_the_key_and_a_chord(self):
        d = self.d
        d.execute_script("document.getElementById('jIn').value='demo';document.getElementById('jBpm').value=240;document.getElementById('jFollow').value=100")
        d.find_element(By.ID, "jGo").click()
        end = time.time() + 15
        while time.time() < end and d.find_element(By.ID, "jKey").text != "C major":
            time.sleep(0.3)
        self.assertEqual(d.find_element(By.ID, "jKey").text, "C major")
        self.assertIn(d.find_element(By.ID, "jChord").text, ("C", "G", "Am", "F"))
        d.find_element(By.ID, "jGo").click()
        self.assertEqual(d.find_element(By.ID, "jGo").text, "START THE BAND")
        self.assertEqual(self.errors(), [])

    def test_mouth_record_runs_with_the_fake_microphone(self):
        d = self.d
        d.execute_script("document.getElementById('mBpm').value=200;document.getElementById('mBars').value=2")
        d.find_element(By.ID, "mHum").click()
        end = time.time() + 20
        while time.time() < end and not any(k in d.find_element(By.ID, "mInfo").text for k in ("notes", "No notes", "Could not")):
            time.sleep(0.3)
        txt = d.find_element(By.ID, "mInfo").text
        self.assertNotIn("Could not", txt, txt)  # the recorder ran end to end
        self.assertEqual(self.errors(), [])

    def test_play_and_midi_with_notes(self):
        d = self.d
        d.execute_script("LAB.M.melody=[{step:0,len:4,midi:60},{step:4,len:4,midi:64}];LAB.M.drums=[{step:0,type:'kick'},{step:8,type:'snare'}];document.getElementById('mPlay').click()")
        time.sleep(1)
        self.assertEqual(d.find_element(By.ID, "mPlay").text, "STOP")
        d.find_element(By.ID, "mPlay").click()
        self.assertEqual(d.find_element(By.ID, "mPlay").text, "PLAY")
        self.assertEqual(self.errors(), [])

if __name__ == "__main__":
    unittest.main()
