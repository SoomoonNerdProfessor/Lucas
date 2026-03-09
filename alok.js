var fullId = "";
var currentLang = "id";

var translations = {
    id: {
        home: "Início",
        settings: "Configurações",
        pageTitle: "Verificador de Canal do WhatsApp",
        pageSubtitle: "Analisar informações do canal do WhatsApp, Soomoon",
        analyzeBtn: "Analisar Canal",
        loading: "Carregando Dados...",
        pleaseWait: "Por favor aguarde um momento",
        followers: "Seguidores",
        copyId: "Copiar ID",
        reaction: "Reação",
        inviteCode: "Código de Convite",
        description: "Descrição",
        settingsTitle: "Configurações",
        language: "Idioma",
        languageDesc: "Escolha o idioma do aplicativo",
        theme: "Tema",
        themeDesc: "Modo claro ou escuro",
        darkMode: "Tema preto",
        lightMode: "Tema Claro",
        analyzeSuccess: "Dados carregados com sucesso",
        analyzeFailed: "Falha ao obter dados. Verifique seu link.",
        idCopied: "ID Copiado!",
        idNotAvailable: "ID não disponível",
        copyFailed: "Falha ao copiar ID",
        invalidLink: "Formato de link inválido. Use um link de canal do WhatsApp.",
        pasteLink: "Por favor cole primeiro o link do canal."
    },
    en: {
        home: "Início",
        settings: "Configurações",
        pageTitle: "Verificador de Canal do WhatsApp",
        pageSubtitle: "Analisar informações de qualquer canal do WhatsApp",
        analyzeBtn: "Analisar Canal",
        loading: "Carregando Dados...",
        pleaseWait: "Por favor aguarde um momento",
        followers: "Seguidores",
        copyId: "Copiar ID",
        reaction: "Reação",
        inviteCode: "Código de Convite",
        description: "Descrição",
        settingsTitle: "Configurações",
        language: "Idioma",
        languageDesc: "Selecionar idioma do aplicativo",
        theme: "Tema",
        themeDesc: "Modo claro ou escuro",
        darkMode: "Modo Escuro",
        lightMode: "Modo Claro",
        analyzeSuccess: "Dados carregados com sucesso",
        analyzeFailed: "Falha ao obter dados. Verifique seu link.",
        idCopied: "ID Copiado!",
        idNotAvailable: "ID não disponível",
        copyFailed: "Falha ao copiar ID",
        invalidLink: "Formato de link inválido. Use um link de canal do WhatsApp.",
        pasteLink: "Por favor cole primeiro o link do canal."
    }
};
function t(key) {
    return translations[currentLang][key] || key;
}

function updateTranslations() {
    document.querySelectorAll("[data-translate]").forEach(function(el) {
        var key = el.getAttribute("data-translate");
        if (translations[currentLang][key]) {
            if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
                el.placeholder = translations[currentLang][key];
            } else {
                el.textContent = translations[currentLang][key];
            }
        }
    });
}

function changeLanguage() {
    var select = document.getElementById("languageSelect");
    currentLang = select.value;
    localStorage.setItem("language", currentLang);
    updateTranslations();
    updateSettingsUI();
}

function toggleSidebar() {
    var sidebar = document.getElementById("sidebar");
    var overlay = document.getElementById("overlay");
    sidebar.classList.toggle("open");
    overlay.classList.toggle("active");
}

function closeSidebar() {
    var sidebar = document.getElementById("sidebar");
    var overlay = document.getElementById("overlay");
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
}

function toggleTheme() {
    var html = document.documentElement;
    var currentTheme = html.getAttribute("data-theme");
    var newTheme = currentTheme === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateThemeIcons(newTheme);
    updateSettingsUI();
}

function updateThemeIcons(theme) {
    var themeIcon = document.getElementById("themeIcon");
    var themeText = document.getElementById("themeText");
    var navThemeIcon = document.getElementById("navThemeIcon");
    var settingThemeIcon = document.getElementById("settingThemeIcon");
    var settingThemeText = document.getElementById("settingThemeText");

    if (theme === "dark") {
        if (themeIcon) themeIcon.className = "fa-solid fa-sun";
        if (themeText) themeText.textContent = t("lightMode");
        if (navThemeIcon) navThemeIcon.className = "fa-solid fa-sun";
        if (settingThemeIcon) settingThemeIcon.className = "fa-solid fa-sun";
        if (settingThemeText) settingThemeText.textContent = t("lightMode");
    } else {
        if (themeIcon) themeIcon.className = "fa-solid fa-moon";
        if (themeText) themeText.textContent = t("darkMode");
        if (navThemeIcon) navThemeIcon.className = "fa-solid fa-moon";
        if (settingThemeIcon) settingThemeIcon.className = "fa-solid fa-moon";
        if (settingThemeText) settingThemeText.textContent = t("darkMode");
    }
}

function initTheme() {
    var savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeIcons(savedTheme);
}

function initLanguage() {
    var savedLang = localStorage.getItem("language") || "id";
    currentLang = savedLang;
    var select = document.getElementById("languageSelect");
    if (select) select.value = savedLang;
    updateTranslations();
}

function openSettingsPopup() {
    closeSidebar();
    var modal = document.getElementById("settingsModal");
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
    updateSettingsUI();
}

function closeSettingsPopup() {
    var modal = document.getElementById("settingsModal");
    modal.classList.remove("active");
    document.body.style.overflow = "";
}

function updateSettingsUI() {
    var settingThemeText = document.getElementById("settingThemeText");
    var settingThemeIcon = document.getElementById("settingThemeIcon");
    var html = document.documentElement;
    var theme = html.getAttribute("data-theme");

    if (settingThemeText) {
        settingThemeText.textContent = theme === "dark" ? t("lightMode") : t("darkMode");
    }
    if (settingThemeIcon) {
        settingThemeIcon.className = theme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
    }
}

