API.fetchAuthors(function callback(data){
    authorsSelector.disabled = false;
    $select = $('#authors_selector').selectize({
        maxItems: null,
        valueField: 'slug',
        labelField: 'name',
        searchField: 'name',
        options: data,
        create: false
    });
    console.log("authors fetched");
});


API.fetchBeats(function callback(data){
    console.log("beats fetched", data);
});