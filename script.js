var themeButton = document.getElementById("theme-toggle");

function updateThemeButton() {
    if (document.body.classList.contains("light")) {
        themeButton.textContent = "Night mode";
    } else {
        themeButton.textContent = "Light mode";
    }
}

if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light");
}
updateThemeButton();

themeButton.addEventListener("click", function () {
    document.body.classList.toggle("light");

    if (document.body.classList.contains("light")) {
        localStorage.setItem("theme", "light");
    } else {
        localStorage.setItem("theme", "dark");
    }

    updateThemeButton();
});


var welcome = document.getElementById("welcome-dialog");

if (welcome !== null) {
    var dontShow = document.getElementById("dont-show-again");
    var helpButton = document.getElementById("help-btn");
    var tabUrl = document.getElementById("tab-url");
    var tabQr = document.getElementById("tab-qr");
    var tabs = [tabUrl, tabQr];
    var choiceHint = document.getElementById("choice-hint");
    var urlInput = document.getElementById("url-input");
    var qrFile = document.getElementById("qr-file");
    var resultBox = document.getElementById("result");

    function saveWelcomeChoice() {
        if (dontShow.checked) {
            localStorage.setItem("hideWelcome", "yes");
        } else {
            localStorage.removeItem("hideWelcome");
        }
    }

    function openWelcome() {
        dontShow.checked = localStorage.getItem("hideWelcome") === "yes";
        welcome.showModal();
    }

    function selectTab(name, moveFocus) {
        var selected = name === "qr" ? tabQr : tabUrl;

        tabs.forEach(function (tab) {
            var isSelected = tab === selected;
            document.getElementById(tab.getAttribute("aria-controls")).hidden = !isSelected;
            tab.setAttribute("aria-selected", isSelected);
            tab.setAttribute("tabindex", isSelected ? "0" : "-1");
        });

        choiceHint.hidden = true;
        resultBox.hidden = true;

        if (moveFocus) {
            selected.focus();
        } else if (name === "qr") {
            qrFile.focus();
        } else {
            urlInput.focus();
        }
    }

    if (localStorage.getItem("hideWelcome") !== "yes") {
        welcome.showModal();
    }

    helpButton.addEventListener("click", openWelcome);

    document.querySelectorAll("[data-choice]").forEach(function (button) {
        button.addEventListener("click", function () {
            saveWelcomeChoice();
            welcome.close();
            selectTab(button.getAttribute("data-choice"), false);
        });
    });

    welcome.addEventListener("click", function (event) {
        if (event.target === welcome) {
            saveWelcomeChoice();
            welcome.close();
        }
    });

    tabs.forEach(function (tab, index) {
        tab.addEventListener("click", function () {
            selectTab(tab === tabQr ? "qr" : "url", false);
        });

        tab.addEventListener("keydown", function (event) {
            if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                var next = tabs[(index + 1) % tabs.length];
                selectTab(next === tabQr ? "qr" : "url", true);
                event.preventDefault();
            }
        });
    });


    var shorteners = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "cutt.ly", "is.gd", "rb.gy"];
    var scamWords = ["urgent", "verify", "suspended", "winner", "prize", "free gift", "password", "click here", "bank account"];

    function showResult(title, level, site, reasons) {
        var list = document.getElementById("result-list");

        document.getElementById("result-title").textContent = title;
        document.getElementById("result-site").textContent = site;

        list.innerHTML = "";
        reasons.forEach(function (reason) {
            var item = document.createElement("li");
            item.textContent = reason;
            list.appendChild(item);
        });

        resultBox.className = "card result " + level;
        resultBox.hidden = false;
        resultBox.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    function analyze(text, prefix) {
        var lowerText = text.toLowerCase();
        var reasons = [];
        var link = "";
        var host = "";
        var words = text.split(/\s+/);

        for (var i = 0; i < words.length; i++) {
            var word = words[i].toLowerCase();
            if (word.indexOf("http://") === 0 || word.indexOf("https://") === 0 || word.indexOf("www.") === 0) {
                link = words[i];
                break;
            }
        }

        if (link !== "") {
            var lowerLink = link.toLowerCase();
            var rest = lowerLink;

            if (rest.indexOf("://") > -1) {
                rest = rest.split("://")[1];
            }
            host = rest.split("/")[0];

            if (lowerLink.indexOf("http://") === 0) {
                reasons.push("The link does not use HTTPS, so the connection is not secure.");
            }

            var digits = host.split(".").join("");
            if (digits !== "" && !isNaN(digits)) {
                reasons.push("The link uses a number address instead of a normal website name.");
            }

            if (lowerLink.indexOf("@") > -1) {
                reasons.push("The link has an @ sign, which can hide the real website.");
            }

            if (shorteners.indexOf(host) > -1) {
                reasons.push("It is a short link, so you cannot see where it really goes.");
            }

            if (host.indexOf("xn--") > -1) {
                reasons.push("The website name uses look-alike letters.");
            }

            if (host.split(".").length > 4) {
                reasons.push("The link has too many parts before the main website name.");
            }

            if (link.length > 75) {
                reasons.push("The link is very long.");
            }
        }

        scamWords.forEach(function (scamWord) {
            if (lowerText.indexOf(scamWord) > -1) {
                reasons.push("The message uses a pressure word: " + scamWord + ".");
            }
        });

        var site = host !== "" ? "Website: " + host : "";
        if (prefix) {
            var shown = text.length > 90 ? text.slice(0, 90) + "..." : text;
            site = prefix + shown;
        }

        if (link === "" && reasons.length === 0) {
            showResult("No link found", "warn", prefix ? site : "", ["Paste a full link, like https://example.com, to check it."]);
        } else if (reasons.length === 0) {
            showResult("Looks safe", "safe", site, ["We did not find common warning signs."]);
        } else if (reasons.length === 1) {
            showResult("Be careful", "warn", site, reasons);
        } else {
            showResult("Dangerous: do not open", "danger", site, reasons);
        }
    }

    document.getElementById("url-form").addEventListener("submit", function (event) {
        event.preventDefault();
        analyze(urlInput.value, "");
    });


    function readQR(file, done) {
        var reader = new FileReader();

        reader.onload = function () {
            var image = new Image();

            image.onload = function () {
                var scale = Math.min(1, 1000 / Math.max(image.width, image.height));
                var canvas = document.createElement("canvas");
                canvas.width = Math.round(image.width * scale);
                canvas.height = Math.round(image.height * scale);

                var context = canvas.getContext("2d");
                context.drawImage(image, 0, 0, canvas.width, canvas.height);

                var pixels = context.getImageData(0, 0, canvas.width, canvas.height);
                var code = jsQR(pixels.data, canvas.width, canvas.height);
                done(code ? code.data : null);
            };

            image.onerror = function () {
                done(null);
            };

            image.src = reader.result;
        };

        reader.readAsDataURL(file);
    }

    document.getElementById("qr-form").addEventListener("submit", function (event) {
        event.preventDefault();
        var file = qrFile.files[0];

        if (!file) {
            showResult("No image chosen", "warn", "", ["Please choose a QR code image first."]);
            return;
        }

        if (typeof jsQR === "undefined") {
            showResult("QR reader not loaded", "warn", "", [
                "Check your internet connection and reload the page.",
                "You can also scan the code with your phone camera and paste the address in the link box."
            ]);
            return;
        }

        readQR(file, function (text) {
            if (text === null) {
                showResult("QR code not found", "warn", "", [
                    "We could not read a QR code in this image.",
                    "Try a clearer picture where the whole code is visible."
                ]);
            } else {
                analyze(text, "QR code says: ");
            }
        });
    });
}
