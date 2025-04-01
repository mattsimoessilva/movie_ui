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

const formatRoleName = (role) => {
    return role.replace(/_/g, ' ')
               .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num); // Adds commas for thousands
};

const formatMoney = (num) => {
    return `$${new Intl.NumberFormat('en-US').format(num)}`; // Formats as currency
};

const formatLabel = (label) => {
    return label.replace(/_/g, ' ') // Replace underscores with spaces
                .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize each word
};

const insertMovie = (movie) => {
    const movieList = document.querySelector('.movie-list');

    // Create button-card pair container
    const buttonCardPair = document.createElement('div');
    buttonCardPair.classList.add('button-card-pair');

    // Collapsible button
    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('collapsible');
    button.innerHTML = `<span>${movie.title}</span>
                        <span class="material-symbols-outlined list-arrow">keyboard_arrow_up</span>`;

    // Movie card container
    const movieCard = document.createElement('div');
    movieCard.classList.add('movie-card');

    // Poster slot
    const posterSlot = document.createElement('div');
    posterSlot.classList.add('movie-poster-slot');
    const poster = document.createElement('img');
    poster.classList.add('movie-poster');
    poster.src = movie.poster_url || 'https://www.rtb.cgiar.org/wp-content/uploads/2019/10/pix-vertical-placeholder-320x480.jpg';
    posterSlot.appendChild(poster);

    // Movie info container
    const infoContainer = document.createElement('div');
    infoContainer.classList.add('movie-info');

    // Iterate over known static properties with formatting
    const staticFields = ["title", "running_time", "budget", "box_office", "release_year"];
    staticFields.forEach(key => {
        const row = document.createElement('div');
        row.classList.add('movie-info-row');

        const label = document.createElement('div');
        label.classList.add('movie-info-label');
        label.innerHTML = `<p>${formatLabel(key)}</p>`; // Capitalize and format

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

    // Dynamically generate role-based entries with formatted role names
    Object.entries(movie).forEach(([key, value]) => {
        if (!staticFields.includes(key) && Array.isArray(value)) { // Handle dynamic roles
            const row = document.createElement('div');
            row.classList.add('movie-info-row');

            const label = document.createElement('div');
            label.classList.add('movie-info-label');
            label.innerHTML = `<p>${formatLabel(key)}</p>`; // Apply role name formatting

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

    // Append everything together
    movieCard.appendChild(posterSlot);
    movieCard.appendChild(infoContainer);
    buttonCardPair.appendChild(button);
    buttonCardPair.appendChild(movieCard);
    movieList.appendChild(buttonCardPair);
};
