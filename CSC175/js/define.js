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
        console.log(searchJisho(words));
    }
}

var searchJisho = function(query) {
    // var jishoAPI = "http://jisho.org/api/v1/search/words?keyword="
    var jishoAPI = "http://jisho.org/api/v1/search/words?"
    var results = [];

    for (var i = 0; i < query.length; i++) {
        $.getJSON(jishoAPI, {
            keyword: query[i]
        })
        .done(function(data) {
            console.log(data);
            results[i] = data;
        });
    }

    return results;
}