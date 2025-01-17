import * as React from "react";
import { isMobile } from "react-device-detect";

import { StyleContext } from "../contexts/StyleContext";
import { ThemeContext } from "../contexts/ThemeContext";
import { TerminalContext } from "../contexts/TerminalContext";

import Utils from "../common/Utils"

const removeSingleQuotes = (str:string) => str.replace(/'([^']+)'/g, '$1');

const splitRegex = /'[^']*'|\S+/g;
const splitToTokens = (str:string) => str.match(splitRegex)?.map(removeSingleQuotes) || [];

const fixUnclosedSingleQuotes = (input:string) => {
  let singleQuoteCount = 0;
  let output = input;

  for (let i = 0; i < input.length; i++) {
    if (input[i] === "'") {
      singleQuoteCount++;
    }
  }

  if (singleQuoteCount % 2 !== 0) {
    output += "'";
  }

  return output;
};

export const useEditorInput = (
  consoleFocused: boolean,
  editorInput: string,
  setEditorInput: any,
  setProcessCurrentLine: any,
  caretPosition: number,
  setCaretPosition: any,
  setBeforeCaretText: any,
  setAfterCaretText: any,
  enableInput: boolean,
  setCandidates: any,
  completionHandler: any
) => {
  const { getPreviousCommand, getNextCommand } = React.useContext(TerminalContext);

  const handleKeyDownEvent = async (event: any) => {
    if (!consoleFocused) {
      return;
    }
    //checks the value of enableInput and returns if its false
    if (!enableInput) {
      return;
    }
    event.preventDefault();

    const eventKey = event.key;

    if (eventKey === "Enter") {
      setProcessCurrentLine(true);
      setCandidates('');
      return;
    }

    let nextInput = null;

    if (eventKey === "Tab") {
      if (completionHandler) {
        const results = await completionHandler(editorInput);
        if (results.length === 1) {
          // 補完実行
          const tokens = splitToTokens(fixUnclosedSingleQuotes(editorInput));
          tokens[tokens.length - 1] = results[0];
          nextInput = tokens.join(' ');
          setCaretPosition(nextInput.length);
          setCandidates('');
        } else if (results.length > 1) {
          setCandidates(results.join(' '));
          nextInput = editorInput
        } else {
          nextInput = editorInput
          setCandidates('');
        }
      } else {
        nextInput = editorInput
        setCandidates('');
      }
    } else if (eventKey === "Backspace") {
      const [caretTextBefore, caretTextAfter] = Utils.splitStringAtIndex(editorInput, caretPosition);
      nextInput = caretTextBefore.slice(0, -1) + caretTextAfter;
      if (editorInput && editorInput.length !== 0) setCaretPosition(caretPosition - 1);
    } else if (eventKey === "ArrowUp") {
      nextInput = getPreviousCommand();
      if (nextInput) setCaretPosition(nextInput.length);
    } else if (eventKey === "ArrowDown") {
      nextInput = getNextCommand();
      if (nextInput) setCaretPosition(nextInput.length);
      else setCaretPosition(0);
    } else if (eventKey === "ArrowLeft") {
      if (caretPosition > 0) setCaretPosition(caretPosition - 1);
      nextInput = editorInput
    } else if (eventKey === "ArrowRight") {
      if (caretPosition < editorInput.length) setCaretPosition(caretPosition + 1);
      nextInput = editorInput
    } else if ((event.metaKey || event.ctrlKey) && eventKey.toLowerCase() === "v") {
      // navigator.clipboard.readText()
      // .then(pastedText => {
      //   const [caretTextBefore, caretTextAfter] = Utils.splitStringAtIndex(editorInput || "", caretPosition);
      //   nextInput = caretTextBefore + pastedText + caretTextAfter;
      //   setCaretPosition(caretPosition + pastedText.length);
      //   setEditorInput(nextInput);
      // });
    } else if ((event.metaKey || event.ctrlKey) && eventKey.toLowerCase() === "c") {
      const selectedText = window.getSelection().toString();
      navigator.clipboard.writeText(selectedText)
          .then(() => {
            nextInput = editorInput;
            setEditorInput(nextInput);
          });
    } else {
      if (eventKey && eventKey.length === 1) {
        const [caretTextBefore, caretTextAfter] = Utils.splitStringAtIndex(editorInput, caretPosition);
        nextInput = caretTextBefore + eventKey + caretTextAfter;
        setCaretPosition(caretPosition + 1);
      } else nextInput = editorInput
    }

    setEditorInput(nextInput);
    setProcessCurrentLine(false);
  };

  React.useEffect(() => {
    // Bind the event listener
    document.addEventListener("keydown", handleKeyDownEvent);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("keydown", handleKeyDownEvent);
    };
  });

  React.useEffect(
    () => {
      const [caretTextBefore, caretTextAfter] = Utils.splitStringAtIndex(editorInput, caretPosition);
      setBeforeCaretText(caretTextBefore);
      setAfterCaretText(caretTextAfter);
    },
    [editorInput, caretPosition]
  );
};

