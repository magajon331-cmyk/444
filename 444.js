/* =========================================================
   HOMELUX MAIN JAVASCRIPT
========================================================= */

const STORAGE_KEY = "homeLuxHouses";
const FAVORITES_KEY = "homeLuxFavorites";
const USER_KEY = "homeLuxUser";
const RATING_KEY = "homeLuxRatings";
const THEME_KEY = "homeLuxTheme";


/* =========================================================
   DEFAULT HOUSES
========================================================= */

const DEFAULT_HOUSES = [

    {
        id: 1,
        name: "Современный дом",
        city: "Душанбе",
        price: "$250 000",
        priceNum: 250000,
        area: 250,
        floors: 2,
        rooms: 4,
        location: "Душанбе, Тоҷикистон",
        description: "Просторный современный дом для семьи.",
        image: ""
    },

    {
        id: 2,
        name: "Семейный дом",
        city: "Душанбе",
        price: "$180 000",
        priceNum: 180000,
        area: 180,
        floors: 2,
        rooms: 4,
        location: "Душанбе, Тоҷикистон",
        description: "Уютный дом в хорошем районе.",
        image: ""
    },

    {
        id: 3,
        name: "Большой коттедж",
        city: "Хуҷанд",
        price: "$320 000",
        priceNum: 320000,
        area: 320,
        floors: 2,
        rooms: 5,
        location: "Хуҷанд, Тоҷикистон",
        description: "Большой и красивый коттедж.",
        image: ""
    },

    {
        id: 4,
        name: "Villa Premium",
        city: "Варзоб",
        price: "$145 000",
        priceNum: 145000,
        area: 210,
        floors: 2,
        rooms: 4,
        location: "Варзоб, Тоҷикистон",
        description: "Красивая вилла рядом с природой.",
        image: ""
    }

];


const FALLBACK_IMAGES = [

    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=85",

    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=85",

    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=900&q=85",

    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=85"

];


/* =========================================================
   HELPERS
========================================================= */

function $(selector){

    return document.querySelector(selector);

}


function $$(selector){

    return [...document.querySelectorAll(selector)];

}


function readJSON(key, fallback){

    try{

        const value = JSON.parse(
            localStorage.getItem(key)
        );

        return value ?? fallback;

    }catch{

        return fallback;

    }

}


function escapeHTML(value){

    return String(value ?? "")
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");

}


/* =========================================================
   HOUSES
========================================================= */

function getHouses(){

    let houses =
        readJSON(STORAGE_KEY, null);


    if(
        !Array.isArray(houses) ||
        houses.length === 0
    ){

        houses =
            structuredClone(DEFAULT_HOUSES);

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(houses)
        );

    }


    return houses;

}


/* =========================================================
   IMAGE
========================================================= */

function getHouseImage(house,index){

    const image =
        String(house.image || "");


    if(
        image.startsWith("data:image/") ||
        image.startsWith("http")
    ){

        return image;

    }


    return FALLBACK_IMAGES[
        index % FALLBACK_IMAGES.length
    ];

}


/* =========================================================
   FAVORITES
========================================================= */

function getFavorites(){

    const favorites =
        readJSON(FAVORITES_KEY, []);


    return Array.isArray(favorites)
        ? favorites.map(String)
        : [];

}


function isFavorite(id){

    return getFavorites()
        .includes(String(id));

}


function toggleFavorite(id){

    const houseId = String(id);

    let favorites =
        getFavorites();


    if(favorites.includes(houseId)){

        favorites =
            favorites.filter(
                x => x !== houseId
            );

        showToast(
            "Хона аз дӯстдоштаҳо хориҷ шуд"
        );

    }else{

        favorites.push(houseId);

        showToast(
            "❤️ Ба дӯстдоштаҳо илова шуд"
        );

    }


    localStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(favorites)
    );


    renderAll();

}


/* =========================================================
   PRICE
========================================================= */

function getPrice(house){

    if(house.price){

        return house.price;

    }


    return "$" +
        Number(
            house.priceNum || 0
        ).toLocaleString("en-US");

}


/* =========================================================
   HOUSE CARD
========================================================= */

function createHouseCard(house,index){

    const id =
        String(house.id);


    const saved =
        isFavorite(id);


    const image =
        getHouseImage(
            house,
            index
        );


    return `

        <article
            class="house-card"
            data-house-id="${escapeHTML(id)}"
        >

            <div class="house-photo">

                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(house.name)}"
                >

                <span class="sale-badge">
                    Продажа
                </span>


                <button
                    class="heart-button ${saved ? "saved" : ""}"
                    data-favorite="${escapeHTML(id)}"
                >
                    ${saved ? "♥" : "♡"}
                </button>

            </div>


            <div class="house-info">

                <h3>
                    ${escapeHTML(
                        house.name ||
                        "Хонаи нав"
                    )}
                </h3>


                <p class="house-city">
                    📍
                    ${escapeHTML(
                        house.city ||
                        "Номаълум"
                    )}
                </p>


                <div class="house-meta">

                    <span>
                        📐
                        ${escapeHTML(
                            house.area || 0
                        )} м²
                    </span>

                    <span>
                        🏢
                        ${escapeHTML(
                            house.floors || 1
                        )} ошёна
                    </span>

                    <span>
                        🛏️
                        ${escapeHTML(
                            house.rooms || 3
                        )}
                    </span>

                </div>


                <div class="house-bottom">

                    <strong class="house-price">
                        ${escapeHTML(
                            getPrice(house)
                        )}
                    </strong>


                    <div class="card-actions">

                        <button
                            class="small-button view-button"
                            data-view-house="${escapeHTML(id)}"
                        >
                            👀 Дидан
                        </button>


                        <button
                            class="small-button"
                            data-map="${escapeHTML(
                                house.location ||
                                house.city ||
                                ""
                            )}"
                        >
                            📍
                        </button>

                    </div>

                </div>

            </div>

        </article>

    `;

}


/* =========================================================
   RENDER
========================================================= */

function renderHome(){

    const container =
        $("#homeHouses");


    if(!container) return;


    const houses =
        getHouses();


    container.innerHTML =
        houses
            .slice(0,3)
            .map(createHouseCard)
            .join("");

}


function renderHouses(){

    const container =
        $("#housesList");


    if(!container) return;


    const houses =
        getHouses();


    container.innerHTML =
        houses
            .map(createHouseCard)
            .join("");

}


function renderFavorites(){

    const container =
        $("#favoriteList");


    if(!container) return;


    const favorites =
        getFavorites();


    const houses =
        getHouses()
            .filter(
                house =>
                    favorites.includes(
                        String(house.id)
                    )
            );


    if(!houses.length){

        container.innerHTML = `

            <div class="profile-box">

                <div class="profile-avatar">
                    ♡
                </div>

                <h2>
                    Ҳоло ягон хона нест
                </h2>

                <p>
                    Дар карточкаи хонаҳо
                    дилро пахш кунед.
                </p>

                <button
                    class="primary-button"
                    data-page="houses"
                >
                    Дидани хонаҳо
                </button>

            </div>

        `;

    }else{

        container.innerHTML =
            houses
                .map(createHouseCard)
                .join("");

    }

}


function renderAll(){

    renderHome();

    renderHouses();

    renderFavorites();

    bindHouseButtons();

    updateHouseCount();

}


/* =========================================================
   HOUSE BUTTONS
========================================================= */

