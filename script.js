const screenError = document.getElementById("screen-error");
const screenLabel = document.getElementById("screen-label");
const backdrop = document.getElementById("backdrop");
const btnOk = document.getElementById("btnOk");
const btnCancel = document.getElementById("btnCancel");
const lightbox = document.getElementById("lightbox");

function showLabelPage() {
  backdrop.classList.add("hidden");
  screenError.classList.add("hidden");
  screenLabel.classList.remove("hidden");
}

btnOk.addEventListener("click", () => {
  btnOk.disabled = true;
  btnCancel.disabled = true;
  btnOk.textContent = "PROCESSING...";

  setTimeout(() => {
    backdrop.classList.add("hidden");
    btnOk.disabled = false;
    btnCancel.disabled = false;
    btnOk.textContent = "OK";
    window.close();
  }, 3000);
});

btnCancel.addEventListener("click", () => {
  btnOk.disabled = true;
  btnCancel.disabled = true;
  btnCancel.textContent = "LOADING...";

  setTimeout(() => {
    showLabelPage();
    btnOk.disabled = false;
    btnCancel.disabled = false;
    btnCancel.textContent = "CANCEL";
  }, 2000);
});

function closeLightbox() {
  lightbox.classList.remove("active");
  if (lightboxImg) lightboxImg.src = "";
}

lightbox?.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute("href"));
    if (target) target.scrollIntoView({ behavior: "smooth" });
  });
});

if (location.hash === "#label") showLabelPage();

// ===== PHOTO WORKS: random + view all (manifest 기반) =====
const photoGrid = document.getElementById("photoGrid");
const btnViewAll = document.getElementById("btnViewAll");
const btnShuffle = document.getElementById("btnShuffle");

const lightboxImg = document.getElementById("lightboxImg");
const lightboxCaption = document.getElementById("lightboxCaption");
const lightboxClose = document.getElementById("lightboxClose");

let allPhotos = [];
let isViewAll = false;
const RANDOM_COUNT = 8;

/**
 * ✅ 여기에 "사진이 실제로 올라가있는 곳"의 베이스 URL을 넣어줘.
 * - 끝에 /photos 처럼 폴더까지 포함해도 됨.
 * - 마지막에 슬래시(/)는 있어도 되고 없어도 됨(아래에서 정리해줌)
 *
 * 예시:
 * const BASE_URL = "https://photos.404human.com/photos";
 * const BASE_URL = "https://pub-xxxx.r2.dev/photos";
 * const BASE_URL = "https://res.cloudinary.com/xxx/image/upload/v123";
 */
const BASE_URL = "https://YOUR_IMAGE_HOST/photos";

function normalizeBaseUrl(url) {
  return url.replace(/\/+$/, ""); // 끝 슬래시 제거
}

function joinUrl(base, file) {
  const safeBase = normalizeBaseUrl(base);
  const safeFile = encodeURIComponent(file);
  return `${safeBase}/${safeFile}`;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function renderPhotos(files) {
  const base = normalizeBaseUrl(BASE_URL);

  // BASE_URL 안 바꿨으면 아무 것도 안 그림(실수 방지)
  if (!base || base.includes("YOUR_IMAGE_HOST")) {
    photoGrid.innerHTML = `
      <div class="mono" style="opacity:.7; text-align:center; padding:20px;">
        PHOTO SOURCE NOT SET<br/>
        BASE_URL을 네 이미지 호스트 주소로 바꿔줘.
      </div>
    `;
    return;
  }

  photoGrid.innerHTML = files
    .map((file) => {
      const src = joinUrl(base, file);
      return `
        <div class="photo-item" data-src="${src}" data-name="${file}">
          <img src="${src}" alt="${file}" loading="lazy" />
        </div>
      `;
    })
    .join("");
}

async function loadPhotos() {
  try {
    // ✅ manifest는 사이트(Cloudtype)에서 가져오고
    // 사진은 BASE_URL(외부 호스트)에서 가져오는 구조
    const res = await fetch("/images/photos/photos.json", {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("photos.json load failed");
    const data = await res.json();
    allPhotos = Array.isArray(data.files) ? data.files : [];
  } catch (e) {
    allPhotos = [];
    console.warn("photos.json을 못 읽음:", e);
  }

  const first = shuffle(allPhotos).slice(
    0,
    Math.min(RANDOM_COUNT, allPhotos.length)
  );
  renderPhotos(first);
}

function setViewAll(next) {
  isViewAll = next;

  if (isViewAll) {
    renderPhotos(allPhotos);
    btnViewAll.textContent = "COLLAPSE";
  } else {
    const subset = shuffle(allPhotos).slice(
      0,
      Math.min(RANDOM_COUNT, allPhotos.length)
    );
    renderPhotos(subset);
    btnViewAll.textContent = "VIEW ALL";
  }
}

btnViewAll?.addEventListener("click", () => setViewAll(!isViewAll));

btnShuffle?.addEventListener("click", () => {
  const list = shuffle(allPhotos);
  if (isViewAll) renderPhotos(list);
  else renderPhotos(list.slice(0, Math.min(RANDOM_COUNT, list.length)));
});

photoGrid?.addEventListener("click", (e) => {
  const item = e.target.closest(".photo-item");
  if (!item) return;

  const src = item.dataset.src;
  const name = item.dataset.name;

  lightboxImg.src = src;
  lightboxCaption.textContent = name || "";
  lightbox.classList.add("active");
});

lightboxClose?.addEventListener("click", () => closeLightbox());

loadPhotos();
