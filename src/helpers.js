/**
 * This function wraps an action with timers to compute the duration of an operation
 * 
 * @param {string} name Name of the action to execute
 * @param {Function} action Function to execute
 */
 function step(name, action) {
    const label = `${name} execution time:`;
    console.time(label)
  
    action();
  
    console.timeEnd(label)
  }
  
  /**
   * This function wraps an action with timers to compute the duration of an operation
   * 
   * @param {string} name Name of the action to execute
   * @param {Function} action Function to execute
   */
  async function stepAsync(name, action) {
    const label = `${name} execution time:`;
    console.time(label)
  
    await action();
  
    console.timeEnd(label)
  }
  
  module.exports = {
    step,
    stepAsync
  }
  