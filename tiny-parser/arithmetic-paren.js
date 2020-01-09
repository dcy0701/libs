/*
  我们设计一个支持 + - * / 的DSL语言
  比如 "(1 + 2) * 10 - 5 / 3;"

  先看优先级 乘法和除法的优先级最高 所以我们首先判断 + -
  BNF:
  Expr ::= Expr + Term
        | Expr - Term
        | Term
  Term ::= Term * Factor
        | Term / Factor
        | Factor
  Factor:: = (expr)
        | num

  Factor 就是类似JS中的primary Expression，由终结符和括号组成，为优先级最高的因子

  这是一个递归下降的分析

  为什么要消除左递归？
  Expr ::= Expr + Term => Expr + Term + Term => Expr + Term + Term + Term
  会一直递归下去。

  // 消除左递归
  首先确认：Factor不变
  
  Factor:: = (expr)
        | num
  
  构建Term
  引入一个中间符号Term1

  Term1 ::= * Factor Term1
          | / Factor Term1
          | empty
  Term  ::= Factor Term1

  构建 Expr 同样的思路
  Expr1 ::= + Term Expr1
          | - Term Expr1
          | empty
  Expr ::= Term Expr1

  这样转化成了右递归
*/

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

  // Expr ::= Term Expr1
  // Expr1 ::= + Term Expr1
  //         | - Term Expr1
  //         | empty

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


  // Expr ::= Term Expr1
  // Expr1 ::= + Term Expr1
  //         | - Term Expr1
  //         | empty

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
  

  //   Term  ::= Factor Term1
  //   Term1 ::=  * Factor Term1
  //            | / Factor Term1
  //            | empty

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

    //   Term  ::= Factor Term1
    //   Term1 ::=  * Factor Term1
    //            | / Factor Term1
    //            | empty

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
