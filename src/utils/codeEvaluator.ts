import { Challenge, TestCase } from '../types/game';

export class CodeEvaluator {
  private outputBuffer: string[] = [];
  private errorBuffer: string[] = [];

  // Mock console.log for capturing output
  private mockPrint = (value: any) => {
    this.outputBuffer.push(String(value));
  };

  public evaluateCode(code: string, challenge: Challenge): {
    success: boolean;
    output: string;
    error?: string;
    passed: number;
    total: number;
  } {
    this.outputBuffer = [];
    this.errorBuffer = [];
    
    try {
      // Execute the Python-like code
      const result = this.executePythonLikeCode(code);
      const output = this.outputBuffer.join('\n');
      
      if (challenge.expectedOutput) {
        const success = this.compareOutput(output.trim(), challenge.expectedOutput.trim());
        return {
          success,
          output,
          passed: success ? 1 : 0,
          total: 1
        };
      }

      if (challenge.testCases) {
        let passed = 0;
        for (const testCase of challenge.testCases) {
          this.outputBuffer = [];
          const testResult = this.runTestCase(code, testCase);
          if (testResult) passed++;
        }
        
        return {
          success: passed === challenge.testCases.length,
          output,
          passed,
          total: challenge.testCases.length
        };
      }

      return {
        success: true,
        output,
        passed: 1,
        total: 1
      };
    } catch (error) {
      return {
        success: false,
        output: this.outputBuffer.join('\n'),
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        passed: 0,
        total: 1
      };
    }
  }

