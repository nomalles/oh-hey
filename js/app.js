// Main application logic with added debugging
class OhHeyApp {
    constructor() {
        // Core systems
        this.avatarCreator = null;
        this.locationHandler = null;
        this.passportManager = null;
        
        // Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        // User data
        this.userId = null;
        this.userAvatar = null;
        
        // App state
        this.isInitialized = false;
        this.avatarMeshes = new Map();
        
        // DOM elements
        this.sceneContainer = document.getElementById('scene-container');
        this.loadingScreen = document.getElementById('loading-screen');
        
        // Add debugging info to loading screen
        const debugDiv = document.createElement('div');
        debugDiv.id = 'debug-info';
        debugDiv.style.marginTop = '20px';
        debugDiv.style.padding = '10px';
        debugDiv.style.backgroundColor = 'rgba(0,0,0,0.2)';
        debugDiv.style.borderRadius = '5px';
        debugDiv.style.maxWidth = '80%';
        debugDiv.style.maxHeight = '200px';
        debugDiv.style.overflow = 'auto';
        debugDiv.style.fontSize = '14px';
        debugDiv.style.textAlign = 'left';
        this.loadingScreen.appendChild(debugDiv);
        
        // Add bypass button
        const bypassButton = document.createElement('button');
        bypassButton.textContent = 'Bypass Loading (Debug)';
        bypassButton.style.marginTop = '20px';
        bypassButton.style.padding = '10px 20px';
        bypassButton.style.backgroundColor = '#ff5555';
        bypassButton.style.border = 'none';
        bypassButton.style.borderRadius = '5px';
        bypassButton.style.color = 'white';
        bypassButton.style.cursor = 'pointer';
        bypassButton.onclick = () => this.bypassLoading();
        this.loadingScreen.appendChild(bypassButton);
        
        this.debugLog('App constructor initialized');
    }
    
    debugLog(message) {
        console.log(`[DEBUG] ${message}`);
        const debugDiv = document.getElementById('debug-info');
        if (debugDiv) {
            const messageElem = document.createElement('div');
            messageElem.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
            debugDiv.appendChild(messageElem);
            debugDiv.scrollTop = debugDiv.scrollHeight;
        }
    }
    
    bypassLoading() {
        this.debugLog('Manually bypassing loading screen');
        
        // Create a mock user ID if needed
        if (!this.userId) {
            this.userId = 'debug-user-' + Math.floor(Math.random() * 1000000);
            this.debugLog(`Created debug user ID: ${this.userId}`);
        }
        
        // Hide loading screen
        this.loadingScreen.style.display = 'none';
        
        // Check for avatar creator
        if (!this.avatarCreator) {
            this.debugLog('Creating avatar creator');
            try {
                this.avatarCreator = new AvatarCreator();
                this.debugLog('Avatar creator initialized');
            } catch (error) {
                this.debugLog(`Error creating avatar creator: ${error.message}`);
                alert('Error initializing avatar creator. Check console for details.');
                console.error(error);
            }
        }
        
        // Check if we should show avatar creator or main app
        const savedAvatar = localStorage.getItem('oh-hey-avatar');
        if (!savedAvatar) {
            this.debugLog('No saved avatar found, showing avatar creator');
            document.getElementById('avatar-creator').style.display = 'block';
        } else {
            this.debugLog('Saved avatar found, initializing 3D scene');
            try {
                // Initialize with minimal requirements
                this.initMinimalThreeJS();
            } catch (error) {
                this.debugLog(`Error initializing 3D scene: ${error.message}`);
                alert('Error initializing 3D scene. Check console for details.');
                console.error(error);
            }
        }
    }
    
    initialize() {
        this.debugLog('Starting app initialization');
        
        // Initialize avatar creator
        try {
            this.avatarCreator = new AvatarCreator();
            this.debugLog('Avatar creator initialized');
        } catch (error) {
            this.debugLog(`Error initializing avatar creator: ${error.message}`);
            console.error('Avatar creator error:', error);
        }
        
        // Check if user already has an avatar
        const savedAvatar = localStorage.getItem('oh-hey-avatar');
        
        if (savedAvatar) {
            this.debugLog('Found saved avatar, continuing to app initialization');
            this.initApp();
        } else {
            this.debugLog('No avatar found, showing avatar creator');
            this.avatarCreator.show();
        }
    }
    
