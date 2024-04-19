import { Buffer } from 'buffer';
window.Buffer = Buffer;

import { generateMnemonic } from 'bip39';
import argon2 from '../node_modules/argon2-browser/lib/argon2.js';

document.addEventListener('DOMContentLoaded', function() {
    const passphraseInput = document.getElementById('passphrase');
    const domainInput = document.getElementById('domain');
    const generateButton = document.getElementById('generatePassword');
    const mainContent = document.getElementById('main-content');
    const passwordContent = document.getElementById('password-content');
    const passwordInput = document.getElementById('password');
    const backButton = document.querySelector('.back-button');
    const toggleButton = document.getElementById('toggleVisibility');
    const copyButton = document.getElementById('copyButton');
    const generatePhraseButton = document.getElementById('generatePhrase');

    // Automatically fill in the domain field with the current tab's URL
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var currentUrl = new URL(tabs[0].url);
        domainInput.value = currentUrl.hostname; // using hostname to get the domain only
    });
  
    toggleButton.addEventListener('click', function() {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleButton.textContent = 'Hide';
        } else {
            passwordInput.type = 'password';
            toggleButton.textContent = 'Show';
        }
    });
  
    copyButton.addEventListener('click', function() {
        navigator.clipboard.writeText(passwordInput.value).then(() => {
            alert('Password copied to clipboard!');
        }).catch(err => {
            alert('Failed to copy password: ' + err);
        });
    });

    generatePhraseButton.addEventListener('click', () => {
        const mnemonic = genMnemonic();
        // Assuming there's an input or another element to display the mnemonic
        document.getElementById('passphrase').value = mnemonic;
    });


    function genMnemonic() {
        // Generate a random mnemonic (uses crypto.getRandomValues under the hood)
        const mnemonic = generateMnemonic(); // Default is 128 bits of entropy
        return mnemonic;
    }
  
    backButton.addEventListener('click', function() {
        mainContent.style.display = 'block';
        passwordContent.style.display = 'none';
    });
  
    generateButton.addEventListener('click', async function() {
        const passphrase = passphraseInput.value;
        const domain = domainInput.value;
        const password = await generatePassword(passphrase, domain);
        passwordInput.value = password;
        mainContent.style.display = 'none';
        passwordContent.style.display = 'flex';
    });
  
    async function generatePassword(passphrase, domain) {
        let result;
        try {
            result = await argon2.hash({
                pass: passphrase, // Combine your password and domain as the input string
                salt: domain, // You should generate a secure, random salt instead
                type: argon2.ArgonType.Argon2id, // Specify Argon2 type (Argon2id, Argon2i, or Argon2d)
                hashLength: 32, // Length of the hash in bytes
                time: 1, // Amount of computation realized, given in number of iterations
                mem: 1024, // Memory usage, given in kibibytes
                parallelism: 1 // Amount of parallelism (threads to run in parallel - does not affect WebAssembly)
            });

        } catch (err) {
            console.error('Argon2 error:', err);
            return ''; // Return empty string or handle error appropriately
        }

        // convert to my accepted characters

        const accpetedCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!$%&'

        let password = '';
        for (let i = 0; i < result.hash.length; i++) {
            const index = result.hash[i] % accpetedCharacters.length;
            password += accpetedCharacters[index];
        }
        return password;
    }
  });
  