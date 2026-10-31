var shorteners = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "cutt.ly", "is.gd", "rb.gy"];
var scamWords = ["urgent", "verify", "suspended", "winner", "prize", "free gift", "password", "click here", "bank account"];

if (localStorage.getItem("theme") == "light") {
    document.body.classList.add("light");
}
updateThemeButton();

function toggleTheme() {
    document.body.classList.toggle("light");

    if (document.body.classList.contains("light")) {
        localStorage.setItem("theme", "light");
    } else {
        localStorage.setItem("theme", "dark");
    }

    updateThemeButton();
}

function updateThemeButton() {
    var button = document.getElementById("theme-toggle");

    if (document.body.classList.contains("light")) {
        button.value = "Night mode";
    } else {
        button.value = "Light mode";
    }
}


var welcome = document.getElementById("welcome-dialog");

if (welcome != null) {
    if (localStorage.getItem("hideWelcome") != "yes") {
        welcome.showModal();
    }

    welcome.onclick = function (event) {
        if (event.target == welcome) {
            closeWelcome();
        }
    };
}

function openWelcome() {
    var box = document.getElementById("dont-show-again");
    box.checked = (localStorage.getItem("hideWelcome") == "yes");
    welcome.showModal();
}

function closeWelcome() {
    var box = document.getElementById("dont-show-again");

    if (box.checked) {
        localStorage.setItem("hideWelcome", "yes");
    } else {
        localStorage.removeItem("hideWelcome");
    }

    welcome.close();
}

function chooseFromPopup(which) {
    closeWelcome();
    chooseCheck(which);
}


function chooseCheck(which) {
    var names = ["url", "msg", "qr"];
    var fields = {url: "url-input", msg: "msg-input", qr: "qr-file"};

    for (var i = 0; i < names.length; i++) {
        var tab = document.getElementById("tab-" + names[i]);
        var panel = document.getElementById("panel-" + names[i]);

        if (names[i] == which) {
            tab.className = "tab tab-on";
            panel.className = "panel on";
        } else {
            tab.className = "tab";
            panel.className = "panel";
        }
    }

    document.getElementById("result").style.display = "none";
    document.getElementById(fields[which]).focus();
}


function showResult(title, level, site, reasons) {
    var box = document.getElementById("result");
    var list = document.getElementById("result-list");

    document.getElementById("result-title").textContent = title;
    document.getElementById("result-site").textContent = site;

    list.innerHTML = "";
    for (var i = 0; i < reasons.length; i++) {
        list.innerHTML = list.innerHTML + "<li>" + reasons[i] + "</li>";
    }

    box.className = "card result " + level;
    box.style.display = "block";
    box.scrollIntoView();
}

function analyze(text) {
    var clean = text.split("\n").join(" ");
    var lowerText = clean.toLowerCase();
    var reasons = [];
    var link = "";
    var host = "";

    var words = clean.split(" ");
    for (var i = 0; i < words.length; i++) {
        var word = words[i].toLowerCase();
        if (word.indexOf("http://") == 0 || word.indexOf("https://") == 0 || word.indexOf("www.") == 0) {
            link = words[i];
            break;
        }
    }

    if (link != "") {
        var lowerLink = link.toLowerCase();
        var rest = lowerLink;

        if (rest.indexOf("://") > -1) {
            rest = rest.split("://")[1];
        }
        host = rest.split("/")[0];

        if (lowerLink.indexOf("http://") == 0) {
            reasons.push("The link does not use HTTPS, so the connection is not secure.");
        }

        var digits = host.split(".").join("");
        if (digits != "" && !isNaN(digits)) {
            reasons.push("The link uses a number address instead of a normal website name.");
        }

        if (lowerLink.indexOf("@") > -1) {
            reasons.push("The link has an @ sign, which can hide the real website.");
        }

        for (var j = 0; j < shorteners.length; j++) {
            if (host == shorteners[j]) {
                reasons.push("It is a short link, so you can't see where it really goes.");
            }
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

    for (var k = 0; k < scamWords.length; k++) {
        if (lowerText.indexOf(scamWords[k]) > -1) {
            reasons.push("The message uses a pressure word: " + scamWords[k] + ".");
        }
    }

    var site = "";
    if (host != "") {
        site = "Website: " + host;
    }

    if (link == "" && reasons.length == 0) {
        showResult("No link found", "warn", "", ["Paste a full link, like https://example.com, to check it."]);
    } else if (reasons.length == 0) {
        showResult("Looks safe", "safe", site, ["No common warning signs found."]);
    } else if (reasons.length == 1) {
        showResult("Be careful", "warn", site, reasons);
    } else {
        showResult("Dangerous, do not open", "danger", site, reasons);
    }
}

function checkLink() {
    analyze(document.getElementById("url-input").value);
    return false;
}

function checkMessage() {
    analyze(document.getElementById("msg-input").value);
    return false;
}

function checkQR() {
    var file = document.getElementById("qr-file").value;

    if (file == "") {
        showResult("No image chosen", "warn", "", ["Choose a QR code image first."]);
    } else {
        showResult("Check the link inside the code", "warn", "", [
            "Read the code with your phone camera, but do not open the link.",
            "Copy the web address, then use the Link tab to check it."
        ]);
    }

    return false;
}