    async initApp() {
        try {
            this.debugLog('Attempting anonymous sign-in to Firebase');
            
            // Try to sign in anonymously to Firebase
            try {
                await signInAnonymously();
                this.userId = auth.currentUser.uid;
                this.debugLog(`Signed in with user ID: ${this.userId}`);
            } catch (error) {
                this.debugLog(`Firebase auth error: ${error.message}`);
                throw error;
            }
            
            // Initialize location handler with error catching
            this.debugLog('Initializing location handler');
            try {
                this.locationHandler = new LocationHandler();
                await this.locationHandler.initialize(this.userId);
                this.debugLog('Location handler initialized successfully');
            } catch (error) {
                this.debugLog(`Location handler error: ${error.message}`);
                throw error;
            }
            
            // Initialize passport manager with error catching
            this.debugLog('Initializing passport manager');
            try {
                this.passportManager = new PassportManager();
                await this.passportManager.initialize(this.userId);
                this.debugLog('Passport manager initialized successfully');
            } catch (error) {
                this.debugLog(`Passport manager error: ${error.message}`);
                throw error;
            }
            
            // Initialize 3D scene
            this.debugLog('Initializing 3D scene');
            try {
                this.initThreeJS();
                this.debugLog('3D scene initialized successfully');
            } catch (error) {
                this.debugLog(`3D scene error: ${error.message}`);
                throw error;
            }
            
            // Set up listeners
            this.debugLog('Setting up event listeners');
            try {
                this.setupEventListeners();
                this.debugLog('Event listeners set up successfully');
            } catch (error) {
                this.debugLog(`Event listener error: ${error.message}`);
                throw error;
            }
            
            // Hide loading screen
            this.debugLog('Initialization complete, hiding loading screen');
            this.loadingScreen.style.display = 'none';
            
            // Mark as initialized
            this.isInitialized = true;
        } catch (error) {
            this.debugLog(`Failed to initialize app: ${error.message}`);
            console.error("Failed to initialize app:", error);
            alert("Failed to start Oh-Hey. Please check your internet connection and try again. Error: " + error.message);
        }
    }
    
    // Simplified Three.JS initialization for debug bypass mode
    initMinimalThreeJS() {
        this.debugLog('Initializing minimal Three.js scene');
        
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            70,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, 10);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.sceneContainer.appendChild(this.renderer.domElement);
        
        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        this.scene.add(directionalLight);
        
        // Add ground plane
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xeeeeee,
            roughness: 0.8,
            metalness: 0.2
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -2;
        this.scene.add(ground);
        
