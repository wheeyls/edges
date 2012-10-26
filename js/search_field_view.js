(function (global, _) {
  "use strict";
  var UP = 38, DOWN = 40, ESC = 27, RET = 13;

  global.searchFieldView = function (opts) {
    var o = $.extend({
      _: _
    , $el: $('#ajax-search')
    , $form: $('#ajax-search form')
    , inputSelector: 'input#query'
    , template: _.template($('#query-root-jsp').html() || '')
    , itemTemplate: _.template($('#query-item-jsp').html() || '')
    , buttonTemplate: _.template($('#query-button-jsp').html() || '')
    , searchResults: null
    , throttleDelay: 500
    , hiddenClassName: 'js-is-hidden'
    }, opts)
    , me = { }
    ;

    o = $.extend(o, (o.$el.data() || {}));
    me.options = o;

    me.hidden = false;

    me.performSearch = function () {
      var value = me.currentQuery();

      if (value) {
        o.searchResults.runQuery(value);
      } else {
        $(o.searchResults).trigger('update', [[]]);
      }
    };

    me.currentQuery = function () {
      return o.$el.find(o.inputSelector).val();
    };

    me.cursor = (function () {
      var value = 0
        , max = 0
        , pub = {}
        ;

      pub.increment = function () {
        pub.setValue(Math.min(value + 1, max));
      };

      pub.decrement = function () {
        pub.setValue(Math.max(value - 1, 0));
      };

      pub.reset = function () {
        pub.setValue(0);
      };

      pub.getValue = function () {
        return value;
      };

      pub.setValue = function (val) {
        value = val;
        $(pub).trigger('value-changed', value);
      };

      pub.getMax = function () {
        return max;
      };

      pub.setMax = function (val) {
        max = val;
      };

      return pub;
    }());

    me.currentResults = [];

    me.checkIfSelected = function (evt) {
      var index = me.cursor.getValue() - 1;

      if (index >= 0) {
        evt && evt.preventDefault() && evt.stopPropagation();
      }

      return index;
    };

    me.selectCursor = function (evt) {
      var index = me.checkIfSelected(evt), $link, loc;

      if (index >= 0) {
        $link = $("a, .js-result", me.currentResults[index]);
        loc = $link.data('cursor-follows-link') ? $link.attr('href') : false;
        $link.click();
        loc && (global.location.href = loc);
      }
    };

    me.drawCursor = function () {
      var index = me.cursor.getValue() - 1;

      $(me.currentResults).each(function (ind, item) {
        if (ind === index) {
          item.addClass('cursor-selected');
        } else {
          item.removeClass('cursor-selected');
        }
      });
    };

    me.$root = $({});

    me.render = function (dataStream) {
      me.$root = $(o.template());
      o.$el.append(me.$root);
      me.$root.on('click', me.show);

      dataStream(function (results) {
        var items = []
        , q = me.currentQuery() || ''
        , buttonResult = ''
        ;

        me.$root.html('');

        o._(results).forEach(function (res) {
          items.push($(o.itemTemplate(res)));
        });

        buttonResult = o.buttonTemplate({query: q, escaped_query: global.escape(q)});
        buttonResult && items.push($(buttonResult));

        me.currentResults = items;
        me.cursor.setMax(items.length);


        $(items).each(function (ind, item) {
          me.$root.append(item);
        });
      });
    };

    // events
    me.keydown = function (evt) {
      var fn;
      evt = evt || {};

      me.hidden && me.show();

      switch (evt.keyCode) {
      case ESC:
        me.hide();
        break;
      case UP:
        me.cursor.decrement();
        break;
      case DOWN:
        me.cursor.increment();
        break;
      case RET:
        me.selectCursor(evt);
        break;
      default:
        me.cursor.reset();
        me.throttledSearch();
      }
    };

    me.show = function () {
      me.hidden = false;
      me.$root.removeClass(o.hiddenClassName);
    };

    me.hide = function () {
      me.hidden = true;
      me.cursor.reset();
      me.$root.addClass(o.hiddenClassName);
    };

    me.blur = function () {
      global.setTimeout(me.hide, 500);
    };

    me.throttledSearch = o._.throttle(me.performSearch, o.throttleDelay);

    me.focus = function () {
      me.throttledSearch();
      me.show();
    };

    o.$el.find(o.inputSelector)
      .on('focus', me.focus)
      .on('keydown', me.keydown)
      .on('blur', me.blur)
      ;

    o.$form.submit(me.checkIfSelected);

    $(me.cursor).on('value-changed', me.drawCursor);

    //o.$el.find(o.inputSelector).on('keyup', me.performSearch);

    me.render(function (continuation) {
      $(o.searchResults).on('update', function (ev, data) {
        continuation(data);
      });
    });

    me.hide();
    return me;
  };

  $(function () {
    var results = global.searchResults({url: '/products/search.json'})
    , view = global.searchFieldView({searchResults: results});

    $('#vendor-search').each(function () {
      var results = global.searchResults({url: '/vendors.json'})
      , view = global.searchFieldView({
        $el: $('#vendor-search')
      , $form: $('.model-form')
      , inputSelector: 'input'
      , template: _.template($('#vendor-root-jsp').html() || '')
      , itemTemplate: _.template($('#vendor-item-jsp').html() || '')
      , buttonTemplate: _.template($('#vendor-button-jsp').html() || '')
      , searchResults: results
      });

      $(document).on('click', '.js-vendor-result', function (evt) {
        $('#vendor-search > input').val($(this).html());
        evt.preventDefault();
        return false;
      });
    });
  });
}(this, this._));
