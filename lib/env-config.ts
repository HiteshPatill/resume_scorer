/**
 * Environment configuration validation
 * Ensures all required environment variables are set at runtime
 */

export function validateEnv() {
  const requiredVars = ['GEMINI_API_KEY'];
  const missing: string[] = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    const errorMsg = `Missing required environment variables: ${missing.join(', ')}`;
    console.error(`❌ ${errorMsg}`);
    if (process.env.NODE_ENV === 'production') {
      throw new Error(errorMsg);
    }
  } else {
    console.log('✅ All required environment variables are configured');
  }
}

export function getEnvConfig() {
  return {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    nodeEnv: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
  };
}
