const BASE_URL = "https://www.swapi.tech/api/planets";
let currentPage = 1;
let totalPages = 0;

// Функция для загрузки данных
async function fetchData(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Ошибка при загрузке данных");
  return response.json();
}

// Рендер карточек планет
function renderPlanets(planets) {
  const container = document.getElementById("planets-container");
  container.innerHTML = "";

  planets.forEach(({ uid, properties }) => {
    const card = document.createElement("div");
    card.className = "col-md-4 mb-4";
    card.innerHTML = `
      <div class="card h-100">
        <div class="card-body">
          <h5 class="card-title">${properties.name}</h5>
          <p><strong>Диаметр:</strong> ${properties.diameter}</p>
          <p><strong>Население:</strong> ${properties.population}</p>
          <p><strong>Гравитация:</strong> ${properties.gravity}</p>
          <p><strong>Зоны:</strong> ${properties.terrain}</p>
          <p><strong>Климат:</strong> ${properties.climate}</p>
          <button class="btn btn-primary" onclick="showDetails('${uid}')">Подробнее</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// Показ модального окна с детальной информацией
async function showDetails(planetId) {
  const planetData = await fetchData(`https://www.swapi.tech/api/planets/${planetId}`);
  const planet = planetData.result.properties;

  const modalTitle = document.getElementById("planetModalLabel");
  const modalDetails = document.getElementById("planet-details");
  const filmsList = document.getElementById("films-list");
  const charactersList = document.getElementById("characters-list");

  modalTitle.textContent = planet.name;
  modalDetails.innerHTML = `
    <p><strong>Диаметр:</strong> ${planet.diameter}</p>
    <p><strong>Население:</strong> ${planet.population}</p>
    <p><strong>Гравитация:</strong> ${planet.gravity}</p>
    <p><strong>Зоны:</strong> ${planet.terrain}</p>
    <p><strong>Климат:</strong> ${planet.climate}</p>
  `;

  // Фильмы
  filmsList.innerHTML = "";
  for (const filmUrl of planet.films) {
    const film = await fetchData(filmUrl);
    const li = document.createElement("li");
    li.textContent = `Эпизод ${film.result.properties.episode_id}: ${film.result.properties.title} (${film.result.properties.release_date})`;
    filmsList.appendChild(li);
  }

  charactersList.innerHTML = "";
  for (const characterUrl of planet.residents) {
    const character = await fetchData(characterUrl);
    const homeworld = await fetchData(character.result.properties.homeworld);
    const li = document.createElement("li");
    li.textContent = `${character.result.properties.name} (${character.result.properties.gender}, ${character.result.properties.birth_year}, Родной мир: ${homeworld.result.properties.name})`;
    charactersList.appendChild(li);
  }

  const modal = new bootstrap.Modal(document.getElementById("planetModal"));
  modal.show();
}

// Пагинация
function renderPagination(total, current) {
  const pagination = document.getElementById("pagination");
  totalPages = Math.ceil(total / 10);
  pagination.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    li.className = `page-item ${i === current ? "active" : ""}`;
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    li.addEventListener("click", () => loadPage(i));
    pagination.appendChild(li);
  }
}

// Загрузка страницы
async function loadPage(page) {
  currentPage = page;
  const data = await fetchData(`${BASE_URL}?page=${page}`);
  renderPlanets(data.results);
  renderPagination(data.total_records, page);
}

// Загрузка всех планет
async function loadAllPlanets() {
  let allPlanets = [];
  let url = `${BASE_URL}?page=1`;
  while (url) {
    const data = await fetchData(url);
    allPlanets = allPlanets.concat(data.results);
    url = data.next;
  }
  renderPlanets(allPlanets);
}

// Инициализация
document.getElementById("show-all").addEventListener("click", loadAllPlanets);
loadPage(currentPage);
