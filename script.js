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

const recordTypes = [Person, Role, Movie];

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
            if (!child.matches("h2")) { 
                child.remove();
            }
        });
    }
};



const newRecord = (type) => {
    const form = document.querySelector(`.${type.singular()}-form`);
    const inputs = form.querySelectorAll("input, select[multiple], textarea");

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

    postRecord(type, recordData).then(() => {
        updateAllRecordLists();
        if (type == Movie) {
            repopulatePersonSelect();
        } else if (type == Person) {
            repopulatePersonSelect();
        } else if (type == Role) {
            repopulateRoleSelect();
        }
        clearForm(`${type.singular()}-form`);
    });
};

const editedRecord = (type) => {
    const form = document.querySelector(`.${type.singular()}-update-form`);
    const inputs = form.querySelectorAll("input, select[multiple], textarea");

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

    updateRecord(type, recordData).then(() => {
        updateAllRecordLists();
        if (type == Movie) {
            repopulatePersonSelect();
        } else if (type == Person) {
            repopulatePersonSelect();
        } else if (type == Role) {
            repopulateRoleSelect();
        }
    });
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
            list.innerHTML = '';

            fetchedData[index][type.plural()].forEach(item => {
                insertRecord(item, type, fetchedData[0], fetchedData[1], fetchedData[2]);
            });
        });

    } catch (error) {
        console.error("Error updating all record lists:", error);
    }
};


const clearForm = (className) => {
    const container = document.getElementsByClassName(className)[0];
    if (!container) {
        return
    }

    container.querySelectorAll("input").forEach(input => input.value = "");
    container.querySelectorAll("textarea").forEach(textarea => textarea.value = "");
    container.querySelectorAll("select").forEach(select => select.selectedIndex = -1);
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

const updateRecord = async (type, recordData) => {
    try {
        const formData = new FormData();

        console.log('recordData:');
        console.log(recordData);

        Object.entries(recordData).forEach(([key, value]) => {
            if (Array.isArray(value) && value.length > 0) {
                value.forEach(item => formData.append(key, item));
            } else if (value !== undefined && value !== null) {
                formData.append(key, value);
            }
        });

        console.log('formData:');
        console.log(formData);

        const response = await fetch(`http://127.0.0.1:5000/${type.singular()}`, {
            method: "PUT",
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
    const merged = [...arr1, ...arr2];
    const uniqueMap = new Map(merged.map(item => [item[key], item]));
    
    return [...uniqueMap.values()].map(obj => ({
        ...obj,
        source: arr1.some(item => item[key] === obj[key]) ? "selected" : "not-selected"
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

    if (record.image_url !== undefined && record.image_url !== null) {
        recordCard.classList.add('two-column');
        const imageSlot = document.createElement('div');
        imageSlot.classList.add('image-slot');
        const image = document.createElement('img');
        image.classList.add('image');
        const PERSON_PLACEHOLDER = "https://st2.depositphotos.com/4111759/12123/v/450/depositphotos_121233262-stock-illustration-male-default-placeholder-avatar-profile.jpg";
        const MOVIE_PLACEHOLDER =  "https://critics.io/img/movies/poster-placeholder.png";
        image.src = record.image_url || (record.type === "Person" ? MOVIE_PLACEHOLDER : PERSON_PLACEHOLDER);
        imageSlot.appendChild(image);
        recordCard.appendChild(imageSlot);
    }

    const infoContainer = document.createElement('div');
    infoContainer.classList.add(`${type.singular()}-update-form`);

    Object.entries(record).forEach(([key, value]) => {
        const normalizedKey = key.replace(/s$/, '').replace(/_/g, ' ');
        const capitalizedKey = normalizedKey
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

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
    
            if (type == Movie) {

                if (rolesMap[capitalizedKey]) {
                    rolesMap[capitalizedKey].forEach(person => {
                        const option = document.createElement("option");
                        option.value = person.id;
                        option.textContent = person.name;
        
                        if (value.some(v => v.id === person.id)) {
                            option.selected = true;
                        }
        
                        select.appendChild(option);
                    });
                }
            } else if (type == Person) {
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
            if (capitalizedKey == 'Id') {
                const input = document.createElement('input');
                input.type = "text";
                input.name = formatLabel(key).toLowerCase().replace(/\s+/g, "_");
                input.value = value || '';
                input.disabled = true;

                valueContainer.appendChild(input);
            } else {
                const input = document.createElement('input');
                input.type = "text";
                input.name = formatLabel(key).toLowerCase().replace(/\s+/g, "_");
                input.value = value || '';

                valueContainer.appendChild(input);
            }
        }
    
        row.appendChild(label);
        row.appendChild(valueContainer);

        if (capitalizedKey == "Id") {
            row.style.display = "none";
        }
        infoContainer.appendChild(row);
    });

    let capitalizedType = type.singular().charAt(0).toUpperCase() + type.singular().slice(1);

    const buttonRow = document.createElement('div');
    buttonRow.classList.add('button-row');

    const updateButton = document.createElement('button');
    updateButton.onclick = () => editedRecord(type);
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