function bindHouseButtons(){

    $$("[data-favorite]").forEach(
        button => {

            button.onclick = function(event){

                event.stopPropagation();

                toggleFavorite(
                    this.dataset.favorite
                );

            };

        }
    );


    $$("[data-view-house]").forEach(
        button => {

            button.onclick = function(){

                openHouseModal(
                    this.dataset.viewHouse
                );

            };

        }
    );


    $$("[data-map]").forEach(
        button => {

            button.onclick = function(){

                const location =
                    encodeURIComponent(
                        this.dataset.map
                    );


                if(!location) return;


                window.open(
                    "https://www.google.com/maps/search/?api=1&query=" +
                    location,
                    "_blank"
                );

            };

        }
    );


    $$("[data-page]").forEach(
        button => {

            button.onclick = function(){

                showPage(
                    this.dataset.page
                );

            };

        }
    );

}


/* =========================================================
   PAGE NAVIGATION
========================================================= */

function showPage(page){

    const target =
        $("#" + page);


    if(!target) return;


    $$(".page").forEach(
        section =>
            section.classList.remove(
                "active"
            )
    );


    target.classList.add("active");


    $$(".nav-link").forEach(
        button => {

            button.classList.toggle(
                "active",
                button.dataset.page === page
            );

        }
    );


    $$(".bottom-button").forEach(
        button => {

            button.classList.toggle(
                "active",
                button.dataset.page === page
            );

        }
    );


    window.scrollTo({
        top:0,
        behavior:"smooth"
    });


    bindHouseButtons();

}


/* =========================================================
   SEARCH
========================================================= */

function performSearch(query){

    const resultContainer =
        $("#searchResults");


    if(!resultContainer) return;


    query =
        String(query || "")
            .trim()
            .toLowerCase();


    const houses =
        getHouses();


    const results =
        !query
            ? houses
            : houses.filter(
                house => {

                    const text = `

                        ${house.name || ""}

                        ${house.city || ""}

                        ${house.location || ""}

                        ${house.price || ""}

                        ${house.description || ""}

                    `.toLowerCase();


                    return text.includes(query);

                }
            );


    if(!results.length){

        resultContainer.innerHTML = `

            <div class="profile-box">

                <div class="profile-avatar">
                    🔎
                </div>

                <h2>
                    Натиҷа ёфт нашуд
                </h2>

                <p>
                    Номи хона ё шаҳрро дигар хел нависед.
                </p>

            </div>

        `;

        return;

    }


    resultContainer.innerHTML =
        results
            .map(createHouseCard)
            .join("");


    bindHouseButtons();

}


/* =========================================================
   HOUSE MODAL
========================================================= */

function openHouseModal(id){

    const house =
        getHouses()
            .find(
                item =>
                    String(item.id) ===
                    String(id)
            );


    if(!house) return;


    const modal =
        $("#houseModal");


    const content =
        $("#houseModalContent");


    const ratingData =
        readJSON(
            RATING_KEY,
            {}
        );


    const currentRating =
        Number(
            ratingData[house.id] || 0
        );


    const image =
        getHouseImage(
            house,
            0
        );


    content.innerHTML = `

        <div class="detail-grid">

            <div class="detail-image">

                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(house.name)}"
                >

            </div>


            <div class="detail-content">

                <small
                    style="
                        color:#b4862e;
                        letter-spacing:2px;
                        font-weight:800;
                    "
                >
                    HOMELUX HOUSE
                </small>


                <h2>
                    ${escapeHTML(
                        house.name
                    )}
                </h2>


                <p>
                    📍
                    ${escapeHTML(
                        house.location ||
                        house.city
                    )}
                </p>


                <div class="detail-price">
                    ${escapeHTML(
                        getPrice(house)
                    )}
                </div>


                <p>
                    📐
                    ${escapeHTML(
                        house.area || 0
                    )} м²
                </p>


                <p>
                    🏢
                    ${escapeHTML(
                        house.floors || 1
                    )} ошёна
                </p>


                <p>
                    🛏️
                    ${escapeHTML(
                        house.rooms || 3
                    )} ҳуҷра
                </p>


                <p>
                    ${escapeHTML(
                        house.description ||
                        "Маълумоти иловагӣ дар бораи ин хона."
                    )}
                </p>


                <button
                    class="primary-button detail-button"
                    id="modalFavoriteButton"
                >
                    ${
                        isFavorite(house.id)
                            ? "♥ Дар дӯстдошта"
                            : "♡ Ба дӯстдошта"
                    }
                </button>


                <div class="rating">

                    <b>
                        ⭐ Рейтинг
                    </b>


                    <div class="stars">

                        ${[1,2,3,4,5]
                            .map(
                                number => `

                                    <button
                                        class="star ${
                                            currentRating >= number
                                                ? "active"
                                                : ""
                                        }"
                                        data-rating="${number}"
                                    >
                                        ★
                                    </button>

                                `
                            )
                            .join("")}

                    </div>

                </div>


                <div class="qr-box">

                    <b>
                        🔐 House ID:
                        ${escapeHTML(house.id)}
                    </b>


                    <div
                        id="qrCode"
                        class="qr-code"
                    ></div>


                    <small>
                        📱 QR-ро скан кунед
                    </small>

                </div>

            </div>

        </div>

    `;


    modal.classList.remove("hidden");


    /* FAVORITE */

    $("#modalFavoriteButton").onclick =
        function(){

            toggleFavorite(
                house.id
            );

            openHouseModal(
                house.id
            );

        };


    /* RATING */

    $$("[data-rating]").forEach(
        star => {

            star.onclick =
                function(){

                    const ratings =
                        readJSON(
                            RATING_KEY,
                            {}
                        );


                    ratings[house.id] =
                        Number(
                            this.dataset.rating
                        );


                    localStorage.setItem(
                        RATING_KEY,
                        JSON.stringify(
                            ratings
                        )
                    );


                    openHouseModal(
                        house.id
                    );


                    showToast(
                        "⭐ Рейтинг сабт шуд"
                    );

                };

        }
    );


    /* QR */

    const qr =
        $("#qrCode");


    if(
        qr &&
        typeof QRCode !== "undefined"
    ){

        new QRCode(
            qr,
            {
                text:
                    location.href.split("?")[0] +
                    "?house=" +
                    encodeURIComponent(
                        house.id
                    ),

                width:170,

                height:170
            }
        );

    }

}


/* =========================================================
   CLOSE MODALS
========================================================= */

$$("[data-close-register]").forEach(
    button => {

        button.onclick =
            function(){

                $("#registerModal")
                    .classList
                    .add("hidden");

            };

    }
);


$$("[data-close-house]").forEach(
    button => {

        button.onclick =
            function(){

                $("#houseModal")
                    .classList
                    .add("hidden");

            };

    }
);


/* =========================================================
   REGISTRATION
========================================================= */

function openRegister(){

    $("#registerModal")
        .classList
        .remove("hidden");


    setTimeout(
        () => {

            $("#regName")
                ?.focus();

        },
        100
    );

}


$("#registerButton")
    ?.addEventListener(
        "click",
        openRegister
    );


$("#profileRegister")
    ?.addEventListener(
        "click",
        openRegister
    );


