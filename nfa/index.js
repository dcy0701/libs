const specialWords = [")", "(", "?", "*", "+", "·", "", "|"];

const match = (reg, str) => {
  // 增加连接符
  reg = addLinkedSymbol(reg);
  // 转化为后缀表达式
  reg = regToPostifx(reg);
  // 创建NFA
  nfa = buildToNfa(reg);

  // 回溯
  return isMatchBackTrack(nfa, str);

  // 全量匹配
  return isMatch(nfa, str);
};

const isMatchBackTrack = (nfa, str) => {
  const strQueue = str.split("");
  const bt = (state, strQueue) => {
    if (state.isEnd === true && strQueue.length === 0) {
      return true;
    }
    const ch = strQueue.shift();
    if (ch !== undefined && state.transitions[ch] && bt(state.transitions[ch], strQueue)) {
      return true;
    }

    ch !== undefined && strQueue.unshift(ch);

    for (const nextState of state.epsilonTransitions || []) {
      if (bt(nextState, strQueue)) {
        return true;
      }
    }

    return false;
  };

  return bt(nfa.startState, strQueue);
};

const isMatch = (nfa, str) => {
  let currentStates = NFA.getClosure(nfa.startState);

  for (const ch of str) {
    const nextStates = [];
    for (const state of currentStates) {
      matchTimes++;
      if (state.transitions[ch]) {
        const paths = NFA.getClosure(state.transitions[ch]);
        nextStates.push(...paths.filter(item => !nextStates.includes(item)));
      }
    }
    currentStates = nextStates;

    if (currentStates.length === 0) {
      return false;
    }
  }

  return currentStates.some(state => state.isEnd);
};

// 一个NFA的状态节点
const State = class {
  constructor(end) {
    this.isEnd = !!end;
    // 跳跃
    this.epsilonTransitions = [];
    // 有效跳转 跳转与token有关
    this.transitions = {};
  }

  addTransition(token, toState) {
    this.transitions[token] = toState;
  }

  addEpsilonTransitions(toState) {
    this.epsilonTransitions.push(toState);
  }
};

const isPlainObject = obj => Reflect.ownKeys(obj).length === 0;

const NFA = class {
  constructor(startState, endState) {
    this.startState = startState;
    this.endState = endState;
  }

  static getClosure(state) {
    // 获得第一个
    const queue = [state];
    const accessStates = [];
    const visited = [];
    while (queue.length > 0) {
      const currentState = queue.pop();

      if (!isPlainObject(currentState.transitions) || currentState.isEnd) {
        if (!accessStates.includes(currentState)) {
          accessStates.push(currentState);
        }
      }

      const currentEpsilonTransitions = currentState.epsilonTransitions.filter(
        item => !visited.includes(item)
      );
      visited.push(...currentEpsilonTransitions);

      queue.push(...currentEpsilonTransitions);
    }

    return accessStates;
  }

  static createBasicNFA(token) {
    const start = new State();
    const end = new State(true);
    start.addTransition(token, end);
    return new NFA(start, end);
  }
  static buildClosure(nfa) {
    // 克林闭包 *
    const start = new State();
    const end = new State(true);
    nfa.endState.addEpsilonTransitions(start);
    nfa.endState.isEnd = false;
    nfa.endState.addEpsilonTransitions(end);

    start.addEpsilonTransitions(nfa.startState);
    start.addEpsilonTransitions(end);

    return new NFA(start, end);
  }
  static buildOneOrZero(nfa) {
    // ?
    const start = new State();
    const end = new State(true);

    nfa.endState.isEnd = false;
    nfa.endState.addEpsilonTransitions(end);

    start.addEpsilonTransitions(nfa.startState);
    start.addEpsilonTransitions(end);

    return new NFA(start, end);
  }
  static buildOneMore(nfa) {
    // +
    const start = new State();
    const end = new State(true);

    nfa.endState.isEnd = false;
    nfa.endState.addEpsilonTransitions(end);
    nfa.endState.addEpsilonTransitions(nfa.startState);

    start.addEpsilonTransitions(nfa.startState);

    return new NFA(start, end);
  }
  static buildLink(left, right) {
    // ·
    const start = new State();
    const end = new State(true);

    start.addEpsilonTransitions(left.startState);
    left.endState.isEnd = false;
    left.endState.addEpsilonTransitions(right.startState);

    right.endState.isEnd = false;
    right.endState.addEpsilonTransitions(end);

    return new NFA(start, end);
  }
  static buildUnion(left, right) {
    // |
    const start = new State();
    const end = new State(true);

    start.addEpsilonTransitions(left.startState);
    start.addEpsilonTransitions(right.startState);

    right.endState.addEpsilonTransitions(end);
    right.endState.isEnd = false;
    left.endState.addEpsilonTransitions(end);
    left.endState.isEnd = false;

    return new NFA(start, end);
  }
};

