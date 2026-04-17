/**
 * codeGuard.js
 * Fast static pre-filter before Docker even runs.
 * Docker isolation is the real sandbox — this is just a cheap first pass.
 */

const PYTHON_RULES = [
  { pattern: /\b(subprocess|os\.system|os\.popen|commands)\b/, reason: "Shell/subprocess access is not allowed" },
  { pattern: /\b(exec|eval)\s*\(/, reason: "exec() and eval() are not allowed" },
  { pattern: /\bcompile\s*\(/, reason: "compile() is not allowed" },
  { pattern: /__import__\s*\(/, reason: "Dynamic imports via __import__ are not allowed" },
  { pattern: /\bopen\s*\(.*?['"](w|a|wb|ab|w\+|a\+)['"]/, reason: "Writing to files is not allowed" },
  { pattern: /\b(socket|urllib|requests|httpx|aiohttp|pycurl)\b/, reason: "Network access is not allowed" },
  { pattern: /\bshutil\b/, reason: "File system manipulation (shutil) is not allowed" },
  { pattern: /\bctypes\b/, reason: "ctypes is not allowed" },
];

const CPP_RULES = [
  { pattern: /\bsystem\s*\(/, reason: "system() calls are not allowed" },
  { pattern: /\bpopen\s*\(/, reason: "popen() is not allowed" },
  { pattern: /\b(execl|execv|execvp|execlp|execle|execve)\s*\(/, reason: "exec() family calls are not allowed" },
  { pattern: /\bfork\s*\(\s*\)/, reason: "fork() is not allowed" },
  { pattern: /\bsocket\s*\(/, reason: "Network socket access is not allowed" },
  { pattern: /\bfopen\s*\(.*?['"](w|a|wb|ab)['"]/, reason: "Writing to files is not allowed" },
  { pattern: /#include\s*[<"](sys\/socket|netinet\/|arpa\/inet|unistd\.h)[>"]/, reason: "Network/system headers are not allowed" },
];

const JS_RULES = [
  { pattern: /\brequire\s*\(\s*['"]child_process['"]/, reason: "child_process module is not allowed" },
  { pattern: /\brequire\s*\(\s*['"]fs['"]/, reason: "fs module is not allowed" },
  { pattern: /\brequire\s*\(\s*['"]net['"]/, reason: "net module is not allowed" },
  { pattern: /\bprocess\.exit\b/, reason: "process.exit() is not allowed" },
];

const JAVA_RULES = [
  { pattern: /Runtime\.getRuntime\(\)\.exec/, reason: "Runtime.exec() is not allowed" },
  { pattern: /ProcessBuilder/, reason: "ProcessBuilder is not allowed" },
  { pattern: /new\s+FileWriter|new\s+FileOutputStream/, reason: "Writing to files is not allowed" },
  { pattern: /import\s+java\.net\./, reason: "Network access is not allowed" },
];

const GO_RULES = [
  { pattern: /\bos\/exec\b/, reason: "os/exec package is not allowed" },
  { pattern: /\bnet\b/, reason: "net package is not allowed" },
  { pattern: /os\.WriteFile|os\.Create/, reason: "Writing to files is not allowed" },
];

const RUST_RULES = [
  { pattern: /std::process::Command/, reason: "process::Command is not allowed" },
  { pattern: /std::net::/, reason: "Network access is not allowed" },
  { pattern: /std::fs::write|File::create/, reason: "Writing to files is not allowed" },
];

const RULES = {
  python:     PYTHON_RULES,
  cpp:        CPP_RULES,
  javascript: JS_RULES,
  java:       JAVA_RULES,
  go:         GO_RULES,
  rust:       RUST_RULES,
};

export function isSafe(code, language) {
  const rules = RULES[language] || [];

  for (const rule of rules) {
    if (rule.pattern.test(code)) {
      return { safe: false, reason: rule.reason };
    }
  }

  if (code.length > 50_000) {
    return { safe: false, reason: "Code exceeds the 50 KB size limit" };
  }

  return { safe: true, reason: null };
}