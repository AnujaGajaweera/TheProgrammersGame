import { Challenge, TestCase } from '../types/game';

export class CodeEvaluator {
  private outputBuffer: string[] = [];

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
    
    try {
      // Basic Python-like syntax evaluation
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
        error: error instanceof Error ? error.message : 'Unknown error',
        passed: 0,
        total: 1
      };
    }
  }

  private compareOutput(actual: string, expected: string): boolean {
    // Handle array/list outputs
    if (expected.startsWith('[') && expected.endsWith(']')) {
      try {
        // Simple array comparison
        const actualArray = actual.replace(/'/g, '"');
        const expectedArray = expected.replace(/'/g, '"');
        return actualArray === expectedArray;
      } catch {
        return actual === expected;
      }
    }
    
    // Handle multi-line outputs
    if (expected.includes('\n')) {
      const actualLines = actual.split('\n').map(line => line.trim());
      const expectedLines = expected.split('\n').map(line => line.trim());
      return actualLines.length === expectedLines.length && 
             actualLines.every((line, i) => line === expectedLines[i]);
    }
    
    return actual === expected;
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

    let i = 0;
    while (i < lines.length) {
      const line = lines[i].trim();
      i += this.executeLine(line, variables, functions, lines, i);
    }
  }

  private executeLine(line: string, variables: any, functions: any, allLines: string[], currentIndex: number): number {
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
    if (line.includes('=') && !line.includes('==') && !line.includes('!=') && !line.includes('<=') && !line.includes('>=')) {
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

    // Function call
    if (line.includes('(') && line.includes(')')) {
      this.evaluateExpression(line, variables);
      return 1;
    }

    return 1;
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
      if (indent === 0) indent = currentIndent;
      
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
      let returnValue = undefined;
      for (const bodyLine of functionBody) {
        const trimmed = bodyLine.trim();
        if (trimmed.startsWith('return ')) {
          returnValue = this.evaluateExpression(trimmed.substring(7), localVars);
          break;
        }
        if (trimmed && !trimmed.startsWith('"""') && !trimmed.endsWith('"""')) {
          this.executeLine(trimmed, localVars, functions, functionBody, 0);
        }
      }
      
      return returnValue;
    };

    return endIndex - startIndex;
  }

  private parseClass(line: string, allLines: string[], startIndex: number, variables: any): number {
    const match = line.match(/class\s+(\w+)(?:\(([^)]*)\))?:/);
    if (!match) return 1;

    const [, className, parentClass] = match;
    
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
      if (indent === 0) indent = currentIndent;
      
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
          // Execute constructor
          const initArgs = ['self', ...args];
          // Simplified - would need proper method parsing
          break;
        }
      }
      
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
      if (indent === 0) indent = currentIndent;
      
      if (currentIndent < indent && currentLine.trim() !== '') break;
      endIndex++;
    }

    const loopBody = allLines.slice(startIndex + 1, endIndex);
    
    // Execute loop
    if (Array.isArray(iterableValue)) {
      for (const item of iterableValue) {
        variables[varName] = item;
        for (const bodyLine of loopBody) {
          const trimmed = bodyLine.trim();
          if (trimmed) {
            this.executeLine(trimmed, variables, functions, loopBody, 0);
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
          
          for (const bodyLine of body) {
            const trimmed = bodyLine.trim();
            if (trimmed) {
              this.executeLine(trimmed, variables, functions, body, 0);
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
          
          for (const bodyLine of body) {
            const trimmed = bodyLine.trim();
            if (trimmed) {
              this.executeLine(trimmed, variables, functions, body, 0);
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
      if (indent === 0) indent = currentIndent;
      
      if (currentIndent < indent && currentLine.trim() !== '') break;
      endIndex++;
    }

    return endIndex;
  }

  private parseTryExcept(allLines: string[], startIndex: number, variables: any, functions: any): number {
    // Find try block end
    const tryEnd = this.findBlockEnd(allLines, startIndex);
    const tryBody = allLines.slice(startIndex + 1, tryEnd);
    
    try {
      // Execute try block
      for (const bodyLine of tryBody) {
        const trimmed = bodyLine.trim();
        if (trimmed) {
          this.executeLine(trimmed, variables, functions, tryBody, 0);
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
        
        for (const bodyLine of exceptBody) {
          const trimmed = bodyLine.trim();
          if (trimmed) {
            this.executeLine(trimmed, variables, functions, exceptBody, 0);
          }
        }
        
        return exceptEnd - startIndex;
      }
    }
    
    return tryEnd - startIndex;
  }

  private parseWhileLoop(line: string, allLines: string[], startIndex: number, variables: any, functions: any): number {
    const condition = line.substring(6, line.length - 1); // Remove 'while ' and ':'
    
    // Find loop body
    const bodyEnd = this.findBlockEnd(allLines, startIndex);
    const loopBody = allLines.slice(startIndex + 1, bodyEnd);
    
    let iterations = 0;
    const maxIterations = 1000; // Prevent infinite loops
    
    while (this.evaluateExpression(condition, variables) && iterations < maxIterations) {
      for (const bodyLine of loopBody) {
        const trimmed = bodyLine.trim();
        if (trimmed) {
          this.executeLine(trimmed, variables, functions, loopBody, 0);
        }
      }
      iterations++;
    }
    
    return bodyEnd - startIndex;
  }

  private handleImport(line: string, variables: any): void {
    // Handle basic imports
    if (line === 'import base64') {
      variables['base64'] = {
        b64decode: (data: string) => {
          // Simple base64 decode simulation
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
    
    // Simple argument parsing (doesn't handle nested parentheses perfectly)
    return argsStr.split(',').map(arg => arg.trim());
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
    if (!isNaN(Number(expr))) {
      return Number(expr);
    }

    // List literal
    if (expr.startsWith('[') && expr.endsWith(']')) {
      const content = expr.slice(1, -1);
      if (!content.trim()) return [];
      return content.split(',').map(item => this.evaluateExpression(item.trim(), variables));
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
    }

    // Method calls
    if (expr.includes('.')) {
      const parts = expr.split('.');
      let obj = variables[parts[0]];
      
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
        } else {
          // Property access
          obj = obj[part];
        }
      }
      
      return obj;
    }

    // Variable
    if (variables[expr] !== undefined) {
      return variables[expr];
    }

    // Arithmetic operations
    if (expr.includes(' + ')) {
      const [left, right] = expr.split(' + ', 2).map(p => p.trim());
      const leftVal = this.evaluateExpression(left, variables);
      const rightVal = this.evaluateExpression(right, variables);
      return leftVal + rightVal;
    }

    if (expr.includes(' - ')) {
      const [left, right] = expr.split(' - ', 2).map(p => p.trim());
      return Number(this.evaluateExpression(left, variables)) - Number(this.evaluateExpression(right, variables));
    }

    if (expr.includes(' * ')) {
      const [left, right] = expr.split(' * ', 2).map(p => p.trim());
      return Number(this.evaluateExpression(left, variables)) * Number(this.evaluateExpression(right, variables));
    }

    if (expr.includes(' / ')) {
      const [left, right] = expr.split(' / ', 2).map(p => p.trim());
      return Number(this.evaluateExpression(left, variables)) / Number(this.evaluateExpression(right, variables));
    }

    if (expr.includes(' % ')) {
      const [left, right] = expr.split(' % ', 2).map(p => p.trim());
      return Number(this.evaluateExpression(left, variables)) % Number(this.evaluateExpression(right, variables));
    }

    if (expr.includes('**')) {
      const [left, right] = expr.split('**', 2).map(p => p.trim());
      return Math.pow(Number(this.evaluateExpression(left, variables)), Number(this.evaluateExpression(right, variables)));
    }

    // Comparison operations
    if (expr.includes(' == ')) {
      const [left, right] = expr.split(' == ', 2).map(p => p.trim());
      return this.evaluateExpression(left, variables) === this.evaluateExpression(right, variables);
    }

    if (expr.includes(' != ')) {
      const [left, right] = expr.split(' != ', 2).map(p => p.trim());
      return this.evaluateExpression(left, variables) !== this.evaluateExpression(right, variables);
    }

    if (expr.includes(' < ')) {
      const [left, right] = expr.split(' < ', 2).map(p => p.trim());
      return this.evaluateExpression(left, variables) < this.evaluateExpression(right, variables);
    }

    if (expr.includes(' > ')) {
      const [left, right] = expr.split(' > ', 2).map(p => p.trim());
      return this.evaluateExpression(left, variables) > this.evaluateExpression(right, variables);
    }

    if (expr.includes(' <= ')) {
      const [left, right] = expr.split(' <= ', 2).map(p => p.trim());
      return this.evaluateExpression(left, variables) <= this.evaluateExpression(right, variables);
    }

    if (expr.includes(' >= ')) {
      const [left, right] = expr.split(' >= ', 2).map(p => p.trim());
      return this.evaluateExpression(left, variables) >= this.evaluateExpression(right, variables);
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
    // Check for global keyword or variables defined outside functions/classes
    return code.includes('global ') || 
           (code.includes('=') && !code.includes('def ') && !code.includes('class '));
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
    // Check for multiple locks that could cause deadlock
    const lockCount = (code.match(/Lock\(\)/g) || []).length;
    return lockCount > 1;
  }

  private usesLibraryFunctions(code: string): boolean {
    const libraryFunctions = ['math.', 'random.', 'os.', 'sys.', 'collections.'];
    return libraryFunctions.some(func => code.includes(func));
  }

  private needsCustomEncryption(code: string): boolean {
    // Check if dealing with sensitive data without custom encryption
    return code.includes('password') || code.includes('secret') || code.includes('key');
  }
}