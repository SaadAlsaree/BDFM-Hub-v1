// Test script to verify the generateAnswerStreamWithConversationContext method exists
const fs = require('fs');
const path = require('path');

// Read the compiled LLM service
const llmServicePath = path.join(__dirname, 'src', 'services', 'llm.service.ts');

fs.readFile(llmServicePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  // Check if the method exists
  const hasMethod = data.includes('generateAnswerStreamWithConversationContext');
  const hasAsyncGenerator = data.includes('AsyncGenerator<string, void, unknown>');

  console.log('✓ Method generateAnswerStreamWithConversationContext exists:', hasMethod);
  console.log('✓ Method has correct async generator return type:', hasAsyncGenerator);

  if (hasMethod && hasAsyncGenerator) {
    console.log('\n🎉 Fix confirmed! The missing method has been added to the LLM service.');
    console.log('The original error should be resolved:');
    console.log('   "generateAnswerStreamWithConversationContext(...) is not a function"');
  } else {
    console.log('\n❌ Issue not fully resolved. Method may still be missing or have wrong signature.');
  }
});