$("#registerForm")
    ?.addEventListener(
        "submit",
        function(event){

            event.preventDefault();


            const name =
                $("#regName")
                    .value
                    .trim();


            const email =
                $("#regEmail")
                    .value
                    .trim();


            const password =
                $("#regPassword")
                    .value;


            if(
                name.length < 2
            ){

                showToast(
                    "Номро дуруст ворид кунед"
                );

                return;

            }


            if(
                !email.includes("@")
            ){

                showToast(
                    "Email-ро дуруст ворид кунед"
                );

                return;

            }


            if(
                password.length < 4
            ){

                showToast(
                    "Парол бояд камаш 4 аломат бошад"
                );

                return;

            }


            const user = {

                name:name,

                email:email

            };


            localStorage.setItem(
                USER_KEY,
                JSON.stringify(user)
            );


            updateProfile();


            $("#registerModal")
                .classList
                .add("hidden");


            $("#registerForm")
                .reset();


            showToast(
                "✅ Регистрация анҷом шуд"
            );

        }
    );


/* =========================================================
   PROFILE
========================================================= */

function updateProfile(){

    const user =
        readJSON(
            USER_KEY,
            null
        );


    if(!user) return;


    const name =
        $("#profileName");


    const email =
        $("#profileEmail");


    if(name){

        name.textContent =
            "Салом, " +
            user.name +
            "! 👋";

    }


    if(email){

        email.textContent =
            user.email;

    }

}


updateProfile();


/* =========================================================
   TOP SEARCH
========================================================= */

$("#topSearchButton")
    ?.addEventListener(
        "click",
        function(){

            const query =
                $("#topSearch")
                    .value;


            showPage("search");


            $("#bigSearch").value =
                query;


            performSearch(
                query
            );

        }
    );


$("#topSearch")
    ?.addEventListener(
        "keydown",
        function(event){

            if(
                event.key === "Enter"
            ){

                $("#topSearchButton")
                    .click();

            }

        }
    );


/* =========================================================
   BIG SEARCH
========================================================= */

$("#bigSearchButton")
    ?.addEventListener(
        "click",
        function(){

            performSearch(
                $("#bigSearch")
                    .value
            );

        }
    );


$("#bigSearch")
    ?.addEventListener(
        "keydown",
        function(event){

            if(
                event.key === "Enter"
            ){

                performSearch(
                    this.value
                );

            }

        }
    );


/* =========================================================
   FILTERS
========================================================= */

$$(".filter").forEach(
    button => {

        button.onclick =
            function(){

                $$(".filter")
                    .forEach(
                        item =>
                            item.classList
                                .remove("active")
                    );


                this.classList
                    .add("active");


                const type =
                    this.dataset.filter;


                let houses =
                    getHouses();


                if(type === "cheap"){

                    houses =
                        houses.filter(
                            house =>
                                Number(
                                    house.priceNum || 0
                                ) <= 150000
                        );

                }


                if(type === "medium"){

                    houses =
                        houses.filter(
                            house => {

                                const price =
                                    Number(
                                        house.priceNum || 0
                                    );


                                return (
                                    price > 150000 &&
                                    price <= 250000
                                );

                            }
                        );

                }


                if(type === "premium"){

                    houses =
                        houses.filter(
                            house =>
                                Number(
                                    house.priceNum || 0
                                ) > 250000
                        );

                }


                const list =
                    $("#housesList");


                list.innerHTML =
                    houses
                        .map(
                            createHouseCard
                        )
                        .join("");


                bindHouseButtons();

            };

    }
);


/* =========================================================
   DARK MODE
========================================================= */

let darkMode =
    localStorage.getItem(
        THEME_KEY
    ) === "true";


function applyTheme(){

    document.body
        .classList
        .toggle(
            "dark",
            darkMode
        );


    const button =
        $("#themeButton");


    if(button){

        button.textContent =
            darkMode
                ? "Фаъол"
                : "Хомӯш";

    }

}


$("#themeButton")
    ?.addEventListener(
        "click",
        function(){

            darkMode =
                !darkMode;


            localStorage.setItem(
                THEME_KEY,
                darkMode
            );


            applyTheme();

        }
    );


applyTheme();


/* =========================================================
   NOTIFICATIONS
========================================================= */

let notifications =
    false;


$("#notificationButton")
    ?.addEventListener(
        "click",
        function(){

            notifications =
                !notifications;


            this.textContent =
                notifications
                    ? "Фаъол"
                    : "Хомӯш";


            showToast(
                notifications
                    ? "🔔 Огоҳиномаҳо фаъол шуданд"
                    : "🔕 Огоҳиномаҳо хомӯш шуданд"
            );

        }
    );


/* =========================================================
   LANGUAGE BUTTONS
========================================================= */

$$("[data-lang]").forEach(
    button => {

        button.onclick =
            function(){

                showToast(
                    "🌐 " +
                    this.textContent.trim()
                );

            };

    }
);


/* =========================================================
   HOUSE COUNT
========================================================= */

function updateHouseCount(){

    const count =
        $("#heroHouseCount");


    if(count){

        count.textContent =
            getHouses().length;

    }

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer;


function showToast(message){

    const toast =
        $("#toast");


    if(!toast) return;


    toast.textContent =
        message;


    toast.classList
        .add("show");


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList
                    .remove("show");

            },
            2300
        );

}


/* =========================================================
   STORAGE UPDATE
========================================================= */

window.addEventListener(
    "storage",
    function(event){

        if(
            event.key === STORAGE_KEY ||
            event.key === FAVORITES_KEY
        ){

            renderAll();

        }


        if(
            event.key === USER_KEY
        ){

            updateProfile();

        }

    }
);


/* =========================================================
   ESC CLOSE
========================================================= */

document.addEventListener(
    "keydown",
    function(event){

        if(
            event.key !== "Escape"
        ) return;


        $("#registerModal")
            ?.classList
            .add("hidden");


        $("#houseModal")
            ?.classList
            .add("hidden");

    }
);


/* =========================================================
   QR HOUSE OPEN
========================================================= */

function openHouseFromURL(){

    const params =
        new URLSearchParams(
            window.location.search
        );


    const houseId =
        params.get("house");


    if(!houseId) return;


    showPage("houses");


    setTimeout(
        () => {

            openHouseModal(
                houseId
            );

        },
        250
    );

}


/* =========================================================
   INITIALIZE
========================================================= */

function init(){

    getHouses();

    renderAll();

    updateProfile();

    applyTheme();

    bindHouseButtons();

    openHouseFromURL();

}


init();/* =========================================================
   HOMELUX MODERN FEATURES
   ========================================================= */

