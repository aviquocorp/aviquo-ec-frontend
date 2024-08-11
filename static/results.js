
// the container so we can remove the cards children
var container = document.getElementsByClassName("program-grid")[0];


// select all the divs with class "nyu-applied-research"
var cards = document.querySelectorAll(".program-cards2");
var allCards = Array.from(cards);

// get the input element
var input = document.getElementById("search");

// every time the input changes, run the filter function
input.addEventListener("input", () => {
    const threshold = 5;

    container.innerHTML = ""; 

    // filter and sort cards from global array
    // Filter and sort cards from the global array
    const filteredSortedCards = allCards
        .map(card => {
            const text = card.childNodes[1].textContent
                .slice(0, input.value.length).toLowerCase();

            const dist = distance(input.value.toLowerCase(), text);
            return { card, dist };
        })
        .filter(({ dist }) => dist <= threshold)  // Filter by distance threshold
        .sort((a, b) => a.dist - b.dist)           // Sort by distance
        .map(({ card }) => card);

    // Add the filtered and sorted cards to the DOM
    filteredSortedCards.forEach(card => {
        container.appendChild(card);
    });

    /*
    for (var i = 0; i < cards.length; i++) {
        if (distance(input.value.toLowerCase(), 
            cards[i].childNodes[1].textContent.slice(0, input.value.length).toLowerCase()) 
            <= 3 || input.value.length == 0) {
            cards[i].style.display = "block";
        } else {
            cards[i].style.display = "none";
        }
    }
    
    console.log(input.value);
    */
});

// thank you Vincent Loh 
function distance(a, b){
	dp = [];

	for(let i=0; i<=a.length; ++i){
		dp.push([]);
		for(let j=0; j<=b.length; ++j)
			dp[i].push(0);
		dp[i][0] = parseInt(i);
	}

	for(i in dp[0]) dp[0][i] = parseInt(i);

	for(let i=0; i<a.length; ++i)
		for(let j=0; j<b.length; ++j)
			dp[i+1][j+1] = Math.min(Math.min(dp[i+1][j], dp[i][j+1]) + 1,
				dp[i][j] + (a[i] == b[j] ? 0 : 1));

	return dp[a.length][b.length]
}

// clear element
var clear = document.getElementById("clear");
clear.addEventListener("click", () => {
    search.value = "";

    // show all the cards again

    container.innerHTML = `
        <div class="program-cards3">
          <div class="program-cards-child2"></div>
          <div class="need-feedback-on">
              need feedback on your ECs or advice from experts? join <a href="https://discord.gg/QMahMhBUsK">our discord!</a>
          </div>
        </div>` ;
    for (var i = 0; i < allCards.length; i++) {
        container.appendChild(allCards[i]);
    }
});


// filter element
var filter = document.getElementById("filter");
filter.addEventListener("click", () => {
    // not implemented
    location.href = "/";
});

// save element
var save = document.getElementById("save");
save.addEventListener("click", () => {
    // not implemented
    location.href = "/";
});

function save() {
    // not implemented
    location.href = "/";
}
