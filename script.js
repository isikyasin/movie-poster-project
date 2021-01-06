class UI {
  constructor() {
    this.homePage = document.querySelector(".home-page");
    this.WatchListPage = document.querySelector(".watchlist-page");
    this.container = document.querySelector(".container");
    this.movieList = [];
    this.watchList = [];
    this.genresWatchlist = document.querySelector(".genres-watchlist");
    this.sortWatchlist = document.querySelector(".sort-watchlist");
    this.sortHome = document.querySelector(".sort-home");
    this.genresHome = document.querySelector(".genres-home");
  }

  addToWatchList(movieID) {
    if (!this.watchList.some((e) => e.imdbID == movieID)) {
      var movieIndex = this.movieList.findIndex((m) => m.imdbID == movieID);
      var newMovie = this.movieList[movieIndex];
      this.watchList.push(newMovie);
      this.addedNotification(newMovie, true);
    }else{
      this.addedNotification(newMovie, false);
    }
    this.showHideRemoveBtn();
    this.filterGenre(true);
  }

  removeFromWatchlist(movieID) {
    if (this.watchList.some((e) => e.imdbID == movieID)) {
      var movieIndex = this.movieList.findIndex((m) => m.imdbID == movieID);
      var newMovie = this.movieList[movieIndex];
      this.removedNotification(newMovie);
      var tempList = this.watchList.filter(function (item) {
        return item.imdbID != movieID;
      });
      this.watchList = tempList;
      this.showHideRemoveBtn();
    }
    if (this.watchList.length > 0) {
      this.filterGenre(true);
    } else {
      this.showWatchList(this.watchList);
    }
  }

  addedNotification(newMovie, isAdded) {
    var element = document.createElement("div");
    element.classList.add("notification","added-notification");
    if(isAdded){
      element.innerHTML = `${newMovie.Title} added to your Watchlist!`;
    }else{
      element.innerHTML = `This movie is already in your Watchlist!`;
    }
    this.container.appendChild(element);
    var self = this;
    setTimeout(function () {
      self.container.removeChild(element);
    }, 1500);
  }

  removedNotification(newMovie) {
    var element = document.createElement("div");
    element.classList.add("notification","removed-notification");
    element.innerHTML = `${newMovie.Title} removed from your Watchlist!`;
    this.container.appendChild(element);
    var self = this;
    setTimeout(function () {
      self.container.removeChild(element);
    }, 1500);
  }

  showHideRemoveBtn(){
    var imdbIDList = [];
    for(let i=0; i<this.watchList.length; i++){
      imdbIDList.push(this.watchList[i].imdbID);
    }
    var buttons = document.querySelectorAll(".remove-from-watchlist");
    var btnsArr = Array.prototype.slice.call(buttons);
    var filteredArray = btnsArr.filter(value => imdbIDList.includes(value.dataset.id));
    var filteredArray2 = btnsArr.filter(value => !(imdbIDList.includes(value.dataset.id))); 
    for(let i=0; i<filteredArray.length; i++){
      filteredArray[i].style.display="initial";
    }
    for(let i=0; i<filteredArray2.length; i++){
      filteredArray2[i].style.display="none";
    }
  }

  filterGenre(isInWatchList){
    var tempList = this.movieList;
    var genreSelect = this.genresHome.value;
    var isFromWatchlist = false;
    if(isInWatchList){
      tempList = this.watchList;
      genreSelect = this.genresWatchlist.value;
      isFromWatchlist = true;
    }
    var filteredList = tempList
    if (genreSelect !== "All") {
      filteredList = tempList.filter(function (item) {
        return genreSelect == item.Type;
      });
    }
    this.sortMovies(filteredList, isFromWatchlist);
  }

  sortMovies(tempList, isFromWatchlist) {
    var sort = this.sortWatchlist;
    if (!isFromWatchlist) {
      sort = this.sortHome;
    }
    tempList = this.orchestrateFilter(tempList, sort.value);
    if (!isFromWatchlist) {
      addMoviesToDom(tempList, this.homePage);
    } else {
      this.showWatchList(tempList);
    }
  }

  orchestrateFilter(tempList, sort) {
    switch (sort) {
      case "Oldest First":
        return tempList.sort((a, b) => parseInt(a.Year) - parseInt(b.Year));
      case "Newest First":
        return tempList.sort((a, b) => parseInt(b.Year) - parseInt(a.Year));
      default:
        return tempList.sort((a, b) => a.Title.localeCompare(b.Title));
    }
  }

  showWatchList(tempList) {
    this.WatchListPage.innerHTML = ``;
    var self = this;
    tempList.forEach(function (value) {
      var element = document.createElement("div");
      element.classList.add("movie");
      element.innerHTML = ` 
            <img src="${value.Poster}" alt=""/>
            <div class="movie-description">
                <h3>${value.Title}</h3> 
                <span>Genre : ${value.Type}</span><span>Year : ${value.Year}</span>
                <button data-id="${value.imdbID}" class="remove-from-watchlist-in-watchlist">REMOVE FROM WATCHLIST</button>
            </div>`;
      self.WatchListPage.appendChild(element);
    });
    if(tempList.length == 0){
      var element = document.createElement("div");
      element.classList.add("empty-watchlist");
      element.innerHTML = `There is no suitable movie for the selected criteria in your watchlist.`;
      this.WatchListPage.appendChild(element);
    }
  }
}

