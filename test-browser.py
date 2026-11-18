"""Optional browser regression test (requires Playwright and Chromium)."""
from pathlib import Path
import re
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent
HTML = re.sub(r'<script src="[^"]+"></script>', '', (ROOT / 'index.html').read_text())

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
    try:
        for reduced in [False, True]:
            page = browser.new_page(viewport={'width': 1280, 'height': 1000}, reduced_motion='reduce' if reduced else 'no-preference')
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            # Inject source into a document rather than relying on an HTTP server.
            page.set_content(HTML)
            page.add_style_tag(content=(ROOT / 'style.css').read_text())
            for script in ['levels.js', 'engine.js', 'i18n.js', 'effects.js', 'icon-sprites.js', 'app.js']:
                page.add_script_tag(content=(ROOT / script).read_text())
            page.locator('#startLanguages button').first.click()
            page.locator('#guideExit').click()
            target = page.locator('#ghostLayer [data-ghost="1,3"]')

            def check(caught):
                assert target.get_attribute('data-caught') == str(caught).lower(), f'wrong ghost state; reduced={reduced}'
                assert target.locator('[filter]').count() == int(caught), 'stale grayscale SVG filter'
                assert ('awake' in target.locator('.ghost-sprite').get_attribute('class')) == (not caught)

            page.evaluate("choose('redI');place(1,3)")
            check(True)
            for _ in range(25):
                page.evaluate("choose('redI')")
                check(False)
                page.evaluate("choose('redI')")
                check(True)
            page.evaluate("choose('redI')")
            check(False)
            page.locator('#remove').click()
            check(False)
            page.locator('#undo').click()
            check(True)
            page.locator('#clear').click()
            check(False)
            assert not errors, errors
            print(f'PASS: Chromium ghost catches, 25 pickups/cancels, remove, undo, clear, reduced-motion={reduced}')
            page.close()
    finally:
        browser.close()
