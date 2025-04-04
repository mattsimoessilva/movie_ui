class Movie {
    constructor(title, poster_url, running_time, budget, box_office, release_year, people = []) {
        this.title = title;
        this.image_url = poster_url;
        this.running_time = running_time;
        this.budget = budget;
        this.box_office = box_office;
        this.release_year = release_year;
        this.people = people;
    }

    static singular() {
        return "movie";
    }

    static plural() {
        return "movies";
    }
}

class Person {
    constructor(name, picture_url) {
        this.name = name;
        this.image_url = picture_url;
    }

    static singular() {
        return "person"
    }

    static plural() {
        return "people"
    }
}

class Role {
    constructor(name, description) {
        this.name = name;
        this.description = description;
    }

    static singular() {
        return "role"
    }

    static plural() {
        return "roles"
    }
}

const recordTypes = [Movie, Person, Role];

document.addEventListener("click", (event) => {
    if (event.target.classList.contains("collapsible")) {
        event.target.classList.toggle("active");
        var content = event.target.nextElementSibling;
        
        content.style.display = content.style.display === "grid" ? "none" : "grid";
    }
});

const fetchRecords = async (type) => {
    try {
        const response = await fetch(`http://127.0.0.1:5000/${type.plural()}`);
        const data = await response.json();

        return data;
    } catch (error) {
        console.error(`Error fetching ${type.plural()}:`, error);
    }
};

const initializeRecords = async () => {
    try {
        let rolesData = await fetchRecords(Role);
        let peopleData = await fetchRecords(Person);
        let moviesData = await fetchRecords(Movie);

        generateRoleSelect(rolesData.roles);
        generatePersonSelect(peopleData.people);

        peopleData.people.forEach(item => insertRecord(item, Person, peopleData, rolesData, moviesData));
        moviesData.movies.forEach(item => insertRecord(item, Movie, peopleData, rolesData));
        rolesData.roles.forEach(item => insertRecord(item, Role));

    } catch (error) {
        console.error("Error fetching records:", error);
    }
};

document.addEventListener('DOMContentLoaded', initializeRecords);

const cleanList = (type) => {
    const list = document.querySelector(`.${type.singular()}-list`);

    if (list.hasChildNodes()) {
        [...list.children].forEach(child => {
            if (!child.matches("h2")) { // Keep the <h2> title
                child.remove();
            }
        });
    }
};



const newRecord = (type) => {
    const form = document.querySelector(`.${type.singular()}-form`);
    const inputs = form.querySelectorAll("input, select[multiple]");

    let recordData = {};

    inputs.forEach(input => {
        if (input.type === "number") {
            recordData[input.name] = parseFloat(input.value) || 0;
        } else if (input.tagName === "SELECT" && input.multiple) {
            if (type === Movie) {
                recordData["people"] = (recordData["people"] || []).concat(
                    Array.from(input.selectedOptions).map(option => option.value)
                );
            } else {
                recordData[input.name] = Array.from(input.selectedOptions).map(option => option.value);
            }
        } else {
            recordData[input.name] = input.value || "";
        }
    });

    if (!recordData.name && !recordData.title) {
        alert(`Please enter a valid ${type.singular()} name!`);
        return;
    }

    postRecord(type, recordData).then(() => {
        updateAllRecordList();
        if (type == Movie) {
            repopulatePersonSelect();
        } else if (type == Person) {
            repopulatePersonSelect();
        } else if (type == Role) {
            repopulateRoleSelect();
        }
        form.reset();
    });

    alert(`${type.singular()} added!`);
};