function getExternalApi(movieList, homePage){
  for(let i = 1; i < 3; i++){
    fetch(`http://www.omdbapi.com/?apikey=6e6b55d&s=batman&page=${i}`)
    .then(response => {
        return response.json();
    }).then(data=>{
        var newMovies = data.Search;
        newMovies.forEach(function(e){
          movieList.push(e);
        })
        addMoviesToDom(movieList, homePage);
    }).catch(error => {
        console.log(error);
    })
  }
}

function addMoviesToDom(movieList, homePage) {
  homePage.innerHTML = "";
  movieList.forEach(function (value) {
    var element = document.createElement("div");
    element.classList.add("movie");
    element.innerHTML = ` 
        <img src="${value.Poster}" alt=""/>
        <div class="movie-description">
            <h3>${value.Title}</h3>
            <span>Type : ${value.Type}</span><span>Year : ${value.Year}</span> 
            <button data-id="${value.imdbID}" class="add-to-watchlist">ADD TO WATCHLIST</button>
            <button data-id="${value.imdbID}" class="remove-from-watchlist">REMOVE FROM WATCHLIST</button>
        </div>`;
    homePage.appendChild(element);
  });
}

function eventListeners() {
  const ui = new UI();
  getExternalApi(ui.movieList, ui.homePage);
  ui.showWatchList(ui.watchList);

  ui.homePage.addEventListener("click", function (event) {
    event.preventDefault();
    if (event.target.classList.contains("add-to-watchlist")) {
      const dataID = event.target.dataset.id;
      ui.addToWatchList(dataID);
    } else if (event.target.classList.contains("remove-from-watchlist")) {
      const dataID = event.target.dataset.id;
      ui.removeFromWatchlist(dataID);
    }
  });

  ui.WatchListPage.addEventListener("click", function (event) {
    event.preventDefault();
    if (event.target.classList.contains("remove-from-watchlist-in-watchlist")) {
      ui.removeFromWatchlist(event.target.dataset.id);
    }
  });

  const allSortBtns = document.querySelectorAll(".sort");
  for (let i = 0; i < allSortBtns.length; i++) {
    allSortBtns[i].addEventListener("click", function (e) {
      e.preventDefault();
      if (allSortBtns[i].classList.contains("sort-btn-home")) {
        ui.filterGenre(false);
      } else if (allSortBtns[i].classList.contains("sort-btn-watchlist")) {
        ui.filterGenre(true);
      }
      ui.showHideRemoveBtn();
    });
  }
}

function scrolldiv() {
  var watchListLink = document.querySelector(".watchlist-links");
  watchListLink.scrollIntoView();
}

function scrollhome() {
  var homePageLink = document.querySelector(".home-page-links");
  homePageLink.scrollIntoView();
}

document.addEventListener("DOMContentLoaded", function () {
  eventListeners();
});
