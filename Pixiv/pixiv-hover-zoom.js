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
  var phzwURL;

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
    var _urlID = _url.match(/id=(\d+)/).pop();

    if (phzwCache[_urlID]) {
      _html = phzwCache[_urlID];
      phzwUpdate(_html, _url);
    } else {
      $.get(_url, function(data) {
        var _img = $('<div />').append(data).find('.works_display img')[0];
        // _img.src = _img.src.replace('c/600x600/img-master', 'img-original').replace('_master1200', '');
        _html = _img.outerHTML;
        phzwCache[_urlID] = _html;
        phzwUpdate(_html, _url);
      });
    }
  };

  if (!phzw.length) {
    $('body').append('<a id="pixiv-hz-wrap" />');
    phzw = $('#pixiv-hz-wrap').css({
      'position': 'absolute',
      'display': 'none',
      'box-shadow': '0 0 5px',
      'z-index': '1000'
    });
  }

  var hoverEvent = function(_this) {
    var bodyRect = document.body.getBoundingClientRect();
    var thisRect = _this.getBoundingClientRect();
    phzwPos = [thisRect.top - bodyRect.top + thisRect.height, thisRect.left, -100 * thisRect.left  / bodyRect.width];
    phzwPull(_this.href);
  };

  $('._unit').on('mouseenter', 'a.work', function() {
    hoverEvent(this);
  });

  $('._unit').on('mouseenter', '.hoverZoomLink', function() {
    hoverEvent(this);
  });

  $(document).on('click', function() {
    phzwToggle(false);
  });

})(window, document, jQuery, undefined);