(function HomeLuxModernPack(){

    "use strict";


    /* =====================================================
       TOAST
       ===================================================== */

    function luxToast(message){

        let toast =
            document.getElementById(
                "luxToast"
            );

        if(!toast){

            toast =
                document.createElement("div");

            toast.id =
                "luxToast";

            toast.className =
                "lux-toast";

            document.body.appendChild(
                toast
            );

        }

        toast.textContent =
            message;

        toast.classList.add(
            "show"
        );


        clearTimeout(
            toast._timer
        );


        toast._timer =
            setTimeout(
                function(){

                    toast.classList.remove(
                        "show"
                    );

                },
                2500
            );

    }


    /* =====================================================
       FAVORITE COUNTER
       ===================================================== */

    function updateFavoriteCounter(){

        const favorites =
            JSON.parse(
                localStorage.getItem(
                    "homeLuxFavorites"
                ) || "[]"
            );


        let button =
            document.querySelector(
                '.nav-btn[data-page="favorites"]'
            );


        if(!button){
            return;
        }


        button.style.position =
            "relative";


        let badge =
            button.querySelector(
                ".lux-favorite-count"
            );


        if(!badge){

            badge =
                document.createElement(
                    "span"
                );

            badge.className =
                "lux-favorite-count";

            button.appendChild(
                badge
            );

        }


        const count =
            Array.isArray(favorites)
                ? favorites.length
                : 0;


        badge.textContent =
            count;


        badge.classList.toggle(
            "show",
            count > 0
        );

    }


    /* =====================================================
       FILTER BAR
       ===================================================== */

    function createFilterBar(){

        const housesPage =
            document.getElementById(
                "houses"
            );


        if(!housesPage){
            return;
        }


        if(
            document.getElementById(
                "luxFilterBar"
            )
        ){
            return;
        }


        const title =
            housesPage.querySelector(
                "h2"
            );


        if(!title){
            return;
        }


        const bar =
            document.createElement(
                "div"
            );


        bar.id =
            "luxFilterBar";

        bar.className =
            "lux-filter-bar";


        bar.innerHTML = `

            <span class="lux-filter-title">
                Филтр:
            </span>

            <button
                type="button"
                class="lux-filter-btn active"
                data-sort="default"
            >
                Ҳама
            </button>

            <button
                type="button"
                class="lux-filter-btn"
                data-sort="cheap"
            >
                💰 Арзонтар
            </button>

            <button
                type="button"
                class="lux-filter-btn"
                data-sort="expensive"
            >
                💎 Қимматтар
            </button>

            <button
                type="button"
                class="lux-filter-btn"
                data-sort="area"
            >
                📐 Масоҳат
            </button>

        `;


        title.insertAdjacentElement(
            "afterend",
            bar
        );


        bar
            .querySelectorAll(
                ".lux-filter-btn"
            )
            .forEach(
                function(button){

                    button.addEventListener(
                        "click",
                        function(){

                            bar
                                .querySelectorAll(
                                    ".lux-filter-btn"
                                )
                                .forEach(
                                    function(item){

                                        item.classList.remove(
                                            "active"
                                        );

                                    }
                                );


                            button.classList.add(
                                "active"
                            );


                            sortHouseCards(
                                button.dataset.sort
                            );

                        }
                    );

                }
            );

    }


    /* =====================================================
       SORT HOUSE CARDS
       ===================================================== */

    function sortHouseCards(
        type
    ){

        const container =
            document.querySelector(
                "#houses .houses-grid"
            ) ||
            document.querySelector(
                "#houses .houses"
            );


        if(!container){
            return;
        }


        const cards =
            Array.from(
                container.querySelectorAll(
                    ".house-card"
                )
            );


        if(!cards.length){
            return;
        }


        cards.sort(
            function(a,b){

                const houseA =
                    houses.find(
                        h =>
                            String(h.id) ===
                            String(
                                a.dataset.houseId
                            )
                    );


                const houseB =
                    houses.find(
                        h =>
                            String(h.id) ===
                            String(
                                b.dataset.houseId
                            )
                    );


                if(!houseA || !houseB){
                    return 0;
                }


                if(type === "cheap"){

                    return (
                        getNumber(
                            houseA.price
                        ) -
                        getNumber(
                            houseB.price
                        )
                    );

                }


                if(type === "expensive"){

                    return (
                        getNumber(
                            houseB.price
                        ) -
                        getNumber(
                            houseA.price
                        )
                    );

                }


                if(type === "area"){

                    return (
                        Number(
                            houseB.area || 0
                        ) -
                        Number(
                            houseA.area || 0
                        )
                    );

                }


                return (
                    Number(
                        a.dataset.originalIndex || 0
                    ) -
                    Number(
                        b.dataset.originalIndex || 0
                    )
                );

            }
        );


        cards.forEach(
            function(card){

                container.appendChild(
                    card
                );

            }
        );

    }


    function getNumber(value){

        const number =
            String(
                value || ""
            )
            .replace(
                /[^0-9.,]/g,
                ""
            )
            .replace(
                /,/g,
                ""
            );


        return (
            parseFloat(number) ||
            0
        );

    }


    /* =====================================================
       SAVE ORIGINAL CARD ORDER
       ===================================================== */

    function saveCardIndexes(){

        document
            .querySelectorAll(
                "#houses .house-card"
            )
            .forEach(
                function(card,index){

                    if(
                        card.dataset.originalIndex ===
                        undefined
                    ){

                        card.dataset.originalIndex =
                            index;

                    }

                }
            );

    }


    /* =====================================================
       IMAGE VIEWER
       ===================================================== */

    function createImageViewer(){

        if(
            document.getElementById(
                "luxImageViewer"
            )
        ){
            return;
        }


        const viewer =
            document.createElement(
                "div"
            );


        viewer.id =
            "luxImageViewer";

        viewer.className =
            "lux-image-viewer";


        viewer.innerHTML = `

            <button
                type="button"
                class="lux-image-close"
                aria-label="Close"
            >
                ×
            </button>

            <img
                src=""
                alt="HomeLux"
            >

        `;


        document.body.appendChild(
            viewer
        );


        const close =
            function(){

                viewer.classList.remove(
                    "show"
                );

            };


        viewer
            .querySelector(
                ".lux-image-close"
            )
            .addEventListener(
                "click",
                close
            );


        viewer.addEventListener(
            "click",
            function(event){

                if(
                    event.target === viewer
                ){

                    close();

                }

            }
        );


        document.addEventListener(
            "keydown",
            function(event){

                if(
                    event.key === "Escape"
                ){

                    close();

                }

            }
        );

    }


    function bindImageViewer(){

        const viewer =
            document.getElementById(
                "luxImageViewer"
            );


        if(!viewer){
            return;
        }


        const viewerImage =
            viewer.querySelector(
                "img"
            );


        document
            .querySelectorAll(
                ".house-photo img"
            )
            .forEach(
                function(image){

                    if(
                        image.dataset.luxViewer
                    ){
                        return;
                    }


                    image.dataset.luxViewer =
                        "1";


                    image.style.cursor =
                        "zoom-in";


                    image.addEventListener(
                        "click",
                        function(event){

                            event.stopPropagation();


                            viewerImage.src =
                                image.src;


                            viewer.classList.add(
                                "show"
                            );

                        }
                    );

                }
            );

    }


    /* =====================================================
       BACK TO TOP
       ===================================================== */

    function createTopButton(){

        if(
            document.getElementById(
                "luxTopButton"
            )
        ){
            return;
        }


        const button =
            document.createElement(
                "button"
            );


        button.id =
            "luxTopButton";

        button.className =
            "lux-top-button";

        button.type =
            "button";

        button.textContent =
            "↑";


        button.title =
            "Ба боло";


        document.body.appendChild(
            button
        );


        button.addEventListener(
            "click",
            function(){

                window.scrollTo({
                    top:0,
                    behavior:"smooth"
                });

            }
        );


        window.addEventListener(
            "scroll",
            function(){

                button.classList.toggle(
                    "show",
                    window.scrollY > 450
                );

            },
            {
                passive:true
            }
        );

    }


    /* =====================================================
       SEARCH WITH ENTER
       ===================================================== */

    function improveSearch(){

        const inputs =
            document.querySelectorAll(
                "#topSearch, #bigSearch"
            );


        inputs.forEach(
            function(input){

                if(
                    input.dataset.luxSearch
                ){
                    return;
                }


                input.dataset.luxSearch =
                    "1";


                input.addEventListener(
                    "keydown",
                    function(event){

                        if(
                            event.key !== "Enter"
                        ){
                            return;
                        }


                        event.preventDefault();


                        const text =
                            input.value.trim();


                        if(
                            typeof searchHouses ===
                            "function"
                        ){

                            searchHouses(
                                text
                            );

                        }


                        const searchPage =
                            document.getElementById(
                                "search"
                            );


                        if(
                            input.id ===
                            "topSearch" &&
                            searchPage
                        ){

                            showPage(
                                "search"
                            );

                            const bigSearch =
                                document.getElementById(
                                    "bigSearch"
                                );


                            if(bigSearch){

                                bigSearch.value =
                                    text;

                            }

                        }

                    }
                );

            }
        );

    }


    /* =====================================================
       CARD CLICK
       ===================================================== */

    function bindCardClick(){

        document
            .querySelectorAll(
                ".house-card"
            )
            .forEach(
                function(card){

                    if(
                        card.dataset.luxCardBound
                    ){
                        return;
                    }


                    card.dataset.luxCardBound =
                        "1";


                    card.style.cursor =
                        "pointer";


                    card.addEventListener(
                        "click",
                        function(event){

                            if(
                                event.target.closest(
                                    "button"
                                ) ||
                                event.target.closest(
                                    "a"
                                )
                            ){

                                return;

                            }


                            const id =
                                card.dataset.houseId;


                            if(
                                id &&
                                typeof openHouse ===
                                "function"
                            ){

                                openHouse(
                                    id
                                );

                            }

                        }
                    );

                }
            );

    }


    /* =====================================================
       FAVORITE TOAST
       ===================================================== */

    function watchFavorites(){

        document.addEventListener(
            "click",
            function(event){

                const button =
                    event.target.closest(
                        ".favorite-button"
                    );


                if(!button){
                    return;
                }


                setTimeout(
                    function(){

                        updateFavoriteCounter();

                        const selected =
                            button.classList.contains(
                                "selected"
                            );


                        luxToast(
                            selected
                                ? "❤️ Хона ба дӯстдоштаҳо илова шуд"
                                : "🤍 Хона аз дӯстдоштаҳо хориҷ шуд"
                        );

                    },
                    50
                );

            }
        );

    }


    /* =====================================================
       MUTATION OBSERVER
       ===================================================== */

    function observeHouseUpdates(){

        const targets = [
            document.getElementById(
                "houses"
            ),
            document.getElementById(
                "homeHouses"
            ),
            document.getElementById(
                "favoriteList"
            )
        ].filter(Boolean);


        if(!targets.length){
            return;
        }


        const observer =
            new MutationObserver(
                function(){

                    setTimeout(
                        function(){

                            saveCardIndexes();

                            bindImageViewer();

                            bindCardClick();

                            updateFavoriteCounter();

                        },
                        80
                    );

                }
            );


        targets.forEach(
            function(target){

                observer.observe(
                    target,
                    {
                        childList:true,
                        subtree:true
                    }
                );

            }
        );

    }


    /* =====================================================
       START
       ===================================================== */

    function start(){

        createFilterBar();

        createImageViewer();

        createTopButton();

        improveSearch();

        saveCardIndexes();

        bindImageViewer();

        bindCardClick();

        updateFavoriteCounter();

        watchFavorites();

        observeHouseUpdates();


        console.log(
            "HomeLux Modern UI Pack = READY ✨"
        );

    }


    if(
        document.readyState ===
        "loading"
    ){

        document.addEventListener(
            "DOMContentLoaded",
            start
        );

    }else{

        start();

    }

})();/* =========================================================
   HOMELUX MODERN FEATURES
   ========================================================= */

