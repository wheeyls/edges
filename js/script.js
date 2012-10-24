(function (_) {
  "use strict";

  var data = {
      products: {}
    , edges: {}
    }
    , matrix
    ;

  function newMatrix() {
    return {
      features: []
    , products: []
    };
  }
  matrix = newMatrix();

  function theTemplate() {
    var temp = _.template($("#li-temp").html());
    theTemplate = function() {
      return temp;
    };
    return temp;
  }

  function renderMatrix() {
    var temp = theTemplate();
    $('#matrix-products').html(temp({items: matrix.products}));
    $('#matrix-features').html(temp({items: matrix.features}));
  }

  function renderProductList() {
    var temp = theTemplate()
      , items = _(data.products).keys()
      ;
    $('#products-list').html(temp({items: items}));
  }

  function createProduct(text) {
    var existing = data.products[text];

    if (existing === undefined) {
      data.products[text] = text;
      matrix.products.push(text);
    }

    renderMatrix();
  }

  function createFeature(text) {
    matrix.features.indexOf(text) < 0 && matrix.features.push(text);

    renderMatrix();
  }

  function guessFeatures() {
    var features = sortForMatrix(matrix.products)
      , names
      ;

    features = sortByValue(features);

    $('#guess').html(JSON.stringify(features));

    _(features).reverse().forEach(function (keyVal) {
      var key = keyVal[0];
      matrix.features.indexOf(key) < 0 && matrix.features.push(key);
    });
  }

  function sortByValue(object) {
    var tuples = _.map(object, function (value, key) { return [key, value]; });
    return _.sortBy(tuples, function (tuple) { return tuple[1]; });
  }

  function addToMatrix() {
    var $$ = $(this)
      , text = $$.html()
      ;

    matrix.products.indexOf(text) < 0 && matrix.products.push(text);
    guessFeatures();
    renderMatrix();
  }

  function dropFeature() {
    var $$ = $(this)
      , text = $$.html()
      , index = matrix.features.indexOf(text)
      ;

    index >= 0 && matrix.features.splice(index, 1);
    renderMatrix();
  }

  function dropProduct() {
    var $$ = $(this)
      , text = $$.html()
      , index = matrix.products.indexOf(text)
      ;

    index >= 0 && matrix.products.splice(index, 1);
    renderMatrix();
  }

  function createItem() {
    var $$ = $(this)
      , $field = $$.find('.text')
      , text = $field.val()
      , type = $$.data('item')
      ;

    type === 'product' ? createProduct(text) : createFeature(text);
    $field.val('');
    return false;
  }

  function storeCombos(products, features) {
    products.forEach(function (i) {
      products.forEach(function (ii) {
        data.edges[i + ii] = featureMap(data.edges[i + ii], features);
      });
    });
  }

  function featureMap(map, features) {
    map = map || {};
    features.forEach(function (val) {
      map[val] = map[val] || 0;
      map[val] += 1;
    });
    return map;
  }

  function saveAndClear() {
    storeCombos(matrix.products, matrix.features);

    clear();
    return false;
  }

  function clear() {
    matrix = newMatrix();
    renderMatrix();
    renderProductList();
    return false;
  }

  function sortForMatrix(products) {
    var features = {};
    products.forEach(function (i) {
      products.forEach(function (ii) {
        var res = data.edges[i + ii]
          , j
          ;

        if (!res) { return; }

        for (j in res) {
          if (!res.hasOwnProperty(j)) { continue; }
          features[j] = features[j] || 0;
          features[j] += res[j];
        }
      });
    });

    return features;
  }

  $(function () {
    $('.creator').on('submit', createItem);
    $('#save').on('click', saveAndClear);
    $('#clear').on('click', clear);
    $(document).on('click', '#products-list li', addToMatrix);
    $(document).on('click', '#matrix-features li', dropFeature);
    $(document).on('click', '#matrix-products li', dropProduct);
  });
  window.data = data;
}(this._));
