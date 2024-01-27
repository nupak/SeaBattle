document.addEventListener("DOMContentLoaded", function() {
    const board = document.getElementById("fields");
    const fieldSize = document.getElementById("game-info").dataset.fieldSize;
    const playerShots = document.getElementById("game-info").dataset.playerShots;
    const sunkShips = document.getElementById("game-info").dataset.sunkShips;
    const bulletsField = document.getElementById("bullets-field");
    const addBulletBtn = document.getElementById("addBulletBtn");
    const removeBulletBtn = document.getElementById("removeBulletBtn");
    bullets = document.getElementById("game-info").dataset.bullets;


    function handleBulletAction(action) {
        const gameId = getGameId();
        if (gameId !== null) {
            fetch(`/api/games/${gameId}/bullet/`, {
                method: "POST",  // Используем метод POST, так как происходит изменение данных
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCookie('csrftoken')
                },
                body: JSON.stringify({ action: action })
            })
            .then(response => response.json())
            .then(data => {
                bullets = data.bullets
                updateBulletsField(bullets);
            })
            .catch(error => {
                console.error("Ошибка при добавлении/удалении пули:", error);
            });
        }
    }

    function createBoard(size) {
        player_ships = "";
        board.innerHTML = "";
        board.removeEventListener("click", clickHandler);
        const gridColumns = `repeat(${size}, 1fr)`;
        for (let i = 1; i-1 < size ; i++) {
            const row = document.createElement("div");
            row.className = "row";

            for (let j = 1; j-1 < size; j++) {
                const cell = document.createElement("div");
                cell.className = "cell";
                cell.id = `${i}-${j}`;
                row.appendChild(cell);
            }
            row.style.gridTemplateColumns = gridColumns;
            board.appendChild(row);
        }

        addClickHandler(board);
    }

    function addClickHandler(board) {
        board.addEventListener("click", clickHandler);
    }

    function clickHandler(event) {
        if (bullets < 1){
            alert("У вас нет пуль");
            return;
        }
        const gameId = getGameId();
        if (gameId !== null) {
            if (event.target.classList.contains("cell")) {
                const cellId = event.target.id;
                    // Отправляем GET-запрос на сервер с координатами выстрела
                    fetch(`/api/games/${gameId}/shoot?coordinates=${cellId}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRFToken": csrfToken
                        },
                    })
                    .then(response => response.json())
                    .then(data => {
                        handleShootResponse(data);
                    })
                    .catch(error => {
                        console.error("Ошибка при отправке GET-запроса на сервер: " + error);
                    });
            }
        } else {
            alert("Пожалуйста перезагрузите страницу");
        }
    }

    function getGameId() {
        const currentUrl = window.location.href;
        const urlParts = currentUrl.split('/');
        const gamesIndex = urlParts.indexOf('games');

        if (gamesIndex !== -1 && !isNaN(urlParts[gamesIndex + 1])) {
            return parseInt(urlParts[gamesIndex + 1], 10);
        } else {
            return null; // Возвращаем null, если pk не найден в URL
        }
    }

    function handleShootResponse(responseData) {
        bullets = responseData.bullets;
        console.log(responseData);
        const playerShots = responseData.player_shots;
        const sunkShips = responseData.sunk_ships;
        const prizesList = responseData.prize_list
        updateBoardState(playerShots, bullets, sunkShips,prizesList);
    }

    function updateBoardState(playerShots, bullets, sunkShips, prizesList) {
        updateShotCell(playerShots)
        updateSunkShips(sunkShips)
        updateBulletsField(bullets);
        populatePrizesBlock(prizesList, "troffeys");
    }
    function updateShotCell(playerShots) {
        playerShots.split(" ").forEach(coordinate => {
            if (coordinate !== "") {
                const cell = document.getElementById(coordinate);
                cell.classList.add("shoot");
            }
        });
    }

    function updateSunkShips(sunkShips) {
       sunkShips.split(" ").forEach(shipCoordinate => {
            if (shipCoordinate !== "") {
                const cell = document.getElementById(shipCoordinate);
                    cell.innerHTML = "X";
            }
        });
    }

    function updateBulletsField(bullets) {
        const bulletsField = document.getElementById("bullets-field");

        if (bulletsField) {
            bulletsField.innerText = `${bullets}`;
        }
    }

    function populatePrizesBlock(prizesData, blockId) {
      // Получаем блок с идентификатором
      const prizesBlock = document.getElementById(blockId);
      while (prizesBlock.firstChild) {
        prizesBlock.removeChild(prizesBlock.firstChild);
    }
      // Проверяем, существует ли блок
      if (!prizesBlock) {
        console.error(`Блок с идентификатором "${blockId}" не найден.`);
        return;
      }
      prizesData = JSON.parse(prizesData)
      // Проходим по всем ключам словаря
      for (const key in prizesData) {
        // Создаем элемент <p>
        const pElement = document.createElement("p");

        // Вставляем внутрь <p> текст с ключом и значением
        pElement.textContent = `Приз! ${prizesData[key]}`;

        // Добавляем созданный элемент <p> в блок
        prizesBlock.appendChild(pElement);
      }
    }


    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    const csrfToken = getCookie('csrftoken');

    createBoard(fieldSize);
    updateBoardState(playerShots, bullets, sunkShips, prizesList);
});
