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

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function renderPhotos(files) {
  photoGrid.innerHTML = files
    .map((file) => {
      const src = `images/photos/${file}`;
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
    const res = await fetch("images/photos/photos.json", { cache: "no-store" });
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