const textContent = (elem: React.ReactElement | string): string => {
  if (!elem) {
    return '';
  }
  if (typeof elem === 'string') {
    return elem;
  }
  const children = elem.props && elem.props.children;
  if (children instanceof Array) {
    return children.map(textContent).filter((e) => e && e.length > 0).join('\n');
  }
  // if (Array.isArray(elem)) {
  //   return elem.map((e) => textContent(e)).join('\n');
  // }
  return textContent(children);
};

export const useBufferedContent = (
  processCurrentLine: any,
  setProcessCurrentLine: any,
  prompt: string,
  currentText: any,
  setCurrentText: any,
  setCaretPosition: any,
  setBeforeCaretText: any,
  setAfterCaretText: any,
  commands: any,
  errorMessage: any,
  defaultHandler: any,
  clearHandler: any
) => {
  const { bufferedContent, setBufferedContent } = React.useContext(TerminalContext);
  const style = React.useContext(StyleContext);
  const themeStyles = React.useContext(ThemeContext);

  React.useEffect(
    () => {
      if (!processCurrentLine) {
        return;
      }

      const processCommand = async (text: string) => {

        const [command, ...rest] = text.trim().split(" ");
        let output = "";

        if(command === "clear") {
          setBufferedContent("");
          setCurrentText("");
          setProcessCurrentLine(false);
          setCaretPosition(0);
          setBeforeCaretText("");
          setAfterCaretText("");
          clearHandler();
          return
        }

        const waiting = (
          <>
            {bufferedContent}
            <span style={{ color: themeStyles.themePromptColor }}>{prompt}</span>
            <span className={`${style.lineText} ${style.preWhiteSpace}`}>{currentText}</span>
            <br />
          </>
        );
        setBufferedContent(waiting);
        setCurrentText("");
        setCaretPosition(0);
        setBeforeCaretText("");
        setAfterCaretText("");

        if (text) {
          const commandArguments = rest.join(" ");

          if (command && commands[command]) {
            const executor = commands[command];

            if (typeof executor === "function") {
              output = await executor(commandArguments);
            } else {
              output = executor;
            }
          } else if (typeof defaultHandler === "function") {
            // TODO: 3rd arg: It might be better to render to string and then htmlToText
            output = await defaultHandler(command, commandArguments, textContent(bufferedContent));
          } else if (typeof errorMessage === "function") {
            output = await errorMessage(command, commandArguments);
          } else {
            output = errorMessage;
          }
        }

        const nextBufferedContent = (
          <>
            {bufferedContent}
            <span style={{ color: themeStyles.themePromptColor }}>{prompt}</span>
            <span className={`${style.lineText} ${style.preWhiteSpace}`}>{currentText}</span>
            {output ? (
              <span>
                <br />
                {output}
              </span>
            ) : null}
            <br />
          </>
        );

        setBufferedContent(nextBufferedContent);
        setProcessCurrentLine(false);
      };

      processCommand(currentText);
    },
    [processCurrentLine]
  );
};

