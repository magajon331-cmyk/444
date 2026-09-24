const STORAGE_KEY = "homeLuxHouses";
const FAVORITES_KEY = "homeLuxFavorites";
const NOTIFY_KEY = "homeLuxNotifications";

/* =========================================================
   STORAGE
========================================================= */

function getHouses() {
    try {
        const data = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );

        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

function saveHouses(houses) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(houses)
    );
}

function getFavorites() {
    try {
        const data = JSON.parse(
            localStorage.getItem(FAVORITES_KEY) || "[]"
        );

        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

function saveFavorites(items) {
    localStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(items)
    );
}

/* =========================================================
   HELPERS
========================================================= */

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatPrice(value) {
    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return "Цена не указана";
    }

    const n = Number(value);

    if (Number.isNaN(n)) {
        return escapeHTML(value);
    }

    return (
        new Intl.NumberFormat("ru-RU").format(n) +
        " сомони"
    );
}

/* =========================================================
   NAVIGATION
========================================================= */

function showPage(name, button = null) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    const page = document.getElementById(name);

    if (!page) return;

    page.classList.add("active");

    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    if (button) {
        button.classList.add("active");
    }

    const titles = {
        dashboard: "Панель управления",
        houses: "Все дома",
        add: "Добавить дом",
        users: "Пользователи",
        sales: "Продажи",
        exchange: "Ивази хона"
    };

    const title = document.getElementById("pageTitle");

    if (title) {
        title.textContent =
            titles[name] || "HomeLux";
    }

    if (
        name === "dashboard" ||
        name === "users" ||
        name === "sales"
    ) {
        updateDashboard();
    }

    if (name === "houses") {
        renderHouses();
    }

    if (
        name === "add" &&
        !document.getElementById("editHouseId")?.value
    ) {
        resetHouseForm();
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {
    const houses = getHouses();

    let users = [];
    let sales = [];

    try {
        users = JSON.parse(
            localStorage.getItem("homeLuxUsers") || "[]"
        );
    } catch {
        users = [];
    }

    try {
        sales = JSON.parse(
            localStorage.getItem("homeLuxSales") || "[]"
        );
    } catch {
        sales = [];
    }

    const housesCount =
        document.getElementById("housesCount");

    const usersCount =
        document.getElementById("usersCount");

    const usersPageCount =
        document.getElementById("usersPageCount");

    const salesCount =
        document.getElementById("salesCount");

    const salesPageCount =
        document.getElementById("salesPageCount");

    const favoritesCount =
        document.getElementById("favoritesCount");

    if (housesCount) {
        housesCount.textContent = houses.length;
    }

    if (usersCount) {
        usersCount.textContent =
            Array.isArray(users)
                ? users.length
                : 0;
    }

    if (usersPageCount) {
        usersPageCount.textContent =
            Array.isArray(users)
                ? users.length
                : 0;
    }

    if (salesCount) {
        salesCount.textContent =
            Array.isArray(sales)
                ? sales.length
                : 0;
    }

    if (salesPageCount) {
        salesPageCount.textContent =
            Array.isArray(sales)
                ? sales.length
                : 0;
    }

    if (favoritesCount) {
        favoritesCount.textContent =
            getFavorites().length;
    }

    updateNotificationBadge();
}

/* =========================================================
   HOUSE STATUS
========================================================= */

function getHouseStatus(house) {
    const value = String(
        house?.status || "sale"
    ).toLowerCase();

    if (value === "reserved") {
        return {
            key: "reserved",
            icon: "🟡",
            text: "Резерв"
        };
    }

    if (value === "sold") {
        return {
            key: "sold",
            icon: "🔴",
            text: "Продано"
        };
    }

    return {
        key: "sale",
        icon: "🟢",
        text: "В продаже"
    };
}

function changeHouseStatus(id, status) {
    const houses = getHouses();

    const house = houses.find(
        item =>
            String(item.id) ===
            String(id)
    );

    if (!house) return;

    if (
        ![
            "sale",
            "reserved",
            "sold"
        ].includes(status)
    ) {
        status = "sale";
    }

    house.status = status;

    saveHouses(houses);

    const meta =
        getHouseStatus(house);

    addNotification(
        meta.icon,
        `Статус "${house.name}": ${meta.text}`
    );

    showToast(
        meta.icon,
        "Статус изменён",
        meta.text
    );

    renderHouses();
    updateDashboard();
}

/* =========================================================
   RENDER HOUSES
========================================================= */

function renderHouses() {
    const list =
        document.getElementById(
            "housesList"
        );

    if (!list) return;

    const query = (
        document.getElementById(
            "houseSearch"
        )?.value || ""
    )
        .toLowerCase()
        .trim();

    const sort =
        document.getElementById(
            "houseSort"
        )?.value || "new";

    let houses = getHouses().filter(
        house => {
            const text = [
                house.name,
                house.city,
                house.location,
                house.description
            ]
                .join(" ")
                .toLowerCase();

            return text.includes(query);
        }
    );

    houses.sort((a, b) => {
        if (sort === "priceHigh") {
            return (
                Number(b.price || 0) -
                Number(a.price || 0)
            );
        }

        if (sort === "priceLow") {
            return (
                Number(a.price || 0) -
                Number(b.price || 0)
            );
        }

        if (sort === "areaHigh") {
            return (
                Number(b.area || 0) -
                Number(a.area || 0)
            );
        }

        if (sort === "areaLow") {
            return (
                Number(a.area || 0) -
                Number(b.area || 0)
            );
        }

        if (sort === "old") {
            return (
                Number(a.id || 0) -
                Number(b.id || 0)
            );
        }

        return (
            Number(b.id || 0) -
            Number(a.id || 0)
        );
    });

    if (!houses.length) {
        list.innerHTML = `
            <div
                class="empty-page"
                style="grid-column:1/-1"
            >
                <div class="empty-icon">
                    🔍
                </div>

                <h2>
                    Дома не найдены
                </h2>

                <p>
                    Попробуйте изменить поиск.
                </p>
            </div>
        `;

        return;
    }

    list.innerHTML =
        houses.map(house => {
            const status =
                getHouseStatus(house);

            let imageHTML;

            if (
                house.image &&
                String(house.image).match(
                    /^(data:image|blob:|https?:)/
                )
            ) {
                imageHTML = `
                    <img
                        src="${house.image}"
                        alt="${escapeHTML(
                            house.name || "Дом"
                        )}"
                    >
                `;
            } else {
                imageHTML = `
                    <div class="no-image">
                        🏠
                    </div>
                `;
            }

            return `
                <article class="house-item">

                    <div class="house-image">

                        ${imageHTML}

                        <button
                            class="favorite-house"
                            onclick="toggleFavorite(${Number(
                                house.id
                            )})"
                            type="button"
                        >
                            ${
                                isFavorite(house.id)
                                    ? "❤️"
                                    : "🤍"
                            }
                        </button>

                        <span
                            class="house-status ${status.key}"
                        >
                            ${status.icon}
                            ${status.text}
                        </span>

                    </div>

                    <div class="house-info">

                        <h3>
                            ${escapeHTML(
                                house.name ||
                                "Без названия"
                            )}
                        </h3>

                        <div class="house-city">
                            📍
                            ${escapeHTML(
                                house.city ||
                                "Не указан"
                            )}
                        </div>

                        <div class="house-details">

                            <span>
                                📐
                                ${house.area || 0}
                                м²
                            </span>

                            <span>
                                🏢
                                ${house.floors || 0}
                                этаж
                            </span>

                        </div>

                        <div class="house-price">
                            💰
                            ${formatPrice(
                                house.price
                            )}
                        </div>

                        <div class="status-buttons">

                            <button
                                type="button"
                                class="${
                                    status.key === "sale"
                                        ? "active"
                                        : ""
                                }"
                                onclick="changeHouseStatus(
                                    ${Number(house.id)},
                                    'sale'
                                )"
                            >
                                🟢 В продаже
                            </button>

                            <button
                                type="button"
                                class="${
                                    status.key === "reserved"
                                        ? "active"
                                        : ""
                                }"
                                onclick="changeHouseStatus(
                                    ${Number(house.id)},
                                    'reserved'
                                )"
                            >
                                🟡 Резерв
                            </button>

                            <button
                                type="button"
                                class="${
                                    status.key === "sold"
                                        ? "active"
                                        : ""
                                }"
                                onclick="changeHouseStatus(
                                    ${Number(house.id)},
                                    'sold'
                                )"
                            >
                                🔴 Продано
                            </button>

                        </div>

                        <div class="house-actions">

                            <button
                                class="edit-btn"
                                type="button"
                                onclick="editHouse(
                                    ${Number(house.id)}
                                )"
                            >
                                ✏️ Изменить
                            </button>

                            <button
                                class="delete-btn"
                                type="button"
                                onclick="deleteHouse(
                                    ${Number(house.id)}
                                )"
                            >
                                🗑️ Удалить
                            </button>

                        </div>

                    </div>

                </article>
            `;
        }).join("");
}

/* =========================================================
   FAVORITES
========================================================= */

function isFavorite(id) {
    return getFavorites()
        .map(String)
        .includes(String(id));
}

function toggleFavorite(id) {
    const favorites =
        getFavorites();

    const index =
        favorites
            .map(String)
            .indexOf(String(id));

    if (index >= 0) {
        favorites.splice(index, 1);

        addNotification(
            "❤️",
            "Дом удалён из избранного"
        );
    } else {
        favorites.push(id);

        addNotification(
            "❤️",
            "Дом добавлен в избранное"
        );
    }

    saveFavorites(favorites);

    renderHouses();
    updateDashboard();
}

/* =========================================================
   FORM
========================================================= */

function resetHouseForm() {
    document
        .getElementById("houseForm")
        ?.reset();

    const editId =
        document.getElementById(
            "editHouseId"
        );

    const formTitle =
        document.getElementById(
            "formTitle"
        );

    const status =
        document.getElementById(
            "houseStatus"
        );

    const preview =
        document.getElementById(
            "houseImagePreview"
        );

    if (editId) {
        editId.value = "";
    }

    if (formTitle) {
        formTitle.textContent =
            "➕ Добавить дом";
    }

    if (status) {
        status.value = "sale";
    }

    if (preview) {
        preview.innerHTML = "🏠";
    }
}

function cancelEdit() {
    resetHouseForm();

    showPage("dashboard");
}

function readFile(file) {
    return new Promise(
        (resolve, reject) => {
            const reader =
                new FileReader();

            reader.onload =
                () => resolve(
                    reader.result
                );

            reader.onerror =
                reject;

            reader.readAsDataURL(file);
        }
    );
}

/* =========================================================
   SAVE HOUSE
========================================================= */

async function saveHouse(event) {
    event.preventDefault();

    const editId =
        document.getElementById(
            "editHouseId"
        );

    const nameInput =
        document.getElementById(
            "houseName"
        );

    const cityInput =
        document.getElementById(
            "houseCity"
        );

    const priceInput =
        document.getElementById(
            "housePrice"
        );

    const areaInput =
        document.getElementById(
            "houseArea"
        );

    const floorsInput =
        document.getElementById(
            "houseFloors"
        );

    const locationInput =
        document.getElementById(
            "houseLocation"
        );

    const descriptionInput =
        document.getElementById(
            "houseDescription"
        );

    const statusInput =
        document.getElementById(
            "houseStatus"
        );

    const imageInput =
        document.getElementById(
            "houseImage"
        );

    const id =
        editId?.value || "";

    const name =
        nameInput?.value.trim() || "";

    const city =
        cityInput?.value.trim() || "";

    const price =
        priceInput?.value || "";

    const area =
        areaInput?.value || "";

    const floors =
        floorsInput?.value || "";

    const location =
        locationInput?.value.trim() || "";

    const description =
        descriptionInput?.value.trim() || "";

    const status =
        statusInput?.value || "sale";

    const file =
        imageInput?.files?.[0];

    if (
        !name ||
        !city ||
        price === "" ||
        Number(area) <= 0 ||
        Number(floors) <= 0
    ) {
        showToast(
            "⚠️",
            "Ошибка",
            "Проверьте заполнение полей."
        );

        return;
    }

    const houses =
        getHouses();

    const oldHouse =
        houses.find(
            house =>
                String(house.id) ===
                String(id)
        );

    let image =
        oldHouse?.image || "";

    if (file) {
        image =
            await readFile(file);
    }

    const house = {
        id:
            id
                ? Number(id)
                : Date.now(),

        name,

        city,

        price:
            Number(price),

        area:
            Number(area),

        floors:
            Number(floors),

        location,

        description,

        status,

        image
    };

    if (id) {
        const index =
            houses.findIndex(
                item =>
                    String(item.id) ===
                    String(id)
            );

        if (index >= 0) {
            houses[index] =
                house;
        }
    } else {
        houses.push(house);
    }

    saveHouses(houses);

    const meta =
        getHouseStatus(house);

    addNotification(
        "🏠",
        id
            ? `Дом изменён · ${meta.text}`
            : `Новый дом добавлен · ${meta.text}`
    );

    showToast(
        "✅",
        "Готово",
        id
            ? `Дом изменён · ${meta.icon} ${meta.text}`
            : `Дом добавлен · ${meta.icon} ${meta.text}`
    );

    resetHouseForm();

    updateDashboard();

    showPage("houses");
}

/* =========================================================
   EDIT
========================================================= */

function editHouse(id) {
    const house =
        getHouses().find(
            item =>
                String(item.id) ===
                String(id)
        );

    if (!house) return;

    const editId =
        document.getElementById(
            "editHouseId"
        );

    const name =
        document.getElementById(
            "houseName"
        );

    const city =
        document.getElementById(
            "houseCity"
        );

    const price =
        document.getElementById(
            "housePrice"
        );

    const area =
        document.getElementById(
            "houseArea"
        );

    const floors =
        document.getElementById(
            "houseFloors"
        );

    const location =
        document.getElementById(
            "houseLocation"
        );

    const description =
        document.getElementById(
            "houseDescription"
        );

    const status =
        document.getElementById(
            "houseStatus"
        );

    const title =
        document.getElementById(
            "formTitle"
        );

    const preview =
        document.getElementById(
            "houseImagePreview"
        );

    if (editId) {
        editId.value =
            house.id;
    }

    if (name) {
        name.value =
            house.name || "";
    }

    if (city) {
        city.value =
            house.city || "";
    }

    if (price) {
        price.value =
            house.price ?? "";
    }

    if (area) {
        area.value =
            house.area ?? "";
    }

    if (floors) {
        floors.value =
            house.floors ?? "";
    }

    if (location) {
        location.value =
            house.location || "";
    }

    if (description) {
        description.value =
            house.description || "";
    }

    if (status) {
        status.value =
            house.status || "sale";
    }

    if (title) {
        title.textContent =
            "✏️ Изменить дом";
    }

    if (preview) {
        preview.innerHTML =
            house.image
                ? `
                    <img
                        src="${house.image}"
                        alt="${escapeHTML(
                            house.name
                        )}"
                    >
                `
                : "🏠";
    }

    showPage("add");
}

/* =========================================================
   DELETE
========================================================= */

function deleteHouse(id) {
    const house =
        getHouses().find(
            item =>
                String(item.id) ===
                String(id)
        );

    if (!house) return;

    if (
        !confirm(
            `Удалить дом "${house.name}"?`
        )
    ) {
        return;
    }

    saveHouses(
        getHouses().filter(
            item =>
                String(item.id) !==
                String(id)
        )
    );

    saveFavorites(
        getFavorites().filter(
            item =>
                String(item) !==
                String(id)
        )
    );

    addNotification(
        "🗑️",
        `Дом "${house.name}" удалён`
    );

    showToast(
        "🗑️",
        "Удалено",
        "Дом успешно удалён."
    );

    renderHouses();
    updateDashboard();
}

/* =========================================================
   IMAGE PREVIEW
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        const input =
            document.getElementById(
                "houseImage"
            );

        input?.addEventListener(
            "change",
            async () => {
                const file =
                    input.files?.[0];

                if (!file) return;

                const image =
                    await readFile(file);

                const preview =
                    document.getElementById(
                        "houseImagePreview"
                    );

                if (preview) {
                    preview.innerHTML = `
                        <img
                            src="${image}"
                            alt="Preview"
                        >
                    `;
                }
            }
        );

        document
            .getElementById("houseForm")
            ?.addEventListener(
                "submit",
                saveHouse
            );

        loadSettings();

        normalizeHouseStatuses();

        updateClock();

        setInterval(
            updateClock,
            1000
        );

        updateDashboard();

        renderHouses();
    }
);

/* =========================================================
   CLOCK
========================================================= */

function updateClock() {
    const now =
        new Date();

    const clock =
        document.getElementById(
            "liveClock"
        );

    const date =
        document.getElementById(
            "liveDate"
        );

    if (clock) {
        clock.textContent =
            now.toLocaleTimeString(
                "ru-RU"
            );
    }

    if (date) {
        date.textContent =
            now.toLocaleDateString(
                "ru-RU",
                {
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                }
            );
    }
}

/* =========================================================
   REFRESH / LOGOUT
========================================================= */

function refreshAdmin() {
    normalizeHouseStatuses();

    updateDashboard();

    renderHouses();

    showToast(
        "🔄",
        "Обновлено",
        "Панель обновлена."
    );
}

function logoutAdmin() {
    if (
        confirm(
            "Вы действительно хотите выйти?"
        )
    ) {
        location.href =
            "index.html";
    }
}

/* =========================================================
   TOAST
========================================================= */

let toastTimer;

function showToast(
    icon,
    title,
    message
) {
    const toast =
        document.getElementById(
            "toast"
        );

    if (!toast) return;

    const toastIcon =
        document.getElementById(
            "toastIcon"
        );

    const toastTitle =
        document.getElementById(
            "toastTitle"
        );

    const toastMessage =
        document.getElementById(
            "toastMessage"
        );

    if (toastIcon) {
        toastIcon.textContent =
            icon;
    }

    if (toastTitle) {
        toastTitle.textContent =
            title;
    }

    if (toastMessage) {
        toastMessage.textContent =
            message;
    }

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer =
        setTimeout(
            () => {
                toast.classList.remove(
                    "show"
                );
            },
            3000
        );
}

/* =========================================================
   DARK MODE
========================================================= */

function toggleDark() {
    applyDark(
        !document.body.classList.contains(
            "dark"
        )
    );
}

function applyDark(enabled) {
    document.body.classList.toggle(
        "dark",
        enabled
    );

    localStorage.setItem(
        "homeluxDark",
        enabled ? "1" : "0"
    );

    const sw =
        document.getElementById(
            "darkSwitch"
        );

    if (sw) {
        sw.checked =
            enabled;
    }
}

function applyDarkFromSettings(
    enabled
) {
    applyDark(enabled);
}

/* =========================================================
   SETTINGS
========================================================= */

function openSettings() {
    const modal =
        document.getElementById(
            "settingsModal"
        );

    if (!modal) return;

    modal.classList.add("show");

    const currentAccent =
        localStorage.getItem(
            "homeluxAccent"
        ) || "#2865eb";

    document
        .querySelectorAll(
            ".color-choice"
        )
        .forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.color ===
                currentAccent
            );
        });

    const darkSwitch =
        document.getElementById(
            "darkSwitch"
        );

    if (darkSwitch) {
        darkSwitch.checked =
            document.body.classList.contains(
                "dark"
            );
    }

    const notifySwitch =
        document.getElementById(
            "notifySwitch"
        );

    if (notifySwitch) {
        notifySwitch.checked =
            localStorage.getItem(
                "homeluxNotify"
            ) !== "0";
    }
}

