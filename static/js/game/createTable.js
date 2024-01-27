document.addEventListener("DOMContentLoaded", function() {
    const board = document.getElementById("fields");
    const resizeButton = document.getElementById("resize-board");
    const boardSizeInput = document.getElementById("board-size");
    const sendDataButton = document.getElementById("send-data");

    let player_ships = "";



    function addClickHandler(board) {
        board.addEventListener("click", clickHandler);
    }

    function clickHandler(event) {
        if (event.target.classList.contains("cell")) {

            if (!event.target.classList.contains("filled")) {
                event.target.classList.add("filled");
                event.target.innerText = "X";
                player_ships = player_ships + event.target.id + " ";
                console.log(player_ships);
            } else {
                event.target.classList.remove("filled");
                event.target.innerText = "";
                const str_for_del = event.target.id + " ";
                player_ships = player_ships.replace(str_for_del, "");
                console.log(player_ships);
            }
            const dynamicForm = document.getElementById("dynamic-form");
            if (dynamicForm) {
                dynamicForm.remove();
            }
            createDynamicForm();
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

    resizeButton.addEventListener("click", function() {
        const newSize = parseInt(boardSizeInput.value);
        if (!isNaN(newSize) && newSize >= 1 && newSize <= 10) {
            createBoard(newSize);
        } else {
            alert("Пожалуйста, введите число от 1 до 10 для размера поля.");
        }
    });

    sendDataButton.addEventListener("click", function() {
        const player = document.getElementById("player").value;
        const boardSize = parseInt(boardSizeInput.value);

        // Проверка наличия хотя бы одного корабля
        if (player_ships.trim() === "") {
            alert("Выберите хотя бы один корабль перед отправкой.");
            return; // Завершаем выполнение функции, чтобы данные не отправлялись
        }

        // Проверка выбора игрока
        if (player.trim() === "") {
            alert("Выберите игрока перед отправкой.");
            return; // Завершаем выполнение функции, чтобы данные не отправлялись
        }

        const postData = {
            player: player,
            field_size: boardSize,
            ships: player_ships,
            prizes: collectFormData()
        };

        fetch("/api/games/create/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken
            },
            body: JSON.stringify(postData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                // Если сервер возвращает ошибку, выводим сообщение
                alert(data.error);
            } else {
                // Если все прошло успешно, выводим сообщение об успехе
                alert("Игра успешно создана!");
                console.log(data);  // Выводим данные от сервера в консоль для отладки
            }
        })
        .catch(error => {
            console.error("Ошибка при отправке данных на сервер: " + error);
        });
    });

    function createDynamicForm() {
        const filledCells = document.querySelectorAll(".filled");

        // Создаем форму
        const dynamicForm = document.createElement("form");
        dynamicForm.id = "dynamic-form";
        document.body.appendChild(dynamicForm);

        // Создаем и добавляем поля формы для каждой клетки
        filledCells.forEach(cell => {
            const label = document.createElement("label");
            label.innerText = `${cell.id}`;

            dynamicForm.appendChild(label);

            const input = document.createElement("input");
            input.type = "text";
            label.appendChild(input);
        });
    }

    function collectFormData() {
        const formData = {};
        const form = document.getElementById("dynamic-form");

        // Получаем все элементы формы
        const formElements = form.elements;

        // Проходимся по всем элементам формы
        for (let i = 0; i < formElements.length; i++) {
            const element = formElements[i];

            if (element.tagName === "INPUT") {
                    const key = element.parentElement.innerText;
                    const value = element.value;
                    formData[key] = value;
                    data = JSON.stringify(formData);
            }
        }
        console.log(data)
        return data;
    }


    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    const csrfToken = getCookie('csrftoken');
    createBoard(parseInt(boardSizeInput.value));
});
