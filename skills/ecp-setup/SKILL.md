---
name: ecp-setup
description: >-
  Set up ECP (Execution Control Protocol) on this machine from scratch: check or
  install Node.js, install the ecp CLI from npm, download the example
  executions, run a first execution, install and configure the first plugins,
  store secrets in the OS keychain, and connect an MCP client. Use when the user
  asks to install, set up, or get started with ECP, or when the ecp command is
  missing or older than this skill's version. After setup, use the ecp skill.
license: Apache-2.0
compatibility: macOS, Linux, or Windows with a shell and network access. Installs Node.js 22.12+ if needed.
metadata:
  version: "0.60.0"
  homepage: "https://executioncontrolprotocol.io/getting-started/agents"
---

# Set up ECP

Take the user from nothing to a working ECP (Execution Control Protocol) install in one short session. Run each step, check its result, and only move on when it passes. Tell the user what you're doing in one line per step. Ask before anything that needs their input (a password, an API key, a choice).

## 1. Check what is already installed

```bash
node --version
npm --version
ecp --version
```

- Node.js **22.12 or later** is required. Any current LTS release (22, 24, or 26) works.
- If `ecp --version` already shows **0.60.0 or later**, skip to step 4.
- Detect the OS (`uname -s`, or `$env:OS` in PowerShell) and use the matching commands below.

## 2. Install Node.js (only if missing or older than 22.12)

Prefer a version manager: it needs no admin rights and avoids permission errors with global npm packages.

**macOS and Linux (nvm):**

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.41.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"
nvm install --lts
nvm alias default 'lts/*'
node --version
```

The `export` and `.` lines load nvm into the current shell; new terminals load it automatically.

**Windows (winget, PowerShell):**

```powershell
winget install --id OpenJS.NodeJS.LTS -e --accept-source-agreements --accept-package-agreements
```

Then open a new terminal (or tell the user to) so `node` is on `PATH`, and check `node --version`.

**Other options:** `brew install node` on macOS with Homebrew, or the installers and package-manager commands at https://nodejs.org/en/download. Don't use `sudo npm` workarounds; if global installs fail with `EACCES`, switch to nvm.

## 3. Install the ECP CLI

```bash
npm install -g @executioncontrolprotocol/cli
ecp --version
```

`ecp --version` must show 0.60.0 or later. If npm installed an older version, the release isn't published yet: build from source instead:

```bash
git clone https://github.com/executioncontrolprotocol/executioncontrolprotocol.git
cd executioncontrolprotocol && corepack enable && pnpm install && pnpm run build
cd packages/cli && pnpm link --global && cd ../..
```

## 4. Install the ECP skills for other agents (optional)

You are reading one of them already. To add them to every agent on the machine, or refresh them later:

```bash
npx skills add https://executioncontrolprotocol.io -g -y
npx skills update -g -y
```

## 5. Download the examples

From the user's working folder (ask where if unclear). All later commands assume this folder:

```bash
mkdir -p ecp-examples && curl -fsSL https://codeload.github.com/executioncontrolprotocol/docs/tar.gz/refs/heads/main | tar -xz --strip-components=2 -C ecp-examples docs-main/examples
```

Windows PowerShell:

```powershell
mkdir ecp-examples -Force; curl.exe -fsSL https://codeload.github.com/executioncontrolprotocol/docs/tar.gz/refs/heads/main -o ecp-examples.tgz; tar -xzf ecp-examples.tgz --strip-components=2 -C ecp-examples docs-main/examples; Remove-Item ecp-examples.tgz
```

`ecp-examples/index.json` lists every example, the plugins it needs, and its run command. Its `ecpVersion` should match this skill's `metadata.version`; download again whenever they differ.

## 6. Run a first execution

```bash
cd ecp-examples/hello && ecp execute hello.ecp.json --input '{}'; cd ../..
```

Expected: `host: started http://127.0.0.1:<port> (idle 15m)` on the first run, then `greet  completed` and a JSON result with `"greeting": "Hello, world!"`. The host is a local background process; it stops by itself after 15 idle minutes.

Then show the user validation catching a mistake: copy `hello.ecp.json` to a scratch file, change `"as": "hello"` to `"as": "hello world"`, and run `ecp execute <scratch file> --validate`. It fails with a JSON path and a code. Delete the scratch file.

## 7. Add the first plugins

`ecp plugins` lists what is installed; `core` (transforms and CSV parsing) is bundled.

**JSONata transforms** (no configuration):

```bash
ecp plugins install jsonata
cd ecp-examples/jsonata-names && ecp execute names.ecp.json --input '{}'; cd ../..
```

**Claude models** (needs an Anthropic API key; ask the user whether they want this):

```bash
ecp plugins install anthropic
ecp commit --type config --action create --object @ecp-examples/configs/anthropic.default.json
```

The config refers to the secret `anthropic.apiKey`; it never contains the key itself. Ask the **user** to store the key in their OS keychain by running this in their own terminal and pasting the key at the hidden prompt:

```bash
ecp config secrets set anthropic.apiKey
```

Never ask them to paste the key into the chat, and never write it to a file. On a machine without a keychain (CI, containers, headless Linux), the user sets `ECP_SECRET_ANTHROPIC_APIKEY` in the environment the host starts from instead. Check with:

```bash
ecp config secrets list
cd ecp-examples/weekly-brief && ecp execute weekly-brief.ecp.json --input '{"signals": ["Shipped onboarding", "Churn down 2%"]}'; cd ../..
```

For any other plugin: `ecp plugins install <name>`, read its settings with `ecp retrieve --type capability --id <capability id>` (`configSchema`), write a config object like `ecp-examples/configs/anthropic.default.json`, commit it, and have the user set each `$secret`. Ask before installing third-party plugins.

## 8. Connect an MCP client (optional)

The MCP server gives any client three tools: `retrieve`, `execute`, `commit`.

| Client | Command or config |
| ------ | ----------------- |
| Claude Code | `claude mcp add ecp -- ecp mcp start` |
| Claude Desktop, Cursor (`.cursor/mcp.json`), Windsurf | `{ "mcpServers": { "ecp": { "command": "ecp", "args": ["mcp", "start"] } } }` |

## 9. Wrap up

Tell the user what is installed (Node version, `ecp --version`, plugins from `ecp plugins`, configs from `ecp retrieve --type config`), where the examples are, and suggest a next step: "describe a task you repeat, and I'll write an execution for it". From here on, use the **ecp** skill.

## Troubleshooting

| Problem | Fix |
| ------- | --- |
| `ecp: command not found` after install | Open a new terminal; with nvm run `. "$NVM_DIR/nvm.sh"`; check `npm prefix -g` is on `PATH` |
| `EACCES` on `npm install -g` | Install Node with nvm (step 2) instead of a system package |
| `ECP_HOST_UNAVAILABLE` (exit 4) | `ecp host logs` and `ecp host logs --supervisor`; then `ecp host start` |
| `ECP_PLUGINS_MISSING` (exit 3) | Run the `ecp plugins install` command from the message |
| `ECP_SECRET_MISSING` | The user runs `ecp config secrets set <key>` (or sets `ECP_SECRET_<KEY>`) |
| Keychain errors on Linux | No Secret Service running; use `ECP_SECRET_<KEY>` environment variables |
| Behind a proxy | Set `HTTPS_PROXY` for npm and the host |

Full guide for humans: https://executioncontrolprotocol.io/getting-started/agents.md
