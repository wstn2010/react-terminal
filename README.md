<p align="center">🚀 React component that renders a Terminal 🖥 (This is enhanced project of react-terminal)</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#props">Props</a> •
  <a href="#report-a-bug">Report a bug</a>
</p>

![Terminal png](https://react-terminal.sirv.com/static/terminal-dracula.png)

## Features
- Mobile support. 📱
- Customizable commands, prompt and error message. ✅
- Support callbacks(async/non-async) for commands. 🔄
- Command history using arrow up and down. 🔼
- Support for copy/paste. 📋
- In-built themes and support to create more. 🚀
- Auto completion

## Installation
Install package with NPM or YARN and add it to your development dependencies:
```
npm install react-terminal-ex
```
OR
```
yarn add react-terminal-ex
```

## Usage
```
import { ReactTerminal } from "react-terminal-ex";

function App(props) {
  // Define commands here
  const commands = {
    whoami: "jackharper",
    cd: (directory) => `changed path to ${directory}`
  };

  return (
    <ReactTerminal
      commands={commands}
    />
  );
}
```

Also make sure to wrap the main mountpoint around the `TerminalContextProvider`. This retains the state even when the component is unmounted and then mounted back:
```
import { TerminalContextProvider } from "react-terminal-ex";

ReactDOM.render(
  <TerminalContextProvider>
    <App/>
  </TerminalContextProvider>,
  rootElement
);
```

## Creating custom themes
The component comes with few in-built themes: `light`, `dark`, `material-light`, `material-dark`, `material-ocean`, `matrix` and `dracula`. You can also create custom themes by passing `themes` parameter in props, as follows:

```
<ReactTerminal
  commands={commands}
  themes={{
    my-custom-theme: {
      themeBGColor: "#272B36",
      themeToolbarColor: "#DBDBDB",
      themeColor: "#FFFEFC",
      themePromptColor: "#a917a8"
    }
  }}
  theme="my-custom-theme"
/>
```

## Props
| name                    | description                                                                                                                                                                                                                                                                                                  | default
|-------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--
| `welcomeMessage`        | A welcome message to show at the start, before the prompt begins. Value can be either a string or JSX                                                                                                                                                                                                        | null
| `prompt`                | Terminal prompt                                                                                                                                                                                                                                                                                              | >>>
| `commands`              | List of commands to be provided as a key value pair where value can be either a string, JSX/HTML tag or callback                                                                                                                                                                                             | null
| `errorMessage`          | Message to show when unidentified command executed, can be either a string, JSX/HTML tag or callback                                                                                                                                                                                                         | "not found!"
| `enableInput`           | Whether to enable user input                                                                                                                                                                                                                                                                                 | true
| `showControlBar`        | Whether to show the top control bar                                                                                                                                                                                                                                                                          | true
| `showControlButtons`    | Whether to show the control buttons at the top bar of the terminal                                                                                                                                                                                                                                           | true
| `theme`                 | Theme of the terminal                                                                                                                                                                                                                                                                                        | "light"
| `themes`                | Themes object to supply custom themes                                                                                                                                                                                                                                                                        | null
| `defaultHandler`        | Default handler to be used (if provided) when no commands match. Useful when you don't know list of commands beforehand/want to send them to server for handling.                                                                                                                                            | null
| `completionHandler`     | Completion handler to be used (if provided) when 'tab' is pressed. The handler takes the entire input string and returns a list of candidates. If there is only one candidate, completion processing is performed. If there are two or more candidates, the candidates are displayed below the command line. | null
| `initialConsoleFocused` | initial value of ConsoleFocused                                                                                                                                                                                                                                                                              | true
| `clearHandler`          | Handler to be used when executing built-in clear comand                                                                                                                                                                                                                                                      | null

## In-built commands
| command | description |
|--|--|
| clear | clears the console |

