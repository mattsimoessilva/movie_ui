# 🗂️ Movie Application User Interface

This is the web page for Movie Application, developed as the MVP for the Basic Full Stack Development sprint of the postgraduate course in Full Stack Development at PUC-Rio. It is designed as a modular and educational exercise to practice clean separation of concerns, object-oriented design in the browser, and DOM manipulation principles.


This project consists of only **three files**:  
- `index.html` – responsible for the structure and interface  
- `styles.css` – responsible for presentation  
- `script.js` – responsible for logic and behavior

## 🧩 Purpose

The goal is to provide a minimal yet functional system that allows users to register three distinct entity types:

- **Movies** – With metadata such as title, image URL, running time, budget, box office, and release year.  
- **People** – Representing individuals like actors, directors, and other film professionals.  
- **Roles** – Describing the participation of each person in a movie through named roles and their descriptions.

Each form operates independently and is wired to a generic `newRecord()` function that receives the entity type as a parameter. This invites the application of object-oriented modeling and promotes code reuse through polymorphism.

## ⚙️ Architecture

The system encourages thinking in terms of:

- **Encapsulation** – Each entity (Movie, Person, Role) can be designed to manage its own rendering logic.
- **Abstraction** – The `newRecord` function does not need to know the specifics of each entity, as long as they conform to a common interface.
- **Modularity** – Entities and their behaviors are defined in a way that new ones can be introduced without altering the existing system.
- **Progressive Enhancement** – The project is fully functional with only vanilla JavaScript, but can be extended to use local storage or a RESTful backend.

## 🔍 Key Features

- **Pure HTML/CSS/JS** – No dependencies, libraries, or frameworks.
- **Form-based Input** – Simple forms to simulate real data entry workflows.
- **Dynamic Rendering** – Entries are displayed immediately after submission.
- **Separation of Concerns** – Clear distinction between structure, style, and behavior.

## 🧠 Educational Value

This project is intentionally minimal, making it ideal for:

- Practicing DOM access and manipulation using JavaScript.
- Designing small-scale domain models using classes and composition.
- Understanding dynamic form handling without relying on frameworks.

## 📂 Project Structure

```
/movie-ui/
│
├── index.html      → Application structure
├── script.js       → Application logic and entity behavior
└── styles.css      → Aesthetic and layout rules
```

## 📝 Final Notes

This project was built as part of the educational experience of the Full Stack Development postgraduate program at PUC-Rio, emphasizing web page design using basic web technologies.