This repository contains the implementation of a mini-application as requested by paperfile in the context of its recruiting efforts.

# Requirements
- https://www.notion.so/Paperpile-full-stack-test-project-7953d77a7fe64de0a3c9c0bc9a2fa313
- cf. [Figma file](https://www.figma.com/file/qX18aK9vyAtMS28qKf8nrG/Fullstack-test-project?node-id=0%3A1).

In short, the application consists of a front-end that let a user select a Microsoft Word file (docx) and upload it to a server for the correction of possible spelling mistakes. The server corrects the mistakes if any and returns an URL for the corrected document.

# Implementation
## Get started
Install dependencies and run start.

## Architecture
There is a front-end and a back-end.

## Front-end
- React/JavaScript stack
- no build or module system are used for simplicity and velocity purposes
- Types are added in specific places [through JSDoc](https://medium.com/@trukrs/type-safe-javascript-with-jsdoc-7a2a63209b76)
- unit tests are available with good old QUnit, and run in the browser (so far tested only in Chrome)
- the front-end implementation is architectured around a event-state-action paradigm, as rendered popular by Elm, Redux, and a few others:
  - The application receives events that are turned into commands that are executed
  - React is used mostly as a rendering library that execute render commands
  - the pattern allows to unit-test user scenarios

Entry file: `public/index.html`

### Discrepancies vs. requirements
Where we felt the requirements could be improved, we took some decisions:
- we added an error screen that gives feedback to the user when a request to process the spelling mistakes in the document has failed
- we also added limits to the documents that can be received to spare the backend (10 MB in the current implementation)

### Known issues
- accepts non-word files... `accept` property does not work?? We haven't found a way to intruct the browser file select input widget to only accept docx files.
- for the reason previously mentioned, a docx file that has been turned into a zip file (replacing the .docx extension with .zip) will be spell-checked correctly. However, the user click on the download link will trigger the download of a zip file.

## Back-end
- Express stack
- router, file upload, logger, cors Express add-ons

### Discrepancies vs. requirements
Where we felt the requirements could be improved, we took some decisions:
- The requirement *Read and extract the text of the first paragraph of the first page.* may not be strictly implemented. The program will look for spelling mistakes everywhere in the document. That means the requirement is fulfilled only if it did not mean to read and extract **only** the text of the first paragraph of the first page.
- we do not check that the file that is being uploaded is indeed a docx file.

## Tests
Tests are available for both front- and back-end in the `tests` directory. Cf. `tests/README.md`.

# Possible improvements
## Backend
- remove download file after a while has passed or some other criteria to free server space
- could do more to validate incoming data:
    - post request (we do not check that the file that is being uploaded is indeed a docx file)
    - spell checking response
- could run some extra tests for files with unsafe characters
- tests with a larger variety of docx files
  - we made some assumptions (marked with `ASSUMPTIONS` in comments) that may be proved wrong, so more tests would help support/dispell these assumptions
  - variety means a test set with miscellaneous:
    - length:  . < SIZE_LIMIT, . = SIZE_LIMIT, . > SIZE_LIMIT 
    - content: text with spelling mistakes in paragraphs, titles, image captions, with revision marks, etc -- the idea is to cover the full docx markup to surface possible incongruencies
    - content: in particular we want to check Word's trimming behavior, so we don't inadvertently remove spaces from the input document
- tests (e2e)

## Front-end
- we do not check that the file that is being uploaded is indeed a docx file
- tests (e2e)

### Development process
- Would be great if the Figma file would provide actual HTML/CSS that can be plugged in the implementation. Designers using a design system may facilitate the handoff process.
