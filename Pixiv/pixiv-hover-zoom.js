/* global window, document, jQuery */

// ==UserScript==
// @name         Pixiv hover zoom
// @namespace    https://github.com/rplus
// @version      0.5
// @description  hover zoom for Pixiv
// @author       Rplus
// @include      http://www.pixiv.net/*
// @grant        none
// ==/UserScript==

;(function(window, document, $) {
  'use strict';

  var phzw = $('#pixiv-hz-wrap');
  var phzwCache = {};
  var phzwPos = [];
  var phzwPattern = /member_illust\.php\?mode=medium&illust_id=(\d+)/;
  var phzwURL;
  var phzwOriginImg;
  var body = document.body;

  var phzwToggle = function(_switch) {
    if (_switch) {
      phzw.css({
        'top': phzwPos[0],
        'left': phzwPos[1],
        'opacity': 1,
        'visibility': 'visible',
        'transform': 'translateX(' + phzwPos[2] + '%)'
      });
    } else {
      if ('0' !== phzw[0].style.opacity) {
        phzw.css({
          'visibility': 'hidden',
          'opacity': 0
        });
      }
    }
  };

  var phzwUpdate = function(_html, _url) {
    if (_url !== phzwURL) {
      phzwURL = _url;
      phzw.attr('href', _url).html(_html);
    }
    phzwToggle(true);
  };

  var phzwPull = function(_url, _preload) {
    var _html;
    var _urlID = _url.match(phzwPattern).pop();

    if (phzwCache[_urlID]) {
      _html = phzwCache[_urlID];
      if (!_preload) { phzwUpdate(_html, _url); }
    } else {
      $.get(_url, function(data) {
        var _html;
        if (phzwOriginImg && -1 !== data.indexOf('original-image')) {
          // large image
          _html = data.match(/_illust_modal.+?(<img.+?>)/).pop();
          _html = _html.replace(/(alt=(".+?"))/, '$1 title=$2').replace(/data-src/, 'src');
        } else {
          _html = data.match(/works_display.+?(<img.+?>)/).pop();
          _html = _html.replace(/(alt=(".+?"))/, '$1 title=$2');
        }

        phzwCache[_urlID] = _html;
        if (!_preload) {
          phzwUpdate(_html, _url);
        } else {
          $('<div >').html(_html);
        }
      });
    }
  };

  $(function() {

  // phzw init
  if (!phzw.length) {
    $(body).append('<a id="pixiv-hz-wrap" />');
    phzw = $('#pixiv-hz-wrap').css({
      'position': 'absolute',
      'visibility': 'hidden',
      'opacity': 0,
      'box-shadow': '0 0 0 3px #fff, 0 0 3px 3px',
      'transition': 'all .3s',
      'z-index': '1000'
    });
  }

  $('._unit').on('mouseenter.phzw', 'a', function(e) {
    if ($(this).attr('href').match(phzwPattern)) {
      e.stopPropagation();
      var thisRect = this.getBoundingClientRect();
      phzwPos = [thisRect.top + body.scrollTop + thisRect.height, thisRect.left, -100 * thisRect.left / body.scrollWidth];
      phzwPull(this.href);
    }
  });

  $(document).on('click.phzw', function() {
    phzwToggle(false);
  });

  $('.link-item').eq(0).prepend('<button> ♥ preload all ♥ </button>').find('button').on('click', function(event) {
    event.preventDefault();
    $('._unit').find('a').filter(function() {
      return $(this).attr('href').match(phzwPattern);
    }).each(function() {
      phzwPull(this.href, true);
    });

  });
  });

})(window, document, jQuery, undefined);
