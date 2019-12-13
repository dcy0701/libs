const parse = require("../../parser/index");

test("empty input", () => {
  expect(parse(``)).toEqual({
    type: "Program",
    // start: 0,
    // loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } },
    body: [],
    // end: 0
  });
});
