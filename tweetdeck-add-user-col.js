// ==UserScript==
// @name         Tweetdeck - Add user col
// @namespace    https://github.com/chetan/tamper-scripts
// @version      0.1
// @description  Add a user column with a single click
// @author       Chetan Sarva
// @match        https://tweetdeck.twitter.com/
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.js
// @include      https://tweetdeck.twitter.com/*
// @run-at       document-end
// ==/UserScript==
// console = unsafeWindow.console;

(function() {
  function waitFor(sel) {
    return new Promise((resolve, reject) => {
      const start = performance.now();
      const id = setInterval(() => {
        const el = $(sel);
        if (el.length === 0) {
          if (performance.now() - start >= 10000) {
            clearInterval(id);
            reject(new Error(`unable to find ${sel} within 10sec`));
          }
          return;
        }
        // found it!
        clearInterval(id);
        resolve(el);
      }, 50);
    });
  }

  function clickAddColumn() {
    waitFor('button.js-add-column').then((el) => {
      el.click();
      $('.js-modal-panel .icon-close').click();
    });
  }

  function clickTweetsButton() {
    waitFor('.js-modal-context .icon-twitter-bird').then((el) => {
      el.click();
      clickAddColumn();
    });
  }

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
    $('span.username').each(function() {
      // const username = $(this).text();
      const tweet = $(this).parents('.tweet');
      if (tweet.find('.quick-plus').length > 0) {
        return;
      }

      const icon = tweet.find('.avatar');
      if (icon.length === 0) {
        return;
      }

      const a = document.createElement('a');
      a.className = 'quick-plus';
      // a.setAttribute('data-username', username);
      a.innerText = 'add';
      let top = icon.offsetParent().position().top + 36;
      if (top < 44) {
        top = 44;
      }
      $(a).css({
        position: 'absolute',
        left: '15px',
        top: `${top}px`,
      });
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
