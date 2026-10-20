/* ============================================================
   LAB — shared controls for the hero previews:
   page switcher, text on/off (remembered), and a hint that fades after first use.
   ============================================================ */
(function () {
  "use strict";

  var PAGES = [["waves", "Waves"], ["flow", "Flow"], ["name", "Name"]];
  var current = document.body.getAttribute("data-fx");

  var bar = document.createElement("nav");
  bar.className = "lab-bar";
  bar.setAttribute("aria-label", "Hero previews");
  var html = '<a href="./">← Lab</a>';
  PAGES.forEach(function (p) {
    html += '<a href="' + p[0] + '.html"' + (p[0] === current ? ' aria-current="page"' : "") + ">" + p[1] + "</a>";
  });
  html += '<button type="button" aria-pressed="true" title="Show or hide the hero text">Text</button>';
  bar.innerHTML = html;
  document.body.appendChild(bar);

  var btn = bar.querySelector("button");
  function setText(on) {
    document.body.classList.toggle("lab-notext", !on);
    btn.setAttribute("aria-pressed", String(on));
    try { localStorage.setItem("lab-text", on ? "1" : "0"); } catch (e) {}
  }
  var saved = null;
  try { saved = localStorage.getItem("lab-text"); } catch (e) {}
  setText(saved !== "0");
  btn.addEventListener("click", function () {
    setText(document.body.classList.contains("lab-notext"));
  });

  var hint = document.querySelector(".lab-hint");
  if (hint) {
    var isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    var text = hint.getAttribute(isTouch ? "data-touch" : "data-mouse");
    if (text) hint.textContent = text;
    var hide = function () { hint.classList.add("is-gone"); };
    window.addEventListener("pointerdown", function (e) {
      if (!e.target.closest(".lab-bar")) hide();
    });
    setTimeout(hide, 10000);
  }

  // effects ignore input that lands on the control bar or a real link/button
  window.labIgnore = function (e) {
    return !!(e.target.closest && e.target.closest(".lab-bar, a, button"));
  };
})();
