const identifierReg = /[A-Za-z_$]/
const identifierGlobalReg = /[A-Za-z_$0-9]+/g
const keywords = /^(?:var|const|let|class|constructor|extends|static|super|function|return|throw|if|else|switch|case|default|for|in|while|do|break|continue|try|catch|finally|debugger|new|this|null|true|false|delete|void|typeof|instanceof|export|as|from|import|of)$/;

let tokenPos = 0; // token当前位置
let lastStart = 0;
let lastEnd = 0;
let tokVal = ""; // token的值
let tokType = ""; // token类型
let tokStart = 0; // token起点
let tokEnd = 0; // token结束点
let inputLen = 0;
let input = "";

/* 语句的类型 */

// end of file
const _eof = { type: "eof" };
// 变量声明
const _var = { type: "var" };
const _let = { type: "let" };
const _const = { type: "const" };
// 逗号
const _comma = { type: "," };

//
const _name = { type: "name" };

const keywordTypes = {
  var: _var,
  const: _const,
  let: _let
};

const initOpts = () => {
  tokenPos = 0;
  tokVal = "";
  tokType = "";
};

const parse = inp => {
  initOpts();
  inputLen = inp.length;
  input = String(inp);

  const node = startNode();
  node.body = [];

  /* 读取第一个token
   *  token的属性 保存在全局
   */

  readToken();

  // 其实js文件，是由多个语句构成的；
  while (tokType !== _eof) {
    const statement = parseStatement();
    node.body.push(statement);
    break;
  }

  return finishNode(node, "Program");
};

const parseStatement = () => {
  const node = startNode(); // 创建一个语句节点

  switch (tokType) {
    case _var:
    case _let:
    case _const:
      return parseVaribleDeclaration(node);
  }
};

const parseVaribleDeclaration = node => {
  const n = parseVar(node);
  return finishNode(n, "VariableDeclaration");
};

const parseVar = node => {
  node.kind = tokVal;
  // 读取下一个token
  next();

  node.declarations = [];

  for (;;) {
    const n = startNode();
    n.id = parseIdent();

    n.init = null;

    node.declarations.push(finishNode(n, "VariableDeclarator"));
    if (!eat(_comma)) break;
  }
  return node;
};

function parseIdent() {
  const node = startNode();
  node.name = tokVal;

  next();

  return finishNode(node, "Identifier");
}

function eat(type) {
  // 吃掉这个token，并且读取下一个token
  if (tokType === type) {
    next();
    return true;
  }
}

const startNode = () => {
  const obj = {
    type: null
  };

  // TODO 设置loc，设置start
  return obj;
};

const readToken = () => {
  const char = input.charAt(tokenPos);
  const charCode = input.charCodeAt(tokenPos);

  if (tokenPos >= inputLen) {
    // 添加一个文件尾部的类型
    return finishToken(_eof);
  }

  // 根据token的首字母 获取token
  const token = getTokenFromCode(charCode);
  // 符合一个变量名 或者 关键字
  if (!token && identifierReg.test(char)) {
    readWord();
  }
};

const getTokenFromCode = code => {
  // 在此函数内 得到token并且移动坐标
  switch (code) {
    case 34: // "
    case 39: // ''
      return readString(code);

    case 44:
      tokenPos++;
      return finishToken(_comma);
  }
};

const readWord = () => {
  tokType = _name;
  identifierGlobalReg.lastIndex = tokenPos;

  const array = identifierGlobalReg.exec(input);
  const [word = ""] = array || [""];

  if (word) {
    tokenPos = tokenPos + word.length;
    // 改变当前token长度

    // 返回关键字名称，修改tokType
    if (keywords.test(word)) {
      tokType = keywordTypes[word];
    }
  }

  finishToken(tokType, word);
};

const finishToken = (type, str) => {
  tokType = type;
  tokEnd = tokenPos;
  tokVal = str;
  // 跳过空格
  skipSpace();
  return type;
};

const skipSpace = () => {
  while (tokenPos < inputLen) {
    const ch = input.charAt(tokenPos);

    if (
      ch === "\n" ||
      ch === "\t" ||
      ch === " " ||
      ch === "\r" ||
      ch === "\f"
    ) {
      ++tokenPos;
    } else {
      break;
    }
  }
};

const finishNode = (node, type) => {
  // 记录通用的node参数
  node.type = type;
  // TODO 记录位置信息
  // TODO 记录start, end
  // node.loc = get
  return node;
};

function next() {
  readToken();
}

module.exports = parse;
