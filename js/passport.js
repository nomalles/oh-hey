// Passport management system
class PassportManager {
    constructor() {
        this.userPassport = null;
        this.savedPassports = new Map();
        
        // DOM elements
        this.passportView = document.getElementById('passport-view');
        this.passportEdit = document.getElementById('passport-edit');
        this.closePassportButton = document.getElementById('close-passport');
        this.closeEditButton = document.getElementById('close-edit');
        this.editPassportButton = document.getElementById('edit-passport-button');
        this.savePassportButton = document.getElementById('save-passport-button');
        this.saveEditButton = document.getElementById('save-edit-button');
        this.savedPassportsContainer = document.getElementById('saved-passports');
        
        // Form inputs
        this.usernameInput = document.getElementById('username-input');
        this.jobInput = document.getElementById('job-input');
        this.gameInput = document.getElementById('game-input');
        this.linkInput = document.getElementById('link-input');
        
        // Passport display elements
        this.passportUsernameElement = document.getElementById('passport-username');
        this.passportJobElement = document.getElementById('passport-job');
        this.passportGameElement = document.getElementById('passport-game');
        this.passportLinkElement = document.getElementById('passport-link');
        this.passportAvatarPreview = document.getElementById('passport-avatar-preview');
        
        this.currentViewedPassportId = null;
        
        this.setupEventListeners();
    }
    
    initialize(userId) {
        this.userId = userId;
        
        // Try to load user passport from Firebase
        return this.loadUserPassport();
    }
    
    loadUserPassport() {
        return new Promise((resolve, reject) => {
            if (!this.userId) {
                reject(new Error("User ID not set"));
                return;
            }
            
            // Fetch passport data from Firestore
            firestore.collection('passports').doc(this.userId).get()
                .then(doc => {
                    if (doc.exists) {
                        this.userPassport = doc.data();
                    } else {
                        // Create default passport
                        const avatarData = JSON.parse(localStorage.getItem('oh-hey-avatar')) || {};
                        this.userPassport = {
                            userId: this.userId,
                            username: 'New User',
                            jobTitle: '',
                            currentGame: '',
                            link: '',
                            avatarData: avatarData
                        };
                        
                        // Save to Firestore
                        this.saveUserPassport();
                    }
                    
                    // Load form data
                    this.updateEditForm();
                    
                    // Load saved passports
                    this.loadSavedPassports();
                    
                    resolve(this.userPassport);
                })
                .catch(error => {
                    console.error("Error loading passport:", error);
                    reject(error);
                });
        });
    }
    
    saveUserPassport() {
        if (!this.userId || !this.userPassport) return Promise.reject("No user data");
        
        return firestore.collection('passports').doc(this.userId).set(this.userPassport);
    }
    
    loadSavedPassports() {
        // First clear the container
        this.savedPassportsContainer.innerHTML = '';
        
        // Get saved passports from local storage
        const savedIds = JSON.parse(localStorage.getItem(`oh-hey-saved-passports-${this.userId}`)) || [];
        
        if (savedIds.length === 0) {
            this.savedPassportsContainer.innerHTML = '<p>No saved passports yet.</p>';
            return;
        }
        
        // Fetch each passport data
        savedIds.forEach(id => {
            firestore.collection('passports').doc(id).get()
                .then(doc => {
                    if (doc.exists) {
                        const passport = doc.data();
                        this.savedPassports.set(id, passport);
                        
                        // Create UI element
                        this.addSavedPassportToUI(id, passport);
                    }
                })
                .catch(error => {
                    console.error("Error loading saved passport:", error);
                });
        });
    }
    
    addSavedPassportToUI(id, passport) {
        const item = document.createElement('div');
        item.className = 'saved-passport-item';
        item.dataset.id = id;
        
        item.innerHTML = `
            <div class="saved-passport-avatar" style="background-color: ${passport.avatarData.color}"></div>
            <div class="saved-passport-info">
                <h3>${passport.username}</h3>
                <p>${passport.jobTitle || 'No job title'}</p>
            </div>
        `;
        
        // Add click event
        item.addEventListener('click', () => {
            this.showPassport(id, passport);
        });
        
        this.savedPassportsContainer.appendChild(item);
    }
    
    savePassportToCollection(id, passport) {
        // Get existing saved passports
        const savedIds = JSON.parse(localStorage.getItem(`oh-hey-saved-passports-${this.userId}`)) || [];
        
        // Check if already saved
        if (savedIds.includes(id)) {
            alert('This passport is already in your collection.');
            return;
        }
        
        // Add to saved list
        savedIds.push(id);
        localStorage.setItem(`oh-hey-saved-passports-${this.userId}`, JSON.stringify(savedIds));
        
        // Add to in-memory map
        this.savedPassports.set(id, passport);
        
        // Update UI
        this.addSavedPassportToUI(id, passport);
        
        alert('Passport saved to your collection!');
    }
    
