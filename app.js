class App {
    constructor() {
        //Note data
        this.notes = [];
        if (localStorage.getItem('notes') !== null) {
            this.notes = JSON.parse(localStorage.getItem('notes'));
        }
        else {
            this.notes = [];
        }

        this.title = '';
        this.text = '';
        this.id = '';

        //html elements will have $ infront
        this.$form = document.querySelector('#form');
        this.$noteTitle = document.querySelector('#note-title');
        this.$noteText = document.querySelector('#note-text');
        this.$formButtons = document.querySelector('#form-buttons');
        this.$formCloseButton = document.querySelector('#form-close-button');
        this.$placeholder = document.querySelector('#placeholder');
        this.$notes = document.querySelector('#notes');

        this.$modal = document.querySelector('.modal');
        this.$modalTitle = document.querySelector('.modal-title');
        this.$modalText = document.querySelector('.modal-text');
        this.$closeModal = document.querySelector('.modal-close-button');
        this.$colorTooltip = document.querySelector('#color-tooltip');

        this.saveNotes();
        this.displayNotes();
        this.addEvenListeners();
    }

    addEvenListeners() {
        document.body.addEventListener('click', event => {
            this.handleFormClick(event);
            this.selectNote(event);
            this.openModal(event);
            this.deleteNote(event);
        });
        document.body.addEventListener('mouseover', event => {
            //console.log("Mouseover event detected on:", event.target);
            this.openTooltip(event);
        });
        document.body.addEventListener('mouseout', event => {
            //console.log("Mouseover event detected on:", event.target);
            this.closeTooltip(event);
        });
        this.$colorTooltip.addEventListener('mouseover', function () {
            this.style.display = "flex";
        });
        this.$colorTooltip.addEventListener('mouseout', function () {
            this.style.display = "none";
        });
        this.$colorTooltip.addEventListener('click', event => {
            const color = event.target.dataset.color;
            if (color) {
                this.editNoteColor(color);
            }
        });
        //Do something when the submit button is clicked
        this.$form.addEventListener('submit', event => {
            event.preventDefault();
            //Store values of note-title and note-text
            const title = this.$noteTitle.value;
            const text = this.$noteText.value;
            //Note needs at leat a title or a text
            const validNote = title || text;

            if (validNote) {
                this.addNote({ title, text });
            }
        });
        this.$formCloseButton.addEventListener('click', event => {
            event.stopPropagation();
            this.closeForm();
        });
        this.$closeModal.addEventListener('click', event => {
            this.closeModal(event);
        })
    }

    handleFormClick(event) {
        //contains return boolean value
        const isFormClicked = this.$form.contains(event.target);

        //Store values of note-title and note-text
        const title = this.$noteTitle.value;
        const text = this.$noteText.value;
        //Note needs at leat a title or a text
        const validNote = title || text;

        if (isFormClicked) {
            this.openForm();
        } else if (validNote) {
            this.addNote({ title, text });
        } else {
            this.closeForm();
        }
    }
    openForm() {
        this.$form.classList.add('form-open');
        this.$noteTitle.style.display = 'block';
        this.$formButtons.style.display = 'block';

    }
    closeForm() {
        //Reverse operations from openForm()
        this.$form.classList.remove('form-open');
        this.$noteTitle.style.display = 'none';
        this.$formButtons.style.display = 'none';

    }
    openTooltip(event) {
        //console.log("openTooltip called on:", event.target);
        if (!event.target.matches('.toolbar-color')) return;

        // Find the closest parent '.note' to get its 'data-id'
        const noteElem = event.target.closest('.note');
        //console.log("Closest .note element:", noteElem);
        if (!noteElem) return; // Exit if no note element found


        this.id = noteElem.dataset.id;
        console.log("Extracted note ID:", this.id);

        const coordinates = event.target.getBoundingClientRect();
        const horizontal = coordinates.left; // Relative to the viewport
        const vertical = coordinates.top + coordinates.height; // Position below the toolbar-color

        this.$colorTooltip.style.left = `${horizontal}px`;
        this.$colorTooltip.style.top = `${vertical}px`;
        this.$colorTooltip.style.display = 'flex';
    }
    closeTooltip(event) {
        if (!event.target.matches('.toolbar-color')) return;
        this.$colorTooltip.style.display = 'none';
    }
    editNoteColor(color) {
        const idEdit = Number(this.id);

        //Iterate through notes, find the id and update that notes color
        this.notes.forEach(note => {
            if (note.id === idEdit) {
                note.color = color;
            }
        });
        this.saveNotes();
        this.displayNotes();

    }
    openModal(event) {
        if (event.target.matches('.toolbar-delete')) return;

        if (event.target.closest('.note')) {
            this.$modal.classList.toggle('open-modal');
            this.$modalTitle.value = this.title;
            this.$modalText.value = this.text;

        }
    }
    closeModal(event) {
        //first edit the note then close it
        this.editNote();
        this.$modal.classList.toggle('open-modal');

    }
    editNote() {
        const title = this.$modalTitle.value;
        const text = this.$modalText.value;
        const idEdit = Number(this.id);

        //Iterate through notes, find the id and update that notes text
        this.notes.forEach(note => {
            if (note.id === idEdit) {
                note.title = title;
                note.text = text;
            }
        });
        this.saveNotes();
        this.displayNotes();

    }
    selectNote(event) {
        const selectedNote = event.target.closest('.note');
        console.log(`Selected Note: ${selectedNote}`);

        //In case there is no note
        if (!selectedNote) return;

        const [noteTitle, noteText] = selectedNote.children;
        this.title = noteTitle.innerText;
        this.text = noteText.innerText;
        //collected from displayNotes() function inside first div using note-id""
        this.id = selectedNote.dataset.id;
    }
    deleteNote(event) {
        event.stopPropagation();
        if (!event.target.matches('.toolbar-delete')) return;

        // Find the closest parent '.note' to get its 'data-id'
        const noteElem = event.target.closest('.note');
        //console.log("Closest .note element:", noteElem);
        if (!noteElem) return; // Exit if no note element found

        const id = noteElem.dataset.id;
        console.log("Extracted note ID:", this.id);

        this.notes = this.notes.filter(note => note.id !== Number(id));

        this.saveNotes();
        this.displayNotes();
    }
    addNote(note) {
        //note parameter is an Object{title,text}

        let newId = this.notes.length;
        if (this.notes.length > 0) {
            //Grab the last node and add one to it for the id
            newId = this.notes[this.notes.length - 1].id + 1;
        }
        else {
            //First note being added
            newId = 1;
        }

        const newNote = {
            title: note.title,
            text: note.text,
            color: 'white',
            id: newId
        };

        //Add it to the array of notes
        this.notes = [...this.notes, newNote];
        console.log(this.notes);

        this.saveNotes();
        this.displayNotes();

        //Collapse and clear out form
        this.closeForm();
        this.$noteTitle.value = '';
        this.$noteText.value = '';
    }
    saveNotes() {
        //saving notes to local storage
        localStorage.setItem('notes', JSON.stringify(this.notes));
    }
    displayNotes() {
        const noteExists = this.notes.length > 0;

        if (noteExists) {
            //hide place holder since we got notes to display
            this.$placeholder.style.display = 'none';
        } else {
            this.$placeholder.style.display = 'flex';
        }

        //iterate over notes
        this.$notes.innerHTML = this.notes.map(note => `
            <div style= "background: ${note.color};" class="note" data-id="${note.id}">
                <div class="${note.title && 'note-title'}">${note.title}</div>
                <div class="note-text">${note.text}</div>
                <div class="toolbar-container">
                    <div class="toolbar">
                        <img class="toolbar-delete" src="images/trash.png">
                        <img class="toolbar-color"  src="images/color.png">
                    </div>
                </div>
            </div>
        `).join("");
    }

}

new App()