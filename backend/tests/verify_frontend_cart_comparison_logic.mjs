import assert from "node:assert/strict";

// Helper identical to frontend/src/services/productService.ts
function getProductComparisonId(product) {
  if (product.product_id && String(product.product_id).trim()) {
    return String(product.product_id).trim();
  }
  if (product.id != null) {
    return String(product.id);
  }
  return "";
}

// Helper identical to Cart.tsx distinct products computation
function computeDistinctCartProducts(items) {
  const seenIds = new Set();
  const distinct = [];
  for (const item of items) {
    const pid = getProductComparisonId(item.product);
    if (pid && !seenIds.has(pid)) {
      seenIds.add(pid);
      distinct.push(item.product);
    }
  }
  return distinct;
}

// Simulation of Cart selection state & compare dispatch
class CartComparisonWorkflow {
  constructor(initialItems) {
    this.items = [...initialItems];
    this.selectedProductIds = [];
    this.isSelectionModalOpen = false;
    this.navigationTarget = null;
    this.navigationState = null;
    this.compareMessage = null;
    this.syncSelection();
  }

  syncSelection() {
    const distinct = computeDistinctCartProducts(this.items);
    const currentIds = distinct.map(getProductComparisonId).filter(Boolean);
    const stillValid = this.selectedProductIds.filter((id) => currentIds.includes(id));
    if (currentIds.length === 2) {
      this.selectedProductIds = currentIds;
    } else {
      this.selectedProductIds = stillValid.slice(0, 2);
    }
  }

  toggleSelection(productId) {
    if (!productId) return;
    this.compareMessage = null;
    if (this.selectedProductIds.includes(productId)) {
      this.selectedProductIds = this.selectedProductIds.filter((id) => id !== productId);
    } else if (this.selectedProductIds.length >= 2) {
      this.selectedProductIds = [this.selectedProductIds[1], productId];
    } else {
      this.selectedProductIds.push(productId);
    }
  }

  removeItem(productId) {
    this.items = this.items.filter((item) => item.product.id !== productId);
    this.syncSelection();
  }

  executeComparison(idA, idB) {
    if (!idA || !idB || idA === idB) {
      this.compareMessage = "Please select two distinct products to compare.";
      return false;
    }
    const distinct = computeDistinctCartProducts(this.items);
    this.navigationTarget = `/compare?product_a=${encodeURIComponent(idA)}&product_b=${encodeURIComponent(idB)}`;
    this.navigationState = { comparisonCandidates: distinct };
    this.isSelectionModalOpen = false;
    return true;
  }

  handleCompareClick() {
    const distinct = computeDistinctCartProducts(this.items);
    if (distinct.length < 2) {
      this.compareMessage = "Add at least 2 distinct products to your cart to compare them side-by-side.";
      return false;
    }
    this.compareMessage = null;

    if (distinct.length === 2) {
      const idA = getProductComparisonId(distinct[0]);
      const idB = getProductComparisonId(distinct[1]);
      return this.executeComparison(idA, idB);
    }

    if (this.selectedProductIds.length === 2) {
      return this.executeComparison(this.selectedProductIds[0], this.selectedProductIds[1]);
    }

    this.isSelectionModalOpen = true;
    return false;
  }
}

console.log("Starting ShopMind AI Cart-to-Comparison Workflow Verification...\n");

// Case 1: Cart with two products
{
  console.log("=== Test Case 1: Cart with Two Products ===");
  const cart = new CartComparisonWorkflow([
    { product: { id: 101, product_id: "ext-1", name: "boAt Rockerz 450", price: 1499 }, quantity: 1 },
    { product: { id: 102, product_id: "ext-2", name: "Sony WH-CH520", price: 4499 }, quantity: 1 },
  ]);

  const distinct = computeDistinctCartProducts(cart.items);
  assert.equal(distinct.length, 2, "Distinct products must be exactly 2");
  assert.deepEqual(cart.selectedProductIds, ["ext-1", "ext-2"], "Both products must be automatically selected");

  const success = cart.handleCompareClick();
  assert.equal(success, true, "Comparison must trigger directly for two products");
  assert.equal(
    cart.navigationTarget,
    "/compare?product_a=ext-1&product_b=ext-2",
    "Target must include both product IDs"
  );
  assert.equal(cart.navigationState.comparisonCandidates.length, 2, "State must contain candidates");
  console.log("✓ Test Case 1 Passed: Cart with 2 products directly and accurately navigates to comparison.\n");
}

// Case 2: Cart with three products
{
  console.log("=== Test Case 2: Cart with Three Products ===");
  const cart = new CartComparisonWorkflow([
    { product: { id: 101, product_id: "ext-1", name: "boAt Rockerz 450", price: 1499 }, quantity: 1 },
    { product: { id: 102, product_id: "ext-2", name: "Sony WH-CH520", price: 4499 }, quantity: 1 },
    { product: { id: 103, product_id: "ext-3", name: "JBL Tune 760NC", price: 5999 }, quantity: 1 },
  ]);

  const distinct = computeDistinctCartProducts(cart.items);
  assert.equal(distinct.length, 3, "Cart has 3 distinct products");
  assert.equal(cart.selectedProductIds.length, 0, "No premature auto-selection of arbitrary items");

  // Clicking compare opens selection modal
  const firstClick = cart.handleCompareClick();
  assert.equal(firstClick, false, "Must not silently compare first two products");
  assert.equal(cart.isSelectionModalOpen, true, "Selection modal must open");

  // User chooses product 1 and product 3
  cart.toggleSelection("ext-1");
  cart.toggleSelection("ext-3");
  assert.deepEqual(cart.selectedProductIds, ["ext-1", "ext-3"], "Selected IDs must match user choice");

  // Now comparing proceeds with the user's chosen pair
  const secondClick = cart.handleCompareClick();
  assert.equal(secondClick, true, "Comparison succeeds with selected pair");
  assert.equal(cart.navigationTarget, "/compare?product_a=ext-1&product_b=ext-3");
  console.log("✓ Test Case 2 Passed: Cart with 3 products requires selection and compares user-chosen pair.\n");
}

