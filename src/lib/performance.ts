// Performance Optimization Utilities

/**
 * Memoization utility
 */
const memoize = (fn) => {
    const cache = {};
    return (...args) => {
        const key = JSON.stringify(args);
        if (cache[key]) {
            return cache[key];
        }
        const result = fn(...args);
        cache[key] = result;
        return result;
    };
};

/**
 * Debouncing utility
 */
const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
};

/**
 * Lazy loading utility
 */
const lazyLoad = (fn) => {
    let executed = false;
    return () => {
        if (!executed) {
            executed = true;
            return fn();
        }
    };
};

export { memoize, debounce, lazyLoad };