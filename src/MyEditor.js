import React, { useState, useEffect, useRef } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  Modifier,
  convertToRaw,
  convertFromRaw,
} from "draft-js";
import "draft-js/dist/Draft.css";

const styleMap = {
  RED: {
    color: "red",
  },
};

const MyEditor = () => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [title, setTitle] = useState("");
  const editorRef = useRef(null);

  useEffect(() => {
    const savedData = localStorage.getItem("editorContent");
    const savedTitle = localStorage.getItem("title");

    if (savedData) {
      const contentState = convertFromRaw(JSON.parse(savedData));
      setEditorState(EditorState.createWithContent(contentState));
    }

    if (savedTitle) {
      setTitle(savedTitle);
    }
  }, []);

  const handleBeforeInput = (chars) => {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    const blockKey = selectionState.getStartKey();
    const block = contentState.getBlockForKey(blockKey);
    const blockText = block.getText();

    const replaceTextAndApplyStyle = (styleType, inline = false) => {
      const newContentState = Modifier.replaceText(
        contentState,
        selectionState.merge({
          anchorOffset: 0,
          focusOffset: blockText.length,
        }),
        ""
      );

      if (inline) {
        setEditorState(
          RichUtils.toggleInlineStyle(
            EditorState.push(editorState, newContentState, "remove-range"),
            styleType
          )
        );
      } else {
        setEditorState(
          RichUtils.toggleBlockType(
            EditorState.push(editorState, newContentState, "remove-range"),
            styleType
          )
        );
      }
      return "handled";
    };

    if (blockText === "#" && chars === " ") {
      return replaceTextAndApplyStyle("header-one");
    }

    if (blockText === "*" && chars === " ") {
      return replaceTextAndApplyStyle("BOLD", true);
    }

    if (blockText === "**" && chars === " ") {
      return replaceTextAndApplyStyle("RED", true);
    }

    if (blockText === "***" && chars === " ") {
      return replaceTextAndApplyStyle("UNDERLINE", true);
    }

    return "not-handled";
  };

  const handleKeyCommand = (command, editorState) => {
    if (command === "split-block") {
      const contentState = editorState.getCurrentContent();
      const selectionState = editorState.getSelection();
      const newContentState = Modifier.splitBlock(contentState, selectionState);
      const unstyledContentState = Modifier.setBlockType(
        newContentState,
        newContentState.getSelectionAfter(),
        "unstyled"
      );
      let newEditorState = EditorState.push(
        editorState,
        unstyledContentState,
        "split-block"
      );
      const currentInlineStyles = editorState.getCurrentInlineStyle();
      currentInlineStyles.forEach((style) => {
        newEditorState = RichUtils.toggleInlineStyle(newEditorState, style);
      });

      setEditorState(newEditorState);
      return "handled";
    }

    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }

    return "not-handled";
  };

  const saveContent = () => {
    const contentState = editorState.getCurrentContent();
    const rawContentState = convertToRaw(contentState);
    localStorage.setItem("editorContent", JSON.stringify(rawContentState));
    localStorage.setItem("title", title);
    alert("Content saved!");
  };

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  return (
    <div>
      {/* <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        placeholder="Enter title here"
      /> */}
      Demo Editor by Darshan
      <button
        onClick={saveContent}
        style={{ float: "right", margin: "10px", marginTop: "3px" }}
      >
        Save
      </button>
      <div
        style={{
          border: "1px solid #ddd",
          padding: "10px",
          minHeight: "200px",
          margin: "10px",
          padding: "10px",
          border: "2px solid skyblue",
        }}
      >
        <Editor
          editorState={editorState}
          onChange={setEditorState}
          handleKeyCommand={handleKeyCommand}
          handleBeforeInput={handleBeforeInput}
          placeholder="Type here..."
          customStyleMap={styleMap}
        />
      </div>
    </div>
  );
};

export default MyEditor;