(function HomeLuxModernPack(){

    "use strict";


    /* =====================================================
       TOAST
       ===================================================== */

    function luxToast(message){

        let toast =
            document.getElementById(
                "luxToast"
            );

        if(!toast){

            toast =
                document.createElement("div");

            toast.id =
                "luxToast";

            toast.className =
                "lux-toast";

            document.body.appendChild(
                toast
            );

        }

        toast.textContent =
            message;

        toast.classList.add(
            "show"
        );


        clearTimeout(
            toast._timer
        );


        toast._timer =
            setTimeout(
                function(){

                    toast.classList.remove(
                        "show"
                    );

                },
                2500
            );

    }


    /* =====================================================
       FAVORITE COUNTER
       ===================================================== */

    function updateFavoriteCounter(){

        const favorites =
            JSON.parse(
                localStorage.getItem(
                    "homeLuxFavorites"
                ) || "[]"
            );


        let button =
            document.querySelector(
                '.nav-btn[data-page="favorites"]'
            );


        if(!button){
            return;
        }


        button.style.position =
            "relative";


        let badge =
            button.querySelector(
                ".lux-favorite-count"
            );


        if(!badge){

            badge =
                document.createElement(
                    "span"
                );

            badge.className =
                "lux-favorite-count";

            button.appendChild(
                badge
            );

        }


        const count =
            Array.isArray(favorites)
                ? favorites.length
                : 0;


        badge.textContent =
            count;


        badge.classList.toggle(
            "show",
            count > 0
        );

    }


    /* =====================================================
       FILTER BAR
       ===================================================== */

    function createFilterBar(){

        const housesPage =
            document.getElementById(
                "houses"
            );


        if(!housesPage){
            return;
        }


        if(
            document.getElementById(
                "luxFilterBar"
            )
        ){
            return;
        }


        const title =
            housesPage.querySelector(
                "h2"
            );


        if(!title){
            return;
        }


        const bar =
            document.createElement(
                "div"
            );


        bar.id =
            "luxFilterBar";

        bar.className =
            "lux-filter-bar";


        bar.innerHTML = `

            <span class="lux-filter-title">
                Филтр:
            </span>

            <button
                type="button"
                class="lux-filter-btn active"
                data-sort="default"
            >
                Ҳама
            </button>

            <button
                type="button"
                class="lux-filter-btn"
                data-sort="cheap"
            >
                💰 Арзонтар
            </button>

            <button
                type="button"
                class="lux-filter-btn"
                data-sort="expensive"
            >
                💎 Қимматтар
            </button>

            <button
                type="button"
                class="lux-filter-btn"
                data-sort="area"
            >
                📐 Масоҳат
            </button>

        `;


        title.insertAdjacentElement(
            "afterend",
            bar
        );


        bar
            .querySelectorAll(
                ".lux-filter-btn"
            )
            .forEach(
                function(button){

                    button.addEventListener(
                        "click",
                        function(){

                            bar
                                .querySelectorAll(
                                    ".lux-filter-btn"
                                )
                                .forEach(
                                    function(item){

                                        item.classList.remove(
                                            "active"
                                        );

                                    }
                                );


                            button.classList.add(
                                "active"
                            );


                            sortHouseCards(
                                button.dataset.sort
                            );

                        }
                    );

                }
            );

    }


    /* =====================================================
       SORT HOUSE CARDS
       ===================================================== */

    function sortHouseCards(
        type
    ){

        const container =
            document.querySelector(
                "#houses .houses-grid"
            ) ||
            document.querySelector(
                "#houses .houses"
            );


        if(!container){
            return;
        }


        const cards =
            Array.from(
                container.querySelectorAll(
                    ".house-card"
                )
            );


        if(!cards.length){
            return;
        }


        cards.sort(
            function(a,b){

                const houseA =
                    houses.find(
                        h =>
                            String(h.id) ===
                            String(
                                a.dataset.houseId
                            )
                    );


                const houseB =
                    houses.find(
                        h =>
                            String(h.id) ===
                            String(
                                b.dataset.houseId
                            )
                    );


                if(!houseA || !houseB){
                    return 0;
                }


                if(type === "cheap"){

                    return (
                        getNumber(
                            houseA.price
                        ) -
                        getNumber(
                            houseB.price
                        )
                    );

                }


                if(type === "expensive"){

                    return (
                        getNumber(
                            houseB.price
                        ) -
                        getNumber(
                            houseA.price
                        )
                    );

                }


                if(type === "area"){

                    return (
                        Number(
                            houseB.area || 0
                        ) -
                        Number(
                            houseA.area || 0
                        )
                    );

                }


                return (
                    Number(
                        a.dataset.originalIndex || 0
                    ) -
                    Number(
                        b.dataset.originalIndex || 0
                    )
                );

            }
        );


        cards.forEach(
            function(card){

                container.appendChild(
                    card
                );

            }
        );

    }


    function getNumber(value){

        const number =
            String(
                value || ""
            )
            .replace(
                /[^0-9.,]/g,
                ""
            )
            .replace(
                /,/g,
                ""
            );


        return (
            parseFloat(number) ||
            0
        );

    }


    /* =====================================================
       SAVE ORIGINAL CARD ORDER
       ===================================================== */

    function saveCardIndexes(){

        document
            .querySelectorAll(
                "#houses .house-card"
            )
            .forEach(
                function(card,index){

                    if(
                        card.dataset.originalIndex ===
                        undefined
                    ){

                        card.dataset.originalIndex =
                            index;

                    }

                }
            );

    }


    /* =====================================================
       IMAGE VIEWER
       ===================================================== */

    function createImageViewer(){

        if(
            document.getElementById(
                "luxImageViewer"
            )
        ){
            return;
        }


        const viewer =
            document.createElement(
                "div"
            );


        viewer.id =
            "luxImageViewer";

        viewer.className =
            "lux-image-viewer";


        viewer.innerHTML = `

            <button
                type="button"
                class="lux-image-close"
                aria-label="Close"
            >
                ×
            </button>

            <img
                src=""
                alt="HomeLux"
            >

        `;


        document.body.appendChild(
            viewer
        );


        const close =
            function(){

                viewer.classList.remove(
                    "show"
                );

            };


        viewer
            .querySelector(
                ".lux-image-close"
            )
            .addEventListener(
                "click",
                close
            );


        viewer.addEventListener(
            "click",
            function(event){

                if(
                    event.target === viewer
                ){

                    close();

                }

            }
        );


        document.addEventListener(
            "keydown",
            function(event){

                if(
                    event.key === "Escape"
                ){

                    close();

                }

            }
        );

    }


    function bindImageViewer(){

        const viewer =
            document.getElementById(
                "luxImageViewer"
            );


        if(!viewer){
            return;
        }


        const viewerImage =
            viewer.querySelector(
                "img"
            );


        document
            .querySelectorAll(
                ".house-photo img"
            )
            .forEach(
                function(image){

                    if(
                        image.dataset.luxViewer
                    ){
                        return;
                    }


                    image.dataset.luxViewer =
                        "1";


                    image.style.cursor =
                        "zoom-in";


                    image.addEventListener(
                        "click",
                        function(event){

                            event.stopPropagation();


                            viewerImage.src =
                                image.src;


                            viewer.classList.add(
                                "show"
                            );

                        }
                    );

                }
            );

    }


    /* =====================================================
       BACK TO TOP
       ===================================================== */

    function createTopButton(){

        if(
            document.getElementById(
                "luxTopButton"
            )
        ){
            return;
        }


        const button =
            document.createElement(
                "button"
            );


        button.id =
            "luxTopButton";

        button.className =
            "lux-top-button";

        button.type =
            "button";

        button.textContent =
            "↑";


        button.title =
            "Ба боло";


        document.body.appendChild(
            button
        );


        button.addEventListener(
            "click",
            function(){

                window.scrollTo({
                    top:0,
                    behavior:"smooth"
                });

            }
        );


        window.addEventListener(
            "scroll",
            function(){

                button.classList.toggle(
                    "show",
                    window.scrollY > 450
                );

            },
            {
                passive:true
            }
        );

    }


    /* =====================================================
       SEARCH WITH ENTER
       ===================================================== */

    function improveSearch(){

        const inputs =
            document.querySelectorAll(
                "#topSearch, #bigSearch"
            );


        inputs.forEach(
            function(input){

                if(
                    input.dataset.luxSearch
                ){
                    return;
                }


                input.dataset.luxSearch =
                    "1";


                input.addEventListener(
                    "keydown",
                    function(event){

                        if(
                            event.key !== "Enter"
                        ){
                            return;
                        }


                        event.preventDefault();


                        const text =
                            input.value.trim();


                        if(
                            typeof searchHouses ===
                            "function"
                        ){

                            searchHouses(
                                text
                            );

                        }


                        const searchPage =
                            document.getElementById(
                                "search"
                            );


                        if(
                            input.id ===
                            "topSearch" &&
                            searchPage
                        ){

                            showPage(
                                "search"
                            );

                            const bigSearch =
                                document.getElementById(
                                    "bigSearch"
                                );


                            if(bigSearch){

                                bigSearch.value =
                                    text;

                            }

                        }

                    }
                );

            }
        );

    }


    /* =====================================================
       CARD CLICK
       ===================================================== */

    function bindCardClick(){

        document
            .querySelectorAll(
                ".house-card"
            )
            .forEach(
                function(card){

                    if(
                        card.dataset.luxCardBound
                    ){
                        return;
                    }


                    card.dataset.luxCardBound =
                        "1";


                    card.style.cursor =
                        "pointer";


                    card.addEventListener(
                        "click",
                        function(event){

                            if(
                                event.target.closest(
                                    "button"
                                ) ||
                                event.target.closest(
                                    "a"
                                )
                            ){

                                return;

                            }


                            const id =
                                card.dataset.houseId;


                            if(
                                id &&
                                typeof openHouse ===
                                "function"
                            ){

                                openHouse(
                                    id
                                );

                            }

                        }
                    );

                }
            );

    }


    /* =====================================================
       FAVORITE TOAST
       ===================================================== */

    function watchFavorites(){

        document.addEventListener(
            "click",
            function(event){

                const button =
                    event.target.closest(
                        ".favorite-button"
                    );


                if(!button){
                    return;
                }


                setTimeout(
                    function(){

                        updateFavoriteCounter();

                        const selected =
                            button.classList.contains(
                                "selected"
                            );


                        luxToast(
                            selected
                                ? "❤️ Хона ба дӯстдоштаҳо илова шуд"
                                : "🤍 Хона аз дӯстдоштаҳо хориҷ шуд"
                        );

                    },
                    50
                );

            }
        );

    }


    /* =====================================================
       MUTATION OBSERVER
       ===================================================== */

    function observeHouseUpdates(){

        const targets = [
            document.getElementById(
                "houses"
            ),
            document.getElementById(
                "homeHouses"
            ),
            document.getElementById(
                "favoriteList"
            )
        ].filter(Boolean);


        if(!targets.length){
            return;
        }


        const observer =
            new MutationObserver(
                function(){

                    setTimeout(
                        function(){

                            saveCardIndexes();

                            bindImageViewer();

                            bindCardClick();

                            updateFavoriteCounter();

                        },
                        80
                    );

                }
            );


        targets.forEach(
            function(target){

                observer.observe(
                    target,
                    {
                        childList:true,
                        subtree:true
                    }
                );

            }
        );

    }


    /* =====================================================
       START
       ===================================================== */

    function start(){

        createFilterBar();

        createImageViewer();

        createTopButton();

        improveSearch();

        saveCardIndexes();

        bindImageViewer();

        bindCardClick();

        updateFavoriteCounter();

        watchFavorites();

        observeHouseUpdates();


        console.log(
            "HomeLux Modern UI Pack = READY ✨"
        );

    }


    if(
        document.readyState ===
        "loading"
    ){

        document.addEventListener(
            "DOMContentLoaded",
            start
        );

    }else{

        start();

    }

})();// ==========================================
// HOMELUX FILTER SYSTEM
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const filterButtons = document.querySelectorAll(".filter-btn");

    if (!filterButtons.length) {
        console.log("Filter buttons not found");
        return;
    }

    filterButtons.forEach(button => {

        button.addEventListener("click", function () {

            const filter = this.dataset.filter;

            // Active button
            filterButtons.forEach(btn => {
                btn.classList.remove("active");
            });

            this.classList.add("active");

            applyHomeFilter(filter);
        });
    });

});


