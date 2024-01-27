document.addEventListener("DOMContentLoaded", function() {
    const board = document.getElementById("fields");
    const fieldSize = document.getElementById("game-info").dataset.fieldSize;
    const csrfToken = getCookie('csrftoken');

    function clickHandler(event) {
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
    }

    function handleShootResponse(responseData) {
        const { player_shots, bullets, sunk_ships } = responseData;
        updateBoardState(player_shots, bullets, sunk_ships);
    }


    function createBoard(size) {
        board.innerHTML = "";
        const gridColumns = `repeat(${size}, 1fr)`;
        for (let i = 1; i <= size; i++) {
            const row = document.createElement("div");
            row.className = "row";

            for (let j = 1; j <= size; j++) {
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

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }



    function updateBoardState(playerShots, bullets, sunkShips) {
        playerShots.split(" ").forEach(coordinate => {
            const cell = document.getElementById(coordinate);
            if (/* Логика проверки попадания */) {
                cell.classList.add("hit");
            } else {
                cell.classList.add("miss");
            }
        });

        sunkShips.split(" ").forEach(shipCoordinate => {
            const cell = document.getElementById(shipCoordinate);
            cell.innerHTML = "X";
        });

        // Дополнительная логика для обновления информации о пулях (bullets)
        // ...

        // Дополнительная логика для обновления других элементов интерфейса
        // ...
    }

    createBoard(fieldSize);
});