function closeSettings() {
    document
        .getElementById(
            "settingsModal"
        )
        ?.classList.remove(
            "show"
        );
}

function closeSettingsOutside(event) {
    if (
        event.target.id ===
        "settingsModal"
    ) {
        closeSettings();
    }
}

/* =========================================================
   ACCENT COLORS
========================================================= */

function setAccent(color) {
    document.documentElement.style
        .setProperty(
            "--accent",
            color
        );

    localStorage.setItem(
        "homeluxAccent",
        color
    );

    document
        .querySelectorAll(
            ".color-choice"
        )
        .forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.color ===
                color
            );
        });

    showToast(
        "🎨",
        "Цвет изменён",
        "Новый цвет интерфейса установлен."
    );
}

/* =========================================================
   NOTIFICATIONS
========================================================= */

function getNotifications() {
    try {
        const data =
            JSON.parse(
                localStorage.getItem(
                    NOTIFY_KEY
                ) || "[]"
            );

        return Array.isArray(data)
            ? data
            : [];
    } catch {
        return [];
    }
}

function addNotification(
    icon,
    text
) {
    if (
        localStorage.getItem(
            "homeluxNotify"
        ) === "0"
    ) {
        return;
    }

    const list =
        getNotifications();

    list.unshift({
        icon,

        text,

        time:
            new Date()
                .toLocaleTimeString(
                    "ru-RU",
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                )
    });

    localStorage.setItem(
        NOTIFY_KEY,
        JSON.stringify(
            list.slice(0, 20)
        )
    );

    updateNotificationBadge();
}