// ==========================================
// APPLY FILTER
// ==========================================

function applyHomeFilter(filter) {

    // Ҳамаи хонаҳоро мегирем
    const houses = getHomeLuxHouses();

    if (!houses.length) {
        console.log("No HomeLux houses found");
        return;
    }

    let sortedHouses = [...houses];

    // -------------------------------
    // ҲАМА
    // -------------------------------

    if (filter === "all") {
        sortedHouses = [...houses];
    }

    // -------------------------------
    // АРЗОНТАР
    // -------------------------------

    if (filter === "cheap") {
        sortedHouses.sort((a, b) => {
            return getNumber(a.price) - getNumber(b.price);
        });
    }

    // -------------------------------
    // ҚИММАТТАР
    // -------------------------------

    if (filter === "expensive") {
        sortedHouses.sort((a, b) => {
            return getNumber(b.price) - getNumber(a.price);
        });
    }

    // -------------------------------
    // МАСОҲАТ
    // -------------------------------

    if (filter === "area") {
        sortedHouses.sort((a, b) => {
            return getNumber(b.area) - getNumber(a.area);
        });
    }

    // Намоиши натиҷа
    displayFilteredHouses(sortedHouses);
}


// ==========================================
// GET HOMELUX HOUSES
// ==========================================

function getHomeLuxHouses() {

    try {

        const data = localStorage.getItem("homeLuxHouses");

        if (!data) {
            return [];
        }

        const houses = JSON.parse(data);

        if (!Array.isArray(houses)) {
            return [];
        }

        return houses;

    } catch (error) {

        console.error(
            "HomeLux houses error:",
            error
        );

        return [];
    }
}


