import { Buffer } from 'buffer';
window.Buffer = Buffer;

import { generateMnemonic } from 'bip39';
import argon2 from '../node_modules/argon2-browser/lib/argon2.js';

document.addEventListener('DOMContentLoaded', function() {
    const passphraseInput = document.getElementById('passphrase');
    const domainInput = document.getElementById('domain');
    const generateButton = document.getElementById('generatePassword');
    const mainContent = document.getElementById('main-content');
    const passphraseContent = document.getElementById('passphrase-content');
    const passwordContent = document.getElementById('password-content');
    const passwordInput = document.getElementById('password');
    const needPassphrase = document.getElementById('needPassphrase');
    const backButton = document.querySelectorAll('.back-button'); // Now selects all back buttons
    const toggleButton = document.getElementById('toggleVisibility');
    const copyButton = document.getElementById('copyButton');
    const generatePhraseButton = document.getElementById('generatePhrase');
    const copyPassphraseButton = document.getElementById('copyPassphrase');
    const generatedPassphraseInput = document.getElementById('generatedPassphrase');

    needPassphrase.addEventListener('click', function() {
        mainContent.style.display = 'none';
        passphraseContent.style.display = 'block';
    });

    backButton.forEach(button => button.addEventListener('click', function() {
        passphraseContent.style.display = 'none';
        passwordContent.style.display = 'none';
        mainContent.style.display = 'block';
    }));

    generatePhraseButton.addEventListener('click', () => {
        const mnemonic = genMnemonic();
        generatedPassphraseInput.value = mnemonic;
    });

    copyPassphraseButton.addEventListener('click', function() {
        navigator.clipboard.writeText(generatedPassphraseInput.value).then(() => {
            alert('Passphrase copied to clipboard!');
        }).catch(err => {
            alert('Failed to copy passphrase: ' + err);
        });
    });
    // Automatically fill in the domain field with the current tab's URL
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var currentUrl = new URL(tabs[0].url);
        domainInput.value = currentUrl.hostname; // using hostname field to get the domain only
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

    function genMnemonic() {
        // Generate a random mnemonic
        const mnemonic = generateMnemonic(); // Default is 128 bits of entropy
        return mnemonic;
    }
  
    generateButton.addEventListener('click', async function() {
        const passphrase = passphraseInput.value;
        const domain = domainInput.value;
        const password = await generatePassword(passphrase, domain);
        passwordInput.value = password;
        mainContent.style.display = 'none';
        passwordContent.style.display = 'block';
    });
  
    async function generatePassword(passphrase, domain) {
        const format = document.getElementById('formatOptions').value;
        let acceptedCharacters;
        
        switch (format) {
            case 'noSpecial':
                acceptedCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                break;
            case 'allLetters':
                acceptedCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
                break;
            default:
                acceptedCharacters = 'abcdefghijklmnopqrstuvwxyz!#$%&*.-_?ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$%&*.-_?'
                break;
        }
        
        let result;
        try {
            result = await argon2.hash({
                pass: passphrase,
                salt: domain,
                type: argon2.ArgonType.Argon2d,
                hashLength: 24,
                time: 100,
                mem: 1024,
                parallelism: 1
            });

        } catch (err) {
            console.error('Argon2 error:', err);
            return '';
        }

        // convert to accepted characters
        let password = '';
        for (let i = 0; i < result.hash.length; i++) {
            const index = result.hash[i] % acceptedCharacters.length;
            password += acceptedCharacters[index];
        }
        return password;
    }
  });
  