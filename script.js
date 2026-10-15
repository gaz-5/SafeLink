// dark/light mode switch
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
