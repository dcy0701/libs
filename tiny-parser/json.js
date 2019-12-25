const jsonParse = source => {
  let ch = "";
  let nextAt = 0;

  const eat = char => {
    if (char && ch !== char) {
      throw "error";
    }
    ch = source[nextAt++];
    return ch;
  };

  const parseNumber = () => {
    let string = "";
    if (ch === "-") {
      eat("-");
      string = "-";
    }
    while (ch >= "0" && ch <= "9") {
      string += ch;
      eat();
    }

    return Number(string);
  };

  const parseString = () => {
    let string = "";

    // 不考虑转义 也不考虑多个嵌套引号
    while (eat()) {
      if (ch === '"') {
        eat('"');
        return string;
      }
      string += ch;
    }
    return string;
  };

  const parseWord = () => {
    if (ch === "t") {
      eat("t");
      eat("r");
      eat("u");
      eat("e");
      return true;
    } else if (ch === "f") {
      eat("f");
      eat("a");
      eat("l");
      eat("s");
      eat("e");
      return false;
    } else if (ch === "n") {
      eat("n");
      eat("u");
      eat("l");
      eat("l");
      return null;
    } else {
      throw "???11";
    }
  };

  const parseArray = () => {
    const array = [];
    eat("[");

    if (ch === "]") {
      eat("]");
      return array;
    }

    while (ch) {
      array.push(entry());
      if (ch === "]") {
        eat("]");
        return array;
      }
      eat(",");
    }

    eat("]");
    return array;
  };

  const parseObject = () => {
    const obj = {};
    eat("{");

    if (ch === "}") {
      return {};
    }

    while (true) {
      const key = parseString();
      eat(":");
      const value = entry();
      obj[key] = value;

      if (ch === "}") {
        break;
      }
      eat(",");
    }

    eat("}");

    return obj;
  };

  const entry = () => {
    switch (ch) {
      case "[":
        return parseArray();
      case "{":
        return parseObject();
      case "-":
        return parseNumber();
      case '"':
        return parseString();
      default:
        // 字面量 只有false true null
        return ch >= "0" && ch <= "9" ? parseNumber() : parseWord();
    }
  };

  eat();
  return entry();
};

console.log(jsonParse('{"a":{"b":[2,"3",{"c":4}]}}'));
console.log(jsonParse('{"a":{"b":[1]}}'));
