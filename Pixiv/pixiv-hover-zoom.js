/* global window, document, jQuery */

// ==UserScript==
// @name         Pixiv hover zoom
// @namespace    https://github.com/rplus
// @version      1.0
// @description  hover zoom for Pixiv
// @author       Rplus
// @include      http://www.pixiv.net/*
// @grant        none
// ==/UserScript==

;(function(window, document, $) {
  'use strict';

  var phzw = $('#pixiv-hz-wrap');
  var phzwPos = [];
  var phzwPattern = /member_illust\.php\?mode=medium&illust_id=(\d+)/;
  var phzwAPI = '//www.pixiv.net/rpc/index.php?mode=get_illust_detail_by_ids&illust_ids=';
  var phzwAPICache = {};
  var imgSize = 'm'; // size: '240mw', m', 'big'
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

  var getAllId = function() {
    var ids = [];

    $.each($('._unit').find('a'), function() {
      var _href = $(this).attr('href');
      var _match = _href && _href.match(phzwPattern);
      if (_match) {
        ids.push(_match.pop());
      }
    });

    return ids;
  };

  var pullIdsData = function(idsArr) {
    var deferred = $.Deferred();

    $.getJSON(phzwAPI + idsArr.join())
      .done(function(data) {

        if (!data.error) {
          for (var _item in data.body) {
            if (data.body.hasOwnProperty(_item)) {
              phzwAPICache[_item] = data.body[_item];
            }
          }
          deferred.resolve(); //update state
        } else {
          deferred.reject();
        }

      })
      .fail(function() {
        deferred.reject();
      });

    return deferred.promise();
  };

  var render = function(_id) {
    var data = phzwAPICache[_id];
    if (!data) { return; }

    if (_id !== phzw.data('id')) {
      var tpl = '<a href="/member_illust.php?mode=medium&illust_id=' + _id + '"><img src="' + data.url[imgSize] + '" title="' + data.illust_title + '"></a>';
      phzw.html(tpl);

      phzw.data('id', _id);
    }

    phzwToggle(true);
  };

  var updatePos = function(ele) {
    var eleRect = ele.getBoundingClientRect();
    phzwPos = [eleRect.top + body.scrollTop + eleRect.height, eleRect.left, -100 * eleRect.left / body.scrollWidth];
  };

  $(function() {

  // phzw init
  if (!phzw.length) {
    $(body).append('<div id="pixiv-hz-wrap" />');
    phzw = $('#pixiv-hz-wrap').css({
      'position': 'absolute',
      'visibility': 'hidden',
      'opacity': 0,
      'box-shadow': '0 0 0 3px #fff, 0 0 3px 3px',
      'transition': 'all .3s',
      'z-index': '1000'
    });

    phzw.on('mouseenter', function() {
      phzw.one('mouseleave', function() {
        phzwToggle(false);
      });
    });
  }

  // delay pre-load data in page
  setTimeout(function() {
    pullIdsData(getAllId());
  }, 1000);

  $('._unit').on('mouseenter.phzw', 'a', function(e) {
    var _match = $(this).attr('href').match(phzwPattern);

    if (!_match) { return; }

    var _id = _match.pop();

    e.stopPropagation();
    updatePos(this);

    if (phzwAPICache[_id]) {
      render(_id);
    } else {
      $.when(pullIdsData([_id]))
        .then(function() {
          render(_id);
        });
    }
  });

  $(document).on('click.phzw', function() {
    phzwToggle(false);
  });

  $('.link-item').eq(0).prepend('<button>-♥ preload all ♥-</button>').find('button').on('click', function(e) {
    e.preventDefault();

    $.when(pullIdsData(getAllId()))
      .then(function() {
        $.each(phzwAPICache, function(key, val) {
          // forcedly preload
          $('<img src="' + val.url[imgSize] + '">');
        });
      });

  });
  });

})(window, document, jQuery, undefined);
