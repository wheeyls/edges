(function (global, $) {
  "use strict";

  global.searchResults = function (opts) {
    var me = {}
    , options = $.extend({
        url: ''
      , method: 'GET'
      , max: 7
      }, opts);


    me.ajaxSuccess = options.ajaxSuccess || function (data) {
      $(me).trigger('update', [data]);
    };

    me.runQuery = function (str) {
      var request
        , params
        ;

      if (!str) { return; }

      params = $.extend({ query: str }, options, {data: {query: str, max: options.max}});

      request = me.fetch(params);

      request.then(me.ajaxSuccess);
    };

    me.fetch = function (params) {
      return $.ajax(params);
    };

    return me;
  };
}(this, this.jQuery));
