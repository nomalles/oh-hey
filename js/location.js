// Location handling system
class LocationHandler {
    constructor() {
        this.currentPosition = null;
        this.watchId = null;
        this.nearbyUsers = new Map();
        this.userId = null;
    }

    initialize(userId) {
        this.userId = userId;
        return this.requestLocationPermission();
    }

    requestLocationPermission() {
        return new Promise((resolve, reject) => {
            if ("geolocation" in navigator) {
                // Request one-time position to start
                navigator.geolocation.getCurrentPosition(
                    position => {
                        this.currentPosition = {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            accuracy: position.coords.accuracy,
                            timestamp: position.timestamp
                        };
                        
                        // Update position in Firebase
                        this.updatePositionInFirebase();
                        
                        // Start watching position
                        this.startLocationWatch();
                        
                        resolve(true);
                    },
                    error => {
                        console.error("Error getting location:", error.message);
                        reject(error);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0
                    }
                );
            } else {
                // Geolocation not supported
                const error = new Error("Geolocation is not supported by this browser.");
                console.error(error.message);
                reject(error);
            }
        });
    }

    startLocationWatch() {
        // Set up continuous location tracking
        this.watchId = navigator.geolocation.watchPosition(
            position => {
                this.currentPosition = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp
                };
                
                // Update position in Firebase
                this.updatePositionInFirebase();
            },
            error => {
                console.error("Error watching location:", error.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }

    stopLocationWatch() {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
    }

    updatePositionInFirebase() {
        if (!this.userId || !this.currentPosition) return;
        
        // Store user's current position
        const userLocationRef = database.ref(`locations/${this.userId}`);
        userLocationRef.set({
            position: {
                latitude: this.currentPosition.latitude,
                longitude: this.currentPosition.longitude,
                accuracy: this.currentPosition.accuracy
            },
            lastUpdated: firebase.database.ServerValue.TIMESTAMP
        });
        
        // Set a presence status and remove location when user disconnects
        userLocationRef.onDisconnect().remove();
        
        // Now fetch nearby users
        this.findNearbyUsers();
    }

    findNearbyUsers() {
        if (!this.currentPosition) return;
        
        // Reference to all locations
        const locationsRef = database.ref('locations');
        
        // Query for all locations (we'll filter by distance in JavaScript)
        locationsRef.once('value')
            .then(snapshot => {
                const locations = snapshot.val() || {};
                const nearbyUsers = new Map();
                
                Object.entries(locations).forEach(([uid, data]) => {
                    // Skip our own user
                    if (uid === this.userId) return;
                    
                    // Calculate distance
                    const userPosition = data.position;
                    const distance = this.calculateDistance(
                        this.currentPosition.latitude,
                        this.currentPosition.longitude,
                        userPosition.latitude,
                        userPosition.longitude
                    );
                    
                    // Check if user is within 50ft (approximately 15 meters)
                    const MAX_DISTANCE = 15; // 15 meters
                    if (distance <= MAX_DISTANCE) {
                        nearbyUsers.set(uid, {
                            userId: uid,
                            position: userPosition,
                            distance: distance,
                            lastUpdated: data.lastUpdated
                        });
                    }
                });
                
                this.nearbyUsers = nearbyUsers;
                
                // Dispatch event to notify of nearby users update
                const event = new CustomEvent('nearbyUsersUpdate', {
                    detail: {
                        nearbyUsers: Array.from(nearbyUsers.values())
                    }
                });
                document.dispatchEvent(event);
            })
            .catch(error => {
                console.error("Error fetching nearby users:", error);
            });
    }

    // Calculate distance between two coordinates in meters
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        return distance;
    }

    getNearbyUsers() {
        return Array.from(this.nearbyUsers.values());
    }

    setUpLocationListener(callback) {
        document.addEventListener('nearbyUsersUpdate', event => {
            callback(event.detail.nearbyUsers);
        });
    }
}
