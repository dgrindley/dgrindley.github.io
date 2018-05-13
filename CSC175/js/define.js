// global array for data to use in table
var currentResults = [];

$(document).ready(function () {
    // click event handlers for dynamic elements (https://stackoverflow.com/a/9331127)
    $("#keywordLinks").on("click", "a.list-group-item", function() {
        // console.log($(this).text());

        for (var i = 0; i < currentResults.length; i++) {
            var r = currentResults[i]; // easier to type

            if (r.keyword == $(this).text()) {
                console.log(r.keyword);

                // populate table with results here!
                // r.data[0].japanese[0].word
                // r.data[0].japanese[1].reading
                // r.data[0].senses[0].english_definitions[#]

                $("#results").find("tr:gt(0)").remove(); // clear rows w/o clearing headings

                // e = entry
                for (var e of r.data) {
                    // this'll cut out alternate spellings/readings, so be careful
                    var word = e.japanese[0].word !== undefined ? e.japanese[0].word : "";
                    var reading = e.japanese[0].reading !== undefined ? e.japanese[0].reading : "";

                    // build english definition
                    var english = "";
                    
                    for (var d of e.senses[0].english_definitions) {
                        english += (d + ", ")
                    }

                    english = english.slice(0, -2); // cut off trailing space + comma

                    console.log(word + " | " + reading + " | " + english);

                    $("#results").append("<tr><td>" + word + "</td><td>" + reading + "</td><td>" + english + "</td></tr>");
                }
            }
        }
    });
});

var getDictEntries = function() {
    var words = [];
    var sentence = $("#sentence").val();

    // get number of asterisks in sentence
    // || []) is a trick to return 0 rather than null for no matches
    var asteriskCount = (sentence.match(/\*/g) || []).length;

    // if number of asterisks is 0 or odd, stop search
    if (asteriskCount == 0) {
        console.log("No words found to define.");
    } else if (asteriskCount % 2 == 1) {
        console.log("Unable to search, perhaps you forgot an asterisk?");
    } else {
        console.log("Searching!");

        var currentWord = "";

        // when true, it is saving a word inside asterisks
        var copying = false;

        // go through sentence, getting each word inside asterisks and pushing them into words
        for (var i = 0; i < sentence.length; i++) {
            currentChar = sentence.charAt(i);

            if (copying && currentChar !== "*") {
                currentWord += currentChar; // append current char in sentence to build word
            }

            if (currentChar === "*") {
                copying = !copying; // switch between true and false upon each asterisk

                if (!copying) {
                    words.push(currentWord);
                    currentWord = ""; // reset word
                }
            }
        }

        console.log(words);
        // console.log(searchJisho(words));
        currentResults = searchJisho(words);
        console.log(currentResults);

        // clear then set up links to words in list group
        $("#keywordLinks").empty();
        for (var w of words) {
            $("#keywordLinks").append('<a href="#" class="list-group-item">' + w + '</a>');
        }
    }
}

// searches Jisho and returns an array containing results
var searchJisho = function(query) {
    // cors.io is a proxy service for bypassing the "No 'Access-Control-Allow-Origin' header" error
    // This is required to avoid making the user change their browser settings and also because GitHub pages
    // seems to not support CORS (although https://stackoverflow.com/a/26417091 says otherwise?)
    var jishoAPI = "https://cors.io/?https://jisho.org/api/v1/search/words?"
    var results = [];

    for (var i = 0; i < query.length; i++) {
        (function(index) {
            $.getJSON(jishoAPI, {
                keyword: query[i]
            })
            .done(function(data) {
                console.log(data);
                data.keyword = query[index];
                results.push(data);
            });
        })(i);
    }

    return results;
}