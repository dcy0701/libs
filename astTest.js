const set = new Set();
console.log(
  "AAABbbBCCDeeEEeeffFFFff".replace(/(\w)(?=.*?(\1)|(\w))/gi, (_, $1, $2) => {
    if ($2 === undefined && set.has($1)) {
      return $1.toLowerCase();
    } else if ($2 === undefined) {
      return $1;
    }

    if (Math.abs($1.codePointAt(0) - $2.codePointAt(0)) === 32) {
      set.add($1, $2);
    }

    return "";
  })
);
