const { types, keywords } = require("./tokenType");

let ch = "";
let nextAt = 0;

const blockReg = /\s/; // TODO 空格定义

const tokenizer = input => {
  // 跳过空格 读取下个字符的总线
  const nextChar = (noskip) => {
    ch = input.charAt(nextAt)
    nextAt++;
    !noskip && skipBlock();

    return ch;
  };

  const skipBlock = () => {
    if (blockReg.test(ch)) {
      nextChar()
    }
  };

  while(true) {
    const ch = nextChar()

    
  }
};


console.log(tokenizer("a + '' * 2"));