export const useCurrentLine = (
  caret: boolean,
  consoleFocused: boolean,
  prompt: string,
  commands: any,
  errorMessage: any,
  enableInput: boolean,
  defaultHandler: any,
  wrapperRef: any,
  completionHandler: any,
  clearHandler: any
) => {
  const style = React.useContext(StyleContext);
  const themeStyles = React.useContext(ThemeContext);
  const { appendCommandToHistory } = React.useContext(TerminalContext);
  const mobileInputRef = React.useRef(null);
  const [editorInput, setEditorInput] = React.useState("");
  const [processCurrentLine, setProcessCurrentLine] = React.useState(false);
  const [caretPosition, setCaretPosition] = React.useState(0);
  const [beforeCaretText, setBeforeCaretText] = React.useState("");
  const [afterCaretText, setAfterCaretText] = React.useState("");
  const [candidates, setCandidates] = React.useState('');

  useScrollToBottom(candidates, wrapperRef);

  React.useEffect(
    () => {
      if (!isMobile) {
        return;
      }
    },
    [consoleFocused]
  );

  React.useEffect(
    () => {
      if (!processCurrentLine) {
        return;
      }
      appendCommandToHistory(editorInput);
    },
    [processCurrentLine]
  );

  React.useEffect(() => {
    if(wrapperRef.current !== null && mobileInputRef.current !== null) {
      wrapperRef.current.onclick = () => {
        mobileInputRef.current.focus();
      }
    }
  },[])

  const mobileInput = isMobile && enableInput? (
    <div className={style.mobileInput}>
      <input
        type="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        value={editorInput}
        onChange={(event) => setEditorInput(event.target.value)}
        ref={mobileInputRef}
        data-testid={"editor-input"}
      />
    </div>
  ) : null;

  const currentLine = !processCurrentLine ? (
    <>
      {mobileInput}
      <span style={{ color: themeStyles.themePromptColor }}>{prompt}</span>
      <div className={style.lineText}>
        <span className={style.preWhiteSpace}>{beforeCaretText}</span>
        {consoleFocused && caret ? (  //if caret isn't true, caret won't be displayed
          <span className={style.caret}>
            <span className={style.caretAfter} style={{ background: themeStyles.themeColor }} />
          </span>
        ) : null}
        <span className={style.preWhiteSpace}>{afterCaretText}</span>
      </div>
      <div>
        {candidates}
      </div>
    </>
  ) : (
    <>
      {mobileInput}
      <div className={style.lineText}>
        {consoleFocused && caret? ( //if caret isn't true, caret won't be displayed
          <span className={style.caret}>
            <span className={style.caretAfter} style={{ background: themeStyles.themeColor }} />
          </span>
        ) : null}
      </div>
    </>
  );

  useEditorInput(
    consoleFocused,
    editorInput,
    setEditorInput,
    setProcessCurrentLine,
    caretPosition,
    setCaretPosition,
    setBeforeCaretText,
    setAfterCaretText,
    enableInput,
    setCandidates,
    completionHandler
  );

  useBufferedContent(
    processCurrentLine,
    setProcessCurrentLine,
    prompt,
    editorInput,
    setEditorInput,
    setCaretPosition,
    setBeforeCaretText,
    setAfterCaretText,
    commands,
    errorMessage,
    defaultHandler,
    clearHandler
  );

  return currentLine;
};

export const useScrollToBottom = (changesToWatch: any, wrapperRef: any) => {
  React.useEffect(
    () => {
      if (!wrapperRef.current) return;
      // eslint-disable-next-line no-param-reassign
      wrapperRef.current.scrollTop = wrapperRef.current.scrollHeight;
    },
    [changesToWatch]
  );
};
