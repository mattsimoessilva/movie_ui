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

        if (type === Person) {
            generatePersonSelect(data.people);
            data.people.forEach(item => insertRecord(item, type));
        } else if (type === Movie) {
            data.movies.forEach(item => insertRecord(item, type));
        } else if (type === Role) {
            generateRoleSelect(data.roles);
            //data.roles.forEach(item => insertRecord(item, type));
        }
    } catch (error) {
        console.error(`Error fetching ${type.plural()}:`, error);
    }
};

fetchRecords(Movie);

fetchRecords(Person);

fetchRecords(Role);


const updateRecordList = async (type) => {
    try {
        const response = await fetch(`http://127.0.0.1:5000/${type.plural()}`);
        const data = await response.json();

        const list = document.querySelector(`.${type.singular()}-list`);
        list.innerHTML = ''; 

        data[type.plural()].forEach(item => {
            insertRecord(item, type);
        });

    } catch (error) {
        console.error(`Error fetching ${type.plural()}:`, error);
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
    

    console.log(recordData);

    if (!recordData.name && !recordData.title) {
        alert(`Please enter a valid ${type.singular()} name!`);
        return;
    }

    insertRecord(recordData, type);
    postRecord(type, recordData).then(() => {
        updateRecordList(type);
        form.reset();
    });

    alert(`${type.singular()} added!`);
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

        console.log(formData);

        const response = await fetch(`http://127.0.0.1:5000/${type.singular()}`, {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            alert(`${type.singular()} successfully registered!`);
            updateRecordList(type);
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

const insertRecord = (record, type) => {
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

    const imageSlot = document.createElement('div');
    imageSlot.classList.add('image-slot');
    const image = document.createElement('img');
    image.classList.add('image');
    image.src = record.image_url || 'https://www.rtb.cgiar.org/wp-content/uploads/2019/10/pix-vertical-placeholder-320x480.jpg';
    imageSlot.appendChild(image);

    const infoContainer = document.createElement('div');
    infoContainer.classList.add('info');

    Object.entries(record).forEach(([key, value]) => {
        if (key == "id") return; // Skip image field

        const row = document.createElement('div');
        row.classList.add('info-row');

        const label = document.createElement('div');
        label.classList.add('info-label');
        label.innerHTML = `<p>${formatLabel(key)}</p>`;

        const valueContainer = document.createElement('div');
        valueContainer.classList.add('info-value');

        let formattedValue = value || "placeholder";
        if (key === "budget" || key === "box_office") formattedValue = formatMoney(value); 
        if (key === "running_time") formattedValue = `${formatNumber(value)} min`;

        if (Array.isArray(value)) {
            value.forEach(entry => {
                const itemEntry = document.createElement('p');
                itemEntry.textContent = entry.name || entry.title;
                valueContainer.appendChild(itemEntry);
            });
        } else {
            valueContainer.innerHTML = `<p>${formattedValue}</p>`;
        }

        row.appendChild(label);
        row.appendChild(valueContainer);
        infoContainer.appendChild(row);
    });

    recordCard.appendChild(imageSlot);
    recordCard.appendChild(infoContainer);
    buttonCardPair.appendChild(button);
    buttonCardPair.appendChild(recordCard);
    list.appendChild(buttonCardPair);
};


const generateRoleSelect = (roles) => {
    console.log(roles);

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
