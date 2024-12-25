const API_BASE_URL = 'https://swapi.py4e.com/api/';

let allPlanets = [];
let currentPage = 1;
const itemsPerPage = 10;
let totalPages = 0;

const planetListContainer = document.getElementById('planet-list');
const paginationContainer = document.getElementById('pagination');
const modalContainer = document.getElementById('modal-container');
const showAllButton = document.getElementById('show-all-button');

async function fetchPlanetsByPage(page) {
  const response = await fetch(`${API_BASE_URL}planets/?page=${page}`);
  const data = await response.json();
  totalPages = Math.ceil(data.count / itemsPerPage);
  return data.results;
}

async function fetchAllPlanets() {
  allPlanets = [];
  let nextPage = `${API_BASE_URL}planets/`;
  while (nextPage) {
    const response = await fetch(nextPage);
    const data = await response.json();
    allPlanets = allPlanets.concat(data.results);
    nextPage = data.next;
  }
  renderAllPlanets();
  paginationContainer.innerHTML = '';
}

function renderPlanets() {
  planetListContainer.innerHTML = '';
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const planetsToShow = allPlanets.slice(startIndex, endIndex);
  planetsToShow.forEach(createPlanetCard);
}

function renderAllPlanets() {
  planetListContainer.innerHTML = '';
  allPlanets.forEach(createPlanetCard);
}

function createPlanetCard(planet) {
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
      <button class="btn btn-primary" onclick="showPlanetDetails(${JSON.stringify(
        planet
      ).replace(/"/g, '&quot;')})">Подробнее</button>
    </div>
  `;
  planetListContainer.appendChild(planetCard);
}

function renderPagination() {
  paginationContainer.innerHTML = '';
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.className = `btn btn-primary m-1 ${i === currentPage ? 'active' : ''}`;
    pageButton.innerText = i;
    pageButton.addEventListener('click', async () => {
      currentPage = i;
      allPlanets = await fetchPlanetsByPage(currentPage);
      renderPlanets();
      renderPagination();
    });
    paginationContainer.appendChild(pageButton);
  }
}

async function showPlanetDetails(planet) {
  const films = await Promise.all(
    planet.films.map(async (filmUrl) => {
      const response = await fetch(filmUrl);
      return await response.json();
    })
  );
  const characters = await Promise.all(
    planet.residents.map(async (residentUrl) => {
      const response = await fetch(residentUrl);
      const residentData = await response.json();
      const homeworldResponse = await fetch(residentData.homeworld);
      residentData.homeworldName = (await homeworldResponse.json()).name;
      return residentData;
    })
  );

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
            <h6>Фильмы:</h6>
            <ul>
              ${films
                .map(
                  (film) =>
                    `<li>${film.title} (Эпизод ${film.episode_id}, ${film.release_date})</li>`
                )
                .join('')}
            </ul>
            <h6>Персонажи:</h6>
            <ul>
              ${characters
                .map(
                  (character) =>
                    `<li>${character.name} (${character.gender}, ${character.birth_year}, Родной мир: ${character.homeworldName})</li>`
                )
                .join('')}
            </ul>
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

showAllButton.addEventListener('click', fetchAllPlanets);

async function init() {
  allPlanets = await fetchPlanetsByPage(1);
  renderPlanets();
  renderPagination();
}

init();

