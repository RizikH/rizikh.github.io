const firebaseConfig = {
  apiKey: "AIzaSyAkBNdvfhhibqQor2qu_hXQYpUdFf47G-0",
  authDomain: "rps-game-6e6cb.firebaseapp.com",
  projectId: "rps-game-6e6cb",
  storageBucket: "rps-game-6e6cb.appspot.com",
  messagingSenderId: "573016712987",
  appId: "1:573016712987:web:f44ab74d495408b33515be",
  measurementId: "G-R7EH8DWSQX"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore and make it globally available
window.firestore = firebase.firestore();
