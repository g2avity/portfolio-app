// Borrowed & modified from https://github.com/jenseng/abuse-the-platform/blob/main/app/utils/singleton.ts
// Thanks @jenseng!

export const singleton = <Value>(
  name: string,
  valueFactory: () => Value | Promise<Value>,
): Value | Promise<Value> => {
  const g = global as unknown as { __singletons: Record<string, unknown> };
  g.__singletons ??= {};
  
  if (!g.__singletons[name]) {
    g.__singletons[name] = valueFactory();
  }
  
  return g.__singletons[name] as Value | Promise<Value>;
};
