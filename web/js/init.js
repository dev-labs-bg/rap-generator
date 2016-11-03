/**
 * This file contains the two initial requests for fetching authors and beats
 * they are needed in order to fill the selectize input with artists
 * and the select element with beats
 */
API.fetchAuthors(function callback(data) {
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


API.fetchBeats(function callback(beats) {
    console.log("beats fetched", beats);
    recorderInstance.initAudio(beats[0].url);
    beats.forEach(function (element) {
        var temp = document.createElement('option');
        temp.setAttribute("value", element.url);
        temp.innerHTML = element.id;
        selectList.appendChild(temp);
    });
    selectList.selectedIndex = 0;
});