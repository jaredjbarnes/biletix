export class Factory<T> {
  generator: () => T;
  availableInstances: T[] = [];
  usedInstances: T[] = [];

  constructor(generator: () => T) {
    this.generator = generator;
  }

  useInstance() {
    let instance: T;
    const availableInstance = this.availableInstances.pop();

    if (availableInstance == null) {
      instance = this.generator();
    } else {
      instance = availableInstance;
    }

    this.usedInstances.push(instance);

    return instance;
  }

  releaseInstance(instance: T) {
    const index = this.usedInstances.indexOf(instance);

    if (index > -1) {
      this.usedInstances.splice(index, 1);
      this.availableInstances.push(instance);
    }
  }

  releaseAll() {
    const usedInstances = this.usedInstances;
    const length = usedInstances.length;

    for (let x = 0; x < length; x++) {
      this.availableInstances.push(this.usedInstances[x]);
    }

    // Fast way to clear an array.
    this.usedInstances.length = 0;
  }
}
