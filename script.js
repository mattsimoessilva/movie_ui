document.addEventListener("click", (event) => {
    if (event.target.classList.contains("collapsible")) {
        event.target.classList.toggle("active");
        var content = event.target.nextElementSibling;
        
        content.style.display = content.style.display === "grid" ? "none" : "grid";
    }
});

const getMovies = async () => {
    let url = 'http://127.0.0.1:5000/movies';
    fetch(url, {
        method: 'get',
    })
        .then((response) => response.json())
        .then((data) => {
            data.movies.forEach(item => insertMovie({...item}));
        })
        .catch((error) => {
            console.error('Error:', error);
        })
}

getMovies()

const updateMovieList = async () => {
    try {
        const response = await fetch("http://127.0.0.1:5000/movies");
        const movieData = await response.json();

        const movieList = document.querySelector('.movie-list');
        movieList.innerHTML = ''; 

        movieData.movies.forEach(movie => {
            insertMovie(movie); 
        });

    } catch (error) {
        console.error("Error fetching movies:", error);
    }
};


const newMovie = () => {
    let title = document.getElementById("newTitle").value;
    let posterUrl = document.getElementById("newPosterUrl").value;
    let runningTime = document.getElementById("newRunningTime").value;
    let budget = document.getElementById("newBudget").value;
    let boxOffice = document.getElementById("newBoxOffice").value;
    let releaseYear = document.getElementById("newReleaseYear").value;

    let selectedPeople = [];
    document.querySelectorAll("select[multiple]").forEach(select => {
        const selectedOptions = Array.from(select.selectedOptions).map(option => option.value);
        selectedPeople.push(...selectedOptions);
    });

    if (title === '') {
        alert("Please enter a movie title!");
    } else if (isNaN(runningTime) || isNaN(budget) || isNaN(boxOffice) || isNaN(releaseYear)) {
        alert("Running time, budget, box office, and release year must be numbers!");
    } else {
        const movieData = {
            title,
            poster_url: posterUrl,
            running_time: parseInt(runningTime),
            budget: parseFloat(budget),
            box_office: parseFloat(boxOffice),
            release_year: parseInt(releaseYear),
            people: selectedPeople 
        };

        insertMovie(movieData);
        postMovie(movieData).then(() => {
            updateMovieList();
            clearForm();
        });
        alert("Movie added!");
    }
};

const clearForm = () => {
    document.getElementById("newTitle").value = "";
    document.getElementById("newPosterUrl").value = "";
    document.getElementById("newRunningTime").value = "";
    document.getElementById("newBudget").value = "";
    document.getElementById("newBoxOffice").value = "";
    document.getElementById("newReleaseYear").value = "";

    document.querySelectorAll("select[multiple]").forEach(select => {
        select.selectedIndex = -1;
    });
};