const buildToNfa = reg => {
  const stack = [];
  for (const ch of reg) {
    if (ch === "*") {
      stack.push(NFA.buildClosure(stack.pop()));
      continue;
    }

    if (ch === "?") {
      stack.push(NFA.buildOneOrZero(stack.pop()));
      continue;
    }

    if (ch === "+") {
      stack.push(NFA.buildOneMore(stack.pop()));
      continue;
    }

    if (ch === "·") {
      const right = stack.pop();
      const left = stack.pop();
      stack.push(NFA.buildLink(left, right));
      continue;
    }

    if (ch === "|") {
      const right = stack.pop();
      const left = stack.pop();
      stack.push(NFA.buildUnion(left, right));
      continue;
    }

    stack.push(NFA.createBasicNFA(ch));
  }

  return stack.pop();
};

const priorityMap = {
  "|": 1,
  "·": 2,
  "?": 3,
  "+": 3,
  "*": 3
};

const peek = stack => stack[stack.length - 1];

const regToPostifx = reg => {
  const StackA = [];
  const StackB = [];

  for (const ch of reg) {
    if (ch === "(") {
      StackB.push("(");
      continue;
    }

    if (ch === ")") {
      while (peek(StackB) !== "(") {
        StackA.push(StackB.pop());
      }
      StackB.pop();
      continue;
    }

    if (!specialWords.includes(ch)) {
      StackA.push(ch);
      continue;
    }

    if (["|", "·", "+", "*", "?"].includes(ch)) {
      while (StackB.length > 0) {
        const operator = peek(StackB);
        if (~~priorityMap[operator] >= priorityMap[ch]) {
          StackA.push(StackB.pop());
        } else {
          break;
        }
      }
      StackB.push(ch);
    }
  }

  while (StackB.length > 0) {
    StackA.push(StackB.pop());
  }

  return StackA.join("");
};

// 为什么要增加连接符？
/*
连接符 指的是连接各个NFA的辅助线 只有在字母 和 括号之间才需要连接
[\w(, \w\w, *(, )(, *\w, )\w] 
其实不难理解，只是增加一个and的表示而已，毕竟正则中 | 表示了union * + ?分别修饰了上一个数字
*/
const equal = (left, right) => {
  if (left === "w") {
    return !specialWords.includes(right);
  } else if (Array.isArray(left)) {
    return left.includes(right);
  } else {
    return left === right;
  }
};
const addLinkedSymbol = reg => {
  const linkedMatchs = [
    {
      left: "w",
      right: "("
    },
    {
      left: "w",
      right: "w"
    },
    {
      left: ["*", "+", "?"],
      right: "("
    },
    {
      left: ")",
      right: "("
    },
    {
      left: ["*", "+", "?"],
      right: "w"
    },
    {
      left: ")",
      right: "w"
    }
  ];
  let lastWord = "";
  let linkedRegStr = "";
  for (const ch of reg) {
    for (const { left, right } of linkedMatchs) {
      if (equal(left, lastWord) && equal(right, ch)) {
        linkedRegStr += "·";
      }
    }
    lastWord = ch;
    linkedRegStr += ch;
  }

  return linkedRegStr;
};

module.exports.match = match;
