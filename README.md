# Pacifica Zhang — personal site

Static personal website built in plain HTML / CSS / vanilla JS.
No build step, no framework, no dependencies. Just open `index.html`.

---

## File structure

```
website/
├── index.html              Home — splash + color-block hero + work + writing
├── about.html              Long bio
├── cv.html                 CV landing — links to en / zh resumes
├── work/
│   └── geoqa.html          GeoQA case study (template for future case studies)
├── writing/
│   └── rag-as-translation.html   First blog post
├── cv/
│   ├── en.html             English résumé (ATS-friendly, 1 page)
│   ├── zh.html             中文简历 (双栏 header, 含照片)
│   └── IMG_3122.jpg        Photo used by zh.html
├── styles.css              All shared styles + component CSS
├── script.js               Lang toggle + scroll-driven splash + IO triggers
└── README.md               This file
```

---

## Local preview

```bash
cd website
open index.html        # macOS
# or
xdg-open index.html    # Linux
# or
start index.html       # Windows
```

Or run a tiny local server (recommended — file:// can break some browser features):

```bash
cd website
python3 -m http.server 8000
# then visit http://localhost:8000
```

---

## Deploy to GitHub Pages (`pacificapie.github.io`)

The repo name **must** be `pacificapie.github.io` for it to be served at the root user URL.

```bash
cd website
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin git@github.com:PacificaPie/pacificapie.github.io.git
git push -u origin main
```

Then in the GitHub repo:

1. **Settings → Pages**
2. **Source**: Deploy from a branch
3. **Branch**: `main`, folder `/ (root)`
4. **Save**

Site will be live at `https://pacificapie.github.io/` within a minute.

---

## Updating content

### Add a new blog post

1. Copy `writing/rag-as-translation.html` to `writing/<new-slug>.html`
2. Edit the eyebrow / title / body / signoff
3. Add a link to it in the Writing section of `index.html`

### Add a new case study

1. Copy `work/geoqa.html` to `work/<new-slug>.html`
2. Edit eyebrow / title / stats row / body
3. The corresponding card on `index.html#work` already exists — just update its `href`

### Update the CV

The two resumes in `cv/` are static HTML mirrors of the master files in `../resume_en.html` and `../resume_cn.html`. When you update the master files (e.g. to add the Meituan internship after onboarding), re-copy:

```bash
cp ../resume_en.html cv/en.html
cp ../resume_cn.html cv/zh.html
```

The Chinese resume references `IMG_3122.jpg` with a relative path — keep it in `cv/` next to `zh.html`.

### Switching the default language

Default detection logic is in `script.js` (`getInitialLang`): browser language `zh*` → Chinese, else English. To override, change the line:

```js
return browserLang.startsWith('zh') ? 'zh' : 'en';
```

User's manual choice is stored in `localStorage` under key `pz-lang`.

---

## Design tokens

All design tokens are CSS custom properties at the top of `styles.css` (`:root` block). Edit there to tune the palette site-wide.

Palette in current build:
- `--bg`           cream `#F8F4ED`
- `--ink`          warm black `#2A2A28`
- `--accent`       cinnamon `#8B6F47`
- `--yellow-deep`  saffron `#E5B53D`
- `--blue`         dusty blue `#4F6E8C`
- `--purple`       warm purple `#7A5C8A`
- `--seal`         vermilion `#B85450`

---

## What's deliberately NOT in the build

- No build tooling (no npm, no bundler) — keeps maintenance trivial
- No framework — every change is a direct edit to an HTML file
- No analytics / cookie banner — adding either should be a deliberate decision later
- No photo / portrait — Hero leans on typography. The single portrait in the project lives in `cv/IMG_3122.jpg` for the Chinese resume only.

---

## Future-additions checklist

- [ ] Independent case studies for VibeSearch, DiD, Tencent (template = `work/geoqa.html`)
- [ ] More blog posts (template = `writing/rag-as-translation.html`)
- [ ] Add Meituan internship to both résumés (after ~1 month onboard) — template comments are already in `cv/en.html` and `cv/zh.html`
- [ ] Optional: custom domain (e.g. `ruoyang.dev`) via Settings → Pages → Custom domain
- [ ] Optional: JD-aware résumé tuner — every résumé bullet already has `data-tags` attributes; future tooling can re-rank / re-emphasize based on a pasted JD