function updateNotificationBadge() {
    const badge =
        document.getElementById(
            "notificationBadge"
        );

    if (!badge) return;

    const count =
        getNotifications().length;

    badge.textContent =
        count;

    badge.style.display =
        count
            ? "grid"
            : "none";
}

function showNotifications() {
    const panel =
        document.getElementById(
            "notificationPanel"
        );

    const list =
        document.getElementById(
            "notificationList"
        );

    if (!panel || !list) {
        return;
    }

    const items =
        getNotifications();

    if (!items.length) {
        list.innerHTML = `
            <div class="notification-empty">
                ✨ Пока уведомлений нет
            </div>
        `;
    } else {
        list.innerHTML =
            items
                .map(
                    item => `
                        <div
                            class="notification-item"
                        >

                            <span
                                class="notification-icon"
                            >
                                ${escapeHTML(
                                    item.icon
                                )}
                            </span>

                            <div>

                                <strong>
                                    ${escapeHTML(
                                        item.text
                                    )}
                                </strong>

                                <small>
                                    ${escapeHTML(
                                        item.time
                                    )}
                                </small>

                            </div>

                        </div>
                    `
                )
                .join("");
    }

    panel.classList.toggle("show");
}

function clearNotifications() {
    localStorage.removeItem(
        NOTIFY_KEY
    );

    updateNotificationBadge();

    showNotifications();
}