function validateUrl(url) {
    if (!url || url.trim() === "") {
        return { valid: false, message: t("pasteLink") };
    }

    var waPattern = /whatsapp\.com\/channel\/[a-zA-Z0-9]+/i;
    if (!waPattern.test(url)) {
        return { valid: false, message: t("invalidLink") };
    }

    return { valid: true };
}

function fetchData() {
    var input = document.getElementById("urlInput");
    var link = input.value.trim();
    performFetch(link);
}

function performFetch(link) {
    var btn = document.getElementById("btnCheck");
    var loader = document.getElementById("loader");
    var result = document.getElementById("resultCard");

    var validation = validateUrl(link);
    if (!validation.valid) {
        Swal.fire({
            icon: "warning",
            text: validation.message,
            confirmButtonColor: "#2563eb",
            customClass: { popup: "rounded-2xl text-sm" }
        });
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ' + t("loading");

    if (loader) loader.classList.remove("hidden");
    if (result) result.classList.add("hidden");

    var controller = new AbortController();
    var timeoutId = setTimeout(function() { controller.abort(); }, 15000);

    var apiUrl = "https://api.fikprojects.web.id/cekidch?apikey=FreeKeys&url=" + encodeURIComponent(link);

    fetch(apiUrl, {
        signal: controller.signal,
        headers: { "Accept": "application/json" }
    })
    .then(function(response) {
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error("HTTP error! status: " + response.status);
        }
        return response.json();
    })
    .then(function(res) {
        var data = res.status ? res.data : null;

        if (data && data.id && data.name) {
            renderData(data);
            if (loader) loader.classList.add("hidden");
            if (result) result.classList.remove("hidden");

            var Toast = Swal.mixin({
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 2000,
                customClass: { popup: "rounded-xl text-xs font-bold" }
            });
            Toast.fire({ icon: "success", title: t("analyzeSuccess") });
        } else {
            throw new Error("Invalid data from API");
        }
    })
    .catch(function(error) {
        console.error("Fetch error:", error);
        if (loader) loader.classList.add("hidden");
        Swal.fire({
            icon: "error",
            title: "Failed!",
            text: t("analyzeFailed"),
            confirmButtonColor: "#2563eb",
            customClass: { popup: "rounded-2xl text-sm" }
        });
    })
    .finally(function() {
        btn.disabled = false;
        btn.innerHTML = '<span>' + t("analyzeBtn") + '</span> <i class="fa-solid fa-arrow-right-long"></i>';
    });
}

function renderData(data) {
    fullId = data.id || "";

    var img = document.getElementById("resPhoto");
    img.src = data.Photo || "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg";
    img.onerror = function() {
        this.src = "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg";
    };

    document.getElementById("resName").textContent = data.name || "Unknown Channel";
    document.getElementById("resFollowers").textContent = parseInt(data.Pengikut || 0).toLocaleString("id-ID");

    var shortId = (data.id || "").replace("@newsletter", "");
    if (shortId.length > 12) shortId = shortId.substring(0, 12) + "...";
    document.getElementById("resIdShort").textContent = shortId || "N/A";

    document.getElementById("resDesc").innerHTML = linkify(data.Deskripsi || "-");

    document.getElementById("resReaction").textContent = data.Reaction || "-";
    document.getElementById("resInvite").textContent = data.Invite || "-";

    var badge = document.getElementById("resVerified");
    if (data.Verified === "Ya" || data.Verified === true) {
        badge.classList.remove("hidden");
    } else {
        badge.classList.add("hidden");
    }

    var stateEl = document.getElementById("resState");
    var state = (data.State || "UNKNOWN").toUpperCase();

    if (state === "ACTIVE") {
        stateEl.textContent = "ACTIVE";
        stateEl.className = "state-badge badge-active";
    } else if (state === "UNKNOWN") {
        stateEl.textContent = "UNKNOWN";
        stateEl.className = "state-badge badge-unknown";
    } else {
        stateEl.textContent = state;
        stateEl.className = "state-badge badge-inactive";
    }

    if (data.KreatorTime) {
        var date = new Date(data.KreatorTime * 1000);
        document.getElementById("resDate").textContent = date.toLocaleDateString(currentLang === "id" ? "id-ID" : "en-US", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    } else {
        document.getElementById("resDate").textContent = "-";
    }
}

function copyId() {
    if (!fullId) {
        Swal.fire({
            icon: "info",
            text: t("idNotAvailable"),
            confirmButtonColor: "#2563eb",
            customClass: { popup: "rounded-2xl text-sm" }
        });
        return;
    }

    navigator.clipboard.writeText(fullId).then(function() {
        var Toast = Swal.mixin({
            toast: true,
            position: "top",
            showConfirmButton: false,
            timer: 1500,
            customClass: { popup: "rounded-xl text-xs font-bold" }
        });
        Toast.fire({ icon: "success", title: t("idCopied") });
    }).catch(function() {
        Swal.fire({
            icon: "error",
            text: t("copyFailed"),
            confirmButtonColor: "#2563eb",
            customClass: { popup: "rounded-2xl text-sm" }
        });
    });
}

function linkify(text) {
    if (!text || text === "-") return "-";
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
        return '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + url + '</a>';
    });
}

document.addEventListener("DOMContentLoaded", function() {
    initTheme();
    initLanguage();

    var input = document.getElementById("urlInput");
    if (input) {
        input.addEventListener("keypress", function(e) {
            if (e.key === "Enter") {
                fetchData();
            }
        });
    }
});
