// ==UserScript==
// @name         Tweetdeck - Add user col
// @namespace    https://github.com/chetan/tamper-scripts
// @version      0.2
// @description  Add a user column with a single click
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

  // step3
  function clickAddColumn() {
    waitFor('button.js-add-column').then((el) => {
      el.click();
      $('.js-modal-panel .icon-close').click();
    });
  }

  // step 2
  function clickTweetsButton() {
    waitFor('.js-modal-context .icon-twitter-bird').then((el) => {
      el.click();
      clickAddColumn();
    });
  }

  // step 1
  function onAddClick(e) {
    const el = $(e.target);
    const tweet = $(el).parents('.tweet');
    tweet
      .find('.account-inline')
      .first()
      .click();
    clickTweetsButton();
  }

  function addPlusButton() {
    $('span.username').each(function () {
      const username = $(this).text();
      const tweet = $(this).parents('.tweet');
      if (tweet.find('.quick-plus').length > 0) {
        return;
      }

      const icon = tweet.find('.avatar');
      if (icon.length === 0) {
        return;
      }

      const a = $.parseHTML(`<a title="Add ${username} in new column" class="quick-plus"><i class="icon icon-plus"></i> add</a>`)
      let top = icon.offsetParent().position().top + 36;
      if (top < 44) {
        top = 44;
      }
      $(a).css({
        position: 'absolute',
        left: '8px',
        top: `${top}px`,
        "font-size": "12px",
      });
      $(a).find("i").css({
        top: "2px",
        position: "relative",
        left: "-1px",
        "font-size": "14px",
      })

      tweet.find('.tweet-body').after(a);
      $(a).on('click', onAddClick);
    });
  }

  function main() {
    addPlusButton();
  }

  setInterval(() => {
    main();
  }, 1000);
})();
