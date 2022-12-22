import { assertEquals } from "https://deno.land/std@0.159.0/testing/asserts.ts";
import { flatten, productsWithoutCurrentElem, final } from "./prueba.ts";

Deno.test(function testFlatten() {
  const initial = [1, [2, "3", 4], [], [[[]]], "45.3", 12];
  const expected = [1, 2, "3", 4, "45.3", 12];
  let result = flatten(initial);
  assertEquals(result, expected);
});

Deno.test(function testFlattenEmpty() {
  const initial: any[] = [];
  const expected: any[] = [];
  assertEquals(flatten(initial), expected);
});

Deno.test(function testFlattenEmptyElems() {
  const initial: any[] = [[], [[]]];
  const expected: any[] = [];
  assertEquals(flatten(initial), expected);
});

Deno.test(function testProductsWithoutIndexTwoElems() {
  const initial = [1, 2];
  const expected = [2, 1];
  assertEquals(productsWithoutCurrentElem(initial), expected);
});

Deno.test(function testProductsWithoutIndexThreeElems() {
  const initial = [1, 2, 3];
  const expected = [6, 3, 2];
  assertEquals(productsWithoutCurrentElem(initial), expected);
});

Deno.test(function testProductsWithoutIndexEmpty() {
  const initial: number[] = [];
  const expected: number[] = [];
  assertEquals(productsWithoutCurrentElem(initial), expected);
});

Deno.test(function testFinal() {
  const initial = [1, ["2", "1.5", 4], 1];
  const expected = [12, 6, 8, 3, 12];
  assertEquals(final(initial), expected);
});