// ==========================================
// CONVERT NUMBER
// ==========================================

function getNumber(value) {

    if (value === undefined || value === null) {
        return 0;
    }

    // Ҳамаи аломатҳои ғайрирақамиро тоза мекунем
    const number = String(value)
        .replace(/[^\d.,-]/g, "")
        .replace(/,/g, "");

    return parseFloat(number) || 0;
}


// ==========================================
// DISPLAY FILTERED HOUSES
// ==========================================

function displayFilteredHouses(houses) {

    /*
       Агар renderHouses() дар коди HomeLux-и ту
       вуҷуд дошта бошад, аз ҳамон истифода мебарем.
    */

    if (typeof renderHouses === "function") {

        // Муваққатан рӯйхати HomeLux-ро иваз мекунем
        const original = localStorage.getItem("homeLuxHouses");

        localStorage.setItem(
            "homeLuxHouses",
            JSON.stringify(houses)
        );

        renderHouses();

        // Рӯйхати аслӣ барқарор мешавад
        if (original !== null) {
            localStorage.setItem(
                "homeLuxHouses",
                original
            );
        }

        return;
    }

    // Агар renderHouses набошад,
    // мустақиман card-ҳоро сорт мекунем.
    sortExistingCards(houses);
}


// ==========================================
// FALLBACK FOR EXISTING CARDS
// ==========================================

function sortExistingCards(houses) {

    const container =
        document.querySelector(".houses-container") ||
        document.querySelector(".houses-list") ||
        document.querySelector("#housesList") ||
        document.querySelector(".house-grid");

    if (!container) {
        console.log("Houses container not found");
        return;
    }

    const cards = [...container.children];

    const houseMap = new Map();

    houses.forEach(house => {

        const id = String(house.id);

        houseMap.set(id, house);
    });

    cards.sort((cardA, cardB) => {

        const idA =
            cardA.dataset.id ||
            cardA.getAttribute("data-id");

        const idB =
            cardB.dataset.id ||
            cardB.getAttribute("data-id");

        const houseA = houseMap.get(String(idA));
        const houseB = houseMap.get(String(idB));

        if (!houseA || !houseB) {
            return 0;
        }

        return getNumber(houseB.area) -
               getNumber(houseA.area);
    });

    cards.forEach(card => {
        container.appendChild(card);
    });
}/* =====================================================
GOOGLE / FACEBOOK / CHROME BUTTONS
===================================================== */

function socialLogin(service){

```
if(service === "google"){

    window.open(
        "https://accounts.google.com/",
        "_blank"
    );

}

else if(service === "facebook"){

    window.open(
        "https://www.facebook.com/",
        "_blank"
    );

}

else if(service === "chrome"){

    window.open(
        "https://www.google.com/chrome/",
        "_blank"
    );

}
```

}
/* ================= SOCIAL LOGIN ================= */

function socialLogin(service){

```
if(service === "google"){

    window.location.href =
        "https://accounts.google.com/";

}

else if(service === "facebook"){

    window.location.href =
        "https://www.facebook.com/";

}

else if(service === "chrome"){

    window.location.href =
        "https://www.google.com/chrome/";

}
```

}
/* =========================================================
   🛒 HOMELUX CART
========================================================= */

const CART_KEY = "homeLuxCart";


function getCart() {

    try {

        const data =
            JSON.parse(
                localStorage.getItem(CART_KEY) || "[]"
            );

        return Array.isArray(data) ? data : [];

    } catch {

        return [];

    }
}


function saveCart(cart) {

    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );

}


/* =========================================================
   ADD HOUSE TO CART
========================================================= */

function addToCart(id) {

    const cart = getCart();

    if (
        cart.some(
            item =>
                String(item.id) === String(id)
        )
    ) {

        alert("🏠 Ин хона аллакай дар корзина ҳаст!");

        return;

    }


    const card =
        document.querySelector(
            `.house-card[data-cart-id="${id}"]`
        );

    if (!card) return;


    const image =
        card.querySelector("img")?.src || "";


    const name =
        card.querySelector("h3")?.textContent.trim()
        || "Хонаи HomeLux";


    const description =
        card.querySelector("p")?.textContent.trim()
        || "";


    const price =
        card.querySelector("strong")?.textContent.trim()
        || "0";


    cart.push({

        id: id,

        name: name,

        description: description,

        price: price,

        image: image

    });


    saveCart(cart);

    renderCart();

    updateCartCount();

    alert("✅ Хона ба корзина илова шуд!");

}