const postMovie = async (movieData) => {
    try {
        const formData = new FormData();

        formData.append("title", movieData.title);
        formData.append("poster_url", movieData.poster_url);
        formData.append("running_time", movieData.running_time);
        formData.append("budget", movieData.budget);
        formData.append("box_office", movieData.box_office);
        formData.append("release_year", movieData.release_year);

        movieData.people.forEach(personId => {
            formData.append("people", personId);
        });

        const response = await fetch("http://127.0.0.1:5000/movie", {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            alert("Movie successfully registered!");
            updateMovieList();
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error("Error adding movie:", error);
        alert("An error occurred while adding the movie.");
    }
};




const fetchPeopleAndGenerateRoles = async () => {
    try {
        const response = await fetch("http://127.0.0.1:5000/people");
        const peopleData = await response.json();

        generateDynamicSelects(peopleData.people);
    } catch (error) {
        console.error("Error fetching people:", error);
    }
};

const generateDynamicSelects = (people) => {
    const form = document.querySelector('.form'); 
    const submitButton = document.querySelector('.registerBtn'); 
    const rolesMap = {};

    people.forEach(person => {
        person.roles.forEach(role => {
            if (!rolesMap[role.name]) {
                rolesMap[role.name] = [];
            }
            rolesMap[role.name].push(person);
        });
    });

    Object.entries(rolesMap).forEach(([roleName, rolePeople]) => {
        const formattedRoleName = formatLabel(roleName);

        const label = document.createElement("label");
        label.textContent = formattedRoleName;

        const select = document.createElement("select");
        select.id = roleName.replace(/\s+/g, '_').toLowerCase();
        select.name = `${roleName.replace(/\s+/g, '_').toLowerCase()}[]`;
        select.multiple = true; 

        rolePeople.forEach(person => {
            const option = document.createElement("option");
            option.value = person.id;
            option.textContent = person.name;
            select.appendChild(option);
        });

        form.insertBefore(label, submitButton);
        form.insertBefore(select, submitButton);
    });
};

fetchPeopleAndGenerateRoles()

const formatRoleName = (role) => {
    return role.replace(/_/g, ' ')
               .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num); 
};

const formatMoney = (num) => {
    return `$${new Intl.NumberFormat('en-US').format(num)}`;
};

const formatLabel = (label) => {
    return label.replace(/_/g, ' ')
                .replace(/\b\w/g, (char) => char.toUpperCase()); 
};

const insertMovie = (movie) => {
    const movieList = document.querySelector('.movie-list');

    const buttonCardPair = document.createElement('div');
    buttonCardPair.classList.add('button-card-pair');

    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('collapsible');
    button.innerHTML = `<span>${movie.title}</span>
                        <span class="material-symbols-outlined list-arrow">keyboard_arrow_up</span>`;

    const movieCard = document.createElement('div');
    movieCard.classList.add('movie-card');

    const posterSlot = document.createElement('div');
    posterSlot.classList.add('movie-poster-slot');
    const poster = document.createElement('img');
    poster.classList.add('movie-poster');
    poster.src = movie.poster_url || 'https://www.rtb.cgiar.org/wp-content/uploads/2019/10/pix-vertical-placeholder-320x480.jpg';
    posterSlot.appendChild(poster);

    const infoContainer = document.createElement('div');
    infoContainer.classList.add('movie-info');

    const staticFields = ["title", "running_time", "budget", "box_office", "release_year"];
    staticFields.forEach(key => {
        const row = document.createElement('div');
        row.classList.add('movie-info-row');

        const label = document.createElement('div');
        label.classList.add('movie-info-label');
        label.innerHTML = `<p>${formatLabel(key)}</p>`;

        const valueContainer = document.createElement('div');
        valueContainer.classList.add('movie-info-value');

        let formattedValue = movie[key] || "placeholder";
        if (key === "budget" || key === "box_office") formattedValue = formatMoney(movie[key]); 
        if (key === "running_time") formattedValue = `${formatNumber(movie[key])} min`; 

        valueContainer.innerHTML = `<p>${formattedValue}</p>`;

        row.appendChild(label);
        row.appendChild(valueContainer);
        infoContainer.appendChild(row);
    });

    Object.entries(movie).forEach(([key, value]) => {
        if (!staticFields.includes(key) && Array.isArray(value)) {
            const row = document.createElement('div');
            row.classList.add('movie-info-row');

            const label = document.createElement('div');
            label.classList.add('movie-info-label');
            label.innerHTML = `<p>${formatLabel(key)}</p>`;

            const valueContainer = document.createElement('div');
            valueContainer.classList.add('movie-info-value');

            value.forEach(person => {
                const personEntry = document.createElement('p');
                personEntry.textContent = person.name;
                valueContainer.appendChild(personEntry);
            });

            row.appendChild(label);
            row.appendChild(valueContainer);
            infoContainer.appendChild(row);
        }
    });

    movieCard.appendChild(posterSlot);
    movieCard.appendChild(infoContainer);
    buttonCardPair.appendChild(button);
    buttonCardPair.appendChild(movieCard);
    movieList.appendChild(buttonCardPair);
};