// Case 3: Cart with four or more products
{
  console.log("=== Test Case 3: Cart with Four or More Products ===");
  const items = [
    { product: { id: 1, product_id: "lap-1", name: "MacBook Air M2", price: 99990 }, quantity: 1 },
    { product: { id: 2, product_id: "lap-2", name: "Dell XPS 13", price: 114990 }, quantity: 1 },
    { product: { id: 3, product_id: "lap-3", name: "HP Envy x360", price: 84990 }, quantity: 1 },
    { product: { id: 4, product_id: "lap-4", name: "Lenovo Yoga 7", price: 79990 }, quantity: 1 },
  ];
  const cart = new CartComparisonWorkflow(items);

  const distinct = computeDistinctCartProducts(cart.items);
  assert.equal(distinct.length, 4, "Cart has 4 distinct products");

  // User selects lap-2 and lap-4
  cart.toggleSelection("lap-2");
  cart.toggleSelection("lap-4");
  const success = cart.handleCompareClick();
  assert.equal(success, true);
  assert.equal(cart.navigationTarget, "/compare?product_a=lap-2&product_b=lap-4");
  assert.equal(cart.navigationState.comparisonCandidates.length, 4, "All 4 candidates passed in state");
  console.log("✓ Test Case 3 Passed: Cart with 4+ products passes all candidates and compares chosen pair.\n");
}

// Case 4: Cart with duplicate quantities of the same product
{
  console.log("=== Test Case 4: Cart with Duplicate Quantities of Same Product ===");
  const cart = new CartComparisonWorkflow([
    { product: { id: 101, product_id: "ext-1", name: "boAt Rockerz 450", price: 1499 }, quantity: 3 },
  ]);

  const distinct = computeDistinctCartProducts(cart.items);
  assert.equal(distinct.length, 1, "Duplicate quantities of single product evaluate to 1 distinct product");

  const success = cart.handleCompareClick();
  assert.equal(success, false, "Must not allow comparing single product with itself");
  assert.match(cart.compareMessage, /Add at least 2 distinct products/);

  // Now user adds a second product with quantity 2
  cart.items.push({
    product: { id: 102, product_id: "ext-2", name: "Sony WH-CH520", price: 4499 },
    quantity: 2,
  });
  cart.syncSelection();

  const distinctAfter = computeDistinctCartProducts(cart.items);
  assert.equal(distinctAfter.length, 2, "Now exactly 2 distinct products exist");
  const successAfter = cart.handleCompareClick();
  assert.equal(successAfter, true, "Comparison now succeeds for the two distinct products");
  assert.equal(cart.navigationTarget, "/compare?product_a=ext-1&product_b=ext-2");
  console.log("✓ Test Case 4 Passed: Duplicate quantities are deduplicated; self-comparison prevented.\n");
}

// Case 5: Cart with a removed or unavailable product
{
  console.log("=== Test Case 5: Cart with Removed or Unavailable Product ===");
  const cart = new CartComparisonWorkflow([
    { product: { id: 101, product_id: "ext-1", name: "boAt Rockerz 450", price: 1499 }, quantity: 1 },
    { product: { id: 102, product_id: "ext-2", name: "Sony WH-CH520", price: 4499 }, quantity: 1 },
    { product: { id: 103, product_id: "ext-3", name: "JBL Tune 760NC", price: 5999 }, quantity: 1 },
  ]);

  // User selects ext-1 and ext-2
  cart.toggleSelection("ext-1");
  cart.toggleSelection("ext-2");
  assert.deepEqual(cart.selectedProductIds, ["ext-1", "ext-2"]);

  // User removes ext-2 from cart
  cart.removeItem(102);
  assert.equal(cart.items.length, 2, "Cart now has 2 items left (ext-1 and ext-3)");
  // Selection must automatically clean up the removed product ID
  assert.deepEqual(cart.selectedProductIds, ["ext-1", "ext-3"], "Auto-synced to the remaining 2 products");

  // User removes ext-3 from cart
  cart.removeItem(103);
  assert.equal(cart.items.length, 1, "Cart now has only 1 item");
  const compareAfterRemoval = cart.handleCompareClick();
  assert.equal(compareAfterRemoval, false, "Cannot compare with only 1 item remaining");
  assert.match(cart.compareMessage, /Add at least 2 distinct products/);

  console.log("✓ Test Case 5 Passed: Removing products automatically updates state and cleans selections.\n");
}

console.log("ALL 5 WORKFLOW CASES PASSED SUCCESSFULLY!");