        // Add placeholder avatar
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: 0x6c63ff,
            shininess: 100
        });
        const avatar = new THREE.Mesh(geometry, material);
        this.scene.add(avatar);
        
        // Start animation loop
        this.animate();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        this.debugLog('Minimal Three.js scene initialized');
    }
    
    initThreeJS() {
        this.debugLog('Setting up full Three.js scene');
        
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            70,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, 10);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.sceneContainer.appendChild(this.renderer.domElement);
        
        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        this.scene.add(directionalLight);
        
        // Add ground plane
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xeeeeee,
            roughness: 0.8,
            metalness: 0.2
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -2;
        this.scene.add(ground);
        
        // Add grid helper
        const gridHelper = new THREE.GridHelper(100, 50, 0xcccccc, 0xcccccc);
        gridHelper.position.y = -1.99;
        this.scene.add(gridHelper);
        
        // Add user avatar
        this.addUserAvatar();
        
        // Start animation loop
        this.animate();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    addUserAvatar() {
        this.debugLog('Adding user avatar to scene');
        
        try {
            // Get user avatar data
            const avatarData = this.passportManager.getUserPassport().avatarData;
            
            // Create avatar mesh
            const avatar = AvatarCreator.createAvatarMesh(avatarData);
            
            // Add avatar to scene
            avatar.position.set(0, 0, 0);
            this.scene.add(avatar);
            
            // Add face
            this.addFaceToAvatar(avatar, avatarData.face);
            
            // Store reference
            this.userAvatar = avatar;
            this.avatarMeshes.set(this.userId, avatar);
            
            this.debugLog('User avatar added successfully');
        } catch (error) {
            this.debugLog(`Error adding user avatar: ${error.message}`);
            console.error('Error adding user avatar:', error);
        }
    }
    
    addFaceToAvatar(avatar, faceType) {
        // Create face plane
        const faceGeometry = new THREE.PlaneGeometry(1.5, 1.5);
        
        // Create canvas for face texture
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Draw face based on type
        ctx.fillStyle = 'rgba(0, 0, 0, 0)';
        ctx.fillRect(0, 0, 256, 256);
        
        ctx.fillStyle = 'black';
        ctx.font = '80px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        let eyes = ':)';
        let mouthY = 70;
        
        switch (faceType) {
            case 'face1': // Happy
                eyes = ':)';
                mouthY = 70;
                break;
            case 'face2': // Cool
                eyes = 'B)';
                mouthY = 65;
                break;
            case 'face3': // Chill
                eyes = '-_-';
                mouthY = 70;
                break;
            case 'face4': // Excited
                eyes = '^_^';
                mouthY = 75;
                break;
            default:
                eyes = ':)';
                mouthY = 70;
        }
        
        ctx.fillText(eyes, 128, 100); // Eyes
        
        // Draw mouth
        ctx.beginPath();
        ctx.arc(128, mouthY + 30, 30, 0, Math.PI);
        ctx.stroke();
        
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        
        // Create material
        const faceMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        // Create mesh
        const facePlane = new THREE.Mesh(faceGeometry, faceMaterial);
        facePlane.position.z = 1.1;
        
        // Add face plane as child of avatar
        avatar.add(facePlane);
    }
    
    updateNearbyAvatars(nearbyUsers) {
        this.debugLog(`Updating nearby avatars. Count: ${nearbyUsers.length}`);
        
        // First, remove avatars that are no longer nearby
        const currentUserIds = new Set(nearbyUsers.map(user => user.userId));
        
        // Add the current user to the set so we don't remove their avatar
        currentUserIds.add(this.userId);
        
        // Remove avatars that are no longer nearby
        this.avatarMeshes.forEach((mesh, id) => {
            if (!currentUserIds.has(id)) {
                this.scene.remove(mesh);
                this.avatarMeshes.delete(id);
                this.debugLog(`Removed avatar for user: ${id}`);
            }
        });
        
        // Add or update nearby avatars
        nearbyUsers.forEach(user => {
            const userId = user.userId;
            
            // Skip if it's the current user
            if (userId === this.userId) return;
            
            // Get passport data
            firestore.collection('passports').doc(userId).get()
                .then(doc => {
                    if (doc.exists) {
                        const passport = doc.data();
                        const avatarData = passport.avatarData;
                        
                        // Check if avatar already exists
                        if (this.avatarMeshes.has(userId)) {
                            // Update position
                            const avatar = this.avatarMeshes.get(userId);
                            
                            // Calculate position based on geolocation
                            const position = this.calculatePositionFromGeolocation(
                                user.position.latitude,
                                user.position.longitude
                            );
                            
                            // Update position
                            avatar.position.set(position.x, 0, position.z);
                            this.debugLog(`Updated position for user: ${userId}`);
                        } else {
                            // Create new avatar
                            const avatar = AvatarCreator.createAvatarMesh(avatarData);
                            
                            // Calculate position based on geolocation
                            const position = this.calculatePositionFromGeolocation(
                                user.position.latitude,
                                user.position.longitude
                            );
                            
                            // Set position
                            avatar.position.set(position.x, 0, position.z);
                            
                            // Add face
                            this.addFaceToAvatar(avatar, avatarData.face);
                            
                            // Add to scene
                            this.scene.add(avatar);
                            
                            // Make avatar clickable
                            avatar.userData.userId = userId;
                            
                            // Store reference
                            this.avatarMeshes.set(userId, avatar);
                            this.debugLog(`Added new avatar for user: ${userId}`);
                        }
                    }
                })
                .catch(error => {
                    this.debugLog(`Error fetching passport for ${userId}: ${error.message}`);
                    console.error("Error fetching passport:", error);
                });
        });
    }
    
    calculatePositionFromGeolocation(latitude, longitude) {
        // Get the current user's position as reference
        const myLat = this.locationHandler.currentPosition.latitude;
        const myLon = this.locationHandler.currentPosition.longitude;
        
        // Calculate difference in meters
        const distance = this.locationHandler.calculateDistance(
            myLat, myLon, latitude, longitude
        );
        
        // Calculate bearing
        const bearing = this.calculateBearing(myLat, myLon, latitude, longitude);
        
        // Convert distance (in meters) to scene units (arbitrary scale)
        const sceneDistance = distance * 0.2; // Scale factor
        
        // Calculate X and Z coordinates
        const x = sceneDistance * Math.sin(bearing);
        const z = sceneDistance * Math.cos(bearing);
        
        return { x, z };
    }
    
    calculateBearing(lat1, lon1, lat2, lon2) {
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const λ1 = lon1 * Math.PI / 180;
        const λ2 = lon2 * Math.PI / 180;
        
        const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
        const x = Math.cos(φ1) * Math.sin(φ2) -
                  Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
        const θ = Math.atan2(y, x);
        
        return θ;
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Rotate avatars slightly for visual effect
        this.avatarMeshes.forEach(avatar => {
            avatar.rotation.y += 0.01;
        });
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
    
    setupEventListeners() {
        // Location updates
        if (this.locationHandler) {
            this.locationHandler.setUpLocationListener(nearbyUsers => {
                this.updateNearbyAvatars(nearbyUsers);
            });
        }
        
        // Avatar click detection
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        this.renderer.domElement.addEventListener('click', (event) => {
            // Calculate mouse position in normalized device coordinates
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            // Update the picking ray with the camera and mouse position
            raycaster.setFromCamera(mouse, this.camera);
            
            // Calculate objects intersecting the picking ray
            const intersects = raycaster.intersectObjects(this.scene.children, true);
            
            // Find the first avatar that was clicked
            for (let i = 0; i < intersects.length; i++) {
                // Walk up the parent chain to find the root mesh
                let object = intersects[i].object;
                while (object.parent && !(object.userData && object.userData.userId)) {
                    object = object.parent;
                }
                
                // Check if this is an avatar with a userId
                if (object.userData && object.userData.userId) {
                    const userId = object.userData.userId;
                    
                    // Skip if it's the current user's avatar
                    if (userId === this.userId) continue;
                    
                    // Get passport data
                    if (this.passportManager) {
                        firestore.collection('passports').doc(userId).get()
                            .then(doc => {
                                if (doc.exists) {
                                    const passport = doc.data();
                                    this.passportManager.showPassport(userId, passport);
                                }
                            })
                            .catch(error => {
                                this.debugLog(`Error fetching passport on click: ${error.message}`);
                                console.error("Error fetching passport:", error);
                            });
                    } else {
                        this.debugLog('Passport manager not initialized when avatar clicked');
                    }
                    
                    break;
                }
            }
        });
    }
    
    start() {
        this.debugLog('start() method called');
        if (!this.isInitialized) {
            this.initApp();
        }
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM content loaded, initializing Oh-Hey app');
    
    // Create app instance
    window.appInstance = new OhHeyApp();
    window.appInstance.initialize();
    
    // Add debug controls to global scope for console access
    window.debugOhHey = {
        bypass: () => window.appInstance.bypassLoading(),
        resetAvatar: () => {
            localStorage.removeItem('oh-hey-avatar');
            console.log('Avatar data cleared. Reload the page to create a new avatar.');
        },
        showDebugInfo: () => {
            const debugDiv = document.getElementById('debug-info');
            if (debugDiv) {
                debugDiv.style.display = debugDiv.style.display === 'none' ? 'block' : 'none';
            }
        }
    };
});