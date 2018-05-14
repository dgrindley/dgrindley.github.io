// global array for data to use in table
var currentResults = [];

// keyword that is currently being looked at
var currentKeyword = "";

$(document).ready(function () {
    // search upon pressing enter
    $("#sentence").keyup(function(event) {
        if (event.keyCode === 13) {
            $("#define").click();
        }
    });

    // click event handlers for dynamic elements (https://stackoverflow.com/a/9331127)
    $("#keywordLinks").on("click", "a.list-group-item", function() {
        currentKeyword = $(this).text();

        for (var i = 0; i < currentResults.length; i++) {
            var r = currentResults[i]; // r = result, easier to type

            if (r.keyword === currentKeyword) {
                // populate table with results
                $("#results").find("tr:gt(0)").remove(); // clear rows w/o clearing headings

                // e = entry
                for (var e of r.data) {
                    var reading = e.japanese[0].reading !== undefined ? e.japanese[0].reading : "";
                    var word = e.japanese[0].word !== undefined ? e.japanese[0].word : reading;

                    // build english definition
                    var english = "";
                    
                    // only get most common english definitions
                    // words like 出る have >100 definitions and it would be inconvenient to show them all
                    for (var d of e.senses[0].english_definitions) {
                        english += (d + ", ")
                    }

                    english = english.slice(0, -2); // cut off trailing space + comma

                    $("#results tbody").append("<tr title='" + word + "'><td>" + word + "</td><td>" + reading + "</td><td>" + english + "</td></tr>");
                }
            }
        }
    });

    // detailed view of entry through modal
    $("#results tbody").on("click", "tr", function() {
        var currentWord = $(this).attr("title");

        // set data for modal
        $("#modalTitle").text(currentWord);

        var currentRow = $(this).closest("tr").index(); // index of row

        for (var i = 0; i < currentResults.length; i++) {
            if (currentResults[i].keyword === currentKeyword) {
                var modalEntry = currentResults[i].data[currentRow];

                // show/hide common badge
                $("#modalCommon").prop("hidden", !modalEntry.is_common); 

                // words + readings
                $("#modalWords").empty();
                $("#modalReadings").empty();

                for (var j of modalEntry.japanese) {
                    // if there is no reading, word is guaranteed
                    if (j.reading !== undefined) {
                        $("#modalReadings").append(j.reading + "<br>");
                    } else {
                        $("#modalReadings").append(j.word + "<br>");
                    }

                    // if there is no word, reading is guaranteed
                    if (j.word !== undefined) {
                        $("#modalWords").append(j.word + "<br>");
                    } else {
                        $("#modalWords").append(j.reading + "<br>");
                    }
                }

                // english
                var english = "";
                    
                // only most common definitions
                for (var d of modalEntry.senses[0].english_definitions) {
                    english += (d + ", ")
                }

                english = english.slice(0, -2); // cut off trailing space + comma

                $("#modalEnglish").text(english);

                // if there are definitions not shown, provide link to view them on Jisho
                if (modalEntry.senses.length > 1) {
                    $("#modalEnglish").append("<br><a href='https://jisho.org/search/" + currentWord + "'>See more definitions on Jisho.org");
                }

                // parts of speech
                var partsOfSpeech = "";

                if (modalEntry.senses[0].parts_of_speech.length > 0) {
                    for (var p of modalEntry.senses[0].parts_of_speech) {
                        partsOfSpeech += (p + ", ");
                    }

                    partsOfSpeech = partsOfSpeech.slice(0, -2); // cut off trailing space + comma
                }

                $("#modalPartsOfSpeech").text(partsOfSpeech);

                // info
                var info = "";

                if (modalEntry.senses[0].info.length > 0) {
                    for (var f of modalEntry.senses[0].info) {
                        info += (f, ", ");
                    }

                    info = info.slice(0, -2); // cut off trailing space + comma
                }

                $("#modalInfo").text(info);

                // links
                var links = "";

                if (modalEntry.senses[0].links.length > 0) {
                    for (var l of modalEntry.senses[0].links) {
                        links += "<a href='" + l.url + "'>" + l.text + "</a><br>";
                    }
                }

                $("#modalLinks").html(links);

                // see also
                var seeAlso = "";

                if (modalEntry.senses[0].see_also.length > 0) {
                    for (var sa of modalEntry.senses[0].see_also) {
                        seeAlso += "<a href='https://jisho.org/search/" + sa + "'>" + sa + "</a><br>";
                    }
                }

                $("#modalSeeAlso").html(seeAlso);

                // tags
                var tags = "";

                if (modalEntry.senses[0].tags.length > 0) {
                    for (var t of modalEntry.senses[0].tags) {
                        tags += "<span class='badge badge-info'>" + t + "</span> ";
                    }
                }

                $("#modalTags").html(tags);
            }
        }

        // pop up the modal
        $("#detailModal").modal("show");
    });
});

var thankUser = function() {
    if ($("#feedbackForm")[0].checkValidity()) {
        alert("Thanks for the feedback! I'll try to get back to you within the next 48 hours.");
        $("#feedbackModal").modal("hide");
    }
}

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

        currentResults = searchJisho(words);

        // clear then set up links to words in list group
        $("#keywordLinks").empty();
        for (var w of words) {
            if (w != "") {
                $("#keywordLinks").append('<a href="#" class="list-group-item">' + w + '</a>');
            }
        }
    }
}

// searches Jisho and returns an array containing results
var searchJisho = function(query) {
    // cors.io is a proxy service for bypassing the "No 'Access-Control-Allow-Origin' header" error
    // this is required to avoid making the user change their browser settings and also because GitHub pages
    // seems to not support CORS (although https://stackoverflow.com/a/26417091 says otherwise?)
    var jishoAPI = "https://cors.io/?https://jisho.org/api/v1/search/words?"
    var results = [];

    for (var i = 0; i < query.length; i++) {
        if (query[i] != "") {
            (function(index) {
                $.getJSON(jishoAPI, {
                    keyword: query[i]
                })
                .done(function(data) {
                    data.keyword = query[index];
                    results.push(data);
                });
            })(i);
        }
    }

    return results;
}