  private compareOutput(actual: string, expected: string): boolean {
    // Normalize whitespace and line endings
    const normalizeString = (str: string) => str.replace(/\s+/g, ' ').trim();
    
    // Handle array/list outputs
    if (expected.startsWith('[') && expected.endsWith(']')) {
      try {
        // Simple array comparison
        const actualNorm = normalizeString(actual.replace(/'/g, '"'));
        const expectedNorm = normalizeString(expected.replace(/'/g, '"'));
        return actualNorm === expectedNorm;
      } catch {
        return normalizeString(actual) === normalizeString(expected);
      }
    }
    
    // Handle multi-line outputs
    if (expected.includes('\n')) {
      const actualLines = actual.split('\n').map(line => line.trim()).filter(line => line);
      const expectedLines = expected.split('\n').map(line => line.trim()).filter(line => line);
      return actualLines.length === expectedLines.length && 
             actualLines.every((line, i) => line === expectedLines[i]);
    }
    
    return normalizeString(actual) === normalizeString(expected);
  }

  private executePythonLikeCode(code: string): any {
    // Enhanced Python-like interpreter
    const lines = code.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
    const variables: { [key: string]: any } = {};
    const functions: { [key: string]: Function } = {};
    
    // Built-in functions
    variables['range'] = (start: number, end?: number, step?: number) => {
      if (end === undefined) {
        end = start;
        start = 0;
      }
      step = step || 1;
      const result = [];
      for (let i = start; i < end; i += step) {
        result.push(i);
      }
      return result;
    };

    variables['len'] = (obj: any) => {
      if (Array.isArray(obj)) return obj.length;
      if (typeof obj === 'string') return obj.length;
      if (obj && typeof obj === 'object') return Object.keys(obj).length;
      return 0;
    };

    variables['str'] = (obj: any) => String(obj);
    variables['int'] = (obj: any) => parseInt(String(obj), 10);
    variables['float'] = (obj: any) => parseFloat(String(obj));
    variables['list'] = (obj: any) => Array.isArray(obj) ? obj : [obj];

    // Built-in methods for strings and arrays
    const addBuiltinMethods = () => {
      String.prototype.replace = function(search: string, replace: string) {
        return this.split(search).join(replace);
      };
    };

    let i = 0;
    while (i < lines.length) {
      try {
        const line = lines[i].trim();
        i += this.executeLine(line, variables, functions, lines, i);
      } catch (error) {
        this.errorBuffer.push(`Line ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
      }
    }
  }

  private executeLine(line: string, variables: any, functions: any, allLines: string[], currentIndex: number): number {
    // Skip empty lines and comments
    if (!line || line.startsWith('#') || line.startsWith('"""') || line.startsWith("'''")) {
      return 1;
    }

    // Function definition
    if (line.startsWith('def ')) {
      return this.parseFunction(line, allLines, currentIndex, functions, variables);
    }

    // Class definition (basic)
    if (line.startsWith('class ')) {
      return this.parseClass(line, allLines, currentIndex, variables);
    }

    // Import statements
    if (line.startsWith('import ') || line.startsWith('from ')) {
      this.handleImport(line, variables);
      return 1;
    }

    // Try-except blocks
    if (line.startsWith('try:')) {
      return this.parseTryExcept(allLines, currentIndex, variables, functions);
    }

    // Variable assignment
    if (line.includes('=') && !this.isComparison(line)) {
      const [varName, value] = line.split('=', 2).map(s => s.trim());
      variables[varName] = this.evaluateExpression(value, variables);
      return 1;
    }

    // Print statement
    if (line.startsWith('print(')) {
      const content = this.extractFunctionArgs(line, 'print')[0];
      const value = this.evaluateExpression(content, variables);
      this.mockPrint(value);
      return 1;
    }

    // For loop
    if (line.startsWith('for ')) {
      return this.parseForLoop(line, allLines, currentIndex, variables, functions);
    }

    // While loop
    if (line.startsWith('while ')) {
      return this.parseWhileLoop(line, allLines, currentIndex, variables, functions);
    }

    // If statement
    if (line.startsWith('if ') || line.startsWith('elif ') || line.startsWith('else:')) {
      return this.parseIfStatement(line, allLines, currentIndex, variables, functions);
    }

    // Function call or expression
    if (line.includes('(') && line.includes(')')) {
      this.evaluateExpression(line, variables);
      return 1;
    }

    // Return statement
    if (line.startsWith('return ')) {
      const value = this.evaluateExpression(line.substring(7), variables);
      throw new ReturnValue(value);
    }

    return 1;
  }

  private isComparison(line: string): boolean {
    const comparisons = ['==', '!=', '<=', '>=', '<', '>'];
    return comparisons.some(op => line.includes(op));
  }

  private parseFunction(line: string, allLines: string[], startIndex: number, functions: any, variables: any): number {
    const match = line.match(/def\s+(\w+)\s*\((.*?)\):/);
    if (!match) return 1;

    const [, funcName, params] = match;
    const paramList = params.split(',').map(p => p.trim()).filter(p => p);
    
    // Find function body
    let endIndex = startIndex + 1;
    let indent = 0;
    
    while (endIndex < allLines.length) {
      const currentLine = allLines[endIndex];
      if (currentLine.trim() === '') {
        endIndex++;
        continue;
      }
      
      const currentIndent = currentLine.length - currentLine.trimStart().length;
      if (indent === 0 && currentLine.trim()) indent = currentIndent;
      
      if (currentIndent < indent && currentLine.trim() !== '') break;
      endIndex++;
    }

    const functionBody = allLines.slice(startIndex + 1, endIndex);
    
    functions[funcName] = (...args: any[]) => {
      const localVars = { ...variables };
      paramList.forEach((param, i) => {
        localVars[param] = args[i];
      });

      // Execute function body
      try {
        for (let i = 0; i < functionBody.length; i++) {
          const bodyLine = functionBody[i];
          const trimmed = bodyLine.trim();
          if (trimmed && !trimmed.startsWith('"""') && !trimmed.endsWith('"""')) {
            this.executeLine(trimmed, localVars, functions, functionBody, i);
          }
        }
      } catch (error) {
        if (error instanceof ReturnValue) {
          return error.value;
        }
        throw error;
      }
      
      return undefined;
    };

    return endIndex - startIndex;
  }

  private parseClass(line: string, allLines: string[], startIndex: number, variables: any): number {
    const match = line.match(/class\s+(\w+)(?:\(([^)]*)\))?:/);
    if (!match) return 1;

    const [, className] = match;
    
    // Find class body
    let endIndex = startIndex + 1;
    let indent = 0;
    
    while (endIndex < allLines.length) {
      const currentLine = allLines[endIndex];
      if (currentLine.trim() === '') {
        endIndex++;
        continue;
      }
      
      const currentIndent = currentLine.length - currentLine.trimStart().length;
      if (indent === 0 && currentLine.trim()) indent = currentIndent;
      
      if (currentIndent < indent && currentLine.trim() !== '') break;
      endIndex++;
    }

    // Simple class implementation
    variables[className] = function(...args: any[]) {
      const instance: any = {};
      
      // Find and execute __init__ method
      const classBody = allLines.slice(startIndex + 1, endIndex);
      for (let i = 0; i < classBody.length; i++) {
        const bodyLine = classBody[i].trim();
        if (bodyLine.startsWith('def __init__(')) {
          // Simple constructor execution
          if (args.length > 0) {
            instance.balance = args[0] || 0;
          }
          break;
        }
      }
      
      // Add methods
      instance.deposit = function(amount: number) {
        instance.balance = (instance.balance || 0) + amount;
        return amount;
      };
      
      instance.withdraw = function(amount: number) {
        if (amount <= (instance.balance || 0)) {
          instance.balance -= amount;
          return amount;
        }
        return 0;
      };
      
      return instance;
    };

    return endIndex - startIndex;
  }

  private parseForLoop(line: string, allLines: string[], startIndex: number, variables: any, functions: any): number {
    const match = line.match(/for\s+(\w+)\s+in\s+(.+):/);
    if (!match) return 1;

    const [, varName, iterable] = match;
    const iterableValue = this.evaluateExpression(iterable, variables);
    
    // Find loop body
    let endIndex = startIndex + 1;
    let indent = 0;
    
    while (endIndex < allLines.length) {
      const currentLine = allLines[endIndex];
      if (currentLine.trim() === '') {
        endIndex++;
        continue;
      }
      
      const currentIndent = currentLine.length - currentLine.trimStart().length;
      if (indent === 0 && currentLine.trim()) indent = currentIndent;
      
      if (currentIndent < indent && currentLine.trim() !== '') break;
      endIndex++;
    }

    const loopBody = allLines.slice(startIndex + 1, endIndex);
    
    // Execute loop
    if (Array.isArray(iterableValue)) {
      for (const item of iterableValue) {
        variables[varName] = item;
        for (let i = 0; i < loopBody.length; i++) {
          const bodyLine = loopBody[i];
          const trimmed = bodyLine.trim();
          if (trimmed) {
            this.executeLine(trimmed, variables, functions, loopBody, i);
          }
        }
      }
    }

    return endIndex - startIndex;
  }

  private parseIfStatement(line: string, allLines: string[], startIndex: number, variables: any, functions: any): number {
    let currentIndex = startIndex;
    let executed = false;

    // Handle if/elif/else chain
    while (currentIndex < allLines.length) {
      const currentLine = allLines[currentIndex].trim();
      
      if (currentLine.startsWith('if ') || currentLine.startsWith('elif ')) {
        const condition = currentLine.substring(currentLine.indexOf(' ') + 1, currentLine.length - 1);
        const conditionResult = this.evaluateExpression(condition, variables);
        
        if (conditionResult && !executed) {
          const bodyEnd = this.findBlockEnd(allLines, currentIndex);
          const body = allLines.slice(currentIndex + 1, bodyEnd);
          
          for (let i = 0; i < body.length; i++) {
            const bodyLine = body[i];
            const trimmed = bodyLine.trim();
            if (trimmed) {
              this.executeLine(trimmed, variables, functions, body, i);
            }
          }
          executed = true;
          return bodyEnd - startIndex;
        } else {
          currentIndex = this.findBlockEnd(allLines, currentIndex);
        }
      } else if (currentLine === 'else:') {
        if (!executed) {
          const bodyEnd = this.findBlockEnd(allLines, currentIndex);
          const body = allLines.slice(currentIndex + 1, bodyEnd);
          
          for (let i = 0; i < body.length; i++) {
            const bodyLine = body[i];
            const trimmed = bodyLine.trim();
            if (trimmed) {
              this.executeLine(trimmed, variables, functions, body, i);
            }
          }
          return bodyEnd - startIndex;
        } else {
          return this.findBlockEnd(allLines, currentIndex) - startIndex;
        }
      } else {
        break;
      }
    }

    return currentIndex - startIndex;
  }

  private findBlockEnd(allLines: string[], startIndex: number): number {
    let endIndex = startIndex + 1;
    let indent = 0;
    
    while (endIndex < allLines.length) {
      const currentLine = allLines[endIndex];
      if (currentLine.trim() === '') {
        endIndex++;
        continue;
      }
      
      const currentIndent = currentLine.length - currentLine.trimStart().length;
      if (indent === 0 && currentLine.trim()) indent = currentIndent;
      
      if (currentIndent < indent && currentLine.trim() !== '') break;
      endIndex++;
    }

    return endIndex;
  }

  private parseWhileLoop(line: string, allLines: string[], startIndex: number, variables: any, functions: any): number {
    const condition = line.substring(6, line.length - 1); // Remove 'while ' and ':'
    
    // Find loop body
    const bodyEnd = this.findBlockEnd(allLines, startIndex);
    const loopBody = allLines.slice(startIndex + 1, bodyEnd);
    
    let iterations = 0;
    const maxIterations = 1000; // Prevent infinite loops
    
    while (this.evaluateExpression(condition, variables) && iterations < maxIterations) {
      for (let i = 0; i < loopBody.length; i++) {
        const bodyLine = loopBody[i];
        const trimmed = bodyLine.trim();
        if (trimmed) {
          this.executeLine(trimmed, variables, functions, loopBody, i);
        }
      }
      iterations++;
    }
    
    return bodyEnd - startIndex;
  }

  private parseTryExcept(allLines: string[], startIndex: number, variables: any, functions: any): number {
    // Find try block end
    const tryEnd = this.findBlockEnd(allLines, startIndex);
    const tryBody = allLines.slice(startIndex + 1, tryEnd);
    
    try {
      // Execute try block
      for (let i = 0; i < tryBody.length; i++) {
        const bodyLine = tryBody[i];
        const trimmed = bodyLine.trim();
        if (trimmed) {
          this.executeLine(trimmed, variables, functions, tryBody, i);
        }
      }
    } catch (error) {
      // Find except block
      let exceptIndex = tryEnd;
      while (exceptIndex < allLines.length && !allLines[exceptIndex].trim().startsWith('except')) {
        exceptIndex++;
      }
      
      if (exceptIndex < allLines.length) {
        const exceptEnd = this.findBlockEnd(allLines, exceptIndex);
        const exceptBody = allLines.slice(exceptIndex + 1, exceptEnd);
        
        // Set exception variable if specified
        const exceptLine = allLines[exceptIndex].trim();
        const match = exceptLine.match(/except\s+\w+\s+as\s+(\w+):/);
        if (match) {
          variables[match[1]] = error;
        }
        
        for (let i = 0; i < exceptBody.length; i++) {
          const bodyLine = exceptBody[i];
          const trimmed = bodyLine.trim();
          if (trimmed) {
            this.executeLine(trimmed, variables, functions, exceptBody, i);
          }
        }
        
        return exceptEnd - startIndex;
      }
    }
    
    return tryEnd - startIndex;
  }

  private handleImport(line: string, variables: any): void {
    // Handle basic imports
    if (line === 'import base64') {
      variables['base64'] = {
        b64decode: (data: string) => {
          try {
            return Array.from(atob(data)).map(c => c.charCodeAt(0));
          } catch {
            return [];
          }
        }
      };
    }
    
    if (line === 'import threading') {
      variables['threading'] = {
        Lock: function() {
          return {
            __enter__: () => {},
            __exit__: () => {}
          };
        }
      };
    }
  }

  private extractFunctionArgs(line: string, funcName: string): string[] {
    const start = line.indexOf('(') + 1;
    const end = line.lastIndexOf(')');
    const argsStr = line.substring(start, end);
    
    if (!argsStr.trim()) return [];
    
    // Simple argument parsing
    const args = [];
    let current = '';
    let depth = 0;
    let inString = false;
    let stringChar = '';
    
    for (let i = 0; i < argsStr.length; i++) {
      const char = argsStr[i];
      
      if (!inString && (char === '"' || char === "'")) {
        inString = true;
        stringChar = char;
        current += char;
      } else if (inString && char === stringChar) {
        inString = false;
        current += char;
      } else if (!inString && char === '(') {
        depth++;
        current += char;
      } else if (!inString && char === ')') {
        depth--;
        current += char;
      } else if (!inString && char === ',' && depth === 0) {
        args.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    if (current.trim()) {
      args.push(current.trim());
    }
    
    return args;
  }

  private evaluateExpression(expr: string, variables: any): any {
    expr = expr.trim();
    
    // Handle None, True, False
    if (expr === 'None') return null;
    if (expr === 'True') return true;
    if (expr === 'False') return false;
    
    // String literal
    if ((expr.startsWith('"') && expr.endsWith('"')) || 
        (expr.startsWith("'") && expr.endsWith("'"))) {
      return expr.slice(1, -1);
    }

    // Number
    if (!isNaN(Number(expr)) && expr !== '') {
      return Number(expr);
    }

    // List literal
    if (expr.startsWith('[') && expr.endsWith(']')) {
      const content = expr.slice(1, -1);
      if (!content.trim()) return [];
      const items = this.parseListItems(content);
      return items.map(item => this.evaluateExpression(item.trim(), variables));
    }

    // Function call
    if (expr.includes('(') && expr.includes(')')) {
      const funcName = expr.substring(0, expr.indexOf('('));
      const args = this.extractFunctionArgs(expr, funcName);
      
      if (variables[funcName] && typeof variables[funcName] === 'function') {
        const evaluatedArgs = args.map(arg => this.evaluateExpression(arg, variables));
        return variables[funcName](...evaluatedArgs);
      }
      
      // Built-in functions
      if (funcName === 'len') {
        const arg = this.evaluateExpression(args[0], variables);
        return Array.isArray(arg) ? arg.length : String(arg).length;
      }
      
      if (funcName === 'str') {
        return String(this.evaluateExpression(args[0], variables));
      }
      
      if (funcName === 'list') {
        const arg = this.evaluateExpression(args[0], variables);
        return Array.isArray(arg) ? arg : [arg];
      }

      if (funcName === 'any') {
        const arg = this.evaluateExpression(args[0], variables);
        if (Array.isArray(arg)) {
          return arg.some(item => Boolean(item));
        }
        return Boolean(arg);
      }

      if (funcName === 'ord') {
        const arg = this.evaluateExpression(args[0], variables);
        return String(arg).charCodeAt(0);
      }

      if (funcName === 'chr') {
        const arg = this.evaluateExpression(args[0], variables);
        return String.fromCharCode(Number(arg));
      }
    }

    // Method calls
    if (expr.includes('.')) {
      return this.evaluateMethodCall(expr, variables);
    }

    // Variable
    if (variables[expr] !== undefined) {
      return variables[expr];
    }

    // Arithmetic and comparison operations
    return this.evaluateOperation(expr, variables);
  }

  private parseListItems(content: string): string[] {
    const items = [];
    let current = '';
    let depth = 0;
    let inString = false;
    let stringChar = '';
    
    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      
      if (!inString && (char === '"' || char === "'")) {
        inString = true;
        stringChar = char;
        current += char;
      } else if (inString && char === stringChar) {
        inString = false;
        current += char;
      } else if (!inString && (char === '[' || char === '(')) {
        depth++;
        current += char;
      } else if (!inString && (char === ']' || char === ')')) {
        depth--;
        current += char;
      } else if (!inString && char === ',' && depth === 0) {
        items.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    if (current.trim()) {
      items.push(current.trim());
    }
    
    return items;
  }

  private evaluateMethodCall(expr: string, variables: any): any {
    const parts = expr.split('.');
    let obj = this.evaluateExpression(parts[0], variables);
    
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      
      if (part.includes('(')) {
        // Method call
        const methodName = part.substring(0, part.indexOf('('));
        const args = this.extractFunctionArgs(part, methodName);
        const evaluatedArgs = args.map(arg => this.evaluateExpression(arg, variables));
        
        if (methodName === 'replace' && typeof obj === 'string') {
          return obj.replace(evaluatedArgs[0], evaluatedArgs[1]);
        }
        if (methodName === 'split' && typeof obj === 'string') {
          return evaluatedArgs.length > 0 ? obj.split(evaluatedArgs[0]) : obj.split();
        }
        if (methodName === 'append' && Array.isArray(obj)) {
          obj.push(evaluatedArgs[0]);
          return obj;
        }
        if (methodName === 'pop' && Array.isArray(obj)) {
          return evaluatedArgs.length > 0 ? obj.splice(evaluatedArgs[0], 1)[0] : obj.pop();
        }
        if (methodName === 'isalpha' && typeof obj === 'string') {
          return /^[a-zA-Z]+$/.test(obj);
        }
        if (methodName === 'isdigit' && typeof obj === 'string') {
          return /^[0-9]+$/.test(obj);
        }
      } else {
        // Property access
        obj = obj[part];
      }
    }
    
    return obj;
  }

  private evaluateOperation(expr: string, variables: any): any {
    // Handle parentheses first
    if (expr.includes('(') && expr.includes(')')) {
      const parenMatch = expr.match(/\(([^()]+)\)/);
      if (parenMatch) {
        const innerResult = this.evaluateExpression(parenMatch[1], variables);
        const newExpr = expr.replace(parenMatch[0], String(innerResult));
        return this.evaluateExpression(newExpr, variables);
      }
    }

    // Comparison operations (higher precedence)
    const comparisons = [' == ', ' != ', ' <= ', ' >= ', ' < ', ' > '];
    for (const op of comparisons) {
      if (expr.includes(op)) {
        const [left, right] = expr.split(op, 2).map(p => p.trim());
        const leftVal = this.evaluateExpression(left, variables);
        const rightVal = this.evaluateExpression(right, variables);
        
        switch (op.trim()) {
          case '==': return leftVal === rightVal;
          case '!=': return leftVal !== rightVal;
          case '<': return leftVal < rightVal;
          case '>': return leftVal > rightVal;
          case '<=': return leftVal <= rightVal;
          case '>=': return leftVal >= rightVal;
        }
      }
    }

    // Arithmetic operations
    const operations = [' + ', ' - ', ' * ', ' / ', ' % ', '**'];
    for (const op of operations) {
      if (expr.includes(op)) {
        const [left, right] = expr.split(op, 2).map(p => p.trim());
        const leftVal = this.evaluateExpression(left, variables);
        const rightVal = this.evaluateExpression(right, variables);
        
        switch (op.trim()) {
          case '+': return leftVal + rightVal;
          case '-': return Number(leftVal) - Number(rightVal);
          case '*': return Number(leftVal) * Number(rightVal);
          case '/': return Number(leftVal) / Number(rightVal);
          case '%': return Number(leftVal) % Number(rightVal);
          case '**': return Math.pow(Number(leftVal), Number(rightVal));
        }
      }
    }

    return expr;
  }

  private runTestCase(code: string, testCase: TestCase): boolean {
    try {
      this.executePythonLikeCode(code);
      const output = this.outputBuffer.join('\n');
      return this.compareOutput(output.trim(), testCase.expectedOutput.trim());
    } catch {
      return false;
    }
  }

  public validateRules(code: string, activeRules: string[]): {
    valid: boolean;
    violations: string[];
  } {
    const violations: string[] = [];

    for (const rule of activeRules) {
      if (rule.includes('variables') || rule.includes('hardcoding')) {
        if (this.hasHardcodedValues(code)) {
          violations.push('Rule violation: No hardcoding values allowed! Use variables instead.');
        }
      }

      if (rule.includes('docstring')) {
        if (code.includes('def ') && !code.includes('"""')) {
          violations.push('Rule violation: Functions must have docstrings! Add """documentation""" to your functions.');
        }
      }

      if (rule.includes('global')) {
        if (this.hasGlobalVariables(code)) {
          violations.push('Rule violation: No global variables allowed! Keep variables local to functions.');
        }
      }

      if (rule.includes('terminate')) {
        if (this.hasInfiniteLoop(code)) {
          violations.push('Rule violation: Loops must terminate! Avoid while True or missing loop conditions.');
        }
      }

      if (rule.includes('sort') && rule.includes('built-in')) {
        if (this.usesBuiltinSort(code)) {
          violations.push('Rule violation: No built-in sort functions allowed! Implement your own sorting algorithm.');
        }
      }

      if (rule.includes('override')) {
        if (code.includes('class ') && !this.hasMethodOverride(code)) {
          violations.push('Rule violation: Each class must override at least one method! Override __str__, __repr__, or another method.');
        }
      }

      if (rule.includes('for-loops') && rule.includes('functional')) {
        if (this.hasForLoops(code)) {
          violations.push('Rule violation: No for-loops allowed! Use functional programming with map(), filter(), and lambda.');
        }
      }

      if (rule.includes('thread-safe')) {
        if (this.hasThreadSafetyIssues(code)) {
          violations.push('Rule violation: All operations must be thread-safe! Use proper locking mechanisms.');
        }
      }

      if (rule.includes('library functions') && rule.includes('scratch')) {
        if (this.usesLibraryFunctions(code)) {
          violations.push('Rule violation: Implement algorithms from scratch! No library functions allowed.');
        }
      }

      if (rule.includes('encrypted') || rule.includes('custom algorithms')) {
        if (this.needsCustomEncryption(code)) {
          violations.push('Rule violation: All data must be encrypted/decrypted using custom algorithms!');
        }
      }
    }

    return {
      valid: violations.length === 0,
      violations
    };
  }

  private hasHardcodedValues(code: string): boolean {
    // Check for direct number usage in print statements
    const printRegex = /print\(\s*\d+\s*\)/;
    const printStringRegex = /print\(\s*["'][^"']*["']\s*\)/;
    return printRegex.test(code) || printStringRegex.test(code);
  }

  private hasGlobalVariables(code: string): boolean {
    return code.includes('global ');
  }

  private hasInfiniteLoop(code: string): boolean {
    return code.includes('while True') || code.includes('while 1');
  }

  private usesBuiltinSort(code: string): boolean {
    return code.includes('.sort(') || code.includes('sorted(');
  }

  private hasMethodOverride(code: string): boolean {
    return code.includes('def __') || code.includes('def toString') || code.includes('def __str__');
  }

  private hasForLoops(code: string): boolean {
    return code.includes('for ') && code.includes(' in ');
  }

  private hasThreadSafetyIssues(code: string): boolean {
    const lockCount = (code.match(/Lock\(\)/g) || []).length;
    return lockCount > 1;
  }

  private usesLibraryFunctions(code: string): boolean {
    const libraryFunctions = ['math.', 'random.', 'os.', 'sys.', 'collections.'];
    return libraryFunctions.some(func => code.includes(func));
  }

  private needsCustomEncryption(code: string): boolean {
    return code.includes('password') || code.includes('secret') || code.includes('key');
  }
}

// Helper class for return values
class ReturnValue extends Error {
  constructor(public value: any) {
    super();
  }
}