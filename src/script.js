const imageWrapper = document.querySelector(".images");
const searchInput = document.querySelector(".search input");

const loadMoreBtn = document.querySelector(".gallery .load-more");
const lightbox = document.querySelector(".lightbox");
const closeImgBtn = lightbox.querySelector(".close-icon");

const apiKey = "qi4emWEzgGGwF2Pke0yD6oYs5cJmeeVJImfOkXF5vmvcM1p50wysnBMu";
const perPage = 15;
let currentPage = 1;
let searchTerm = null;

// Make downloadImg globally accessible for inline HTML
window.downloadImg = (imgUrl) => {
  // Converting received img to blob, creating its download link, & downloading it
  fetch(imgUrl)
    .then((res) => res.blob())
    .then((blob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = new Date().getTime();
      a.click();
    })
    .catch(() => alert("Failed to download image!"));
};

const showLightbox = (imgUrl) => {
  const lightboxImg = new Image();
  lightboxImg.src = imgUrl;

  lightboxImg.addEventListener("load", () => {
    let lightboxWrapper = lightbox.querySelector(".wrapper");
    if (!lightboxWrapper) {
      const wrapper = document.createElement("div");
      wrapper.classList.add("wrapper");
      lightbox.appendChild(wrapper);
      lightboxWrapper = wrapper;
    }

    lightboxWrapper.innerHTML = "";

    const header = document.createElement("header");
    const photographerDiv = document.createElement("div");
    photographerDiv.classList.add("photographer");
    const photographerIcon = document.createElement("i");
    photographerIcon.classList.add("uil", "uil-camera");
    const photographerSpan = document.createElement("span");
    photographerDiv.appendChild(photographerIcon);
    photographerDiv.appendChild(photographerSpan);
    header.appendChild(photographerDiv);

    const buttonsDiv = document.createElement("div");
    buttonsDiv.classList.add("buttons");

    // Download button with SVG
    const downloadBtn = document.createElement("button");
    downloadBtn.classList.add("modal-btn", "download-btn");
    downloadBtn.title = "Download Image";
    downloadBtn.addEventListener("click", () => window.downloadImg(imgUrl));
    downloadBtn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3v12m0 0l-4-4m4 4l4-4" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="4" y="19" width="16" height="2" rx="1" fill="#fff"/>
      </svg>
    `;
    buttonsDiv.appendChild(downloadBtn);

    // Close button with SVG
    const closeBtn = document.createElement("button");
    closeBtn.classList.add("modal-btn", "close-btn");
    closeBtn.title = "Close";
    closeBtn.addEventListener("click", hideLightbox);
    closeBtn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="18" y1="6" x2="6" y2="18" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
        <line x1="6" y1="6" x2="18" y2="18" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;
    buttonsDiv.appendChild(closeBtn);

    header.appendChild(buttonsDiv);

    const previewImgDiv = document.createElement("div");
    previewImgDiv.classList.add("preview-img");
    const imgDiv = document.createElement("div");
    imgDiv.classList.add("img");
    imgDiv.appendChild(lightboxImg);
    previewImgDiv.appendChild(imgDiv);

    lightboxWrapper.appendChild(header);
    lightboxWrapper.appendChild(previewImgDiv);

    lightbox.classList.add("show");
    document.body.style.overflow = "hidden";
  });

  lightboxImg.addEventListener("error", () => {
    console.error("Failed to load image:", imgUrl);
  });
};

const hideLightbox = () => {
  lightbox.classList.remove("show");
  // Don't clear innerHTML, just hide. This keeps event listeners attached.
  document.body.style.overflow = "auto";
};

const generateHTML = (images) => {
  imageWrapper.innerHTML += images
    .map(
      (img) =>
        `<li class="card">
      <img src="${img.src.large2x}" alt="img" data-url="${img.src.large2x}">
      <div class="details">
        <div class="photographer">
          &#128247; <!-- Camera icon using HTML entity -->
          <span>${img.photographer}</span>
        </div>
        <button onclick="downloadImg('${img.src.large2x}');">
          &#8595; <!-- Down arrow icon using HTML entity -->
        </button>
      </div>
    </li>`,
    )
    .join("");

  attachImageClickListeners();
};

const attachImageClickListeners = () => {
  const imageCards = document.querySelectorAll(".card img");
  imageCards.forEach((img) => {
    img.addEventListener("click", (event) => {
      event.stopPropagation(); // Prevent event bubbling
      const imgUrl = event.target.dataset.url;
      showLightbox(imgUrl);
    });
  });
};

const getImages = (apiURL) => {
  // Fetching images by API call with authorization header
  searchInput.blur();
  loadMoreBtn.innerText = "Loading...";
  loadMoreBtn.classList.add("disabled");
  fetch(apiURL, {
    headers: { Authorization: apiKey },
  })
    .then((res) => res.json())
    .then((data) => {
      generateHTML(data.photos);
      attachImageClickListeners(); // Call attachImageClickListeners after generating HTML
      loadMoreBtn.innerText = "Load More";
      loadMoreBtn.classList.remove("disabled");
    })
    .catch(() => alert("Failed to load images!"));
};

const loadMoreImages = () => {
  currentPage++; // Increment currentPage by 1
  // If searchTerm has some value then call API with search term else call default API
  let apiUrl = `https://api.pexels.com/v1/curated?page=${currentPage}&per_page=${perPage}`;
  apiUrl = searchTerm
    ? `https://api.pexels.com/v1/search?query=${searchTerm}&page=${currentPage}&per_page=${perPage}`
    : apiUrl;
  getImages(apiUrl);
  attachImageClickListeners(); // Call attachImageClickListeners after loading more images
};

// Call attachImageClickListeners after the initial images have been loaded
attachImageClickListeners();

const searchButton = document.querySelector(".search-btn"); // Assuming the search button has the class 'search-btn'

const loadSearchImages = (e) => {
  if (e.type === "keyup") {
    if (e.target.value === "") {
      searchTerm = null;
      return;
    }
    if (e.key === "Enter") {
      searchTerm = e.target.value;
    }
  } else if (e.type === "click") {
    searchTerm = searchInput.value;
  }

  if (searchTerm) {
    currentPage = 1;
    imageWrapper.innerHTML = "";
    getImages(
      `https://api.pexels.com/v1/search?query=${searchTerm}&page=1&per_page=${perPage}`,
    );
  }
};

searchInput.addEventListener("keyup", loadSearchImages);
searchButton.addEventListener("click", loadSearchImages);

getImages(
  `https://api.pexels.com/v1/curated?page=${currentPage}&per_page=${perPage}`,
);
loadMoreBtn.addEventListener("click", loadMoreImages);
// No duplicate event listeners
closeImgBtn.addEventListener("click", hideLightbox);
