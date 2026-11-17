const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
let locale = localStorage.getItem("bunayya-language") || "id";
const calculatorState = { campus: "BUNAYYA I", level: "KB", period: 0 };
const setLocale = (value) => {
  locale = value;
  document.documentElement.lang = value;
  localStorage.setItem("bunayya-language", value);
  const b = $("[data-language]");
  if (b) {
    b.textContent = value === "id" ? "EN" : "ID";
    b.setAttribute(
      "aria-label",
      value === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia",
    );
  }
  document.dispatchEvent(new CustomEvent("localechange"));
};
$("[data-language]")?.addEventListener("click", () =>
  setLocale(locale === "id" ? "en" : "id"),
);
setLocale(locale);
const menu = $("[data-menu]"),
  nav = $("#nav"),
  header = $(".site-header");
let menuReturnFocus = null;
const setMenuState = (open, { restoreFocus = false } = {}) => {
  if (!menu || !nav) return;
  if (open) menuReturnFocus = document.activeElement;
  menu.setAttribute("aria-expanded", String(open));
  menu.setAttribute(
    "aria-label",
    open
      ? locale === "id" ? "Tutup menu navigasi" : "Close navigation menu"
      : locale === "id" ? "Buka menu navigasi" : "Open navigation menu",
  );
  nav.classList.toggle("open", open);
  header?.classList.toggle("menu-open", open);
  document.body.toggleAttribute("data-menu-open", open);
  if (open) requestAnimationFrame(() => $("a", nav)?.focus());
  if (!open && restoreFocus) (menuReturnFocus || menu).focus();
};
menu?.addEventListener("click", () =>
  setMenuState(menu.getAttribute("aria-expanded") !== "true"),
);
nav?.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenuState(false);
});
document.addEventListener("localechange", () =>
  setMenuState(menu?.getAttribute("aria-expanded") === "true"),
);
setMenuState(false);
document.addEventListener("click", (event) => {
  if (nav?.classList.contains("open") && !event.target.closest(".site-header")) {
    setMenuState(false);
  }
});
const desktopLayout = matchMedia("(min-width:1001px)");
desktopLayout.addEventListener?.("change", (event) => {
  if (event.matches) setMenuState(false);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && nav?.classList.contains("open")) {
    setMenuState(false, { restoreFocus: true });
    return;
  }
  if (event.key !== "Tab" || !nav?.classList.contains("open")) return;
  const focusables = $$("a,button", header).filter((el) => el.getClientRects().length && !el.hasAttribute("disabled"));
  if (!focusables.length) return;
  const first = focusables[0], last = focusables[focusables.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
const sectionLinks = $$('nav a[href^="#"]');
const sectionTargets = sectionLinks.map((a) => document.querySelector(a.getAttribute("href")));
const navIndicator = document.createElement("span");
navIndicator.className = "nav-indicator";
navIndicator.setAttribute("aria-hidden", "true");
if (nav && sectionLinks.length) nav.append(navIndicator);
function moveNavIndicator(link) {
  if (!link || !navIndicator.isConnected) return;
  navIndicator.style.width = `${link.offsetWidth}px`;
  navIndicator.style.transform = `translateX(${link.offsetLeft}px)`;
  navIndicator.hidden = false;
}
function updateActiveNavigation() {
  if (!sectionLinks.length) return;
  let active = -1;
  sectionTargets.forEach((section, index) => {
    if (section && section.getBoundingClientRect().top <= innerHeight * .38) active = index;
  });
  sectionLinks.forEach((link, index) => {
    if (index === active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  moveNavIndicator(sectionLinks[active]);
}
if (sectionLinks.length) {
  let ticking = false;
  addEventListener("scroll", () => {
    if (!ticking) requestAnimationFrame(() => {
      header?.toggleAttribute("data-scrolled", scrollY > 48);
      updateActiveNavigation();
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
  addEventListener("resize", updateActiveNavigation);
  header?.toggleAttribute("data-scrolled", scrollY > 48);
  updateActiveNavigation();
} else if (/bunayya-(i|ii)\.html$/i.test(location.pathname)) {
  const campusLink = $('nav a[href$="#campuses"]');
  campusLink?.setAttribute("aria-current", "location");
}
if (!sectionLinks.length) {
  const updateHeaderPosition = () => header?.toggleAttribute("data-scrolled", scrollY > 48);
  addEventListener("scroll", updateHeaderPosition, { passive: true });
  updateHeaderPosition();
}
$$("[data-wa]").forEach(
  (a) =>
    (a.href =
      "https://wa.me/6287888889199?text=" +
      encodeURIComponent(
        "Assalamu'alaikum, saya ingin bertanya tentang PPDB BUNAYYA 2027/2028.",
      )),
);
if ("IntersectionObserver" in window && !reduced) {
  const io = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      }),
    { threshold: 0.09 },
  );
  $$(".reveal").forEach((el) => io.observe(el));
} else $$(".reveal").forEach((el) => el.classList.add("visible"));

const centres = [
  ["Sentra balok", "Block centre"],
  ["Sentra bermain peran", "Role-play centre"],
  ["Sentra seni rupa", "Visual arts centre"],
  ["Sentra gerak & lagu", "Movement & music centre"],
  ["Sentra bahan alam", "Natural materials centre"],
  ["Persiapan membaca", "Reading preparation"],
  ["Persiapan berhitung", "Numeracy preparation"],
];
if ($("[data-centres]"))
  $("[data-centres]").innerHTML = centres
    .map(
      (c, i) =>
        `<article class="centre"><span>${String(i + 1).padStart(2, "0")}</span><h3><span data-lang="id">${c[0]}</span><span data-lang="en">${c[1]}</span></h3></article>`,
    )
    .join("");

const slides = $$("[data-slide]");
let slide = 0,
  paused = false,
  timer;
const showSlide = (n) => {
  slide = (n + slides.length) % slides.length;
  slides.forEach((el, i) => (el.hidden = i !== slide));
  if ($("[data-hero-count]"))
    $("[data-hero-count]").textContent =
      `${String(slide + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
  if ($("[data-hero-progress]"))
    $("[data-hero-progress]").style.transform = `translateX(${slide * 100}%)`;
};
const restart = () => {
  clearInterval(timer);
  if (!paused && !reduced)
    timer = setInterval(() => showSlide(slide + 1), 5500);
};
$("[data-hero-prev]")?.addEventListener("click", () => {
  showSlide(slide - 1);
  restart();
});
$("[data-hero-next]")?.addEventListener("click", () => {
  showSlide(slide + 1);
  restart();
});
$("[data-hero-pause]")?.addEventListener("click", (e) => {
  paused = !paused;
  e.currentTarget.textContent = paused ? "▶" : "Ⅱ";
  e.currentTarget.setAttribute(
    "aria-label",
    paused ? "Putar carousel" : "Jeda carousel",
  );
  restart();
});
if (slides.length) {
  showSlide(0);
  restart();
}

let galleryData = [
  {
    id: "learning-01",
    category: "learning",
    title: ["Belajar bersama", "Learning together"],
    caption: [
      "Placeholder dokumentasi pembelajaran BUNAYYA.",
      "Placeholder for BUNAYYA learning documentation.",
    ],
    tall: true,
  },
  {
    id: "centre-01",
    category: "learning",
    title: ["Eksplorasi sentra", "Centre exploration"],
    caption: [
      "Foto resmi akan ditambahkan setelah tersedia.",
      "Official photography will be added when available.",
    ],
  },
  {
    id: "activity-01",
    category: "activity",
    title: ["Kegiatan tematik", "Thematic activities"],
    caption: [
      "Placeholder, bukan foto kegiatan sebenarnya.",
      "A placeholder, not an actual activity photo.",
    ],
    tall: true,
  },
  {
    id: "together-01",
    category: "activity",
    title: ["Momen kebersamaan", "Moments together"],
    caption: [
      "Dokumentasi resmi menyusul.",
      "Official documentation coming soon.",
    ],
  },
  {
    id: "campus-01",
    category: "campus",
    title: ["BUNAYYA I", "BUNAYYA I"],
    caption: [
      "Perumahan Permata Tangerang.",
      "Permata Tangerang residential area.",
    ],
    tall: true,
  },
  {
    id: "campus-02",
    category: "campus",
    title: ["BUNAYYA II", "BUNAYYA II"],
    caption: ["Town House Bumi Indah.", "Bumi Indah Town House."],
  },
];
let activeFilter = "all",
  lightboxIndex = 0;
const gallery = $("[data-gallery]");
function galleryItems() {
  return galleryData.filter(
    (x) => activeFilter === "all" || x.category === activeFilter,
  );
}
function renderGallery() {
  if (!gallery) return;
  const items = galleryItems();
  const categories =
    locale === "id"
      ? { learning: "PEMBELAJARAN", activity: "KEGIATAN", campus: "KAMPUS" }
      : { learning: "LEARNING", activity: "ACTIVITIES", campus: "CAMPUSES" };
  gallery.innerHTML = items
    .map(
      (x, i) => {
        const languageIndex = locale === "id" ? 0 : 1;
        const image = x.src
          ? `<img src="${x.src}" alt="${x.alt?.[languageIndex] || x.title[languageIndex]}" loading="lazy" width="1200" height="900">`
          : "";
        return `<button class="gallery-item ${x.tall ? "tall" : ""}" data-gallery-id="${x.id}" aria-label="${x.title[languageIndex]}">${image}<span class="gallery-shade"></span><small>${String(i + 1).padStart(2, "0")} · ${categories[x.category]}</small><h3>${x.title[languageIndex]}</h3></button>`;
      },
    )
    .join("");
  $("[data-gallery-count]").textContent =
    `01 / ${String(items.length).padStart(2, "0")}`;
  $$("[data-gallery-id]").forEach((b, i) =>
    b.addEventListener("click", () => openLightbox(i)),
  );
}
$$("[data-filter]").forEach((b) =>
  b.addEventListener("click", () => {
    activeFilter = b.dataset.filter;
    $$("[data-filter]").forEach((x) => {
      x.classList.toggle("active", x === b);
      x.setAttribute("aria-pressed", x === b);
    });
    renderGallery();
  }),
);
const moveGallery = (d) => {
  const items = $$("[data-gallery-id]");
  if (!items.length) return;
  const left = gallery.scrollLeft;
  let i = items.reduce(
    (best, el, index) =>
      Math.abs(el.offsetLeft - left) < Math.abs(items[best].offsetLeft - left)
        ? index
        : best,
    0,
  );
  i = (i + d + items.length) % items.length;
  items[i].scrollIntoView({
    behavior: reduced ? "auto" : "smooth",
    block: "nearest",
    inline: "start",
  });
  $("[data-gallery-count]").textContent =
    `${String(i + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}`;
};
$("[data-gallery-prev]")?.addEventListener("click", () => moveGallery(-1));
$("[data-gallery-next]")?.addEventListener("click", () => moveGallery(1));
let galleryScrollFrame;
gallery?.addEventListener("scroll", () => {
  cancelAnimationFrame(galleryScrollFrame);
  galleryScrollFrame = requestAnimationFrame(() => {
    const items = $$("[data-gallery-id]");
    if (!items.length) return;
    const index = items.reduce(
      (best, item, candidate) =>
        Math.abs(item.offsetLeft - gallery.scrollLeft) <
        Math.abs(items[best].offsetLeft - gallery.scrollLeft)
          ? candidate
          : best,
      0,
    );
    $("[data-gallery-count]").textContent =
      `${String(index + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}`;
  });
}, { passive: true });
const dialog = $("[data-lightbox]");
function openLightbox(i) {
  lightboxIndex = i;
  paintLightbox();
  dialog.showModal();
}
function paintLightbox() {
  const items = galleryItems(),
    x = items[(lightboxIndex + items.length) % items.length];
  lightboxIndex = (lightboxIndex + items.length) % items.length;
  $("[data-lightbox-index]").textContent =
    `${String(lightboxIndex + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}`;
  $("[data-lightbox-title]").textContent = x.title[locale === "id" ? 0 : 1];
  $("[data-lightbox-caption]").textContent = x.caption[locale === "id" ? 0 : 1];
  const art = $("[data-lightbox-art]");
  if (art)
    art.innerHTML = x.src
      ? `<img src="${x.src}" alt="${x.alt?.[locale === "id" ? 0 : 1] || x.title[locale === "id" ? 0 : 1]}">`
      : "";
}
$("[data-lightbox-close]")?.addEventListener("click", () => dialog.close());
$("[data-lightbox-prev]")?.addEventListener("click", () => {
  lightboxIndex--;
  paintLightbox();
});
$("[data-lightbox-next]")?.addEventListener("click", () => {
  lightboxIndex++;
  paintLightbox();
});
dialog?.addEventListener("click", (e) => {
  if (e.target === dialog) dialog.close();
});
dialog?.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") {
    lightboxIndex--;
    paintLightbox();
  }
  if (e.key === "ArrowRight") {
    lightboxIndex++;
    paintLightbox();
  }
});
let dialogTouchX = null;
dialog?.addEventListener(
  "touchstart",
  (event) => {
    dialogTouchX = event.touches[0].clientX;
  },
  { passive: true },
);
dialog?.addEventListener(
  "touchend",
  (event) => {
    if (dialogTouchX === null) return;
    const delta = event.changedTouches[0].clientX - dialogTouchX;
    if (Math.abs(delta) > 45) {
      lightboxIndex += delta < 0 ? 1 : -1;
      paintLightbox();
    }
    dialogTouchX = null;
  },
  { passive: true },
);
document.addEventListener("localechange", renderGallery);
renderGallery();
fetch("assets/gallery.json")
  .then((response) =>
    response.ok
      ? response.json()
      : Promise.reject(Error(`HTTP ${response.status}`)),
  )
  .then((items) => {
    galleryData = items.map((item) => ({
      ...item,
      title: [item.title.id, item.title.en],
      caption: [item.caption.id, item.caption.en],
      alt: [item.alt.id, item.alt.en],
    }));
    renderGallery();
  })
  .catch((error) => console.warn("Gallery manifest fallback in use", error));

let youtubeData = null;
const renderYouTube = () => {
  const list = $("[data-youtube-list]");
  if (!list) return;
  if (!youtubeData?.videos?.length) {
    list.innerHTML = `<p class="video-fallback">${locale === "id" ? "Cerita terbaru belum dapat dimuat. Kunjungi kanal YouTube BUNAYYA melalui tautan di bawah." : "The latest stories could not be loaded. Visit the BUNAYYA YouTube channel using the link below."}</p>`;
    return;
  }
  list.innerHTML = "";
  youtubeData.videos.slice(0, 3).forEach((video, index) => {
    const card = document.createElement("article");
    card.className = "video-card";
    const published = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(video.publishedAt));
    card.innerHTML = `
      <div class="video-media">
        <img src="${video.thumbnail}" alt="" loading="lazy" width="480" height="270">
        <button class="video-play" type="button" aria-label="${locale === "id" ? "Putar video" : "Play video"}: ${video.title}"><span aria-hidden="true">▶</span></button>
      </div>
      <div class="video-copy"><span>${String(index + 1).padStart(2, "0")} · ${published}</span><h3></h3><a href="${video.url}" target="_blank" rel="noopener">${locale === "id" ? "Tonton di YouTube" : "Watch on YouTube"} ↗</a></div>`;
    $("h3", card).textContent = video.title;
    $(".video-play", card).addEventListener("click", () => {
      const media = $(".video-media", card);
      media.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1" title="${video.title.replaceAll('"', "&quot;")}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe><button class="video-close" type="button" aria-label="${locale === "id" ? "Tutup video" : "Close video"}">×</button>`;
      $(".video-close", media).addEventListener("click", renderYouTube);
    });
    list.append(card);
  });
};
async function initYouTube() {
  if (!$("[data-youtube-list]")) return;
  try {
    const response = await fetch("assets/youtube-latest.json");
    if (!response.ok) throw Error(`HTTP ${response.status}`);
    youtubeData = await response.json();
  } catch (error) {
    console.warn("YouTube data unavailable", error);
  }
  renderYouTube();
}
document.addEventListener("localechange", renderYouTube);
document.addEventListener("visibilitychange", () => {
  if (document.hidden && $(".video-media iframe")) renderYouTube();
});
initYouTube();

$$('[data-map-frame] iframe').forEach((frame) => {
  frame.addEventListener("load", () => frame.closest("[data-map-frame]")?.classList.add("is-loaded"));
});

let content;
const rupiah = (n) => "Rp " + new Intl.NumberFormat("id-ID").format(n);
async function initData() {
  try {
    const res = await fetch("assets/content.json");
    if (!res.ok) throw Error(`HTTP ${res.status}`);
    content = await res.json();
    renderAdmissions();
  } catch (err) {
    console.error("Content data failed to load", err);
    const c = $(".calculator");
    if (c)
      c.innerHTML =
        "<p>Data biaya tidak dapat dimuat. Silakan muat ulang halaman.</p>";
  }
}
function renderAdmissions() {
  if (!$("#period")) return;
  const selectedPeriod = calculatorState.period;
  $("#period").innerHTML = content.tuition.periods
    .map(
      (p, i) =>
        `<option value="${i}">${locale === "en" ? p.labelEn || p.label : p.label}</option>`,
    )
    .join("");
  $("#period").value = String(selectedPeriod);
  $("#level").value = calculatorState.level;
  $("#campus").value = calculatorState.campus;
  $("[data-policies]").innerHTML = content.tuition.policies
    .map((p) => `<p lang="id">${p}</p>`)
    .join("");
  $("[data-fee-table]").innerHTML = Object.entries(
    content.tuition.officialTotals,
  )
    .map(
      ([level, total]) =>
        `<tr><td>${level}</td><td data-label="${locale === "id" ? "Biaya normal" : "Standard tuition"}">${rupiah(total)}</td><td data-label="${locale === "id" ? "Setelah potongan" : "After discount"}">${rupiah(total - content.tuition.periods[0].discount)}</td></tr>`,
    )
    .join("");
  calculate();
}
function calculate() {
  if (!content || !$("#level")) return;
  calculatorState.campus = $("#campus").value;
  calculatorState.level = $("#level").value;
  calculatorState.period = Number($("#period").value);
  const level = calculatorState.level,
    p = content.tuition.periods[calculatorState.period],
    rows = content.tuition.levels[level],
    normal = rows.reduce((a, x) => a + x.amount, 0);
  if (normal !== content.tuition.officialTotals[level])
    console.error(`Total mismatch for ${level}`);
  const initialRows = rows.filter((row) => !row.recurring);
  const monthlyRows = rows.filter((row) => row.recurring);
  $("[data-initial-breakdown]").innerHTML = initialRows
    .map(
      (r) =>
        `<div class="breakdown-row"><span>${locale === "en" ? r.labelEn : r.label}</span><b>${rupiah(r.amount)}</b></div>`,
    )
    .join("");
  $("[data-monthly-breakdown]").innerHTML = monthlyRows
    .map(
      (r) =>
        `<div class="breakdown-row"><span>${locale === "en" ? r.labelEn : r.label}</span><b>${rupiah(r.amount)}</b></div>`,
    )
    .join("");
  $("[data-normal]").textContent = rupiah(normal);
  $("[data-discount]").textContent = "− " + rupiah(p.discount);
  const totalElement = $("[data-total]");
  totalElement.textContent = rupiah(normal - p.discount);
  if (!reduced) {
    totalElement.classList.remove("amount-updated");
    requestAnimationFrame(() => totalElement.classList.add("amount-updated"));
  }
  const msg =
    locale === "en"
      ? `Assalamu'alaikum, I would like information about ${calculatorState.campus} admissions 2027/2028 for ${level}, ${p.labelEn || p.label} payment period. The website estimate is ${rupiah(normal - p.discount)} and remains subject to official school terms.`
      : `Assalamu'alaikum, saya ingin informasi PPDB ${calculatorState.campus} 2027/2028 jenjang ${level}, periode pelunasan ${p.label}. Estimasi website ${rupiah(normal - p.discount)} dan mengikuti ketentuan resmi sekolah.`;
  $("[data-calc-wa]").href =
    "https://wa.me/" + content.whatsapp + "?text=" + encodeURIComponent(msg);
}
$("#level")?.addEventListener("change", calculate);
$("#period")?.addEventListener("change", calculate);
$("#campus")?.addEventListener("change", calculate);
document.addEventListener("localechange", () => {
  if (content) renderAdmissions();
});
initData();
