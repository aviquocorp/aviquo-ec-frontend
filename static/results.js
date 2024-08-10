// index the results
// select all the divs with class "nyu-applied-research"
var nyuAppliedResearch = document.querySelectorAll(".nyu-applied-research");

// get the input element
var input = document.getElementById("search");

// every time the input changes, run the filter function
input.addEventListener("input", () => {
    for (var i = 0; i < nyuAppliedResearch.length; i++) {
        if (distance(input.value.toLowerCase(), nyuAppliedResearch[i].innerHTML.toLowerCase()) <= 2 || input.value.length == 0) {
            nyuAppliedResearch[i].style.display = "block";
        } else {
            nyuAppliedResearch[i].style.display = "none";
        }
    }
    
    console.log(input.value);
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
