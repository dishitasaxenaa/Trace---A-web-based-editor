const axios = require("axios");

async function executeCode({ code, language, stdin }) {
  try {
    const response = await axios.post(
      "https://emkc.org/api/v2/piston/execute",
      {
        language: language,
        version: "*",
        files: [
          {
            content: code
          }
        ],
        stdin: stdin || ""
      }
    );

    const result = response.data.run;

    return {
      stdout: result.stdout,
      stderr: result.stderr,
      status: result.code === 0 ? "Accepted" : "Error"
    };

  } catch (err) {
    console.log("Piston error:", err.response?.data || err.message);
    throw new Error("Execution failed");
  }
}

module.exports = { executeCode };