const imageWrapper = document.querySelector(".images");
const searchInput = document.querySelector(".search input");

const loadMoreBtn = document.querySelector(".gallery .load-more");
const lightbox = document.querySelector(".lightbox");
const closeImgBtn = lightbox.querySelector(".close-icon");

const apiKey = "qi4emWEzgGGwF2Pke0yD6oYs5cJmeeVJImfOkXF5vmvcM1p50wysnBMu";
const perPage = 15;
let currentPage = 1;
let searchTerm = null;

const downloadImg = (imgUrl) => {
  // Converting received img to blob, creating its download link, & downloading it
  fetch(imgUrl)
    .then(res => res.blob())
    .then(blob => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = new Date().getTime();
      a.click();
    })
    .catch(() => alert("Failed to download image!"));
}

const showLightbox = (imgUrl) => {
  const lightboxImg = new Image();
  lightboxImg.src = imgUrl;

  lightboxImg.addEventListener('load', () => {
    const lightboxWrapper = lightbox.querySelector('.wrapper');
    if (!lightboxWrapper) {
      const wrapper = document.createElement('div');
      wrapper.classList.add('wrapper');
      lightbox.appendChild(wrapper);
      lightboxWrapper = wrapper;
    }

    lightboxWrapper.innerHTML = ''; // Clear previous content

    const header = document.createElement('header');
    const photographerDiv = document.createElement('div');
    photographerDiv.classList.add('photographer');
    const photographerIcon = document.createElement('i');
    photographerIcon.classList.add('uil', 'uil-camera');
    const photographerSpan = document.createElement('span');
    photographerDiv.appendChild(photographerIcon);
    photographerDiv.appendChild(photographerSpan);
    header.appendChild(photographerDiv);

    const buttonsDiv = document.createElement('div');
    buttonsDiv.classList.add('buttons');
    const downloadBtn = document.createElement('i');
    downloadBtn.classList.add('uil', 'uil-import', 'download-icon');
    downloadBtn.addEventListener('click', () => downloadImg(imgUrl));
    const closeBtn = document.createElement('i');
    closeBtn.classList.add('uil', 'uil-times', 'close-icon');
    closeBtn.addEventListener('click', hideLightbox);
    buttonsDiv.appendChild(downloadBtn);
    buttonsDiv.appendChild(closeBtn);
    header.appendChild(buttonsDiv);

    const previewImgDiv = document.createElement('div');
    previewImgDiv.classList.add('preview-img');
    const imgDiv = document.createElement('div');
    imgDiv.classList.add('img');
    imgDiv.appendChild(lightboxImg);
    previewImgDiv.appendChild(imgDiv);

    lightboxWrapper.appendChild(header);
    lightboxWrapper.appendChild(previewImgDiv);

    lightbox.classList.add('show');
    document.body.style.overflow = 'hidden';
  });

  lightboxImg.addEventListener('error', () => {
    console.error('Failed to load image:', imgUrl);
  });
}








const hideLightbox = () => {
  lightbox.classList.remove('show');
  lightbox.innerHTML = ''; // Clear the lightbox content
  document.body.style.overflow = 'auto';
}


const generateHTML = (images) => {
  imageWrapper.innerHTML += images.map(img =>
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
    </li>`
  ).join("");

  attachImageClickListeners();
}

const attachImageClickListeners = () => {
  const imageCards = document.querySelectorAll('.card img');
  imageCards.forEach(img => {
    img.addEventListener('click', (event) => {
      event.stopPropagation(); // Prevent event bubbling
      const imgUrl = event.target.dataset.url;
      showLightbox(imgUrl);
    });
  });
}





const getImages = (apiURL) => {
  // Fetching images by API call with authorization header
  searchInput.blur();
  loadMoreBtn.innerText = "Loading...";
  loadMoreBtn.classList.add("disabled");
  fetch(apiURL, {
    headers: { Authorization: apiKey }
  })
    .then(res => res.json())
    .then(data => {
      generateHTML(data.photos);
      attachImageClickListeners(); // Call attachImageClickListeners after generating HTML
      loadMoreBtn.innerText = "Load More";
      loadMoreBtn.classList.remove("disabled");
    })
    .catch(() => alert("Failed to load images!"));
}

const loadMoreImages = () => {
  currentPage++; // Increment currentPage by 1
  // If searchTerm has some value then call API with search term else call default API
  let apiUrl = `https://api.pexels.com/v1/curated?page=${currentPage}&per_page=${perPage}`;
  apiUrl = searchTerm ? `https://api.pexels.com/v1/search?query=${searchTerm}&page=${currentPage}&per_page=${perPage}` : apiUrl;
  getImages(apiUrl);
  attachImageClickListeners(); // Call attachImageClickListeners after loading more images
}

// Call attachImageClickListeners after the initial images have been loaded
attachImageClickListeners();


const searchButton = document.querySelector('.search-btn'); // Assuming the search button has the class 'search-btn'

const loadSearchImages = (e) => {
  let searchTerm;

  if (e.type === 'keyup') {
    if (e.target.value === '') return searchTerm = null;
    if (e.key === 'Enter') {
      searchTerm = e.target.value;
    }
  } else if (e.type === 'click') {
    searchTerm = searchInput.value;
  }

  if (searchTerm) {
    currentPage = 1;
    imageWrapper.innerHTML = '';
    getImages(`https://api.pexels.com/v1/search?query=${searchTerm}&page=1&per_page=${perPage}`);
  }
}

searchInput.addEventListener('keyup', loadSearchImages);
searchButton.addEventListener('click', loadSearchImages);


getImages(`https://api.pexels.com/v1/curated?page=${currentPage}&per_page=${perPage}`);
loadMoreBtn.addEventListener("click", loadMoreImages);
searchInput.addEventListener("keyup", loadSearchImages);
closeImgBtn.addEventListener("click", hideLightbox);