/* =========================================================
   REMOVE
========================================================= */

function removeFromCart(id) {

    let cart = getCart();

    cart =
        cart.filter(
            item =>
                String(item.id) !== String(id)
        );

    saveCart(cart);

    renderCart();

    updateCartCount();

}


/* =========================================================
   CLEAR
========================================================= */

function clearCart() {

    if (!getCart().length) return;


    if (
        !confirm(
            "Корзинаро пурра тоза кардан мехоҳед?"
        )
    ) return;


    localStorage.removeItem(CART_KEY);

    renderCart();

    updateCartCount();

}


/* =========================================================
   COUNT
========================================================= */

function updateCartCount() {

    const count =
        document.getElementById("cartCount");

    if (!count) return;


    count.textContent =
        getCart().length;

}


/* =========================================================
   RENDER CART
========================================================= */

function renderCart() {

    const container =
        document.getElementById("cartItems");

    const totalElement =
        document.getElementById("cartTotal");


    if (!container) return;


    const cart = getCart();


    if (!cart.length) {

        container.innerHTML = `
            <div class="cart-empty">
                🏠<br>
                Корзина холӣ аст
            </div>
        `;

        if (totalElement) {
            totalElement.textContent =
                "0 сомони";
        }

        return;

    }


    container.innerHTML =
        cart.map(item => `

            <div
                class="cart-item"
                data-id="${item.id}"
            >

                ${
                    item.image
                    ?
                    `<img
                        src="${item.image}"
                        alt="${item.name}"
                    >`
                    :
                    `<div
                        style="
                        width:85px;
                        height:70px;
                        display:grid;
                        place-items:center;
                        background:#e2e8f0;
                        border-radius:12px;
                        font-size:30px;
                        "
                    >
                        🏠
                    </div>`
                }

                <div class="cart-item-info">

                    <h3>
                        ${item.name}
                    </h3>

                    <small>
                        ${item.description}
                    </small>

                    <br>

                    <strong>
                        ${item.price}
                    </strong>

                </div>

                <button
                    class="remove-cart"
                    onclick="removeFromCart('${item.id}')"
                >
                    🗑️
                </button>

            </div>

        `).join("");


    if (totalElement) {

        totalElement.textContent =
            calculateCartTotal();

    }

}


/* =========================================================
   TOTAL
========================================================= */

function calculateCartTotal() {

    const cart = getCart();


    let total = 0;


    cart.forEach(item => {

        const number =
            String(item.price)
                .replace(/[^\d.,]/g, "")
                .replace(/,/g, "");


        const value =
            parseFloat(number);


        if (!isNaN(value)) {

            total += value;

        }

    });


    return (
        new Intl.NumberFormat("ru-RU")
            .format(total)
        + " сомони"
    );

}


/* =========================================================
   OPEN / CLOSE
========================================================= */

function openCart() {

    document
        .getElementById("cartPanel")
        ?.classList.add("active");

    document
        .getElementById("cartOverlay")
        ?.classList.add("active");

}


function closeCart() {

    document
        .getElementById("cartPanel")
        ?.classList.remove("active");

    document
        .getElementById("cartOverlay")
        ?.classList.remove("active");

}


/* =========================================================
   CREATE BUTTONS UNDER HOUSES
========================================================= */

function setupCartHouses() {

    const cards =
        document.querySelectorAll(
            ".house-card"
        );


    cards.forEach(
        (card, index) => {

            const id =
                card.dataset.cartId
                || String(index + 1);


            card.dataset.cartId = id;


            if (
                card.querySelector(
                    ".add-cart-button"
                )
            ) return;


            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "add-cart-button";


            button.type =
                "button";


            button.textContent =
                "🛒 Ба корзина";


            button.onclick =
                () => addToCart(id);


            card.appendChild(button);

        }
    );

}


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupCartHouses();

        renderCart();

        updateCartCount();


        document
            .getElementById("cartButton")
            ?.addEventListener(
                "click",
                openCart
            );


        document
            .getElementById("closeCart")
            ?.addEventListener(
                "click",
                closeCart
            );


        document
            .getElementById("cartOverlay")
            ?.addEventListener(
                "click",
                closeCart
            );


        document
            .getElementById("clearCart")
            ?.addEventListener(
                "click",
                clearCart
            );

    }
);/* =========================
   SMART MATCH ENGINE
========================= */

function openSmartMatch() {

    const modal =
        document.getElementById("smartMatchModal");

    if (!modal) return;

    modal.classList.add("active");

    document.body.style.overflow = "hidden";
}


function closeSmartMatch() {

    const modal =
        document.getElementById("smartMatchModal");

    if (!modal) return;

    modal.classList.remove("active");

    document.body.style.overflow = "";
}


function findSmartHouse() {

    if (
        typeof houses === "undefined" ||
        !Array.isArray(houses)
    ) {
        alert("Хонаҳо ёфт нашуданд!");
        return;
    }


    const city =
        document.getElementById("smartCity").value;

    const price =
        Number(
            document.getElementById("smartPrice").value
        );

    const area =
        Number(
            document.getElementById("smartArea").value
        );

    const style =
        document.getElementById("smartStyle").value;


    let results = houses.map(house => {

        let score = 0;


        /* CITY */

        if (city === "all") {

            score += 10;

        } else if (house.city === city) {

            score += 35;

        } else {

            score -= 20;

        }


        /* PRICE */

        if (house.price <= price) {

            score += 30;

        } else {

            score -= 20;

        }


        /* AREA */

        if (area === 0) {

            score += 10;

        } else if (house.area >= area) {

            score += 25;

        } else {

            score -= 10;

        }


        /* STYLE */

        if (style === "all") {

            score += 10;

        } else {

            const premium =
                Boolean(house.premium);

            if (
                style === "premium" &&
                premium
            ) {
                score += 25;
            }

            if (
                style === "standard" &&
                !premium
            ) {
                score += 25;
            }

        }


        return {
            ...house,
            smartScore: score
        };

    });


    /* BEST HOUSE */

    results.sort(
        (a, b) =>
            b.smartScore - a.smartScore
    );


    const best = results[0];


    if (!best) {

        document.getElementById(
            "smartResult"
        ).innerHTML =
            "<div class='wow-empty'>😕 Хона ёфт нашуд.</div>";

        return;
    }


    let percent =
        Math.round(
            Math.max(
                55,
                Math.min(
                    99,
                    60 + best.smartScore
                )
            )
        );


    document.getElementById(
        "smartResult"
    ).innerHTML = `

        <div class="smart-result">

            <img
                src="${best.image}"
                alt="${best.name}"
            >

            <div>

                <span class="smart-percent">
                    ✦ ${percent}% мувофиқ
                </span>

                <h3>
                    ${best.name}
                </h3>

                <p>
                    📍 ${best.location}
                </p>

                <p>
                    💰 ${Number(best.price).toLocaleString()}
                    сомонӣ
                    ·
                    📐 ${best.area} м²
                    ·
                    🏢 ${best.floors} ошёна
                </p>

                <p>
                    ${best.description}
                </p>

            </div>

        </div>

    `;

}


/* ESC = CLOSE */

document.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Escape") {

            closeSmartMatch();

        }

    }
);