(function () {
  "use strict";

  /* ------------------------------------------------------------------
     SETTINGS: edit these three lines. Everything works without them.
     ------------------------------------------------------------------ */
  var WHATSAPP_NUMBER = "233244571482";

  // Optional: email Felma a copy of every order. Paste your form URL from a
  // service such as Formspree (https://formspree.io/f/xxxx) or Web3Forms.
  // Leave "" to skip.
  var ORDER_ENDPOINT = "";
  // Extra fields some services need, e.g. { access_key: "YOUR_KEY" } for Web3Forms.
  var ORDER_EXTRA_FIELDS = {};

  // Optional: a payment link for deposits (Paystack, Flutterwave or Hubtel
  // payment page). Leave "" to hide the "Pay deposit" box.
  var PAYMENT_LINK = "";
  /* ------------------------------------------------------------------ */

  // Footer year
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Mobile navigation
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "Close" : "Menu";
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "Menu";
        toggle.focus();
      }
    });
  }

  // Order form
  var form = document.getElementById("order-form");
  if (form) {
    var dateInput = form.querySelector("#needed-by");
    if (dateInput) dateInput.min = new Date().toISOString().split("T")[0];

    // Preselect from the link, e.g. contact.html?type=Wedding
    var params = new URLSearchParams(window.location.search);
    var preset = params.get("type");
    var select = form.querySelector("#cake-type");
    if (preset && select) {
      for (var i = 0; i < select.options.length; i++) {
        if (select.options[i].value.toLowerCase() === preset.toLowerCase()) {
          select.selectedIndex = i;
        }
      }
    }

    // Show the deposit box only when a payment link is set
    var payBox = document.getElementById("pay-box");
    var payLink = document.getElementById("pay-link");
    if (payBox && payLink && PAYMENT_LINK) {
      payLink.href = PAYMENT_LINK;
      payBox.hidden = false;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      var data = new FormData(form);
      var isClass = data.get("type") === "Cake class";
      var lines = [
        isClass
          ? "Hello Felma Cakes, I'd like to ask about your cake classes."
          : "Hello Felma Cakes, I'd like to order a cake.",
        "",
        "Name: " + data.get("name"),
        (isClass ? "Enquiry: " : "Cake type: ") + data.get("type")
      ];
      if (data.get("date")) lines.push((isClass ? "Preferred start: " : "Needed by: ") + data.get("date"));
      if (data.get("details")) lines.push("Details: " + data.get("details"));

      // Open WhatsApp first so the browser treats it as a direct tap
      var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(lines.join("\n"));
      window.open(url, "_blank", "noopener");

      // Optional email copy for Felma's records
      if (ORDER_ENDPOINT) {
        var payload = Object.assign({}, ORDER_EXTRA_FIELDS, {
          name: data.get("name"),
          type: data.get("type"),
          date: data.get("date") || "",
          details: data.get("details") || ""
        });
        fetch(ORDER_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true
        }).catch(function () { /* the WhatsApp message is the main route */ });
      }
    });
  }
})();
