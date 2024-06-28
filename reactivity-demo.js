// For storing the dependencies for each reactive object
const targetMap = new WeakMap();

let activeEffect = null; // The active effect running

function track(target, key) {
  if (activeEffect) { // only track if there is an activeEffect
      // Get the current depsMap for the target (reactive object)
      let depsMap = targetMap.get(target);
      if (!depsMap) {
        // If it doesn't exist, create it
        targetMap.set(target, (depsMap = new Map()));
      }
    
      // Get the dependency object for this property
      let dep = depsMap.get(key)
      if (!dep) {
        // If it doesn't exist, create it
        depsMap.set(key, (dep = new Set()));
    }
    dep.add(activeEffect);
  }
}

function trigger(target, key) {
  // Does this object have any properties that have dependencies?
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  let dep = depsMap.get(key);
  if (dep) {
    dep.forEach(effect => {
      effect(); // run them all!
    });
  }
}

function reactive(target) {
  const handler = {
    get(target, key, receiver) {
      let result = Reflect.get(target, key, receiver);
      track(target, key);
      return result;
    },
    set(target, key, value, receiver) {
      let oldValue = target[key];
      let result = Reflect.set(target, key, value, receiver);
      if (result && oldValue != value) {
        // console.log('trigger', target, key)
        trigger(target, key);
      }
      console.log(result)
      return result;
    }
  }
  return new Proxy(target, handler);
}

function effect(eff) {
  console.log('effect')
  activeEffect = eff;  // Set this as the activeEffect
  activeEffect();      // Run it
  activeEffect = null; // Unset it
}

let product = reactive({ price: 5, quantity: 2 });
let salePrice = 0;
let total = 0;

effect(() => {
  total = product.price * product.quantity;
});

effect(() => {
  salePrice = product.price * 0.9;
});

console.log(
  `Before updated total (should be 10) = ${total} salePrice (should be 4.5) = ${salePrice}`
); // Should output '10' and '4.5'

product.quantity = 3; // Will rerun the total effect function

console.log(
  `After updated total (should be 15) = ${total} salePrice (should be 4.5) = ${salePrice}`
); // Should output '15' and '4.5'

product.price = 10; // Would run both the effect functions above

console.log(
  `After updated total (should be 30) = ${total} salePrice (should be 9) = ${salePrice}`
); // Should be '30' and '9'
