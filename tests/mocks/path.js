const path = {
  resolve: jest.fn((...paths) => {
    // Simple path resolution that joins paths with forward slashes
    return paths.join('/').replace(/\/+/g, '/');
  }),
  join: jest.fn((...paths) => {
    // Simple path joining that uses forward slashes
    return paths.join('/').replace(/\/+/g, '/');
  }),
  dirname: jest.fn((path) => {
    // Return the directory name of a path
    return path.split('/').slice(0, -1).join('/');
  }),
  basename: jest.fn((path) => {
    // Return the last portion of a path
    return path.split('/').pop();
  }),
  relative: jest.fn((from, to) => {
    // Simple relative path calculation
    const fromParts = from.split('/').filter(Boolean);
    const toParts = to.split('/').filter(Boolean);
    
    let commonParts = 0;
    for (let i = 0; i < Math.min(fromParts.length, toParts.length); i++) {
      if (fromParts[i] !== toParts[i]) break;
      commonParts++;
    }
    
    const upCount = fromParts.length - commonParts;
    const downParts = toParts.slice(commonParts);
    
    return [...Array(upCount).fill('..'), ...downParts].join('/') || '.';
  }),
  isAbsolute: jest.fn((path) => {
    // Check if path starts with / or drive letter on Windows
    return /^([a-zA-Z]:|\/|\\)/.test(path);
  })
};

module.exports = path;
