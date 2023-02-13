/*
  This module provides `diff()` and `patch()` functions roughly compatible with
  the Python `dictdiffer` package. It allows diffs created with `dictdiffer` in
  Python to be applied to JS objects, and creation of diffs that can then be
  applied by dictdiffer.

  I say "roughly compatible" - compatible in as far as is required to support
  iframes in timing recordings, e.g. at a very basic level.
 */
export const dotLookup = (dest, path, parent = false) => {
  if (path === '' || path === []) {
    return dest;
  }

  let nodes;
  let isArray = false;

  if (Array.isArray(path)) {
    nodes = path;
    isArray = true;
  }
  else {
    nodes = path.split('.');
  }

  if (parent) {
    nodes = nodes.slice(0, -1);
  }

  let curNode = dest;

  while (nodes.length > 0) {
    const nextNode = nodes.shift();

    if (!curNode[nextNode]) {
      curNode[nextNode] = isArray ? [] : {};
    }

    curNode = curNode[nextNode];
  }

  return curNode;
};

const add = (dest, path, changes) => {
  const localDest = dotLookup(dest, path);
  changes.forEach(
    ([key, value]) => {
      localDest[key] = value;
    }
  );
};

const change = (dest, path, changes) => {
  const localDest = dotLookup(dest, path, true);

  let parentNode;
  if (Array.isArray(path)) {
    parentNode = path[path.length - 1];
  }
  else {
    const ppath = path.split('.');
    parentNode = ppath.slice(-1);
  }

  localDest[parentNode] = changes[1];
};

const remove = (dest, path, changes) => {
  const localDest = dotLookup(dest, path);
  changes.forEach(
    ([key]) => {
      delete localDest[key];
    }
  );
};

const PATCHERS = {
  add,
  change,
  remove
};

export function patch(diffResult, target) {
  const dest = JSON.parse(JSON.stringify(target));

  diffResult.forEach(
    ([action, path, changes]) => {
      PATCHERS[action](dest, path, changes);
    }
  );

  return dest;
}

export function diff(first, second) {
  const _diffRecursive = (first, second, node = []) => {
    let result = [];

    const dottedNode = node.every(n => typeof (n) === 'string') ? node.join('.') : node;
    let intersection = []; let addition = []; let deletion = [];
    let differ = false;

    if (first && second && typeof (first) === 'object' && typeof (second) === 'object') {
      if (Array.isArray(first) && Array.isArray(second)) {
        const lenFirst = first.length; const lenSecond = second.length;
        intersection = range(0, Math.min(lenFirst, lenSecond));
        addition = range(Math.min(lenFirst, lenSecond), lenSecond);
        deletion = range(Math.min(lenFirst, lenSecond), lenFirst).reverse();
        differ = true;
      }
      else {
        intersection = Object.keys(first).filter(f => Object.prototype.hasOwnProperty.call(second, f));
        addition = Object.keys(second).filter(f => !Object.prototype.hasOwnProperty.call(first, f));
        deletion = Object.keys(first).filter(f => !Object.prototype.hasOwnProperty.call(second, f));
        differ = true;
      }
    }

    if (differ) {
      intersection.forEach(
        key => {
          result = [
            ...result,
            ..._diffRecursive(first[key], second[key], [...node, key])
          ];
        }
      );

      if (addition.length > 0) {
        result.push(['add', dottedNode, addition.map(a => [a, second[a]])]);
      }

      if (deletion.length > 0) {
        result.push(['remove', dottedNode, deletion.map(d => [d, first[d]])]);
      }
    }
    else {
      if (first !== second) {
        result.push(['change', dottedNode, [first, second]]);
      }
    }

    return result;
  };

  return _diffRecursive(first, second, []);
}

const range = (start, stop, step = 1) =>
  Array(Math.ceil((stop - start) / step)).fill(start).map((x, y) => x + y * step);
