import { useState, useCallback } from "react";
import T from "./theme/tokens";
import { MOCK_CODE } from "./mocks/mockData";
import { executeCode } from "./api";

import Topbar from "./components/Topbar";
import TestCasePanel from "./components/TestCasePanel";
import EditorPane from "./components/EditorPanel";
import AIPanel from "./components/AIPanel";
import OutputPanel from "./components/OutputPanel";

const Layout = () => {
  const [code, setCode]         = useState(MOCK_CODE);
  const [language, setLanguage] = useState("Python");
  const [running, setRunning]   = useState(false);
  const [output, setOutput]     = useState(null);
  const [testOpen, setTestOpen] = useState(true);
  const [testActual, setTestActual] = useState(null);
  const [testInput, setTestInput]   = useState("nums = [2, 7, 11, 15]\ntarget = 9");

  const handleRun = useCallback(async () => {
    setRunning(true);
    setOutput(null);
    setTestActual(null);

    try {
      const result = await executeCode({
        code,
        language,
        stdin: testOpen ? testInput : "",
      });

      if (testOpen) {
        setTestActual(result.stdout.trim());
      } else {
        setOutput(result);
      }
    } catch (err) {
      const errorResult = {
        stdout: "",
        stderr: err.message,
        time: "0.000s",
        memory: "0.0 MB",
        status: "Error",
      };
      if (testOpen) {
        setTestActual(`Error: ${err.message}`);
      } else {
        setOutput(errorResult);
      }
    } finally {
      setRunning(false);
    }
  }, [code, language, testOpen, testInput]);

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100vh", background: T.bg,
      color: T.textPri, overflow: "hidden",
    }}>
      <Topbar
        language={language}
        setLanguage={setLanguage}
        onRun={handleRun}
        running={running}
        testOpen={testOpen}
        setTestOpen={setTestOpen}
      />

      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <TestCasePanel
          open={testOpen}
          actualOutput={testActual}
          input={testInput}
          setInput={setTestInput}
        />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div style={{ flex: 1 }}>
            <EditorPane code={code} setCode={setCode} language={language} />
          </div>
          {output && !testOpen && (
            <div style={{ height: 200 }}>
              <OutputPanel output={output} onClose={() => setOutput(null)} />
            </div>
          )}
        </div>

        <div style={{ width: 360 }}>
          <AIPanel code={code} language={language} />
        </div>
      </div>
    </div>
  );
};

export default Layout;