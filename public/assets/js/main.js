console.log("JSON is working");

async function getData(word) {
    let url = `https://dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=70f34083-431b-4637-b6d9-90d8498b8c67`;

    try {
        let result = await fetch(url);
        let jsonResult = await result.json();
        console.log(jsonResult);

        const displayArea = document.getElementById("definition-display");
        displayArea.innerHTML = ""; // Clear previous results

        // If the API returns an array of suggestion strings instead of the word data
        // Conditional (ternary) operator to make it cleaner
        // shorthand: condition ? exprIfTrue : exprIfFalse

        // if length of result is empty, meaning no results, show result
        // else check the word data, pronunciation, audio file, part of speech, and definition list
        jsonResult.length > 0 && typeof jsonResult[0] === "string"
            ? displayArea.innerHTML = `<p>No exact match found. Did you mean: ${jsonResult.join(", ")}?</p>`
            : jsonResult.length > 0
                ? (() => {
                    const wordData = jsonResult[0];
                    const pronunciation = wordData.hwi.prs ? wordData.hwi.prs[0].mw : "No pronunciation available";
                    const audioFile = wordData.hwi.prs && wordData.hwi.prs[0].sound ? wordData.hwi.prs[0].sound.audio : null;
                    const partOfSpeech = wordData.fl;
                    const definitionList = wordData.shortdef ? wordData.shortdef : ["No definition available"];

                    // Generating pills for synonyms without duplicates
                    const synonymsData = wordData.syns && wordData.syns.length > 0 ? wordData.syns[0].pt : null;
                    let synonyms = [];
                    const uniqueSynonyms = new Set();

                    // duplicate check
                    synonymsData
                        ? synonymsData
                            .map(synEntry => {
                                if (Array.isArray(synEntry) && synEntry[0] === "text") {
                                    const scMatches = synEntry[1].match(/{sc}([^}]+){\/sc}/g);
                                    return scMatches
                                        ? scMatches.map(sc => {
                                            const synonym = sc.replace(/{sc}|{\/sc}/g, ""); // Remove tags
                                            if (!uniqueSynonyms.has(synonym)) {
                                                uniqueSynonyms.add(synonym);
                                                synonyms.push(synonym);
                                            }
                                            return synonym;
                                        })
                                        : [];
                                }
                                return [];
                            })
                            .flat()
                        : synonyms = [];

                    const synonymPills = synonyms.length > 0
                        ? synonyms.map(syn => `<span class="pill">${syn}</span>`).join(" ")
                        : "No synonyms available";

                    // Etymology - remove <p> tag
                    const etymology = wordData.et && wordData.et.length > 0
                        ? wordData.et.map(ety => `<p>${ety[1].replace(/{[^}]+}/g, "")}</p>`).join("") // Remove all tags
                        : "No etymology available";

                    // Example Sentences - remove and vis <p> tag
                    const examples = wordData.def && wordData.def[0].sseq[0][0][1].dt
                        ? wordData.def[0].sseq[0][0][1].dt
                            .filter(item => item[0] === "vis")
                            .map(item => `<p>"${item[1][0].t.replace(/{[^}]+}/g, "")}"</p>`) // Remove all tags and add quotes
                            .join("")
                        : "No examples available";

                    // Display the word data
                    displayArea.innerHTML = `
                        <div class="definition-section">
                            <p id="keyword"><strong>${word}</strong></p>
                            <p class="pronunciation">Pronunciation: ${pronunciation}</p>
                            ${audioFile ? `<audio class="audio-player" controls><source src="https://media.merriam-webster.com/audio/prons/en/us/mp3/${audioFile.charAt(0)}/${audioFile}.mp3" type="audio/mp3"></audio>` : ""}
                            <p class="definition"><strong>Definitions:</strong></p>
                            <ul>
                                ${definitionList.map(def => `<li>${def}</li>`).join("")}
                            </ul>
                            <p class="etymology"><strong>Etymology:</strong> ${etymology}</p>
                            <p class="example-sentences"><strong>Example Sentences:</strong> ${examples}</p>
                        </div>
                        <div class="synonyms"><strong>Synonyms:</strong> ${synonymPills}</div>
                    `;
                })()
                : displayArea.innerHTML = `<p>No results found.</p>`;

    } catch (error) {
        console.log(`error: `, error);
        document.getElementById("definition-display").innerHTML = "<p>An error occurred. Please try again.</p>";
    }
}

// If user clicks, you get the input from HTML
// If it's not empty you put that word and throw it into the API
document.getElementById("search-button").addEventListener("click", function () {
    const word = document.getElementById("word-input").value;
    if (word) {
        document.getElementById("loading-message").style.display = "block";
        getData(word);
    } else {
        alert("Please enter a word.");
    }
});