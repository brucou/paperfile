(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
      (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.paperFile = factory());
}(this, (function () {
  'use strict';
  const StrictMode = React.StrictMode;
  const render = ReactDOM.render;
  const {useRef} = React;

  // Hyperscript helpers
  // Cf. https://reactjs.org/docs/react-without-jsx.html
  const h = React.createElement;
  const div = (a, b) => h("div", a, b);
  const span = (a, b) => h("span", a, b);
  const button = (a, b) => h("button", a, b);
  const a = (a, b) => h("a", a, b);

  // Properties
  const baseURL = "http://localhost:3000/";
  const rootElement = document.getElementById("root");

  // Control states
  /**
   * @typedef {string} ControlState
   * Control state an application is in. Each control state corresponds
   * to a specific application behavior. Here a control state corresponds
   * to a screen.
   */
  const INIT = "init";
  const FILE_AVAILABLE_FOR_DOWNLOAD = "fafd";
  const CHECKING_GRAMMAR = "cg";
  const REQUEST_FAILED = "rf";

  // Events
  /**
   * @typedef {{type: String, data: *}} Event
   */
  const STARTED_APP = "sa";
  const SELECTED_FILE = "sf";
  const ENTERED_DROP_ZONE = "edz";
  const LEFT_DROP_ZONE = "ldz";
  const DROPPED_FILE_IN_DROP_ZONE = "dfidz";
  const CLICKED_RESTART = "cr";
  const REQUEST_SUCCEEDED = "rs";
  // Yeah that's just to avoid same moniker as REQUEST_FAILED control state...
  const REQUEST_ERRORED = "re";

  // Commands
  /**
   * @typedef {{type: string, params: *}} Command
   */
  const RENDER = "ctr";
  const UPLOAD_FILE = "ctuf";

  // Helpers
  function requestUpload(axiosInstance, file) {
    let formData = new FormData();

    formData.append("file", file);
    return axiosInstance
      .post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(res => res.data && res.data.url)
  }

  /**
   * Takes an event and computes actions to perform. Actions are of two kinds:
   * - updates the application state
   * - execute effects
   * Elm/Redux/Kingly(state machine) inspired.
   * @param {Event} event
   * @param {AppState} state Application state
   * @returns {{updates: AppStateUpdates, commands: Array<Command>}}
   */
  function controller(event, state) {
    const {type, data} = event;
    switch (type) {
      case STARTED_APP: {
        const initState = data;
        return {
          updates: initState,
          commands: [{type: RENDER, params: initState}]
        }
      }

      case ENTERED_DROP_ZONE: {
        const updates = {isFileDraggedOver: true};
        return {
          updates,
          commands: [
            {type: RENDER, params: updates}
          ]
        }
      }

      case LEFT_DROP_ZONE: {
        const updates = {isFileDraggedOver: false};
        return {
          updates,
          commands: [
            {type: RENDER, params: updates}
          ]
        }
      }

      case DROPPED_FILE_IN_DROP_ZONE: {
        const file = data;
        const updates = {isFileDraggedOver: false, controlState: CHECKING_GRAMMAR};
        return {
          updates,
          commands: [
            {type: UPLOAD_FILE, params: file},
            {type: RENDER, params: updates},
          ]
        }
      }

      case SELECTED_FILE: {
        const file = data;
        const updates = {downloadURL: null, controlState: CHECKING_GRAMMAR};
        return {
          updates,
          commands: [
            {type: UPLOAD_FILE, params: file},
            {type: RENDER, params: updates}
          ]
        }
      }

      case CLICKED_RESTART: {
        const updates = initState;
        return {
          updates,
          commands: [{type: RENDER, params: updates}]
        }
      }

      case REQUEST_ERRORED: {
        // In the end, we don't show that to the user
        // const err = data;
        // const htmlMessage = err && err.response && err.response.data || "Error!";
        const updates = {downloadURL: null, controlState: REQUEST_FAILED};
        return {
          updates,
          commands: [{type: RENDER, params: updates}]
        }
      }

      case REQUEST_SUCCEEDED: {
        /** @type String */
        const url = data;
        const updates = {downloadURL: url, controlState: FILE_AVAILABLE_FOR_DOWNLOAD};
        return {
          updates,
          commands: [{type: RENDER, params: updates}]
        }
      }

    }
  }

  const axiosInstance = axios.create({baseURL});

  /**
   * @typedef EffectHandlers {{[effect: string]: (function(params, AppState, dispatch): void): *)}}
   * An effect handler uses some data (`params`) to perform an effect.
   * The `dispatch` callback can be used to send events to the caller.
   * The application state (`AppState`) is also passed as a convenience to
   * compute the render command: render uses the updated application state,
   * already computed by the controller, so we reuse that instead of recomputing.
   * For any other command, the parameter is probably not needed.
   */
  /**
   * Factory that returns effect handlers. Every property corresponds to
   * an effect and is mapped to a function that runs that effect.
   * @param axiosInstance the axios instance created to query remote APIs
   * @returns {EffectHandlers}
   */
  const createEffectHandlers = (axiosInstance) => ({
    [RENDER]: (_, updatedState, __) => {
      render(
        h(StrictMode, {}, [
          h(App, {...updatedState}, null),
        ]),
        rootElement
      );
    },
    [UPLOAD_FILE]: (file, _, dispatch) => requestUpload(axiosInstance, file)
      .then(url => dispatch({type: REQUEST_SUCCEEDED, data: url}))
      .catch(err => dispatch({type: REQUEST_ERRORED, data: err}))
  });
  const effectHandlers = createEffectHandlers(axiosInstance);

  const createCommandHandler = (effectHandlers) => (commands, updatedState, dispatch) => {
    if (!commands) return;

    commands.forEach(({type, params}) => effectHandlers[type](params, updatedState, dispatch));
  };

  /**
   * Updates the application state from a series of state updates.
   * Should be non-destructive, i.e. at the very least shallow-copy.
   * @param {AppState} state
   * @param {Object} stateUpdates
   * @returns {AppState} updated state
   */
  const updateState = (state, stateUpdates) => ({...state, ...stateUpdates});
  const commandHandler = createCommandHandler(effectHandlers);

  /**
   * Factory that returns a dispatch function that processes
   * the events received by the application.
   * @param {function} commandHandler
   * @param {function(Event, AppState) : {updates: Object, commands: Array<Command>}} controller
   * @param {function(AppState, AppStateUpdates) : AppState} updateState
   * @returns {function (Event) : ()}
   */
  const createDispatcher = (commandHandler, controller, updateState) => {
    let appState = {};

    // This is fine for this app but it should be noted that dispatch is reentrant
    // so some care should be taken to avoid stack-exhausting infinite loops.
    // A call to `dispatch` should not trigger a subsequent synchronous
    // call to dispatch!
    const dispatch = (event) => {
      const {updates, commands} = controller(event, appState);
      appState = updateState(appState, updates);
      commandHandler(commands, appState, dispatch);
    }

    return dispatch
  }

  const dispatch = createDispatcher(commandHandler, controller, updateState);

  /**
   * Application's main component
   * @param {String} controlState
   * @param {Boolean} isFileDraggedOver
   * @param {null | String} downloadURL
   * @returns {*}
   */
  function App({controlState, isFileDraggedOver, downloadURL}) {
    const componentToDisplay = (() => {
      switch (controlState) {

        case INIT:
          return h(Init, {
            isFileDraggedOver,
            onFileSelected: (file) => dispatch({type: SELECTED_FILE, data: file}),
            onDragEnter: (_) => dispatch({type: ENTERED_DROP_ZONE, data: void 0}),
            onDragLeave: (_) => dispatch({type: LEFT_DROP_ZONE, data: void 0}),
            onDrop: (file) => dispatch({type: DROPPED_FILE_IN_DROP_ZONE, data: file}),
          }, null);

        case CHECKING_GRAMMAR:
          return h(CheckingGrammar, {}, null);

        case FILE_AVAILABLE_FOR_DOWNLOAD:
          return (
            h(DownloadPrompt, {
              url: downloadURL,
              onRestart: (_) => dispatch({type: CLICKED_RESTART, data: void 0})
            }, null)
          )

        case REQUEST_FAILED:
          return (
            h(RequestFailed, {
              onRestart: (_) => dispatch({type: CLICKED_RESTART, data: void 0})
            }, null)
          )

        default:
          return null
      }
    })();

    return (
      div({className: "app"}, [
        componentToDisplay
      ])
    );
  }

  function Init({isFileDraggedOver, onFileSelected, onDrop, onDragEnter, onDragLeave}) {
    const nativeFileSelectButtonRef = useRef(null);

    const handleDragEnter = e => {
      e.preventDefault();
      e.stopPropagation();

      onDragEnter(e);
    };

    const handleDragLeave = e => {
      e.preventDefault();
      e.stopPropagation();

      onDragLeave(e);
    };

    const handleDragOver = e => {
      e.preventDefault();
      e.stopPropagation();

      e.dataTransfer.dropEffect = 'copy';
    };

    const handleDrop = e => {
      e.preventDefault();
      e.stopPropagation();

      let file = [...e.dataTransfer.files][0];
      onDrop(file);
    };

    return div({
      className: "init dropzone ".concat(isFileDraggedOver ? " dragged-over" : ""),
      onDragOver: e => handleDragOver(e),
      onDrop: e => handleDrop(e),
      onDragEnter: e => handleDragEnter(e),
      onDragLeave: e => handleDragLeave(e)
    }, [
      div({className: "sink"}, "Drop Word file here"),
      div({}, [div({className: "or liner"}, "or")]),
      button({
        className: "file-select raise",
        onClick: (_) => {
          nativeFileSelectButtonRef.current.click();
        }
      }, "Choose Word file..."),
      h("input", {
        ref: nativeFileSelectButtonRef,
        className: "invisible",
        id: "fileElem",
        type: "file",
        accept: "application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/msword",
        onChange: (ev) => {
          ev.preventDefault();
          const selectedFiles = nativeFileSelectButtonRef.current.files;
          onFileSelected(selectedFiles[0]);
        }
      }, null)
    ])
  }

  function CheckingGrammar({}) {
    return (
      div({className: "checking-grammar primary"}, [
        span({className: "loading loading--full-height"}, "Checking grammar"),
      ])
    )
  }

  function DownloadPrompt({url, onRestart}) {
    return (
      div({className: "processed primary"}, [
        a({href: url, "aria-label": "file download link"}, "Download corrected file"),
        button({
          className: "restart",
          onClick: onRestart
        }, "Restart")
      ]))
  }

  function RequestFailed({onRestart}) {
    // ADR:
    // In the end, we don't show a more descriptive error message to the user.
    // A more detailed error message is available in the network tab
    // of the console.
    return (
      div({className: "failed"}, [
        div({className: "raise"}, `Server failed!`),
        button({className: "error", onClick: onRestart}, "Restart")
      ]))
  }

  // Kick-off the app with the initial rendering
  /**
   * @typedef {{isFileDraggedOver: boolean, downloadURL: null|string, controlState: ControlState}} AppState
   */
  /**
   * @typedef {Object} AppStateUpdates
   * @property {boolean} [isFileDraggedOver]
   * @property {null|string} [downloadURL]
   * @property {ControlState} [controlState]
   */
  const initState = {
    controlState: "init",
    isFileDraggedOver: false,
    downloadURL: null
  };
  dispatch({type: STARTED_APP, data: initState});

  // Exporting necessary variables for testing purposes.
  // When using a build and module system, this is not necessary.
  return {
    STARTED_APP,
    createDispatcher,
    SELECTED_FILE,
    ENTERED_DROP_ZONE,
    LEFT_DROP_ZONE,
    DROPPED_FILE_IN_DROP_ZONE,
    CLICKED_RESTART,
    REQUEST_SUCCEEDED,
    REQUEST_ERRORED,
    RENDER,
    UPLOAD_FILE,
    INIT,
    FILE_AVAILABLE_FOR_DOWNLOAD,
    CHECKING_GRAMMAR,
    REQUEST_FAILED,
    initState,
    controller,
    updateState,
    createCommandHandler
  }
})));

