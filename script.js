// ---------- dark/light mode switch ----------
const themeToggle = document.getElementById("theme-toggle");

// show the right button text for the current mode
function updateToggleText() {
    if (document.body.classList.contains("light")) {
        themeToggle.textContent = "Dark mode";
    } else {
        themeToggle.textContent = "Light mode";
    }
}

// use the mode saved from the last visit
if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light");
}
updateToggleText();

// switch modes when the button is clicked, and remember the choice
themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("light");

    if (document.body.classList.contains("light")) {
        localStorage.setItem("theme", "light");
    } else {
        localStorage.setItem("theme", "dark");
    }

    updateToggleText();
});


// ---------- welcome pop-up ----------
const welcomeDialog = document.getElementById("welcome-dialog");
const welcomeStart = document.getElementById("welcome-start");
const dontShowAgain = document.getElementById("dont-show-again");
const helpBtn = document.getElementById("help-btn");

// show the pop-up on every visit unless the user chose "don't show again"
if (localStorage.getItem("hideWelcome") !== "yes") {
    welcomeDialog.showModal();
}

// close the pop-up and remember the checkbox choice
function closeWelcome() {
    if (dontShowAgain.checked) {
        localStorage.setItem("hideWelcome", "yes");
    } else {
        localStorage.removeItem("hideWelcome");
    }
    welcomeDialog.close();
}

welcomeStart.addEventListener("click", closeWelcome);

// clicking outside the box also closes it
welcomeDialog.addEventListener("click", function (event) {
    if (event.target === welcomeDialog) {
        closeWelcome();
    }
});

// the "?" button in the header opens it again
helpBtn.addEventListener("click", function () {
    dontShowAgain.checked = localStorage.getItem("hideWelcome") === "yes";
    welcomeDialog.showModal();
});


// ---------- choose URL or QR code ----------
const tabs = [
    document.getElementById("tab-url"),
    document.getElementById("tab-qr")
];
const choiceHint = document.getElementById("choice-hint");

// show one panel, hide the other, and mark the chosen button
function selectTab(selected, moveFocus) {
    tabs.forEach(function (tab) {
        const isSelected = tab === selected;
        const panel = document.getElementById(tab.getAttribute("aria-controls"));

        tab.setAttribute("aria-selected", isSelected);
        tab.setAttribute("tabindex", isSelected ? "0" : "-1");
        panel.hidden = !isSelected;
    });

    choiceHint.hidden = true;

    if (moveFocus) {
        // arrow keys: keep focus on the choice buttons
        selected.focus();
        return;
    }

    // mouse/tap: put the cursor in the input so the user can start right away
    const panelId = selected.getAttribute("aria-controls");
    const target = panelId === "panel-url"
        ? document.getElementById("url-input")
        : document.getElementById("qr-file");
    target.focus();
}

tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () {
        selectTab(tab, false);
    });

    // arrow keys move between the two choices
    tab.addEventListener("keydown", function (event) {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            const next = tabs[(index + 1) % tabs.length];
            selectTab(next, true);
            event.preventDefault();
        }
    });
});
