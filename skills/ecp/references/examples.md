# Examples

Small executions that run on a fresh install: they use only the bundled core plugin (`core.transform`, `core.parse-csv`). Each was validated and run against the host.

## Transform

`hello.ecp.json`:

```json
{
  "schema": "@executioncontrolprotocol.execution",
  "version": "2.0",
  "steps": [
    {
      "id": "greet",
      "uses": "@executioncontrolprotocol/core.transform",
      "accepts": { "type": "object", "properties": { "name": { "type": "string" } }, "required": ["name"] },
      "returns": { "type": "object", "properties": { "greeting": { "type": "string" } }, "required": ["greeting"] },
      "input": { "name": "world" },
      "script": { "lang": "js", "source": "return { greeting: `Hello, ${input.name}!` }" },
      "as": "hello"
    }
  ]
}
```

Run: `ecp execute hello.ecp.json --json`

## forEach over run input

`titles.ecp.json` (run input `titles`, one transform per item, collected into `slugs`):

```json
{
  "schema": "@executioncontrolprotocol.execution",
  "version": "2.0",
  "execution": {
    "id": "slug-titles",
    "accepts": {
      "type": "object",
      "properties": { "titles": { "type": "array", "items": { "type": "string" } } },
      "required": ["titles"]
    },
    "returns": {
      "type": "object",
      "properties": { "slugs": { "type": "array" } }
    }
  },
  "steps": [
    {
      "type": "loop",
      "mode": "forEach",
      "id": "each-title",
      "ref": "state.titles",
      "as": "title",
      "steps": [
        {
          "id": "slugify",
          "uses": "@executioncontrolprotocol/core.transform",
          "accepts": { "type": "object", "properties": { "title": { "type": "string" } }, "required": ["title"] },
          "returns": { "type": "object", "properties": { "slug": { "type": "string" } }, "required": ["slug"] },
          "input": { "title": { "$ref": "state.title" } },
          "script": {
            "lang": "js",
            "source": "return { slug: input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }"
          },
          "as": "item"
        }
      ],
      "collect": "state.item.slug",
      "into": "slugs"
    }
  ]
}
```

Validate: `ecp execute titles.ecp.json --validate --json`

Run: `ecp execute titles.ecp.json --input '{"titles":["Hello World","Second title"]}' --json`

Always pass `--input` (use `'{}'` when there is none) so `execution.accepts` defaults are applied.

## Parse CSV from disk

Place `sample.csv` beside the execution (relative paths resolve from the execution file's folder) or use an absolute path:

```json
{
  "schema": "@executioncontrolprotocol.execution",
  "version": "2.0",
  "steps": [
    {
      "id": "rows",
      "uses": "@executioncontrolprotocol/core.parse-csv",
      "input": {
        "file": { "kind": "file", "path": "sample.csv", "mediaType": "text/csv" }
      },
      "as": "csv"
    }
  ]
}
```

Output: `{ "csv": { "columns": [...], "rows": [{...}] } }`; every value is a string. Validation checks the shape only; the file is read at run time.

## More patterns

The ECP repository's `examples/` folder has larger executions (branches, loops, plugins): https://github.com/executioncontrolprotocol/executioncontrolprotocol/tree/development/examples
