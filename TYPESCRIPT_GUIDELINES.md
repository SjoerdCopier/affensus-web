# TypeScript Guidelines & Best Practices

## 🚫 NEVER USE `any` TYPE

The `any` type defeats the purpose of TypeScript and should be avoided at all costs. Here are the proper alternatives:

### ❌ Wrong - Using `any`
```typescript
interface ProjectCredentials {
  [key: string]: any // DON'T DO THIS
}

React.cloneElement(children as React.ReactElement<any>, { selectedProject }) // DON'T DO THIS
```

### ✅ Correct - Proper Type Definitions

#### 1. For Unknown API Response Structures
```typescript
// Option 1: Use `unknown` and type guards
interface ProjectCredentials {
  [key: string]: unknown
}

// Option 2: Define what you actually expect
interface ProjectCredentials {
  [networkName: string]: {
    apiKey?: string
    secret?: string
    status?: 'active' | 'inactive' | 'pending'
    lastChecked?: string
    // Add other known properties
  }
}

// Option 3: Use a generic type
interface ApiResponse<T = Record<string, unknown>> {
  success: boolean
  data: T
  error?: string
}
```

#### 2. For React Components with Props
```typescript
// Option 1: Define specific prop interface
interface ComponentProps {
  selectedProject?: Project | null
  locale?: string
  [key: string]: unknown // for additional props
}

// Option 2: Use React's built-in types
React.cloneElement(
  children as React.ReactElement<ComponentProps>, 
  { selectedProject }
)

// Option 3: More specific typing
React.cloneElement(
  children as React.ReactElement<{ selectedProject?: Project | null }>, 
  { selectedProject }
)
```

## 🛡️ Type Safety Patterns

### 1. API Response Handling
```typescript
// Define expected response structure
interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

interface NetworkCredential {
  id: string
  name: string
  apiKey: string
  status: 'active' | 'inactive' | 'pending'
  lastChecked: string
}

// Use it
const response: ApiResponse<Record<string, NetworkCredential>> = await fetch(...)
```

### 2. Unknown Data Transformation
```typescript
// Instead of any, use unknown and validate
function transformCredentials(data: unknown): NetworkCredential[] {
  if (!data || typeof data !== 'object') {
    return []
  }
  
  const obj = data as Record<string, unknown>
  return Object.entries(obj).map(([key, value]) => ({
    id: key,
    name: key,
    // Validate and provide defaults
    apiKey: typeof value === 'object' && value && 'apiKey' in value 
      ? String(value.apiKey) 
      : '',
    status: 'active' as const,
    lastChecked: new Date().toISOString()
  }))
}
```

### 3. Event Handlers
```typescript
// Instead of any
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  // properly typed event
}

const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  // properly typed event
}
```

## 🔧 Quick Fixes for Common Patterns

### Pattern 1: Generic Object Properties
```typescript
// ❌ Wrong
interface Config {
  [key: string]: any
}

// ✅ Correct
interface Config {
  [key: string]: string | number | boolean | null | undefined
}

// Or more specific
interface Config {
  apiUrl: string
  timeout: number
  retries: number
  [key: string]: unknown // for additional config
}
```

### Pattern 2: Function Parameters
```typescript
// ❌ Wrong
function processData(data: any) {
  return data.someProperty
}

// ✅ Correct
function processData(data: unknown) {
  if (data && typeof data === 'object' && 'someProperty' in data) {
    return (data as { someProperty: unknown }).someProperty
  }
  return null
}

// Or with proper interface
interface ProcessableData {
  someProperty: string
}

function processData(data: ProcessableData) {
  return data.someProperty
}
```

### Pattern 3: React Children Manipulation
```typescript
// ❌ Wrong
React.cloneElement(children as React.ReactElement<any>, props)

// ✅ Correct
React.cloneElement(
  children as React.ReactElement<Record<string, unknown>>, 
  props
)

// Or with specific interface
interface ChildProps {
  selectedProject?: Project | null
  [key: string]: unknown
}

React.cloneElement(
  children as React.ReactElement<ChildProps>, 
  { selectedProject }
)
```

## 📋 Pre-commit Checklist

Before committing TypeScript code, ensure:

- [ ] No `any` types used anywhere
- [ ] All function parameters have proper types
- [ ] All return types are explicit or properly inferred
- [ ] API responses have defined interfaces
- [ ] Event handlers use React's built-in types
- [ ] Unknown data is handled with type guards
- [ ] Generic types are used where appropriate

## 🚨 ESLint Rules to Enforce

Add these to your ESLint config:

```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",
    "@typescript-eslint/no-unsafe-call": "error",
    "@typescript-eslint/no-unsafe-return": "error"
  }
}
```

## 💡 Remember

1. **`unknown` is almost always better than `any`**
2. **Define interfaces for known structures**
3. **Use type guards for runtime validation**
4. **Leverage TypeScript's built-in React types**
5. **When in doubt, be more specific rather than more generic**

The goal is to catch errors at compile time, not runtime!
