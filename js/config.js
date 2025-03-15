// Firebase configuration
// You will need to replace these values with your actual Firebase project details
const firebaseConfig = {
    apiKey: "AIzaSyD3Op0LTdW9Dq1u1mc_3StyVryATMdEKpc",
  authDomain: "streetpass-web.firebaseapp.com",
  projectId: "streetpass-web",
  storageBucket: "streetpass-web.firebasestorage.app",
  messagingSenderId: "162492502670",
  appId: "1:162492502670:web:3ddd023bd35421ca562fdf",
  measurementId: "G-H0CDB6RH90",
    databaseURL: "https://streetpass-web-default-rtdb.firebaseio.com"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Create references to Firebase services
const auth = firebase.auth();
const firestore = firebase.firestore();
const database = firebase.database();

// Anonymous authentication function
function signInAnonymously() {
    return auth.signInAnonymously()
        .catch(error => {
            console.error("Error signing in anonymously:", error);
        });
}
