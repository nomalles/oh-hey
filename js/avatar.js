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
        this.currentGradient = null; // Add this line for gradient support
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

    initEnvironment() {
        // Set a nicer background color
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
        
        // Add a ground plane with gradient
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.ShaderMaterial({
            uniforms: {
                colorA: { value: new THREE.Color(0xCCCCCC) },
                colorB: { value: new THREE.Color(0xEEEEEE) }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 colorA;
                uniform vec3 colorB;
                varying vec2 vUv;
                void main() {
                    gl_FragColor = vec4(mix(colorA, colorB, vUv.y), 1.0);
                }
            `
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -2;
        this.scene.add(ground);
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
            case 'capsule':
                geometry = CustomShapes.createCapsuleGeometry(0.8, 1.6, 4, 8);
                break;
            case 'octahedron':
                geometry = new THREE.OctahedronGeometry(1.2, 0);
                break;
            case 'rounded-cube':
                geometry = new THREE.BoxGeometry(1.6, 1.6, 1.6, 4, 4, 4);
                geometry = CustomShapes.roundedBoxGeometry(geometry, 0.2);
                break;
            default:
                geometry = new THREE.SphereGeometry(1, 32, 32);
        }
    
        // Create material based on color and gradient
        let material;
        
        if (this.currentGradient) {
            // Create gradient material using ShaderMaterial
            material = new THREE.ShaderMaterial({
                uniforms: {
                    colorA: { value: new THREE.Color(this.currentColor) },
                    colorB: { value: new THREE.Color(this.currentGradient) }
                },
                vertexShader: `
                    varying vec2 vUv;
                    varying vec3 vPosition;
                    
                    void main() {
                        vUv = uv;
                        vPosition = position;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform vec3 colorA;
                    uniform vec3 colorB;
                    varying vec2 vUv;
                    varying vec3 vPosition;
                    
                    void main() {
                        // Gradient based on normalized height (y position)
                        float normalizedY = (vPosition.y + 1.0) / 2.0;
                        vec3 color = mix(colorA, colorB, normalizedY);
                        
                        // Add some phong-like shading
                        vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
                        vec3 normal = normalize(vPosition);
                        float diff = max(dot(normal, lightDir), 0.0);
                        vec3 diffuse = color * diff;
                        vec3 ambient = color * 0.3;
                        
                        gl_FragColor = vec4(ambient + diffuse, 1.0);
                    }
                `
            });
        } else {
            // Create standard material with current color
            material = new THREE.MeshPhongMaterial({
                color: this.currentColor,
                shininess: 100,
                specular: 0x333333,
                emissive: new THREE.Color(this.currentColor).multiplyScalar(0.2)
            });
        }
    
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
    
        // Color selection with gradient support
        this.colorOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Update UI
                this.colorOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                // Update state
                this.currentColor = option.dataset.color;
                this.currentGradient = option.dataset.gradient || null;
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
                gradient: this.currentGradient, // Add gradient info
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
            gradient: this.currentGradient,
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
            case 'capsule':
                geometry = CustomShapes.createCapsuleGeometry(0.8, 1.6, 4, 8);
                break;
            case 'octahedron':
                geometry = new THREE.OctahedronGeometry(1.2, 0);
                break;
            case 'rounded-cube':
                geometry = new THREE.BoxGeometry(1.6, 1.6, 1.6, 4, 4, 4);
                geometry = CustomShapes.roundedBoxGeometry(geometry, 0.2);
                break;
            default:
                geometry = new THREE.SphereGeometry(1, 32, 32);
        }
    
        // Create material with gradient support
        let material;
        
        if (avatarData.gradient) {
            material = new THREE.ShaderMaterial({
                uniforms: {
                    colorA: { value: new THREE.Color(avatarData.color) },
                    colorB: { value: new THREE.Color(avatarData.gradient) }
                },
                vertexShader: `
                    varying vec2 vUv;
                    varying vec3 vPosition;
                    
                    void main() {
                        vUv = uv;
                        vPosition = position;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform vec3 colorA;
                    uniform vec3 colorB;
                    varying vec2 vUv;
                    varying vec3 vPosition;
                    
                    void main() {
                        // Gradient based on normalized height (y position)
                        float normalizedY = (vPosition.y + 1.0) / 2.0;
                        vec3 color = mix(colorA, colorB, normalizedY);
                        
                        // Add some phong-like shading
                        vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
                        vec3 normal = normalize(vPosition);
                        float diff = max(dot(normal, lightDir), 0.0);
                        vec3 diffuse = color * diff;
                        vec3 ambient = color * 0.3;
                        
                        gl_FragColor = vec4(ambient + diffuse, 1.0);
                    }
                `
            });
        } else {
            material = new THREE.MeshPhongMaterial({
                color: avatarData.color,
                shininess: 100
            });
        }
    
        // Create head mesh
        const avatar = new THREE.Mesh(geometry, material);
    
        return avatar;
    }

    static addMoreShapeOptions(shapeButtonsContainer) {
        // Add more shape options
        const additionalShapes = [
            { name: 'capsule', label: 'Capsule' },
            { name: 'octahedron', label: 'Octa' },
            { name: 'rounded-cube', label: 'Smooth Cube' }
        ];
        
        additionalShapes.forEach(shape => {
            const button = document.createElement('button');
            button.className = 'option-button';
            button.dataset.shape = shape.name;
            button.textContent = shape.label;
            shapeButtonsContainer.appendChild(button);
        });
    }

}
const CustomShapes = {
    // Create capsule geometry (cylinder with spherical caps)
    createCapsuleGeometry(radius, height, radialSegments, heightSegments) {
        const geometry = new THREE.BufferGeometry();
        const radiusTop = radius;
        const radiusBottom = radius;
        const heightCylinder = height - radius * 2;
        
        // Create cylinder part
        const cylinderGeometry = new THREE.CylinderGeometry(
            radiusTop, radiusBottom, heightCylinder, radialSegments, heightSegments, true
        );
        cylinderGeometry.translate(0, 0, 0);
        
        // Create the spherical caps
        const sphereGeometry1 = new THREE.SphereGeometry(
            radius, radialSegments, heightSegments, 0, Math.PI * 2, 0, Math.PI / 2
        );
        sphereGeometry1.translate(0, heightCylinder / 2, 0);
        
        const sphereGeometry2 = new THREE.SphereGeometry(
            radius, radialSegments, heightSegments, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2
        );
        sphereGeometry2.translate(0, -heightCylinder / 2, 0);
        
        // Merge geometries
        const mergedGeometry = new THREE.BufferGeometry();
        const cylinderPositions = cylinderGeometry.attributes.position.array;
        const sphere1Positions = sphereGeometry1.attributes.position.array;
        const sphere2Positions = sphereGeometry2.attributes.position.array;
        
        // Combine positions
        const positions = new Float32Array(cylinderPositions.length + sphere1Positions.length + sphere2Positions.length);
        positions.set(cylinderPositions, 0);
        positions.set(sphere1Positions, cylinderPositions.length);
        positions.set(sphere2Positions, cylinderPositions.length + sphere1Positions.length);
        
        mergedGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        return mergedGeometry;
    },
    
    // Round the edges of a box geometry
    roundedBoxGeometry(boxGeometry, radius) {
        // Clone geometry to avoid modifying the original
        const geometry = boxGeometry.clone();
        const position = geometry.attributes.position;
        const normal = geometry.attributes.normal;
        
        // Get box dimensions
        const box = new THREE.Box3().setFromBufferAttribute(position);
        const size = new THREE.Vector3();
        box.getSize(size);
        
        const halfSize = size.clone().multiplyScalar(0.5);
        
        // Process each vertex
        for (let i = 0; i < position.count; i++) {
            const vertex = new THREE.Vector3();
            vertex.fromBufferAttribute(position, i);
            
            // Calculate how much to move the vertex
            const x = Math.max(0, Math.abs(vertex.x) - (halfSize.x - radius));
            const y = Math.max(0, Math.abs(vertex.y) - (halfSize.y - radius));
            const z = Math.max(0, Math.abs(vertex.z) - (halfSize.z - radius));
            
            const distance = Math.sqrt(x * x + y * y + z * z);
            
            if (distance > 0) {
                const factor = (radius / distance) - 1;
                vertex.x += (vertex.x > 0 ? x : -x) * factor;
                vertex.y += (vertex.y > 0 ? y : -y) * factor;
                vertex.z += (vertex.z > 0 ? z : -z) * factor;
                
                position.setXYZ(i, vertex.x, vertex.y, vertex.z);
                
                // Update normal to point from center to new position
                const direction = vertex.normalize();
                normal.setXYZ(i, direction.x, direction.y, direction.z);
            }
        }
        
        geometry.computeVertexNormals();
        return geometry;
    }
};