/* =========================================================
   BACKUP
========================================================= */

function exportHouses() {
    const data = {
        version: 2,

        date:
            new Date().toISOString(),

        houses:
            getHouses(),

        favorites:
            getFavorites()
    };

    const blob =
        new Blob(
            [
                JSON.stringify(
                    data,
                    null,
                    2
                )
            ],
            {
                type:
                    "application/json"
            }
        );

    const url =
        URL.createObjectURL(
            blob
        );

    const a =
        document.createElement(
            "a"
        );

    a.href = url;

    a.download =
        "homelux-backup.json";

    document.body.appendChild(a);

    a.click();

    a.remove();

    setTimeout(
        () => {
            URL.revokeObjectURL(
                url
            );
        },
        100
    );

    showToast(
        "📥",
        "Backup",
        "Резервная копия сохранена."
    );
}

/* =========================================================
   RESTORE
========================================================= */

function restoreHouses(input) {
    const file =
        input?.files?.[0];

    if (!file) return;

    const reader =
        new FileReader();

    reader.onload = () => {
        try {
            const parsed =
                JSON.parse(
                    reader.result
                );

            const houses =
                Array.isArray(parsed)
                    ? parsed
                    : parsed.houses;

            if (
                !Array.isArray(
                    houses
                )
            ) {
                throw new Error();
            }

            houses.forEach(
                house => {
                    if (
                        ![
                            "sale",
                            "reserved",
                            "sold"
                        ].includes(
                            house.status
                        )
                    ) {
                        house.status =
                            "sale";
                    }
                }
            );

            saveHouses(houses);

            if (
                Array.isArray(
                    parsed.favorites
                )
            ) {
                saveFavorites(
                    parsed.favorites
                );
            }

            renderHouses();

            updateDashboard();

            showToast(
                "📤",
                "Готово",
                "Данные восстановлены."
            );
        } catch {
            showToast(
                "⚠️",
                "Ошибка",
                "Неверный файл Backup."
            );
        }

        input.value = "";
    };

    reader.readAsText(file);
}

