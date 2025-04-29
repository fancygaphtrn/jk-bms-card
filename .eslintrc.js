module.exports = {
    parser: '@typescript-eslint/parser',  // Specifies the ESLint parser
    plugins: [
    "@typescript-eslint"
    ],
    parserOptions: {
        ecmaVersion: 2018,  // Allows for the parsing of modern ECMAScript features
        sourceType: 'module',  // Allows for the use of imports
        experimentalDecorators: true,
    },
    rules: {
        "@typescript-eslint/camelcase": 0,
        "@typescript-eslint/no-explicit-any": 0,
    }
};
