"""Render the Dork it B8 media.

Usage:
  python render_og.py og        # banner-og.png (1280x640) for social preview / Greasy Fork
  python render_og.py previews  # one PNG per SVG into render_preview/ (local QA only)
"""
import pathlib
import sys

from playwright.sync_api import sync_playwright

MEDIA = pathlib.Path(__file__).resolve().parent

SIZES = {
    "banner.svg": (1280, 320),
    "banner-og.svg": (1280, 640),
    "menu-categories.svg": (400, 474),
    "menu-dorks.svg": (400, 416),
    "sweep-bar.svg": (640, 212),
    "sweep-flow.svg": (820, 276),
}


def render(page, svg_name, w, h, out):
    page.set_viewport_size({"width": w, "height": h})
    page.goto((MEDIA / svg_name).as_uri())
    page.evaluate("() => document.fonts.ready")
    page.screenshot(path=str(out))


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "og"
    with sync_playwright() as p:
        try:
            browser = p.chromium.launch()
        except Exception:
            browser = p.chromium.launch(channel="msedge")
        page = browser.new_page(device_scale_factor=2)
        if mode == "og":
            render(page, "banner-og.svg", 1280, 640, MEDIA / "banner-og.png")
            print("rendered banner-og.png")
        else:
            prev = MEDIA / "render_preview"
            prev.mkdir(exist_ok=True)
            for name, (w, h) in SIZES.items():
                render(page, name, w, h, prev / (pathlib.Path(name).stem + ".png"))
                print("rendered", name)
        browser.close()


if __name__ == "__main__":
    main()
