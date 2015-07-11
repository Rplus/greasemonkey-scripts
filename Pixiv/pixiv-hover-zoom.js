/* global window, document, jQuery */

// ==UserScript==
// @name         Pixiv hover zoom
// @namespace    https://github.com/rplus
// @version      0.3
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
  var body = document.body;

  var phzwToggle = function(_switch) {
    if (_switch) {
      phzw.css({
        'top': phzwPos[0],
        'left': phzwPos[1],
        'transform': 'translateX(' + phzwPos[2] + '%)'
      }).fadeIn();
    } else {
      if ('none' !== phzw[0].style.display) {
        phzw.fadeOut();
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

  var phzwPull = function(_url) {
    var _html;
    var _urlID = _url.match(phzwPattern).pop();

    if (phzwCache[_urlID]) {
      _html = phzwCache[_urlID];
      phzwUpdate(_html, _url);
    } else {
      $.get(_url, function(data) {
        var clonePage = $('<div />').append(data);
        var _img = clonePage.find('.works_display img');

        // // big img
        // var _oImg = clonePage.find('.original-image');
        // _oImg.attr('src', _oImg.attr('data-src'));
        // if (_oImg.attr('data-src')) {
        //   _img = _oImg;
        // }

        _img.attr('title', _img[0].alt);

        _html = _img[0].outerHTML;
        phzwCache[_urlID] = _html;
        phzwUpdate(_html, _url);
      });
    }
  };

  if (!phzw.length) {
    $(body).append('<a id="pixiv-hz-wrap" />');
    phzw = $('#pixiv-hz-wrap').css({
      'position': 'absolute',
      'display': 'none',
      'box-shadow': '0 0 5px',
      'z-index': '1000'
    });
  }

  var hoverEvent = function(_this) {
    var thisRect = _this.getBoundingClientRect();
    phzwPos = [thisRect.top + body.scrollTop + thisRect.height, thisRect.left, -100 * thisRect.left / body.scrollWidth];
    phzwPull(_this.href);
  };

  $('._unit').on('mouseenter.phzw', 'a', function() {
    if ($(this).attr('href').match(phzwPattern)) {
      hoverEvent(this);
    }
  });

  });

  $(document).on('click', function() {
    phzwToggle(false);
  });

})(window, document, jQuery, undefined);
