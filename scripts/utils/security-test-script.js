/**
 * 🧪 BIMatch Security Test Automation Script
 * Da eseguire nella console del browser per test automatici
 */

console.log("🔒 BIMatch Security Test Suite avviata...");

// Test Configuration
const TEST_CONFIG = {
  baseUrl: window.location.origin,
  testEmail: 'test@example.com',
  testPassword: 'wrongpassword',
  xssPayloads: [
    '<script>alert("XSS")</script>',
    '<img src="x" onerror="alert(\'XSS\')">',
    'javascript:alert("XSS")',
    '<svg onload="alert(\'XSS\')">',
    '"><script>alert("XSS")</script>'
  ]
};

// Utility Functions
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const log = (test, status, details = '') => {
  const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏳';
  console.log(`${emoji} ${test}: ${status} ${details}`);
};

// Test 1: Security Headers Check
async function testSecurityHeaders() {
  console.log('\n🛡️ Testing Security Headers...');
  
  try {
    const response = await fetch(window.location.href);
    const headers = response.headers;
    
    const requiredHeaders = {
      'x-frame-options': 'DENY',
      'x-content-type-options': 'nosniff',
      'strict-transport-security': 'max-age=31536000',
      'content-security-policy': /default-src 'self'/,
      'referrer-policy': 'strict-origin-when-cross-origin'
    };
    
    let allHeadersPresent = true;
    
    for (const [header, expectedValue] of Object.entries(requiredHeaders)) {
      const actualValue = headers.get(header);
      if (!actualValue) {
        log(`Header ${header}`, 'FAIL', 'Missing');
        allHeadersPresent = false;
      } else if (typeof expectedValue === 'string' && actualValue !== expectedValue) {
        log(`Header ${header}`, 'FAIL', `Expected: ${expectedValue}, Got: ${actualValue}`);
        allHeadersPresent = false;
      } else if (expectedValue instanceof RegExp && !expectedValue.test(actualValue)) {
        log(`Header ${header}`, 'FAIL', `Pattern not matched: ${actualValue}`);
        allHeadersPresent = false;
      } else {
        log(`Header ${header}`, 'PASS');
      }
    }
    
    return allHeadersPresent;
  } catch (error) {
    log('Security Headers Test', 'FAIL', error.message);
    return false;
  }
}

// Test 2: XSS Protection Test
function testXSSProtection() {
  console.log('\n🚨 Testing XSS Protection...');
  
  let xssBlocked = true;
  
  TEST_CONFIG.xssPayloads.forEach((payload, index) => {
    try {
      // Test input sanitization
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = payload;
      
      if (tempDiv.innerHTML === payload) {
        log(`XSS Payload ${index + 1}`, 'FAIL', 'Not sanitized');
        xssBlocked = false;
      } else {
        log(`XSS Payload ${index + 1}`, 'PASS', 'Sanitized');
      }
    } catch (error) {
      log(`XSS Payload ${index + 1}`, 'PASS', 'Blocked by browser');
    }
  });
  
  return xssBlocked;
}

// Test 3: Rate Limiting Test (Manual trigger)
function testRateLimiting() {
  console.log('\n⏱️ Rate Limiting Test (Manual)...');
  console.log('🔸 Per testare rate limiting:');
  console.log('1. Vai su /login');
  console.log('2. Inserisci email esistente + password sbagliata');
  console.log('3. Clicca "Accedi" 6 volte consecutive');
  console.log('4. Il 6° tentativo deve mostrare "Troppi tentativi"');
  
  return 'MANUAL_TEST_REQUIRED';
}

// Test 4: Session Storage Security
function testSessionSecurity() {
  console.log('\n🔐 Testing Session Security...');
  
  let sessionSecure = true;
  
  // Check for sensitive data in localStorage
  const sensitiveKeys = ['password', 'token', 'secret', 'key'];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    
    if (sensitiveKeys.some(sensitive => key?.toLowerCase().includes(sensitive))) {
      log('LocalStorage Security', 'FAIL', `Sensitive key found: ${key}`);
      sessionSecure = false;
    }
  }
  
  // Check for sensitive data in sessionStorage
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    const value = sessionStorage.getItem(key);
    
    if (sensitiveKeys.some(sensitive => key?.toLowerCase().includes(sensitive))) {
      log('SessionStorage Security', 'FAIL', `Sensitive key found: ${key}`);
      sessionSecure = false;
    }
  }
  
  if (sessionSecure) {
    log('Session Storage Security', 'PASS', 'No sensitive data found in storage');
  }
  
  return sessionSecure;
}