    showPassport(userId, passport) {
        this.currentViewedPassportId = userId;
        
        // Update passport view with user data
        this.passportUsernameElement.textContent = passport.username;
        this.passportJobElement.textContent = passport.jobTitle || 'No job title';
        this.passportGameElement.textContent = passport.currentGame ? 
            `Currently Playing: ${passport.currentGame}` : 'Not playing anything right now';
        
        if (passport.link) {
            this.passportLinkElement.href = passport.link.startsWith('http') ? 
                passport.link : `https://${passport.link}`;
            this.passportLinkElement.textContent = passport.link;
        } else {
            this.passportLinkElement.href = '#';
            this.passportLinkElement.textContent = 'No link provided';
        }
        
        // Update avatar preview
        this.passportAvatarPreview.style.backgroundColor = passport.avatarData.color;
        
        // Show/hide save button based on whether it's the user's own passport
        if (userId === this.userId) {
            this.savePassportButton.style.display = 'none';
        } else {
            this.savePassportButton.style.display = 'block';
        }
        
        // Show passport view
        this.passportView.classList.add('active');
    }
    
    updateEditForm() {
        if (!this.userPassport) return;
        
        this.usernameInput.value = this.userPassport.username || '';
        this.jobInput.value = this.userPassport.jobTitle || '';
        this.gameInput.value = this.userPassport.currentGame || '';
        this.linkInput.value = this.userPassport.link || '';
    }
    
    setupEventListeners() {
        // Close passport view
        this.closePassportButton.addEventListener('click', () => {
            this.passportView.classList.remove('active');
            this.currentViewedPassportId = null;
        });
        
        // Close edit form
        this.closeEditButton.addEventListener('click', () => {
            this.passportEdit.style.display = 'none';
        });
        
        // Edit passport button
        this.editPassportButton.addEventListener('click', () => {
            this.updateEditForm();
            this.passportEdit.style.display = 'block';
        });
        
        // Save passport to collection
        this.savePassportButton.addEventListener('click', () => {
            if (this.currentViewedPassportId && this.currentViewedPassportId !== this.userId) {
                // Get passport data from Firestore
                firestore.collection('passports').doc(this.currentViewedPassportId).get()
                    .then(doc => {
                        if (doc.exists) {
                            const passport = doc.data();
                            this.savePassportToCollection(this.currentViewedPassportId, passport);
                        }
                    })
                    .catch(error => {
                        console.error("Error saving passport:", error);
                    });
            }
        });
        
        // Save edit form
        this.saveEditButton.addEventListener('click', () => {
            // Update passport data
            this.userPassport.username = this.usernameInput.value.trim() || 'User';
            this.userPassport.jobTitle = this.jobInput.value.trim();
            this.userPassport.currentGame = this.gameInput.value.trim();
            this.userPassport.link = this.linkInput.value.trim();
            
            // Save to Firestore
            this.saveUserPassport()
                .then(() => {
                    this.passportEdit.style.display = 'none';
                    alert('Passport updated successfully!');
                })
                .catch(error => {
                    console.error("Error saving passport:", error);
                    alert('Failed to update passport. Please try again.');
                });
        });
        
        // Menu button
        const menuButton = document.getElementById('menu-button');
        const menuPanel = document.getElementById('menu-panel');
        
        menuButton.addEventListener('click', () => {
            menuPanel.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (event) => {
            if (!menuPanel.contains(event.target) && event.target !== menuButton) {
                menuPanel.classList.remove('active');
            }
        });
        
        // Emoji reaction buttons
        const emojiButtons = document.querySelectorAll('.emoji-button');
        emojiButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (this.currentViewedPassportId && this.currentViewedPassportId !== this.userId) {
                    const emoji = button.textContent;
                    
                    // Send reaction to Firebase
                    const reactionRef = database.ref(`reactions/${this.currentViewedPassportId}`);
                    reactionRef.push({
                        from: this.userId,
                        emoji: emoji,
                        timestamp: firebase.database.ServerValue.TIMESTAMP
                    });
                    
                    // Visual feedback
                    button.classList.add('reacted');
                    setTimeout(() => {
                        button.classList.remove('reacted');
                    }, 500);
                }
            });
        });
    }
    
    getUserPassport() {
        return this.userPassport;
    }
    
    getPassportById(id) {
        if (id === this.userId) {
            return this.userPassport;
        } else if (this.savedPassports.has(id)) {
            return this.savedPassports.get(id);
        }
        return null;
    }
}
