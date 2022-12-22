function main() {
  console.log("test1");
  let test1 = [1, [2, "3", 4], [], [[[]]], "45.3", 12];
  console.log(test1);
  let result1 = final(test1);
  console.log(result1);

  console.log("\ntest2");
  let test2 = [1];
  console.log(test2);
  let result2 = final(test2);
  console.log(result2);

  console.log("\ntest3");
  let test3 = ["123", "45", ["1", "2", ["3", [4]]]];
  console.log(test3);
  let result3 = final(test3);
  console.log(result3);

  console.log("\ntest4");
  let test4 = ["hola", "45", ["1", "2", ["3", [4]]]];
  console.log(test4);
  let result4 = final(test4);
  console.log(result4);

  console.log("\ntest5");
  let test5: any[] = [];
  console.log(test5);
  let result5 = final(test5);
  console.log(result5);
}

export function productsWithoutCurrentElem(arr: number[]): number[] {
  if (arr.length === 0) {
    return [];
  }
  let result: number[] = [];
  arr.forEach((_: number, i: number) => {
    let product = 1;
    arr.forEach((elem2: number, j: number) => {
      if (j !== i) {
        product *= elem2;
      }
    });
    result.push(product);
  });
  return result;
}

function arraysEqual(a: any[], b: any[]): boolean {
  if (a === b) {
    return true;
  }
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export function flatten(arr: any[]) {
  let new_arr: any[] = [];
  arr.forEach((elem) => {
    if (Array.isArray(elem)) {
      let flattened = flatten(elem);
      new_arr = new_arr.concat(flattened);
    } else {
      new_arr.push(elem);
    }
  });
  return new_arr;
}

export function final(arr: any[]) {
  let result = flatten(arr);
  result = result.map((value) => Number(value));
  result = productsWithoutCurrentElem(result);

  return result;
}

main();
