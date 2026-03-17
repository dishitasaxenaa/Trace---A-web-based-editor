import Editor from "@monaco-editor/react";
import T from "../theme/tokens";
import Badge from "./Badge";

const MONACO_LANG = {
  Python: "python",
  "C++": "cpp",
  Java: "java",
  JavaScript: "javascript",
  Go: "go",
  Rust: "rust",
};

const EditorPanel = ({ code, setCode, language }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: T.bg }}>
      
      {/* Top Bar remains same */}

      <div style={{ flex: 1 }}>
        <Editor
          height="100%"
          language={MONACO_LANG[language]}
          value={code}
          onChange={(value) => setCode(value || "")}
          theme="vs-dark"
          options={{
            fontSize: 13,
            fontFamily: T.font,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
};

export default EditorPanel;