const updateAllRecordLists = async () => {
    try {
        const fetchedData = await Promise.all(
            recordTypes.map(type => 
                fetch(`http://127.0.0.1:5000/${type.plural()}`).then(res => res.json())
            )
        );

        recordTypes.forEach((type, index) => {
            const list = document.querySelector(`.${type.singular()}-list`);
            list.innerHTML = ''; // Clear previous data

            fetchedData[index][type.plural()].forEach(item => {
                insertRecord(item, type, fetchedData[1], fetchedData[2]); // Pass people and roles
            });
        });

    } catch (error) {
        console.error("Error updating all record lists:", error);
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

const postRecord = async (type, recordData) => {
    try {
        const formData = new FormData();

        Object.entries(recordData).forEach(([key, value]) => {
            if (Array.isArray(value) && value.length > 0) {
                value.forEach(item => formData.append(key, item));
            } else if (value !== undefined && value !== null) {
                formData.append(key, value);
            }
        });

        const response = await fetch(`http://127.0.0.1:5000/${type.singular()}`, {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            alert(`${type.singular()} successfully registered!`);
            updateAllRecordLists();
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error(`Error adding ${type.singular()}:`, error);
        alert(`An error occurred while adding the ${type.singular()}.`);
    }
};


const generatePersonSelect = (people) => {
    const form = document.querySelector('.movie-form'); 
    const submitButton = document.querySelector('.registerMovieBtn'); 
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
        select.name = `${roleName.replace(/\s+/g, '_').toLowerCase()}s`;
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

const repopulatePersonSelect = async () => {
    document.querySelectorAll('.movie-form select').forEach(select => select.remove());
    document.querySelectorAll('.movie-form label').forEach(label => label.remove());

    try {
        let peopleData = await fetchRecords(Person);
        generatePersonSelect(peopleData.people);

    } catch (error) {
        console.error("Error fetching records:", error);
    }
};

const repopulateRoleSelect = async () => {
    document.querySelectorAll('.person-form select').forEach(select => select.remove());
    document.querySelectorAll('.person-form label').forEach(label => label.remove());

    try {
        let rolesData = await fetchRecords(Role);
        generateRoleSelect(rolesData.roles);

    } catch (error) {
        console.error("Error fetching roles:", error);
    }
};


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

const mergeUniqueObjectsWithTags = (arr1, arr2, key) => {
    const merged = [...arr1, ...arr2]; // Combine arrays
    const uniqueMap = new Map(merged.map(item => [item[key], item])); // Remove duplicates
    
    return [...uniqueMap.values()].map(obj => ({
        ...obj,
        source: arr1.some(item => item[key] === obj[key]) ? "selected" : "not-selected" // Tag source
    }));
};


const insertRecord = (record, type, peopleData, rolesData, moviesData) => {
    const rolesMap = {};

    if (rolesData && peopleData) {
        rolesData.roles.forEach(role => {
            rolesMap[role.name] = []

            peopleData.people.forEach(person => {
                person.roles.forEach(personRole => {
                    if (role.name == personRole.name) {
                        rolesMap[role.name].push(person);
                    }
                })
            })
        })
    }


    const list = document.querySelector(`.${type.singular()}-list`);

    const buttonCardPair = document.createElement('div');
    buttonCardPair.classList.add('button-card-pair');

    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('collapsible');
    button.innerHTML = `<span>${record.name || record.title}</span>
                        <span class="material-symbols-outlined list-arrow">keyboard_arrow_up</span>`;

    const recordCard = document.createElement('div');
    recordCard.classList.add('record-card');

    if (record.image_url) {
        recordCard.classList.add('two-column');
        const imageSlot = document.createElement('div');
        imageSlot.classList.add('image-slot');
        const image = document.createElement('img');
        image.classList.add('image');
        image.src = record.image_url || 'https://www.rtb.cgiar.org/wp-content/uploads/2019/10/pix-vertical-placeholder-320x480.jpg';
        imageSlot.appendChild(image);
        recordCard.appendChild(imageSlot);
    }

    const infoContainer = document.createElement('div');
    infoContainer.classList.add(`${type.singular()}-update-form`);

    // Populate form fields
    Object.entries(record).forEach(([key, value]) => {
        if (key === "id") return; // Skip ID field
    
        // Normalize key to match role names in rolesMap
        const normalizedKey = key.replace(/s$/, ''); // 
        let capitalizedKey = normalizedKey.charAt(0).toUpperCase() + normalizedKey.slice(1);

        const row = document.createElement('div');
        row.classList.add('info-row');
    
        const label = document.createElement('div');
        label.classList.add('info-label');
        label.innerHTML = `<p>${formatLabel(key)}</p>`;
    
        const valueContainer = document.createElement('div');
        valueContainer.classList.add('info-value');

    
        if (Array.isArray(value)) {
            const select = document.createElement("select");
            select.id = formatLabel(key).replace(/\s+/g, '_').toLowerCase();
            select.name = `${formatLabel(key).replace(/\s+/g, '_').toLowerCase()}s`;
            select.multiple = true;
    
            // Ensure correct role matching
            if (type == Movie) {
                if (rolesMap[capitalizedKey]) {
                    rolesMap[capitalizedKey].forEach(person => {
                        const option = document.createElement("option");
                        option.value = person.id;
                        option.textContent = person.name;
        
                        // Select the option only if the person is already linked to the movie
                        if (value.some(v => v.id === person.id)) {
                            option.selected = true;
                        }
        
                        select.appendChild(option);
                    });
                }
            } else if (type == Person) {
                console.log(capitalizedKey);

                if (capitalizedKey == 'Movie') {
                    const movies = mergeUniqueObjectsWithTags(value, moviesData.movies, "id");

                    movies.forEach(entry => {
                        const option = document.createElement("option");
                        option.value = entry.id;
                        option.textContent = entry.name || entry.title;

                        if (entry.source == "selected") {
                            option.selected = true;
                        }
                
                        select.appendChild(option);
                    })
                } else if (capitalizedKey == 'Role') {
                    const roles = mergeUniqueObjectsWithTags(value, rolesData.roles, "id");

                    console.log(rolesData.roles);

                    roles.forEach(entry => {
                        const option = document.createElement("option");
                        option.value = entry.id;
                        option.textContent = entry.name || entry.title;

                        if (entry.source == "selected") {
                            option.selected = true;
                        }
                
                        select.appendChild(option);
                    })
                } else {
                    value.forEach(entry => {
                        const option = document.createElement("option");
                        option.value = entry.id;
                        option.textContent = entry.name || entry.title;
                        option.selected = true;
                
                        select.appendChild(option);
                    })
                }

              
            }

            valueContainer.appendChild(select);
        } else {
            const input = document.createElement('input');
            input.type = "text";
            input.name = formatLabel(key).toLowerCase();
            input.value = value || "placeholder";
            valueContainer.appendChild(input);
        }
    
        row.appendChild(label);
        row.appendChild(valueContainer);
        infoContainer.appendChild(row);
    });

    let capitalizedType = type.singular().charAt(0).toUpperCase() + type.singular().slice(1);

    const buttonRow = document.createElement('div');
    buttonRow.classList.add('button-row');

    const updateButton = document.createElement('button');
    updateButton.onclick = `updateRecord(${capitalizedType})`;
    updateButton.classList.add(`update${capitalizedType}Btn`);
    updateButton.innerText = 'Update';
    buttonRow.appendChild(updateButton);

    const deleteButton = document.createElement('button');
    deleteButton.onclick = `deleteRecord(${capitalizedType})`;
    deleteButton.classList.add(`delete${capitalizedType}Btn`);
    deleteButton.innerText = 'Delete';
    buttonRow.appendChild(deleteButton);

    infoContainer.appendChild(buttonRow);
    recordCard.appendChild(infoContainer);
    buttonCardPair.appendChild(button);
    buttonCardPair.appendChild(recordCard);
    list.appendChild(buttonCardPair);
};



const generateRoleSelect = (roles) => {

    const form = document.querySelector('.person-form');
    const submitButton = document.querySelector('.registerPersonBtn');
    
    const fieldName = 'Roles';

    const label = document.createElement("label");
    label.textContent = fieldName;

    const select = document.createElement("select");
    select.id = "role";
    select.name = "roles";
    select.multiple = true;

    roles.forEach(role => {
        const option = document.createElement("option");
        option.value = role.id;
        option.textContent = role.name;
        select.appendChild(option);
    });

    form.insertBefore(label, submitButton);
    form.insertBefore(select, submitButton);
}
