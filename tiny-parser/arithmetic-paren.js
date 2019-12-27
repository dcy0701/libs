const tokenizer = sourceCode => {
  let ch = "";
  let nextAt = 0;

  const tokens = [];

  const read = () => {
    ch = sourceCode.charAt(nextAt);
    nextAt += 1;
    readBlock();
    return ch;
  };

  const readBlock = () => {
    if (/\s/.test(ch)) {
      read();
    }
  };

  const readNumber = () => {
    let string = "";

    while (/\d/.test(ch)) {
      string += ch;
      read();
    }

    return string;
  };

  read();

  while (nextAt <= sourceCode.length) {
    if (["+", "-", "*", "/", "(", ")"].includes(ch)) {
      tokens.push(ch);
      read();
    } else {
      tokens.push(readNumber());
    }
  }

  return tokens;
};

const parser = tokens => {
  let nextAt = 0;
  let tok = "";

  const eat = () => {
    tok = tokens[nextAt];
    nextAt += 1;
    return tok;
  };

  const parseStatement = () => {
    const node = {
      type: "ExpressionStatement",
      expression: parseExpression()
    };

    return node;
  };

  const parseExpr1 = () => {
    const lastTok = tok;
    if (lastTok === "+" || lastTok === "-") {
      eat();
      const leftResult = parseTerm();
      const rightResult = parseExpr1();

      if (rightResult === null) {
        return [lastTok, leftResult];
      }

      const node = {
        type: "binaryExpression",
      };

      const [operator, nodeRight] = rightResult;

      node.left = leftResult;
      node.right = nodeRight;
      node.operator = operator;

      return [lastTok, node];
    }

    return null;
  };

  const parseExpression = () => {
    const leftResult = parseTerm();
    const rightResult = parseExpr1();

    if (rightResult === null) {
      return leftResult;
    }

    const node = {
      type: "binaryExpression",
    };

    const [operator, nodeRight] = rightResult;

    node.left = leftResult;
    node.right = nodeRight;
    node.operator = operator;

    return node
  };
  const parseTerm = () => {
    const leftResult = parseFactor();
    const rightResult = parseTerm1();

    if (rightResult === null) {
      return leftResult;
    }

    const node = {
      type: "binaryExpression",
    };

    const [operator, nodeRight] = rightResult;

    node.left = leftResult;
    node.right = nodeRight;
    node.operator = operator;

    return node
  };

  const parseTerm1 = () => {
    const lastTok = tok;
    if (tok === "*" || tok === "/") {
      eat();
      const leftResult = parseFactor();
      const rightResult = parseTerm1();

      if (rightResult === null) {
        return [lastTok, leftResult];
      }

      const node = {
        type: "binaryExpression",
      };

      const [operator, nodeRight] = rightResult;

      node.left = leftResult;
      node.right = nodeRight;
      node.operator = operator;

      return [lastTok, node];
    }

    return null;
  };

  // Factor:: = (expr)
  //          | num
  const parseFactor = () => {
    if (isNumber(tok)) {
      const node = {
        type: 'Literal',
        value: tok,
      };

      eat();
      return node;
    }

    if (tok === '(') {
      eat();
      const node = parseExpression()
      if (tok === ')') {
        eat();
        return node
      }
    }
  };

  const isNumber = number => {
    return /\d+/.test(number);
  };

  eat();
  return parseStatement();
};





const tokens = tokenizer("(1 + 2) * 10 - 5 / 3");
const ast = parser(tokens)
console.log(ast);