// Test 5: Cookie Security
function testCookieSecurity() {
  console.log('\n🍪 Testing Cookie Security...');
  
  const cookies = document.cookie.split(';');
  let cookieSecure = true;
  
  if (cookies.length === 0 || (cookies.length === 1 && cookies[0] === '')) {
    log('Cookie Security', 'PASS', 'No cookies set (good for privacy)');
    return true;
  }
  
  cookies.forEach(cookie => {
    const [name] = cookie.trim().split('=');
    
    // Check if authentication cookies are secure
    if (name.toLowerCase().includes('auth') || name.toLowerCase().includes('session')) {
      // In a real test, we'd check HttpOnly, Secure, SameSite attributes
      // This is limited in browser console
      log('Cookie Security', 'INFO', `Auth cookie found: ${name} (check HttpOnly/Secure manually)`);
    }
  });
  
  return cookieSecure;
}

// Test 6: Content Security Policy Violations
function testCSPViolations() {
  console.log('\n🔒 Testing CSP Violations...');
  
  const originalLog = console.error;
  let cspViolations = [];
  
  console.error = function(...args) {
    if (args.some(arg => typeof arg === 'string' && arg.includes('Content Security Policy'))) {
      cspViolations.push(args.join(' '));
    }
    originalLog.apply(console, args);
  };
  
  // Restore original console.error after 5 seconds
  setTimeout(() => {
    console.error = originalLog;
    
    if (cspViolations.length === 0) {
      log('CSP Violations', 'PASS', 'No CSP violations detected');
    } else {
      log('CSP Violations', 'FAIL', `${cspViolations.length} violations found`);
      cspViolations.forEach(violation => console.warn('CSP Violation:', violation));
    }
  }, 5000);
  
  return 'MONITORING_FOR_5_SECONDS';
}

// Test 7: Iframe Protection
function testIframeProtection() {
  console.log('\n🖼️ Testing Iframe Protection...');
  
  try {
    if (window.self !== window.top) {
      log('Iframe Protection', 'FAIL', 'Page is loaded in iframe');
      return false;
    } else {
      log('Iframe Protection', 'PASS', 'Page is not in iframe');
      return true;
    }
  } catch (error) {
    log('Iframe Protection', 'PASS', 'Cross-origin iframe blocked');
    return true;
  }
}

// Main Test Runner
async function runSecurityTests() {
  console.log('🚀 Starting BIMatch Security Test Suite...\n');
  
  const results = {
    securityHeaders: await testSecurityHeaders(),
    xssProtection: testXSSProtection(),
    rateLimiting: testRateLimiting(),
    sessionSecurity: testSessionSecurity(),
    cookieSecurity: testCookieSecurity(),
    cspViolations: testCSPViolations(),
    iframeProtection: testIframeProtection()
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log('='.repeat(40));
  
  let passedTests = 0;
  let totalTests = 0;
  
  Object.entries(results).forEach(([test, result]) => {
    if (result === true) {
      console.log(`✅ ${test}: PASSED`);
      passedTests++;
    } else if (result === false) {
      console.log(`❌ ${test}: FAILED`);
    } else {
      console.log(`ℹ️ ${test}: ${result}`);
    }
    totalTests++;
  });
  
  console.log('='.repeat(40));
  console.log(`📈 Score: ${passedTests}/${totalTests - 2} automated tests passed`);
  console.log('📝 Note: Rate limiting and CSP monitoring require manual verification');
  
  console.log('\n🔍 Next Steps:');
  console.log('1. Test rate limiting manually on /login page');
  console.log('2. Test session timeout (wait 6 minutes)');
  console.log('3. Test file upload with malicious files');
  console.log('4. Check Firebase Console for audit logs');
  console.log('5. Verify cookie banner appears in incognito mode');
  
  return results;
}

// Auto-run tests
runSecurityTests();

// Export functions for manual testing
window.BIMatchSecurityTests = {
  runAll: runSecurityTests,
  testSecurityHeaders,
  testXSSProtection,
  testRateLimiting,
  testSessionSecurity,
  testCookieSecurity,
  testCSPViolations,
  testIframeProtection
};

console.log('\n🛠️ Manual test functions available in window.BIMatchSecurityTests');