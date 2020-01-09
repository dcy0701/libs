/**
 * 今天我们会一起编写一个编译器。一个非常非常简化的微型编译器！这个编译器非常小，如果你移除这个
 * 文件里的注释，那么这个文件只剩下大概200行代码。
 *
 * 我们会将类似于LISP的函数调用编译成类似于C的函数调用。
 *
 *
 * 如果我有两个函数`add`和`subtract`，它们会像下面这样被写出来：
 *
 *                  LISP                      C
 *
 *   2 + 2          (add 2 2)                 add(2, 2)
 *   4 - 2          (subtract 4 2)            subtract(4, 2)
 *   2 + (4 - 2)    (add 2 (subtract 4 2))    add(2, subtract(4, 2))
 *
 * 非常简单直观!
 *
 * 非常好，因为这就是我们要编译的代码。
 * 尽管这并不是一个完整的LISP或者C的编译器，但是它足够展示
 * 现代编译器的很多大部分组成部件。
 */

/**
 * 大部分编译器的工作可以被分解为三个主要阶段：解析（Parsing），转化（Transformation）以及
 * 代码生成（Code Generation）。
 *
 * 1. *解析* 将源代码转换为一个更抽象的形式。
 *
 * 2. *转换* 接受解析产生的抽象形式并且操纵这些抽象形式做任何编译器想让它们做的事。
 *
 * 3. *代码生成* 基于转换后的代码表现形式（code representation）生成目标代码。
 */

/**
 * 解析
 * -------
 *
 * 解析一般被分为两个部分：词法分析和语法分析。
 *
 * 1. *词法分析*
 *
 * 2. *语法分析* 
 *
 * 看下面的代码:
 *
 *   (add 2 (subtract 4 2))
 *
 * 上面代码产生的词素会像下面这样：
 *
 *   [
 *     { type: 'paren',  value: '('        },
 *     { type: 'name',   value: 'add'      },
 *     { type: 'number', value: '2'        },
 *     { type: 'paren',  value: '('        },
 *     { type: 'name',   value: 'subtract' },
 *     { type: 'number', value: '4'        },
 *     { type: 'number', value: '2'        },
 *     { type: 'paren',  value: ')'        },
 *     { type: 'paren',  value: ')'        },
 *   ]
 *
 * 而产生的抽象语法树会像下面这样：
 *
 *   {
 *     type: 'Program',
 *     body: [{
 *       type: 'CallExpression',
 *       name: 'add',
 *       params: [{
 *         type: 'NumberLiteral',
 *         value: '2',
 *       }, {
 *         type: 'CallExpression',
 *         name: 'subtract',
 *         params: [{
 *           type: 'NumberLiteral',
 *           value: '4',
 *         }, {
 *           type: 'NumberLiteral',
 *           value: '2',
 *         }]
 *       }]
 *     }]
 *   }
 */

/**
 * 我们从解析步骤的第一个部分开始，词法分析。也就是tokenizer词素生成器的工作。
 *
 * 我们将源代码分解成一个词素数组。
 *
 *   (add 2 (subtract 4 2))   =>   [{ type: 'paren', value: '(' }, ...]
 */

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

/**
 * 我们的语法分析器接受我们的词素数组并创造出一个抽象语法树。
 *   (add 2 (subtract 4 2))
 *   [{ type: 'paren', value: '(' }, ...]   =>   { type: 'Program', body: [...] }
 */

const parser = tokens => {
  let currentIndex = 0;

  const ast = {
    type: "Program",
    body: []
  };

  const parseTerm = () => {
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
      // 创建一个`while`循环直到我们碰到一个类型为`paren`并且`value`是闭括号的词素
      while (
        (token.type === "paren" && token.value !== ")") ||
        token.type !== "paren"
      ) {
        node.params.push(parseTerm());
        token = tokens[currentIndex];
      }

      currentIndex++;
      return node;
    }
  };

  while (currentIndex < tokens.length) {
    ast.body.push(parseTerm());
  }

  return ast;
};

/**
 * 现在我们有了抽象语法树，而我们希望可以使用一个访问者对象来访问各个节点。我们需要能够在碰到一
 * 个节点的时候调用访问者对象相应的方法。
 *
 *   traverse(ast, {
 *     Program: (node, parent) {
 *        // ...
 *     },
 *
 *     CallExpression: (node, parent) {
 *        // ...
 *     },
 *
 *     NumberLiteral: (node, parent) {
 *        // ...
 *     },
 *   });
 */

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

/**
 * 接下来就是转换器。我们的转换器会接收我们创造的抽象语法树并将它和一个访问者对象传给traverser
 * 函数。然后创造一个新的抽象语法树。
 *
 * ----------------------------------------------------------------------------
 *   Original AST                     |   Transformed AST
 * ----------------------------------------------------------------------------
 *   {                                |   {
 *     type: 'Program',               |     type: 'Program',
 *     body: [{                       |     body: [{
 *       type: 'CallExpression',      |       type: 'ExpressionStatement',
 *       name: 'add',                 |       expression: {
 *       params: [{                   |         type: 'CallExpression',
 *         type: 'NumberLiteral',     |         callee: {
 *         value: '2'                 |           type: 'Identifier',
 *       }, {                         |           name: 'add'
 *         type: 'CallExpression',    |         },
 *         name: 'subtract',          |         arguments: [{
 *         params: [{                 |           type: 'NumberLiteral',
 *           type: 'NumberLiteral',   |           value: '2'
 *           value: '4'               |         }, {
 *         }, {                       |           type: 'CallExpression',
 *           type: 'NumberLiteral',   |           callee: {
 *           value: '2'               |             type: 'Identifier',
 *         }]                         |             name: 'subtract'
 *       }]                           |           },
 *     }]                             |           arguments: [{
 *   }                                |             type: 'NumberLiteral',
 *                                    |             value: '4'
 * ---------------------------------- |           }, {
 *                                    |             type: 'NumberLiteral',
 *                                    |             value: '2'
 *                                    |           }]
 *                                    |         }
 *                                    |       }
 *                                    |     }]
 *                                    |   }
 * ----------------------------------------------------------------------------
 */
const transformer = ast => {
  ast._context = [];

// 接下来我会小小地作弊一下并使用一个小小的hack。我们会给父节点添加一个`context`属性，我们
// 会将子节点添加到它们的父节点的`context`属性中。

  traverser(ast, {
    NumberLiteral: (node, parent) => {
      parent._context.push({
        type: "NumberLiteral",
        value: node.value
      });
    },
    CallExpression: (node, parent) => {
      let expression = {
        type: "CallExpression",
        callee: {
          type: "Identifier",
          name: node.name
        },
        arguments: []
      };
      
      // 绑定一个指针
      node._context = expression.arguments;

      if (parent.type !== "CallExpression") {
        expression = {
          type: "ExpressionStatement",
          expression: expression
        };
      }

      parent._context.push(expression);
    }
  });

  const newAst = {
    type: "Program",
    body: ast._context
  };

  return newAst;
};

/**
 * 现在我们进入最后的阶段：代码生成器。
 *
 * 我们的代码生成器会递归地调用自身将树中的每一个节点打印出来，最终形成一个巨大的字符串。
 */

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

const compiler = code => {
  const tokens = tokenizer(code);
  const ast = parser(tokens);
  const newAst = transformer(ast);
  return codegen(newAst);
};

console.log(compiler("(add 1 (substract 2 3))"));
