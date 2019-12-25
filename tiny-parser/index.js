const tokenizer = (input = "") => {
  const inputLen = input.length;
  let currentIndex = 0;

  let whitespaceReg = /\s/;
  let identifierReg = /[a-z]/;
  let identifierRegGlobal = /[a-z]+/g;
  let numberReg = /[0-9]/;
  let numberRegGlobal = /\d+/g;

  const tokenStream = [];

  while (currentIndex < inputLen) {
    const char = input.charAt(currentIndex);
    if (char === "(") {
      tokenStream.push({
        type: "paren",
        value: "("
      });

      currentIndex++;

      continue;
    }

    if (char === ")") {
      tokenStream.push({
        type: "paren",
        value: ")"
      });
      currentIndex++;

      continue;
    }

    if (whitespaceReg.test(char)) {
      currentIndex++;
      continue;
    }

    if (identifierReg.test(char)) {
      identifierRegGlobal.lastIndex = currentIndex;
      const [value] = identifierRegGlobal.exec(input);
      tokenStream.push({
        type: "name",
        value
      });

      currentIndex += value.length;

      continue;
    }

    if (numberReg.test(char)) {
      numberRegGlobal.lastIndex = currentIndex;
      const [value] = numberRegGlobal.exec(input);

      tokenStream.push({
        type: "number",
        value: +value
      });

      currentIndex += value.length;

      continue;
    }

    currentIndex++;
  }

  return tokenStream;
};

const parser = tokens => {
  let currentIndex = 0;

  const ast = {
    type: "Program",
    body: []
  };

  const parseStatement = () => {
    let token = tokens[currentIndex];

    if (token.type === "number") {
      currentIndex++;
      return {
        type: "NumberLiteral",
        value: token.value
      };
    }

    if (token.type === "paren" && token.value === "(") {
      token = tokens[++currentIndex];

      const node = {
        type: "CallExpression",
        name: token.value,
        params: []
      };

      token = tokens[++currentIndex];
      while (
        (token.type === "paren" && token.value !== ")") ||
        token.type !== "paren"
      ) {
        node.params.push(parseStatement());
        token = tokens[currentIndex];
      }

      currentIndex++;
      return node;
    }
  };

  while (currentIndex < tokens.length) {
    ast.body.push(parseStatement());
  }

  return ast;
};

const traverser = (ast, visitor) => {
  const queueList = [
    {
      parent: null,
      node: ast
    }
  ];
  while (queueList.length) {
    const { parent, node: currentNode } = queueList.pop();

    if (visitor[currentNode.type]) {
      visitor[currentNode.type](currentNode, parent);
    }

    const children = [...(currentNode.body || currentNode.params || [])]
      .reverse()
      .map(node => ({
        parent: currentNode,
        node
      }));
    queueList.push(...children);
  }
};

const transformer = ast => {
  ast._context = []

  traverser(ast, {
    CallExpression: (node, parent) => {
      let expression = {
        type: "CallExpression",
        callee: {
          type: "Identifier",
          name: node.name
        },
        arguments: []
      };

      node._context = expression.arguments;

      if (parent.type !== "CallExpression") {
        expression = {
          type: "ExpressionStatement",
          expression: expression
        };
      }

      parent._context.push(expression);
    },
    NumberLiteral: (node, parent) => {
      parent._context.push({
        type: "NumberLiteral",
        value: node.value
      });
    }
  });

  const newAst = {
    type: "Program",
    body: ast._context
  };

  return newAst;
};

const codegen = node => {
  switch (node.type) {
    case "Program":
      return node.body.map(codegen).join("\n");

    case "NumberLiteral":
      return node.value;

    case "ExpressionStatement":
      return codegen(node.expression) + ";";
    case "Identifier":
      return node.name;
    case "CallExpression":
      return `${codegen(node.callee)}(${node.arguments
        .map(codegen)
        .join(",")})`;
  }
};

const compiler = (code) => {
  const tokens = tokenizer(code)
  const ast = parser(tokens)
  const newAst = transformer(ast)
  return codegen(newAst)
}

console.log(compiler('(add 1 (substract 2 3))'));