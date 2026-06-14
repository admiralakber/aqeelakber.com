# Extravaganza short URLs on aqeelakber.com

Redirect pages live in `extra/` (Jekyll `redirect` layout — same pattern as `xtra.html`).

| Short URL | Target post |
|-----------|-------------|
| `/extra/ep1` | `/blog/2026-06-12-the-potter.html` |
| `/extra/bt1` | `/blog/2026-06-13-artificial-life.html` |
| `/extra/ep2` | `/blog/2026-06-13-emerging-technology.html` |
| `/extra/bt2` | `/blog/2026-06-13-meos-constellation.html` |

EP2/BT2 targets follow `publish:blog` filename rules (`YYYY-MM-DD-{title-slug}.html`).
Verify or update `redirect_url` after org-octopress generates the real `_posts/` HTML.

## Human publish steps

```bash
cd ~/blog/src

# 1. Build site locally (optional sanity check)
bundle exec jekyll build
# confirm _site/extra/ep1/index.html (or .html) redirects correctly

# 2. Commit redirect pages + any new _posts from org-octopress
git add extra/ep1.html extra/bt1.html extra/ep2.html extra/bt2.html
git add blog/ _posts/   # when EP2/BT2 org posts exist
git commit -m "blog: extravaganza short URLs (/extra/ep1, bt1, …)"

# 3. Push — GitHub → Cloudflare Pages → aqeelakber.com
git push origin main
```

Org-octopress flow for new episode posts (unchanged):

```bash
# from the-extravaganza repo, after YouTube upload records youtubeId:
npm run publish:blog -- ep002-mei --transcript
# Emacs: open ~/blog/src/blog/YYYY-MM-DD-emerging-technology.org
# M-x org-octopress
# then commit _posts/ + blog/*.org and push as above
```
