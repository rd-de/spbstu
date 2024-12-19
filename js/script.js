const apiUrl = 'https://www.swapi.tech/api/planets';
let allPlanets = [];
let currentPage = 1;
const itemsPerPage = 10;
let totalPages = 0;

const planetListContainer = document.getElementById('planet-list');
const paginationContainer = document.getElementById('pagination');
const modalContainer = document.getElementById('modal-container');
const showAllButton = document.getElementById('show-all-button');

async function fetchAllPlanets() {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    const planets = data.results;

    allPlanets = await Promise.all(
      planets.map(async (planet) => {
        const detailsResponse = await fetch(planet.url);
        const detailsData = await detailsResponse.json();
        return detailsData.result.properties;
      })
    );

    totalPages = Math.ceil(allPlanets.length / itemsPerPage);
    renderPlanets();
    renderPagination();
  } catch (error) {
    console.error('Error fetching planets:', error);
  }
}

function renderPlanets() {
  planetListContainer.innerHTML = '';
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const planetsToShow = allPlanets.slice(startIndex, endIndex);

  planetsToShow.forEach((planet) => {
    const planetCard = document.createElement('div');
    planetCard.className = 'planet-card card mb-3';
    planetCard.innerHTML = `
      <div class="card-body">
        <h5 class="card-title">${planet.name}</h5>
        <p>Диаметр: ${planet.diameter || 'Неизвестно'}</p>
        <p>Население: ${planet.population || 'Неизвестно'}</p>
        <p>Гравитация: ${planet.gravity || 'Неизвестно'}</p>
        <p>Территории: ${planet.terrain || 'Неизвестно'}</p>
        <p>Климат: ${planet.climate || 'Неизвестно'}</p>
      </div>
    `;
    planetCard.addEventListener('click', () => showPlanetDetails(planet));
    planetListContainer.appendChild(planetCard);
  });
}

function renderPagination() {
  paginationContainer.innerHTML = '';
  const maxPagesToShow = 3;
  let startPage = Math.max(1, currentPage - 1);
  let endPage = Math.min(totalPages, currentPage + 1);

  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement('button');
    pageButton.className = `btn btn-primary m-1 ${i === currentPage ? 'active' : ''}`;
    pageButton.innerText = i;
    pageButton.addEventListener('click', () => {
      currentPage = i;
      renderPlanets();
    });
    paginationContainer.appendChild(pageButton);
  }

  if (currentPage < totalPages) {
    const nextPageButton = document.createElement('button');
    nextPageButton.className = 'btn btn-secondary m-1';
    nextPageButton.innerText = 'Далее';
    nextPageButton.addEventListener('click', () => {
      currentPage++;
      renderPlanets();
    });
    paginationContainer.appendChild(nextPageButton);
  }
}

function showPlanetDetails(planet) {
  modalContainer.innerHTML = `
    <div class="modal fade show" tabindex="-1" style="display: block;">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${planet.name}</h5>
            <button type="button" class="btn-close" onclick="closeModal()"></button>
          </div>
          <div class="modal-body">
            <p>Диаметр: ${planet.diameter || 'Неизвестно'}</p>
            <p>Население: ${planet.population || 'Неизвестно'}</p>
            <p>Гравитация: ${planet.gravity || 'Неизвестно'}</p>
            <p>Территории: ${planet.terrain || 'Неизвестно'}</p>
            <p>Климат: ${planet.climate || 'Неизвестно'}</p>
            <p>Период вращения: ${planet.rotation_period || 'Неизвестно'}</p>
            <p>Период орбиты: ${planet.orbital_period || 'Неизвестно'}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Закрыть</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function closeModal() {
  modalContainer.innerHTML = '';
}

showAllButton.addEventListener('click', () => {
  currentPage = 1;
  fetchAllPlanets();
});

function init() {
  fetchAllPlanets();
}

init();

