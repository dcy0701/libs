const parse = require("../../parser/index");

test("statement test", () => {
  expect(parse(`var a`)).toEqual({
    type: "Program",
    body: [
      {
        type: "VariableDeclaration",
        kind: "var",
        declarations: [
          {
            type: "VariableDeclarator",
            id: {
              type: "Identifier",
              name: "a"
            },
            init: null
          }
        ]
      }
    ]
  });

  expect(parse(`var a, b, c`)).toEqual({
    type: "Program",
    body: [
      {
        type: "VariableDeclaration",
        kind: "var",
        declarations: [
          {
            type: "VariableDeclarator",
            id: {
              type: "Identifier",
              name: "a"
            },
            init: null
          },
          {
            type: "VariableDeclarator",
            id: {
              type: "Identifier",
              name: "b"
            },
            init: null
          },
          {
            type: "VariableDeclarator",
            id: {
              type: "Identifier",
              name: "c"
            },
            init: null
          }
        ]
      }
    ]
  });
});
