var items = [
    ['abcde', [1,2,3,4,5,6,7,8,9,0]]
,   ['aefg',  [11,12,13,14,15,16,17,18,19,20]]
]
, x = {
    a: {b: {}, c: {}, d: {}, e: {}}
,   b: {a: {}, c: {}, d: {}, e: {}}
,   c: {a: {}, b: {}, d: {}, e: {}}
,   d: {a: {}, b: {}, c: {}, e: {}}
,   e: {a: {}, b: {}, c: {}, d: {}}
}
, y = {
    1: {a: 1, b: 1, c: 1, d: 1, e: 1}
,   2: {a: 1, b: 1, c: 1, d: 1, e: 1}
}
, data = {}
//, sampleData = {
//    ab: {{1:1}, {2:1}, {3:0}, {4:0}},
//    ac: {{1:0}, {2:0}, {3:1}, {4:1}},
//    ad: {{1:0}, {2:0}, {3:0}, {4:0}},
//    bc: {{1:0}, {2:0}, {3:0}, {4:0}},
//    bd: {{1:0}, {2:0}, {3:0}, {4:0}},
//    cd: {{1:0}, {2:0}, {3:0}, {4:0}},
//};

function storeCombos(products, features) {
    products.forEach(function (i) {
        products.forEach(function (ii) {
            data[i + ii] = featureMap(data[i + ii], features);
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

function sortForMatrix(products) {
    var features = {};
    products.forEach(function (i) {
        products.forEach(function (ii) {
            var res = data[i + ii]
              , j
              ;

            if (!res) { return; }

            for(j in res) {
                if(!res.hasOwnProperty(j)) { return; }
                features[j] = features[j] || 0;
                features[j] += res[j];
            }
        });
    });
    return features;
}

storeCombos(['sfdc', 'zendesk', 'drupal'], [1,2,3,4,5]);
storeCombos(['sfdc', 'ood', 'mscrm'], [111,222,333]);

sortForMatrix(['sfdc', 'ood', 'zendesk', 'mscrm']).toSource();
