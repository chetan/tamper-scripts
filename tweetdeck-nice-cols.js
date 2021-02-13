// ==UserScript==
// @name         Tweetdeck - Nice cols
// @namespace    https://github.com/chetan/tamper-scripts
// @version      0.1
// @description  Clean up column headers
// @author       Chetan Sarva
// @license      MIT
// @match        https://tweetdeck.twitter.com/
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.js
// @include      https://tweetdeck.twitter.com/*
// @run-at       document-end
// ==/UserScript==
// console = unsafeWindow.console;

(function () {
  /**
   * Waits for the given selector to match an element, then resolves the promise.
   *
   * Current timeout is 10sec.
   */
  function waitFor(sel, $ctx) {
    const TIMEOUT = 10000; // in ms
    if (!$ctx) {
      // Use root jquery instance if none given
      $ctx = $;
    }
    return new Promise((resolve, reject) => {
      const start = performance.now();
      const id = setInterval(() => {
        const el = $ctx.find(sel);
        if (el.length === 0) {
          if (performance.now() - start >= TIMEOUT) {
            clearInterval(id);
            reject(new Error(`unable to find ${sel} within 10sec`));
          }
          return;
        }
        // found it!
        clearInterval(id);
        resolve($(el));
      }, 50);
    });
  }

  function onClickRemoveCol(e) {
    const el = $(e.target);

    // open panel
    el.parent().find("i.icon-sliders").click();

    // click remove
    waitFor('.js-column-options i.icon-close', el.parents("section")).then((el) => {
      $(el).click();
    });
  }

  function modifyCol(el) {
    const header = el.find("header");

    // apparently there's a redraw that happens so we may actually need to
    // reapply our changes once in a while.
    if (el.data("nice-cols") && header.find("i.quickclose").length > 0) {
      return;
    }

    // mark as modified whether or not we fail later
    // no need to try again
    el.data("nice-cols", true);

    // figure out col type
    let type = "";
    if (header.find("i.icon-user").length > 0) {
      if (header.find(".column-heading").text() === "Home") {
        type = "home";
      } else {
        type = "user";
      }
    } else if (header.find("i.icon-list").length > 0) {
      type = "list";
    }

    if (type === "home") {
      // don't modify main feed col
      return;
    }

    // Cleanup the header
    if (type === "user" || type === "list") {
      header.find("i.column-type-icon").remove();
      header.find(".column-header-title").css({
        "padding-left": "10px"
      });
    }
    if (type === "user") {
      header.find(".column-heading").remove();
    } else if (type === "list") {
      header.find(".attribution").remove();
    }

    // add quick remove button
    const icon = $.parseHTML(`<i class="icon icon-close quickclose"></i>`);
    $(icon).css({
      color: "#1da1f2",
      cursor: "pointer",
    }).on('click', onClickRemoveCol);
    header.find(".column-header-links").prepend(icon);
  }

  function findCols() {
    // each col is a <section>
    $('section').each(function (idx, el) {
      modifyCol($(el));
    });
  }

  function main() {
    findCols();
  }

  setInterval(() => {
    main();
  }, 1000);
})();