/* =========================================================
   NORMALIZE OLD HOUSES
========================================================= */

function normalizeHouseStatuses() {
    const houses =
        getHouses();

    let changed =
        false;

    houses.forEach(
        house => {
            if (
                ![
                    "sale",
                    "reserved",
                    "sold"
                ].includes(
                    house.status
                )
            ) {
                house.status =
                    "sale";

                changed =
                    true;
            }
        }
    );

    if (changed) {
        saveHouses(houses);
    }
}

/* =========================================================
   LOAD SETTINGS
========================================================= */

function loadSettings() {
    const accent =
        localStorage.getItem(
            "homeluxAccent"
        );

    if (accent) {
        document.documentElement.style
            .setProperty(
                "--accent",
                accent
            );
    }

    if (
        localStorage.getItem(
            "homeluxDark"
        ) === "1"
    ) {
        document.body.classList.add(
            "dark"
        );
    }

    const notify =
        document.getElementById(
            "notifySwitch"
        );

    if (notify) {
        notify.checked =
            localStorage.getItem(
                "homeluxNotify"
            ) !== "0";
    }
}

/* =========================================================
   EXTRA: SEARCH + SORT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        const search =
            document.getElementById(
                "houseSearch"
            );

        const sort =
            document.getElementById(
                "houseSort"
            );

        search?.addEventListener(
            "input",
            renderHouses
        );

        sort?.addEventListener(
            "change",
            renderHouses
        );
    }
);

/* =========================================================
   EXTRA: KEYBOARD SHORTCUTS
========================================================= */

document.addEventListener(
    "keydown",
    event => {
        if (
            event.key === "/" &&
            document.activeElement?.tagName !==
                "INPUT" &&
            document.activeElement?.tagName !==
                "TEXTAREA"
        ) {
            event.preventDefault();

            const search =
                document.getElementById(
                    "houseSearch"
                );

            search?.focus();
        }

        if (
            event.key === "Escape"
        ) {
            closeSettings();
        }
    }
);