# Back-end test strategy
## Unit tests
- separate pure functions from effectful functions
- mock APIs to test effectful functions

There is currently one unit test.

### Pure functions
- retrieveSpellingErrors

### Effectful functions
#### No mocking
- applyTextSuggestions

#### Mocking
- requestSpellChecks

Not much value to test the rest of the effectful functions. 
Best jump to integration tests and manual testing.
For the sake of time, we only did manual testing.

## Manual testing
Performed on three inputs:
- `spelling-test.docx` with two spelling errors
  - expected: 
    - speling -> spelling, wrng -> wrong, correctly replaced
    - docx file can be opened with the expected contents in it
    - docx file can be accessed with provided link
- `spelling-test-empty.docx` with no content
  - expected:
    - produced file has the same (empty) contents as input file
- `spelling-test-malformed.docx` with corrupted docx format
  - expected:
    - 400 error
    - server still on

# Front-end test strategy
We use a controller, that like Elm, Redux, or the Kingly state machine library (I am the author), takes events and computes commands to execute. That function is a pure function, and as such can be unit-tested easily. 

The controller pattern makes for a particularly attractive unit-testing option as it allows to unit-test **user scenarios**, which in turn leaves few integration and end-to-end tests to perform. This goes contrary to a recently popularized wisdom that predicates: *Write tests. Not too many. Mostly integration.*.

Our implementation only uses React as a UI library and as such does not the complexity of the testing process that comes with using React with the whole framework attached (hooks, state, lifecycle, etc.).

There are currently no end-to-end tests. Given the small scope, we tested the application manually.

# Running tests
## Front-end
QUnit tests:
- from the home directory, go to `tests/front-end` and open the `index.html` in a browser. 

## Back-end
From the home directory, run `npm run test` (`yarn run test` should work too, but has not been tested).
