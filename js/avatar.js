// Avatar creation system
class AvatarCreator {
    constructor() {
        // Three.js components for avatar preview
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.avatar = null;
        this.light = null;
        this.faceTextures = {};

        // Avatar state
        this.currentShape = 'sphere';
        this.currentColor = '#ff6b6b';
        this.currentFace = 'face1';

        // DOM elements
        this.previewContainer = document.getElementById('avatar-preview');
        this.shapeButtons = document.querySelectorAll('#head-shapes .option-button');
        this.colorOptions = document.querySelectorAll('.color-option');
        this.faceButtons = document.querySelectorAll('#face-options .option-button');
        this.confirmButton = document.getElementById('confirm-avatar');

        // Initialize
        this.initThree();
        this.loadTextures();
        this.setupEventListeners();
        this.animate();
    }

    initThree() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xe0e0e0);

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            50,
            this.previewContainer.clientWidth / this.previewContainer.clientHeight,
            0.1,
            1000
        );
        this.camera.position.z = 5;

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.previewContainer.clientWidth, this.previewContainer.clientHeight);
        this.previewContainer.appendChild(this.renderer.domElement);

        // Add light
        this.light = new THREE.DirectionalLight(0xffffff, 1);
        this.light.position.set(0, 0, 2);
        this.scene.add(this.light);

        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Create initial avatar
        this.createAvatar();

        // Handle window resize
        window.addEventListener('resize', () => {
            const width = this.previewContainer.clientWidth;
            const height = this.previewContainer.clientHeight;
            
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        });
    }

    loadTextures() {
        // Create face textures (normally you would load these from files)
        // For now, we'll create simple canvas textures as placeholders
        const faces = ['face1', 'face2', 'face3', 'face4'];
        const expressions = [
            { eyes: ':)', mouthY: 70 }, // Happy
            { eyes: 'B)', mouthY: 65 }, // Cool
            { eyes: '-_-', mouthY: 70 }, // Chill
            { eyes: '^_^', mouthY: 75 }, // Excited
        ];

        faces.forEach((face, index) => {
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');
            
            // Transparent background
            ctx.fillStyle = 'rgba(0, 0, 0, 0)';
            ctx.fillRect(0, 0, 256, 256);
            
            // Draw face - this is very basic, you'll replace with actual face textures
            ctx.fillStyle = 'black';
            ctx.font = '80px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(expressions[index].eyes, 128, 100); // Eyes
            
            // Draw mouth
            ctx.beginPath();
            ctx.arc(128, expressions[index].mouthY + 30, 30, 0, Math.PI);
            ctx.stroke();
            
            this.faceTextures[face] = new THREE.CanvasTexture(canvas);
        });
    }

    createAvatar() {
        // Remove existing avatar if any
        if (this.avatar) {
            this.scene.remove(this.avatar);
        }

        // Create geometry based on current shape
        let geometry;
        switch (this.currentShape) {
            case 'sphere':
                geometry = new THREE.SphereGeometry(1, 32, 32);
                break;
            case 'cube':
                geometry = new THREE.BoxGeometry(1.8, 1.8, 1.8);
                break;
            case 'cone':
                geometry = new THREE.ConeGeometry(1, 2, 32);
                break;
            case 'cylinder':
                geometry = new THREE.CylinderGeometry(1, 1, 2, 32);
                break;
            case 'torus':
                geometry = new THREE.TorusGeometry(0.8, 0.4, 16, 50);
                break;
            default:
                geometry = new THREE.SphereGeometry(1, 32, 32);
        }

        // Create material with current color
        const material = new THREE.MeshPhongMaterial({
            color: this.currentColor,
            shininess: 100
        });

        // Create head mesh
        this.avatar = new THREE.Mesh(geometry, material);
        this.scene.add(this.avatar);

        // Create face plane
        const faceGeometry = new THREE.PlaneGeometry(1.5, 1.5);
        const faceMaterial = new THREE.MeshBasicMaterial({
            map: this.faceTextures[this.currentFace],
            transparent: true,
            side: THREE.DoubleSide
        });
        const facePlane = new THREE.Mesh(faceGeometry, faceMaterial);
        facePlane.position.z = 1.1;

        // Add face plane as child of avatar
        this.avatar.add(facePlane);

        // Position adjustments based on shape
        if (this.currentShape === 'cone') {
            facePlane.position.y = 0.5;
        } else if (this.currentShape === 'cylinder') {
            facePlane.position.y = 0;
        }
    }

    updateAvatar() {
        this.createAvatar();
    }

    setupEventListeners() {
        // Shape selection
        this.shapeButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Update UI
                this.shapeButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Update state
                this.currentShape = button.dataset.shape;
                this.updateAvatar();
            });
        });

        // Color selection
        this.colorOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Update UI
                this.colorOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                // Update state
                this.currentColor = option.dataset.color;
                this.updateAvatar();
            });
        });

        // Face selection
        this.faceButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Update UI
                this.faceButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Update state
                this.currentFace = button.dataset.face;
                this.updateAvatar();
            });
        });

        // Confirm button
        this.confirmButton.addEventListener('click', () => {
            // Get avatar data
            const avatarData = {
                shape: this.currentShape,
                color: this.currentColor,
                face: this.currentFace
            };

            // Save in local storage
            localStorage.setItem('oh-hey-avatar', JSON.stringify(avatarData));

            // Hide avatar creator
            document.getElementById('avatar-creator').style.display = 'none';

            // Start the main application
            if (window.appInstance) {
                window.appInstance.start();
            }
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.avatar) {
            this.avatar.rotation.y += 0.01;
        }
        
        this.renderer.render(this.scene, this.camera);
    }

    show() {
        document.getElementById('avatar-creator').style.display = 'block';
    }

    getUserAvatar() {
        return {
            shape: this.currentShape,
            color: this.currentColor,
            face: this.currentFace
        };
    }

    // Static function to create a Three.js avatar mesh from avatar data
    static createAvatarMesh(avatarData) {
        // Create geometry based on shape
        let geometry;
        switch (avatarData.shape) {
            case 'sphere':
                geometry = new THREE.SphereGeometry(1, 32, 32);
                break;
            case 'cube':
                geometry = new THREE.BoxGeometry(1.8, 1.8, 1.8);
                break;
            case 'cone':
                geometry = new THREE.ConeGeometry(1, 2, 32);
                break;
            case 'cylinder':
                geometry = new THREE.CylinderGeometry(1, 1, 2, 32);
                break;
            case 'torus':
                geometry = new THREE.TorusGeometry(0.8, 0.4, 16, 50);
                break;
            default:
                geometry = new THREE.SphereGeometry(1, 32, 32);
        }

        // Create material with color
        const material = new THREE.MeshPhongMaterial({
            color: avatarData.color,
            shininess: 100
        });

        // Create head mesh
        const avatar = new THREE.Mesh(geometry, material);

        return avatar;
    }
}
