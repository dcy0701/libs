class TokenType {
  constructor(label, conf = {}) {
    this.label = label;
    this.keyword = conf.keyword;
    this.binop = conf.binop || null;
  }
}

function binop(name, prec) {
  return new TokenType(name, { binop, prec });
}

const keywords = {}

function kw(name, options = {}) {
  options.keyword = name
  return keywords[name] = new TokenType(name, options)
}

const types = {
  // 合并的token
  num: new TokenType("num"),
  string: new TokenType("string"),
  name: new TokenType("name"),
  eof: new TokenType("eof"),

  // 标点符号集
  bracketL: new TokenType("["),
  bracketR: new TokenType("]"),
  brackL: new TokenType("{"),
  brackR: new TokenType("}"),
  parenL: new TokenType("("),
  parenR: new TokenType(")"),
  comma: new TokenType(","),
  semi: new TokenType(";"),
  colon: new TokenType(":"),
  dot: new TokenType("."),
  question: new TokenType("?"),
  eq: new TokenType("="),
  // 暂不涉及es6+
  logicalOR: binop("||", 1),
  logicalAND: binop("&&", 2),
  bitwiseOR: binop("|", 3),
  bitwiseXOR: binop("^", 4),
  bitwiseAND: binop("&", 5),
  modulo: binop("%", 10),
  star: binop("*", 10),
  slash: binop("/", 10),
  starstar: new TokenType("**", { beforeExpr: true }),

  // Keyword token types.
  _break: kw("break"),
  _case: kw("case"),
  _catch: kw("catch"),
  _continue: kw("continue"),
  _debugger: kw("debugger"),
  _default: kw("default"),
  _finally: kw("finally"),
  _for: kw("for"),
  _function: kw("function"),
  _if: kw("if"),
  _return: kw("return"),
  _switch: kw("switch"),
  _throw: kw("throw"),
  _try: kw("try"),
  _var: kw("var"),
  _const: kw("const"),
  _while: kw("while"),
  _with: kw("with"),
  _new: kw("new"),
  _this: kw("this"),
  _super: kw("super"),
  _class: kw("class"),
  _extends: kw("extends"),
  _export: kw("export"),
  _import: kw("import"),
  _null: kw("null"),
  _true: kw("true"),
  _false: kw("false"),
  _in: kw("in"),
  _instanceof: kw("instanceof"),
  _typeof: kw("typeof"),
  _void: kw("void"),
  _delete: kw("delete")
};


module.exports = {
  types,
  keywords,
}